import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';
import WorkspaceView from './WorkspaceView';
import QuickAIImprovementView from './QuickAIImprovementView';

// ─── Score helpers ─────────────────────────────────────────────────────────────
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
};
const scoreLabel = (score) => {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Average';
  return 'Needs work';
};
const scoreColor = (score) => {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

// ─── SVG Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80, strokeWidth = 8 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score ?? 0) / 100) * circ;
  const color = scoreColor(score ?? 0);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease-out' }}
      />
    </svg>
  );
}

// ─── Score Breakdown Card ──────────────────────────────────────────────────────
function ScoreBreakdownCard({ item }) {
  const [open, setOpen] = useState(false);
  const percent = Math.round((item.score / item.max) * 100);

  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      style={{ background: '#fff', border: '1px solid #E2E8F0' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C7D2FE')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-base shrink-0" aria-hidden="true">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.type}</p>
        </div>
        <span className="text-sm font-bold text-slate-800 tabular-nums shrink-0">
          {item.score}
          <span className="text-[10px] font-normal text-slate-400">/{item.max}</span>
        </span>
      </div>

      <div className="w-full rounded-full h-1.5 overflow-hidden mb-2" style={{ background: '#F1F5F9' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, background: item.barColor }}
        />
      </div>

      {open && (
        <p className="text-xs text-slate-500 leading-relaxed mt-2 pt-2 border-t border-slate-100">
          {item.desc}
        </p>
      )}
      <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--color-accent)' }}>
        {open ? 'Collapse' : 'Details'}
      </p>
    </button>
  );
}

