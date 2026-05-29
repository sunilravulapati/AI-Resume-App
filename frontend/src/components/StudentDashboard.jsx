import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';
import WorkspaceView from './WorkspaceView';

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
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score ?? 0) / 100) * circ;
  const color = scoreColor(score ?? 0);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r}
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
  const [activeTab, setActiveTab] = useState('upload');
  const { userRecord } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [analysis,  setAnalysis]  = useState(null);

  const [sessions,        setSessions]        = useState([]);
  const [baseResumes,     setBaseResumes]     = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [activeSessionId,  setActiveSessionId]  = useState(null);
  const [jobDescription,   setJobDescription]   = useState('');
  const [isTailoring,      setIsTailoring]      = useState(false);
  const [tailoredData,     setTailoredData]     = useState(null);
  const [editedData,       setEditedData]       = useState(null);
  const [parsedText,       setParsedText]       = useState('');

  const [linkedinUrl,               setLinkedinUrl]               = useState('');
  const [githubUrl,                 setGithubUrl]                 = useState('');
  const [portfolioUrl,              setPortfolioUrl]              = useState('');
  const [competitiveProgrammingUrl, setCompetitiveProgrammingUrl] = useState('');
  const [linksOpen,                 setLinksOpen]                 = useState(false);

  // Tailor tab view: 'inputs' | 'output'
  const [tailorView, setTailorView] = useState('inputs');

  // Auto-save status
  const [saveStatus,  setSaveStatus]  = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const saveTimerRef = useRef(null);

  // Export panel scroll ref
  const exportRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'history' && sessions.length === 0) {
      fetchHistory();
    }
    if (activeTab === 'tailor' && baseResumes.length === 0) {
      fetchHistory();
    }
  }, [activeTab]);

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

  const handleAnalysisComplete = (result) => {
    setAnalysis(result);
    setShowModal(false);
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
    if (!selectedResumeId)      return toast.error('Please select a base resume');
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
            linkedin:               linkedinUrl.trim()               || null,
            github:                 githubUrl.trim()                 || null,
            portfolio:              portfolioUrl.trim()              || null,
            competitiveProgramming: competitiveProgrammingUrl.trim() || null,
          },
        },
        { withCredentials: true }
      );
      setTailoredData(res.data.tailoredResume);
      setParsedText(res.data.parsedText || '');
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
    setTailorView('output');
  };

  const userLinks = {
    linkedin:               linkedinUrl.trim()               || null,
    github:                 githubUrl.trim()                 || null,
    portfolio:              portfolioUrl.trim()              || null,
    competitiveProgramming: competitiveProgrammingUrl.trim() || null,
  };

  // Context bar data: look up selected base resume or session for company/role
  const selectedResume = sessions.find((s) => s._id === activeSessionId) || baseResumes.find((h) => h._id === selectedResumeId);

  const TABS = [
    { key: 'upload',  icon: '⚡', label: 'Analyze'  },
    { key: 'history', icon: '📁', label: 'Sessions'  },
    { key: 'tailor',  icon: '✨', label: 'Tailor'   },
  ];

  const bestScore = baseResumes.length
    ? Math.max(...baseResumes.map((h) => h.atsScore || 0))
    : analysis?.atsScore ?? null;

  const buildBreakdownItems = (analysis) => {
    const defaultSub = { structure: 0, impact: 0, skillAlignment: 0, complexity: 0, professionalism: 0, skillProjectFit: 0 };
    const rawSub  = analysis.subScores || defaultSub;
    const totalSub = Object.values(rawSub).reduce((a, b) => a + b, 0);
    const ats     = analysis.atsScore || 0;

    const defs = [
      { name: 'Formatting & layout',   max: 20, key: 'structure',       icon: '📝', type: 'Programmatic', barColor: '#6366F1', desc: 'Checks structure and formatting standards.' },
      { name: 'Impact & metrics',      max: 20, key: 'impact',          icon: '📈', type: 'Programmatic', barColor: '#10B981', desc: 'Checks presence of measurable results.' },
      { name: 'Skill alignment',       max: 20, key: 'skillAlignment',  icon: '🔑', type: 'Programmatic', barColor: '#F59E0B', desc: 'Keyword alignment against expected tech terms.' },
      { name: 'Technical complexity',  max: 15, key: 'complexity',      icon: '🏗️', type: 'AI Cognitive',  barColor: '#8B5CF6', desc: 'Depth of roles, infrastructure, and tools.' },
      { name: 'Professional phrasing', max: 5,  key: 'professionalism', icon: '✍️', type: 'AI Cognitive',  barColor: '#EF4444', desc: 'Usage of active words and formal phrasing.' },
      { name: 'Skill–project match',   max: 10, key: 'skillProjectFit', icon: '🎯', type: 'AI Cognitive',  barColor: '#059669', desc: 'Verification that skills are proven in roles.' },
    ];

    return defs.map((d) => ({
      ...d,
      score: totalSub > 0 ? rawSub[d.key] : Math.round((ats / 100) * d.max),
    }));
  };

  // If a tailored resume is active and we are not currently generating one,
  // take over the screen with the WorkspaceView.
  if (tailoredData && !isTailoring) {
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleAnalysisComplete} />
      )}

      {/* ── Sticky Header ───────────────────────────────────────────────────── */}
      <div
        className="sticky top-[68px] z-30"
        style={{ background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Top row: greeting + badges */}
          <div className="pt-4 pb-2 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-accent)' }}>
                ResumeAI
              </p>
              <h1 className="text-lg font-bold text-slate-800 truncate">
                {userRecord?.firstName ? `Hey, ${userRecord.firstName} 👋` : 'Your dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {sessions.length > 0 && (
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569' }}
                >
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </span>
              )}
              {bestScore != null && (
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)', color: 'var(--color-accent)' }}
                >
                  Best {bestScore}/100
                </span>
              )}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-0.5 pb-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold border-b-2 transition-all duration-200 focus-visible:outline-none rounded-t-lg"
                style={{
                  borderBottomColor: activeTab === tab.key ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-accent)' : '#64748B',
                  background: activeTab === tab.key ? 'var(--color-brand-50)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = '#64748B';
                }}
              >
                <span className="text-sm" aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* ══════════════ ANALYZE TAB ══════════════════════════════════════ */}
        {activeTab === 'upload' && (
          <div className="space-y-5">
            {!analysis ? (
              <>
                {/* CTA cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: '⚡',
                      iconBg: '#EEF2FF',
                      title: 'General analysis',
                      desc: 'Best-practices scan — formatting, impact language, metrics & ATS hygiene. No JD needed.',
                    },
                    {
                      icon: '🎯',
                      iconBg: '#F0FDF4',
                      title: 'Match my resume',
                      desc: 'Deep JD analysis — keyword gaps, role fit score, missing skills & seniority alignment.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.title}
                      onClick={() => setShowModal(true)}
                      className="group text-left p-6 rounded-2xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
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
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                        style={{ background: opt.iconBg }}
                      >
                        {opt.icon}
                      </div>
                      <p className="font-semibold text-slate-800 text-sm mb-2">{opt.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                      <p
                        className="mt-4 text-xs font-semibold flex items-center gap-1"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        Get started →
                      </p>
                    </button>
                  ))}
                </div>

                {/* Pro tip */}
                <div
                  className="flex items-start gap-3 rounded-2xl p-4"
                  style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
                >
                  <span className="text-base shrink-0">💡</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>Pro tip:</span>{' '}
                    Run a general analysis first to get your baseline score, then use Match my resume for each specific role.
                  </p>
                </div>
              </>
            ) : (
              /* ── Analysis Result ── */
              <div className="space-y-5 animate-fade-up">

                {/* Score Hero */}
                <Card>
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center">
                        <ScoreRing score={analysis.atsScore} />
                        <span
                          className="absolute text-xl font-bold tabular-nums"
                          style={{ color: scoreColor(analysis.atsScore) }}
                        >
                          {analysis.atsScore}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ATS Score</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${scoreBadge(analysis.atsScore)}`}
                        >
                          {scoreLabel(analysis.atsScore)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setAnalysis(null); setShowModal(true); }}
                      className="text-xs font-semibold px-4 py-2 rounded-xl border transition-all hover:bg-[var(--color-brand-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      style={{ borderColor: 'var(--color-brand-200)', color: 'var(--color-accent)' }}
                    >
                      + Analyze another
                    </button>
                  </div>
                </Card>

                {/* Role match (targeted mode) */}
                {analysis.matchScore != null && (
                  <Card>
                    <div className="p-5 grid grid-cols-2 gap-4">
                      {[
                        { label: 'General', score: analysis.atsScore },
                        { label: 'Role match', score: analysis.matchScore },
                      ].map(({ label, score }) => (
                        <div
                          key={label}
                          className={`rounded-xl p-4 text-center ${scoreBadge(score)}`}
                          style={{ border: '1px solid' }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">{label}</p>
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <ScoreRing score={score} size={60} strokeWidth={6} />
                              <span className="absolute inset-0 flex items-center justify-center text-base font-bold">
                                {score}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {analysis.keywordMatchRate != null && (
                      <div className="px-5 pb-5">
                        <div className="flex justify-between mb-2">
                          <p className="text-xs font-semibold text-slate-700">Keyword match rate</p>
                          <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                            {analysis.keywordMatchRate}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${analysis.keywordMatchRate}%`, background: 'var(--color-accent)' }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Missing skills */}
                {analysis.missingSkills?.length > 0 && (
                  <Card>
                    <div className="p-5" style={{ background: '#FEF2F2' }}>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">
                        Missing critical skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ background: '#fff', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Score breakdown */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                    <span>📊</span>
                    Score breakdown{' '}
                    <span className="normal-case font-normal text-slate-400 tracking-normal">(tap any card)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {buildBreakdownItems(analysis).map((item, i) => (
                      <ScoreBreakdownCard key={i} item={item} />
                    ))}
                  </div>
                </div>

                {/* AI summary */}
                <Card>
                  <div className="p-5" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                      🤖 AI Summary
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {analysis.studentFeedback?.summary || analysis.summary}
                    </p>
                  </div>
                </Card>

                {/* Strengths & improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <div className="p-5" style={{ background: '#F0FDF4' }}>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">✓ Strengths</p>
                      <ul className="space-y-2.5">
                        {(analysis.studentFeedback?.strengths || analysis.strengths || []).map((s, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-600 shrink-0 mt-0.5 font-bold">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-5" style={{ background: '#FEF2F2' }}>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">→ To improve</p>
                      <ul className="space-y-2.5">
                        {(analysis.studentFeedback?.improvements || analysis.improvements || []).map((s, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                            <span className="text-red-500 shrink-0 mt-0.5 font-bold">→</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </div>
              </div>
            )}
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
              <div className="space-y-12">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                {scoreLabel(item.atsScore)}
                              </span>
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

        {/* ══════════════ TAILOR TAB ═══════════════════════════════════════ */}
        {activeTab === 'tailor' && (
          <div className="space-y-4 animate-fade-up">

            {/* Mobile view toggle (only shown when results exist) */}
            {(tailoredData || isTailoring) && (
              <div
                className="flex p-1 rounded-xl border lg:hidden"
                style={{ background: '#F1F5F9', borderColor: '#E2E8F0' }}
              >
                {[
                  { key: 'inputs', label: '✏️ Inputs' },
                  { key: 'output', label: '✨ Workspace' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setTailorView(v.key)}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none"
                    style={
                      tailorView === v.key
                        ? { background: '#fff', color: 'var(--color-accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                        : { color: '#94A3B8' }
                    }
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

              {/* ── Left: Inputs ── */}
              <div className={`${(tailoredData || isTailoring) && tailorView !== 'inputs' ? 'hidden lg:block' : 'block'}`}>
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
                            {baseResumes.map((item, index) => (
                              <option key={item._id} value={item._id}>
                                Resume {baseResumes.length - index} — {item.atsScore}/100 · {new Date(item.createdAt).toLocaleDateString()}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Job description */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Job description
                            </label>
                            {jobDescription.trim() && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {jobDescription.trim().split(/\s+/).length} words
                              </span>
                            )}
                          </div>
                          <textarea
                            className="w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all min-h-[140px] resize-y leading-relaxed"
                            style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                            placeholder="Paste the full job description here…"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--color-accent)';
                              e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                              e.target.style.background = '#fff';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#E2E8F0';
                              e.target.style.boxShadow = 'none';
                              e.target.style.background = '#F8FAFC';
                            }}
                          />
                        </div>

                        {/* Profile links — collapsible */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setLinksOpen((o) => !o)}
                            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
                          >
                            <span>
                              Profile links{' '}
                              <span className="normal-case font-normal text-slate-400">(optional)</span>
                            </span>
                            <span className="text-base" style={{ color: 'var(--color-accent)' }}>
                              {linksOpen ? '−' : '+'}
                            </span>
                          </button>

                          {linksOpen && (
                            <div className="space-y-3 pt-3">
                              {[
                                { label: 'LinkedIn',                prefix: 'in/', placeholder: 'yourprofile',              val: linkedinUrl,               set: setLinkedinUrl,               type: 'text' },
                                { label: 'GitHub',                  prefix: 'gh/', placeholder: 'yourusername',             val: githubUrl,                 set: setGithubUrl,                 type: 'text' },
                                { label: 'Portfolio',               prefix: null,  placeholder: 'https://yourportfolio.com', val: portfolioUrl,              set: setPortfolioUrl,              type: 'url'  },
                                { label: 'Competitive programming', prefix: null,  placeholder: 'https://leetcode.com/u/…',  val: competitiveProgrammingUrl, set: setCompetitiveProgrammingUrl, type: 'url'  },
                              ].map((field) => (
                                <div key={field.label}>
                                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">{field.label}</label>
                                  <div className="relative">
                                    {field.prefix && (
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
                                        {field.prefix}
                                      </span>
                                    )}
                                    <input
                                      type={field.type}
                                      className={`w-full rounded-xl ${field.prefix ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all`}
                                      style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}
                                      placeholder={field.placeholder}
                                      value={field.val}
                                      onChange={(e) => field.set(e.target.value)}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-accent)';
                                        e.target.style.background = '#fff';
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = '#E2E8F0';
                                        e.target.style.background = '#F8FAFC';
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Generate button */}
                        <button
                          type="button"
                          onClick={handleTailor}
                          disabled={isTailoring || !jobDescription.trim()}
                          className="premium-btn w-full justify-center py-3.5"
                        >
                          {isTailoring ? (
                            <span className="flex items-center justify-center gap-2.5">
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Rewriting your resume…
                            </span>
                          ) : (
                            '✨ Generate tailored resume'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* ── Right: Workspace Output ── */}
              <div className={`${(tailoredData || isTailoring) && tailorView !== 'output' ? 'hidden lg:block' : 'block'}`}>

                {/* Empty state */}
                {!tailoredData && !isTailoring && (
                  <Card>
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                      <h2 className="text-sm font-semibold text-slate-800">AI tailored workspace</h2>
                    </div>
                    <div className="p-6 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                        style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
                      >
                        🪄
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2">How AI tailoring works</h3>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-xs mx-auto">
                        We never invent fake experience — we rewrite your real background to match what employers want.
                      </p>
                      <div className="space-y-4 text-left">
                        {[
                          { n: 1, title: 'Keyword extraction',    desc: 'Scans the JD for required technical and soft skills.' },
                          { n: 2, title: 'Smart reordering',      desc: 'Prioritizes your projects that match the tech stack.' },
                          { n: 3, title: 'STAR method rewriting', desc: 'Enhances bullet points for maximum ATS compatibility.' },
                        ].map(({ n, title, desc }) => (
                          <div key={n} className="flex items-start gap-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                              style={{ background: 'var(--color-brand-50)', color: 'var(--color-accent)' }}
                            >
                              {n}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Loading state */}
                {isTailoring && (
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile FAB — upload tab, no analysis ── */}
      {activeTab === 'upload' && !analysis && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 sm:hidden">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 text-white text-sm font-semibold px-6 py-3.5 rounded-full active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
          >
            <span className="text-base">⚡</span>
            Analyze resume
          </button>
        </div>
      )}
    </div>
  );
}