// ─── Reusable card ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.07)' }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { userRecord } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('quick');
  const [tailorAnalysis, setTailorAnalysis] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [baseResumes, setBaseResumes] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredData, setTailoredData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [parsedText, setParsedText] = useState('');

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [competitiveProgrammingUrl, setCompetitiveProgrammingUrl] = useState('');
  const [linksOpen, setLinksOpen] = useState(false);

  // Tailor tab view: 'inputs' | 'output'
  const [tailorView, setTailorView] = useState('inputs');

  // Auto-save status
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const saveTimerRef = useRef(null);

  // Export panel scroll ref
  const exportRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (tailoredData) setTailorView('output');
  }, [tailoredData]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const [sessionsRes, baseResRes] = await Promise.all([
        axios.get('/api/resume/sessions', { withCredentials: true }),
        axios.get('/api/resume/history', { withCredentials: true })
      ]);
      setSessions(sessionsRes.data);
      setBaseResumes(baseResRes.data);
      if (baseResRes.data.length > 0) setSelectedResumeId(baseResRes.data[0]._id);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalysisComplete = () => {
    setBaseResumes([]); // Clear to refetch on next tab visit
    toast.success('Analysis complete!');
  };

  const activeSessionRef = useRef(activeSessionId);
  useEffect(() => { activeSessionRef.current = activeSessionId; }, [activeSessionId]);

  // Auto-save: debounced API call
  const handleDataChange = useCallback((data) => {
    setEditedData(data);
    setSaveStatus('unsaved');
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const sid = activeSessionRef.current;
      if (sid) {
        try {
          await axios.put(`/api/resume/session/${sid}`, { tailoredData: data }, { withCredentials: true });
          setSaveStatus('saved');
        } catch (err) {
          console.error('Auto-save failed', err);
          setSaveStatus('unsaved');
        }
      } else {
        // If no session ID is active, we just show saved visually
        setSaveStatus('saved');
      }
    }, 1500);
  }, []);

  const handleTailor = async () => {
    if (!selectedResumeId) return toast.error('Please select a base resume');
    if (!jobDescription.trim()) return toast.error('Please paste a job description');
    setIsTailoring(true);
    setTailoredData(null);
    setEditedData(null);
    setParsedText('');
    setSaveStatus('saved');
    try {
      const res = await axios.post(
        '/api/resume/tailor',
        {
          resumeId: selectedResumeId,
          jobDescription,
          userLinks: {
            linkedin: linkedinUrl.trim() || null,
            github: githubUrl.trim() || null,
            portfolio: portfolioUrl.trim() || null,
            competitiveProgramming: competitiveProgrammingUrl.trim() || null,
          },
        },
        { withCredentials: true }
      );
      setTailoredData(res.data.tailoredResume);
      setParsedText(res.data.parsedText || '');
      setTailorAnalysis(res.data.analysis || null);
      // Refetch sessions since we created a new one
      fetchHistory();
      // Set the active session ID so auto-save knows where to save
      // We will add activeSessionId state
      setActiveSessionId(res.data.sessionId);
      toast.success('Resume tailored successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to tailor resume');
    } finally {
      setIsTailoring(false);
    }
  };

  // Back from workspace — clears tailored state and returns to dashboard
  const handleBackFromWorkspace = useCallback(() => {
    setTailoredData(null);
    setEditedData(null);
    setTailorAnalysis(null);
    setSaveStatus('saved');
    setTailorView('inputs');
    setActiveSessionId(null);
  }, []);

  const handleOpenSession = (session) => {
    setTailoredData(session.tailoredData);
    setJobDescription(session.jobDescription);
    setSelectedResumeId(session.baseResumeId);
    setActiveSessionId(session._id);
    // Note: session.baseResumeId could be populated, or we need to fetch parsedText
    setParsedText(session.baseResumeId?.parsedText || session.parsedText || '');
    setTailorAnalysis({
      atsScore: session.atsScore,
      matchScore: session.roleMatchScore,
      strengths: session.strengths,
      improvements: session.weaknesses,
    });
    setTailorView('output');
    setSelectedMode('quick');
  };

  const userLinks = {
    linkedin: linkedinUrl.trim() || null,
    github: githubUrl.trim() || null,
    portfolio: portfolioUrl.trim() || null,
    competitiveProgramming: competitiveProgrammingUrl.trim() || null,
  };

  // Context bar data: look up selected base resume or session for company/role
  const selectedResume = sessions.find((s) => s._id === activeSessionId) || baseResumes.find((h) => h._id === selectedResumeId);

  const TABS = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'upload', icon: '⚡', label: 'Analyze' },
    { key: 'history', icon: '📁', label: 'History' },
    { key: 'tailor', icon: '✨', label: 'Tailor' },
  ];

  const bestScore = baseResumes.length
    ? Math.max(...baseResumes.map((h) => h.atsScore || 0))
    : null;

  const buildBreakdownItems = (analysis) => {
    const defaultSub = { structure: 0, impact: 0, skillAlignment: 0, complexity: 0, professionalism: 0, skillProjectFit: 0 };
    const rawSub = analysis.subScores || defaultSub;
    const totalSub = Object.values(rawSub).reduce((a, b) => a + b, 0);
    const ats = analysis.atsScore || 0;

    const defs = [
      { name: 'Formatting & layout', max: 20, key: 'structure', icon: '📝', type: 'Programmatic', barColor: '#6366F1', desc: 'Checks structure and formatting standards.' },
      { name: 'Impact & metrics', max: 20, key: 'impact', icon: '📈', type: 'Programmatic', barColor: '#10B981', desc: 'Checks presence of measurable results.' },
      { name: 'Skill alignment', max: 20, key: 'skillAlignment', icon: '🔑', type: 'Programmatic', barColor: '#F59E0B', desc: 'Keyword alignment against expected tech terms.' },
      { name: 'Technical complexity', max: 15, key: 'complexity', icon: '🏗️', type: 'AI Cognitive', barColor: '#8B5CF6', desc: 'Depth of roles, infrastructure, and tools.' },
      { name: 'Professional phrasing', max: 5, key: 'professionalism', icon: '✍️', type: 'AI Cognitive', barColor: '#EF4444', desc: 'Usage of active words and formal phrasing.' },
      { name: 'Skill–project match', max: 10, key: 'skillProjectFit', icon: '🎯', type: 'AI Cognitive', barColor: '#059669', desc: 'Verification that skills are proven in roles.' },
    ];

    return defs.map((d) => ({
      ...d,
      score: totalSub > 0 ? rawSub[d.key] : Math.round((ats / 100) * d.max),
    }));
  };

  // If a tailored resume is active and we are not currently generating one,
  // take over the screen with the WorkspaceView.
  if (tailoredData && !isTailoring) {
    if (selectedMode === 'quick') {
      return (
        <QuickAIImprovementView
          tailoredData={tailoredData}
          parsedText={parsedText}
          user={userRecord}
          userLinks={userLinks}
          analysis={tailorAnalysis}
          onBack={handleBackFromWorkspace}
        />
      );
    }

    // Default to advanced
    return (
      <WorkspaceView
        tailoredData={tailoredData}
        onDataChange={handleDataChange}
        user={userRecord}
        selectedResume={selectedResume}
        resumeId={selectedResumeId}
        parsedText={parsedText}
        userLinks={userLinks}
        onBack={handleBackFromWorkspace}
        saveStatus={saveStatus}
      />
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleAnalysisComplete} />
      )}

      {/* ── Sidebar ── */}
      <div className="w-64 shrink-0 hidden md:flex border-r bg-white sticky top-[68px] h-[calc(100vh-68px)] flex-col" style={{ borderColor: '#E2E8F0' }}>
        <div className="p-6 flex-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Navigation</h2>
          <nav className="space-y-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => tab.key === 'upload' ? setShowModal(true) : setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key && tab.key !== 'upload'
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-accent)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around p-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => tab.key === 'upload' ? setShowModal(true) : setActiveTab(tab.key)}
            className={`flex flex-col items-center p-2 text-[10px] font-semibold rounded-xl ${activeTab === tab.key && tab.key !== 'upload' ? 'text-[var(--color-accent)]' : 'text-slate-500'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col pb-24 md:pb-0">

        {/* ── Page Content ─────────────────────────────────────────────────────── */}
        <div className="w-full px-4 sm:px-6 py-6 pb-28">
            {/* ══════════════ DASHBOARD TAB ════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="animate-fade-up space-y-6">
                {/* Greeting & Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-800">
                    {userRecord?.firstName ? `Hey, ${userRecord.firstName} 👋` : 'Welcome to your Dashboard 👋'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Here's a quick overview of your resume improvement progress.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: 'Latest Score', 
                      value: [...baseResumes, ...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.atsScore || '--', 
                      subtext: 'Most recent ATS scan',
                      icon: '📈', color: '#10B981' 
                    },
                    { label: 'Best Score', value: bestScore || '--', subtext: 'Highest achieved', icon: '🏆', color: '#F59E0B' },
                    { label: 'Analyzed', value: baseResumes.length, subtext: 'Total base uploads', icon: '📄', color: '#6366F1' },
                    { label: 'Tailored', value: sessions.length, subtext: 'Targeted versions', icon: '✨', color: '#8B5CF6' }
                  ].map((stat, i) => (
                    <Card key={i} className="p-5 flex flex-col justify-between hover:shadow-md transition-all border border-slate-100/60 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50 border border-slate-100 shadow-sm">{stat.icon}</div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-2">{stat.label}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stat.subtext}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Recent Activity & Best Match */}
                  <div className="space-y-6">
                    {/* Recent Activity */}
                    <Card>
                      <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Resume Activity</h2>
                        {/* Table Header */}
                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                          <div className="flex-1">Title</div>
                          <div className="w-28 text-center shrink-0">ATS Score</div>
                          <div className="w-28 text-center shrink-0">JD Score</div>
                          <div className="w-6 shrink-0"></div>
                        </div>
                      </div>
                      <div className="p-0">
                        {baseResumes.length === 0 && sessions.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-sm text-slate-500">No activity yet. Upload a resume to get started.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100/80">
                            {[...baseResumes, ...sessions]
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                              .slice(0, 5)
                              .map((activity) => {
                                const isSession = 'roleName' in activity;
                                const jdScore = activity.roleMatchScore ?? activity.feedback?.matchScore ?? null;
                                return (
                                  <div key={activity._id} 
                                    onClick={() => {
                                      if (isSession) {
                                        handleOpenSession(activity);
                                        setActiveTab('tailor');
                                      } else {
                                        setSelectedResumeId(activity._id);
                                        setActiveTab('history');
                                      }
                                    }}
                                    className="p-4 px-2 mx-3 flex items-center hover:bg-slate-50 transition-colors cursor-pointer group rounded-xl">
                                    
                                    {/* Title Column */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 shadow-sm border border-white ${isSession ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'bg-[var(--success-soft)] text-[var(--success)]'}`}>
                                        {isSession ? '✨' : '📄'}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[var(--color-accent)] transition-colors">
                                          {isSession 
                                            ? (activity.company ? `${activity.company} · ${activity.roleName}` : activity.roleName || 'Targeted Role')
                                            : `Base Resume (${new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                            {isSession ? 'Tailored Session' : 'Resume Upload'}
                                          </span>
                                          <span className="text-[11px] font-medium text-slate-400">
                                            {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* ATS Score Column */}
                                    <div className="w-28 flex justify-center shrink-0">
                                      <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ${scoreBadge(activity.atsScore)}`}>
                                        {activity.atsScore} <span className="opacity-60 text-[10px]">/ 100</span>
                                      </span>
                                    </div>

                                    {/* JD Score Column */}
                                    <div className="w-28 flex justify-center shrink-0">
                                      {jdScore != null ? (
                                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ${scoreBadge(jdScore)}`}>
                                          {jdScore} <span className="opacity-60 text-[10px]">/ 100</span>
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-slate-300 px-2.5 py-1.5">—</span>
                                      )}
                                    </div>

                                    {/* Arrow */}
                                    <div className="w-6 flex justify-end shrink-0">
                                      <span className="text-slate-300 group-hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">→</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Best JD Match */}
                    <Card>
                      <div className="px-5 py-4 mx-auto border-b border-slate-100/80">
                        <h2 className="text-sm font-semibold text-slate-800">Best JD Match</h2>
                      </div>
                      <div className="p-5">
                        {(() => {
                          const itemsWithMatch = [...baseResumes, ...sessions].filter(item => 
                            (item.feedback?.matchScore != null) || (item.roleMatchScore != null)
                          );
                          if (itemsWithMatch.length === 0) {
                            return (
                              <div className="text-center py-5">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">🎯</div>
                                <p className="text-sm font-medium text-slate-600">No targeted analysis results yet.</p>
                                <button onClick={() => setShowModal(true)} className="text-xs font-bold text-[var(--color-accent)] mt-2 hover:underline focus-visible:outline-none">
                                  Run a targeted match →
                                </button>
                              </div>
                            );
                          }
                          const bestMatch = itemsWithMatch.reduce((best, current) => {
                            const bestScore = best.feedback?.matchScore ?? best.roleMatchScore ?? 0;
                            const currentScore = current.feedback?.matchScore ?? current.roleMatchScore ?? 0;
                            return currentScore > bestScore ? current : best;
                          });
                          const score = bestMatch.feedback?.matchScore ?? bestMatch.roleMatchScore ?? 0;
                          const roleName = bestMatch.roleName || 'Targeted Role';
                          const isSession = 'roleName' in bestMatch;
                          
                          return (
                            <div className="flex items-center justify-between group cursor-pointer"
                                 onClick={() => {
                                   if (isSession) {
                                     handleOpenSession(bestMatch);
                                     setActiveTab('tailor');
                                   } else {
                                     setSelectedResumeId(bestMatch._id);
                                     setActiveTab('history');
                                   }
                                 }}>
                              <div className="flex items-center gap-5">
                                <div className="relative shrink-0 transition-transform group-hover:scale-105">
                                  <ScoreRing score={score} size={64} strokeWidth={6} />
                                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black tracking-tight" style={{ color: scoreColor(score) }}>
                                    {score}%
                                  </span>
                                </div>
                                <div>
                                  <p className="text-base font-bold text-slate-800 group-hover:text-[var(--color-accent)] transition-colors leading-tight mb-1">{bestMatch.company ? `${bestMatch.company} · ` : ''}{roleName}</p>
                                  <p className="text-xs font-medium text-slate-500">Top matching profile</p>
                                </div>
                              </div>
                              <span className="text-slate-300 group-hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">→</span>
                            </div>
                          );
                        })()}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ SESSIONS TAB ═════════════════════════════════════ */}
            {activeTab === 'history' && (
              <div className="animate-fade-up">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <span className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading sessions…</span>
                    </div>
                  </div>
                ) : sessions.length === 0 && baseResumes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                      style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
                    >
                      📭
                    </div>
                    <p className="font-semibold text-base text-slate-800 mb-1">No history yet</p>
                    <p className="text-sm text-slate-500">Go to the Analyze or Tailor tabs to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {sessions.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h2 className="section-title-accent text-slate-800 font-semibold text-base">Tailored Sessions</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              {sessions.length} session{sessions.length !== 1 ? 's' : ''} — click any card to open the workspace
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {sessions.map((item, index) => (
                            <button
                              key={item._id}
                              onClick={() => handleOpenSession(item)}
                              className="group w-full text-left rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                              style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.12)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                              }}
                            >
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Session {sessions.length - index}
                                  </p>
                                  {item.roleName && (
                                    <p className="text-xs font-semibold truncate max-w-[140px]" style={{ color: 'var(--color-accent)' }}>
                                      {item.company ? `${item.company} · ` : ''}{item.roleName}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scoreBadge(item.atsScore)}`}>
                                    {scoreLabel(item.atsScore)}
                                  </span>
                                  {item.roleMatchScore != null && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}>
                                      Role Match: {item.roleMatchScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-shrink-0">
                                  <ScoreRing score={item.atsScore} size={56} strokeWidth={6} />
                                  <span
                                    className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                                    style={{ color: scoreColor(item.atsScore) }}
                                  >
                                    {item.atsScore}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1 pl-1">
                                  {item.feedback?.summary || 'No summary available.'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                                  Open session →
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {baseResumes.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h2 className="section-title-accent text-slate-800 font-semibold text-base">Uploaded Resumes</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              {baseResumes.length} document{baseResumes.length !== 1 ? 's' : ''} — click any card to view detailed analysis
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {baseResumes.map((item, index) => (
                            <button
                              key={item._id}
                              onClick={() => navigate(`/resume/${item._id}`)}
                              className="group w-full text-left rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                              style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.12)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                              }}
                            >
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Resume {baseResumes.length - index}
                                  </p>
                                  {item.jobDescription && (
                                    <p className="text-xs font-semibold truncate max-w-[140px]" style={{ color: 'var(--color-accent)' }}>
                                      Targeted Match
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scoreBadge(item.atsScore)}`}>
                                    ATS: {item.atsScore}
                                  </span>
                                  {item.feedback?.matchScore != null && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}>
                                      Role Match: {item.feedback.matchScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-shrink-0">
                                  <ScoreRing score={item.atsScore} size={56} strokeWidth={6} />
                                  <span
                                    className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                                    style={{ color: scoreColor(item.atsScore) }}
                                  >
                                    {item.atsScore}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                                  {item.feedback?.studentFeedback?.summary || item.feedback?.summary || 'No summary available.'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                                  View analysis →
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAILOR TAB */}
            {activeTab === 'tailor' && (
              <div className="max-w-3xl mx-auto animate-fade-up">
                
                {/* Compact explanatory content */}
                {!tailoredData && !isTailoring && (
                  <div className="mb-6 p-5 rounded-2xl flex items-start gap-4" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                    <div className="text-3xl">🪄</div>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-900 mb-1">How AI tailoring works</h3>
                      <p className="text-xs text-indigo-700 leading-relaxed mb-3">
                        We never invent fake experience — we rewrite your real background to match what employers want.
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-indigo-800">
                        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[9px] font-bold">1</span> Extract keywords</span>
                        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[9px] font-bold">2</span> Analyze gaps</span>
                        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[9px] font-bold">3</span> Optimize content</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading state or Inputs */}
                {isTailoring ? (
                  <Card>
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
                      >
                        <span className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>
                        Analyzing job description…
                      </p>
                      <p className="text-xs text-slate-500">Rewriting bullets using the STAR method</p>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <div
                      className="px-5 py-4"
                      style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}
                    >
                      <h2 className="text-sm font-semibold text-slate-800">Target a specific role</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Select a resume and paste the job description.</p>
                    </div>

                    <div className="p-5 space-y-5">
                      {baseResumes.length === 0 ? (
                        <div
                          className="rounded-xl p-4 text-sm font-semibold"
                          style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
                        >
                          Upload and analyze a resume first to use this feature.
                        </div>
                      ) : (
                        <>
                          {/* Resume selector */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Base resume
                            </label>
                            <select
                              className="w-full rounded-xl px-3 py-3 text-sm font-medium text-slate-800 focus:outline-none transition-all"
                              style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                              value={selectedResumeId}
                              onChange={(e) => setSelectedResumeId(e.target.value)}
                              onFocus={(e) => {
                                e.target.style.borderColor = 'var(--color-accent)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#E2E8F0';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <option value="" disabled>Select a resume…</option>
                              {baseResumes.map((r) => (
                                <option key={r._id} value={r._id}>
                                  Base Resume ({new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}) — Score: {r.atsScore}/100
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Job description */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Job Description
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">Required</span>
                            </div>
                            <textarea
                              placeholder="Paste the job description here…"
                              className="w-full h-32 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none transition-all resize-none"
                              style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                              value={jobDescription}
                              onChange={(e) => setJobDescription(e.target.value)}
                              onFocus={(e) => {
                                e.target.style.borderColor = 'var(--color-accent)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#E2E8F0';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </div>

                          {/* Optional links */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Personal Links (Optional)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="url"
                                placeholder="LinkedIn URL"
                                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition-all"
                                style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              />
                              <input
                                type="url"
                                placeholder="GitHub URL"
                                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition-all"
                                style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              />
                              <input
                                type="url"
                                placeholder="Portfolio URL"
                                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition-all"
                                style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              />
                              <input
                                type="url"
                                placeholder="Competitive Programming (e.g., LeetCode)"
                                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition-all"
                                style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                                value={competitiveProgrammingUrl}
                                onChange={(e) => setCompetitiveProgrammingUrl(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              />
                            </div>
                          </div>

                          {/* Mode selection */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              How would you like to improve your resume?
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedMode('quick')}
                                className={`text-left p-4 rounded-xl border-2 transition-all focus-visible:outline-none ${selectedMode === 'quick'
                                    ? 'border-[var(--color-accent)] bg-[var(--color-brand-50)]'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">⭐</span>
                                  <span className={`font-bold text-sm ${selectedMode === 'quick' ? 'text-[var(--color-accent)]' : 'text-slate-800'}`}>
                                    Resume Improvement
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--color-accent)' }}>
                                    Recommended
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  Get ATS insights, resume suggestions, role-match feedback, AI-generated improvements, and an optimized PDF instantly.
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedMode('advanced')}
                                className={`text-left p-4 rounded-xl border-2 transition-all focus-visible:outline-none ${selectedMode === 'advanced'
                                    ? 'border-[var(--color-accent)] bg-[var(--color-brand-50)]'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">⚡</span>
                                  <span className={`font-bold text-sm ${selectedMode === 'advanced' ? 'text-[var(--color-accent)]' : 'text-slate-800'}`}>
                                    Advanced Workspace
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  Open the interactive editing environment with AI-powered editing tools, side-by-side editing, autosave, and version history.
                                </p>
                              </button>
                            </div>
                          </div>

                          {/* Generate button */}
                          <button
                            type="button"
                            onClick={handleTailor}
                            disabled={!jobDescription.trim()}
                            className="premium-btn w-full justify-center py-3.5 mt-2"
                          >
                            {selectedMode === 'quick' ? '✨ Generate Improved Resume' : '✨ Open Advanced Workspace'}
                          </button>
                        </>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}