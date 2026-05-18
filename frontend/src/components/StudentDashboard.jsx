import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import ExportPanel from './ExportPanel';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';
import { WelcomeStrip, StatPill, TabNav, EmptyState } from './DashboardShell';
import TailoredPreview from './TailoredPreview';

/* score helpers */
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20 shadow-sm';
  if (score >= 50) return 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 shadow-sm';
  return 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20 shadow-sm';
};
const scoreLabel = (score) => {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Average';
  return 'Needs Work';
};
const scoreAccent = (score) => {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const { userRecord } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [analysis, setAnalysis]   = useState(null);

  const [history, setHistory]               = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription]     = useState('');
  const [isTailoring, setIsTailoring]           = useState(false);
  const [tailoredData, setTailoredData]         = useState(null);
  const [parsedText, setParsedText]             = useState('');

  /* URL override states */
  const [linkedinUrl, setLinkedinUrl]                             = useState('');
  const [githubUrl, setGithubUrl]                                 = useState('');
  const [portfolioUrl, setPortfolioUrl]                           = useState('');
  const [competitiveProgrammingUrl, setCompetitiveProgrammingUrl] = useState('');
  const [linksOpen, setLinksOpen]                     = useState(false);

  /* Mobile tailor tab toggle */
  const [mobileTailorTab, setMobileTailorTab] = useState('edit');

  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'tailor') && history.length === 0) {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('/api/resume/history', { withCredentials: true });
      setHistory(res.data);
      if (res.data.length > 0) setSelectedResumeId(res.data[0]._id);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalysisComplete = (analysisResult) => {
    setAnalysis(analysisResult);
    setShowModal(false);
    setHistory([]);
    toast.success('Analysis complete!');
  };

  const handleTailor = async () => {
    if (!selectedResumeId)      return toast.error('Please select a base resume');
    if (!jobDescription.trim()) return toast.error('Please paste a Job Description');
    setIsTailoring(true);
    setTailoredData(null);
    setParsedText('');
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
      toast.success('Resume tailored successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to tailor resume');
    } finally {
      setIsTailoring(false);
    }
  };

  /* ── userLinks object passed to ExportPanel → TailoredPDF ───────── */
  const userLinks = {
    linkedin:               linkedinUrl.trim()               || null,
    github:                 githubUrl.trim()                 || null,
    portfolio:              portfolioUrl.trim()              || null,
    competitiveProgramming: competitiveProgrammingUrl.trim() || null,
  };

  /* ─── tabs config ─────────────────────────────────────────────────── */
  const TABS = [
    { key: 'upload',  icon: '⚡', label: 'Analyze' },
    { key: 'history', icon: '📁', label: 'History' },
    { key: 'tailor',  icon: '✨', label: 'Tailor' },
  ];

  const bestScore = history.length
    ? Math.max(...history.map((h) => h.atsScore || 0))
    : analysis?.atsScore ?? null;

  const firstName = userRecord?.firstName;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAnalysisComplete}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <WelcomeStrip
          firstName={firstName}
          subtitle="Analyze your resume, track scores over time, and tailor content for each job application."
        >
          {history.length > 0 && <StatPill label="Resumes" value={history.length} />}
          {bestScore != null && (
            <StatPill label="Best score" value={`${bestScore}/100`} accent={scoreAccent(bestScore)} />
          )}
        </WelcomeStrip>
        <div className="mt-8 mb-2">
          <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
      </div>



      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">

        {/* ══════════════════ UPLOAD TAB ══════════════════ */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
              {!analysis ? (
                <div className="p-8 sm:p-10">
                  <h2 className="text-xl font-bold text-[var(--text)] mb-2 font-display">Analyze Your Resume</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
                    Choose a quick best-practices scan or a targeted match against a specific job description.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <button
                      onClick={() => setShowModal(true)}
                      className="group relative text-left p-6 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-brand-50)] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">⚡</div>
                      <h3 className="font-bold text-[var(--text)] text-base mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                        General Analysis
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Best-practices scan — formatting, impact language, metrics & ATS hygiene. No JD needed.
                      </p>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Get started <span>→</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowModal(true)}
                      className="group relative text-left p-6 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success-soft)] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--success)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--success)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">🎯</div>
                      <h3 className="font-bold text-[var(--text)] text-base mb-2 group-hover:text-[var(--success)] transition-colors">
                        Match My Resume
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Deep JD analysis — keyword gaps, role fit score, missing skills & seniority alignment.
                      </p>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[var(--success)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Get started <span>→</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-start gap-4 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-5">
                    <span className="text-xl shrink-0">💡</span>
                    <p className="text-sm text-[var(--text)] leading-relaxed font-medium">
                      <span className="font-bold text-[var(--color-accent)]">Pro tip:</span>{' '}
                      Run a General Analysis first to get your baseline score, then use Match My Resume for each specific role you apply to.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Analysis result ── */
                <div className="animate-fade-up">
                  <div className="px-8 py-7 border-b border-[var(--border)] bg-gradient-to-br from-[var(--bg-muted)] to-[var(--bg-elevated)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-2">
                          {analysis.matchScore != null ? 'General Score' : 'ATS Score'}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tight" style={{ color: scoreAccent(analysis.atsScore) }}>
                            {analysis.atsScore}
                          </span>
                          <span className="text-lg text-[var(--text-muted)] font-bold">/100</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2.5">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold border ${scoreBadge(analysis.atsScore)}`}>
                          {scoreLabel(analysis.atsScore)}
                        </span>
                        <button
                          onClick={() => { setAnalysis(null); setShowModal(true); }}
                          className="text-xs font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] border-2 border-[var(--color-accent-soft)] hover:border-[var(--color-accent)] bg-[var(--bg-elevated)] px-4 py-2 rounded-xl transition-all duration-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] mt-2"
                        >
                          + Analyze Another
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {analysis.matchScore != null && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`rounded-2xl border p-5 text-center bg-[var(--bg-elevated)] shadow-sm ${scoreBadge(analysis.atsScore)}`}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">General</p>
                            <p className="text-3xl font-black">{analysis.atsScore}<span className="text-base font-bold opacity-50">/100</span></p>
                          </div>
                          <div className={`rounded-2xl border p-5 text-center bg-[var(--bg-elevated)] shadow-sm ${scoreBadge(analysis.matchScore)}`}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Role Match</p>
                            <p className="text-3xl font-black">{analysis.matchScore}<span className="text-base font-bold opacity-50">/100</span></p>
                          </div>
                        </div>

                        {analysis.keywordMatchRate != null && (
                          <div className="bg-[var(--bg-muted)] rounded-2xl p-6 border border-[var(--border)]">
                            <div className="flex justify-between mb-3">
                              <p className="text-sm font-bold text-[var(--text)]">Keyword Match Rate</p>
                              <span className="text-sm font-black text-[var(--color-accent)]">{analysis.keywordMatchRate}%</span>
                            </div>
                            <div className="w-full bg-[var(--border-strong)] rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-1000 ease-out"
                                style={{ width: `${analysis.keywordMatchRate}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {analysis.missingSkills?.length > 0 && (
                          <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-2xl p-6">
                            <p className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider mb-3">Missing Critical Skills</p>
                            <div className="flex flex-wrap gap-2.5">
                              {analysis.missingSkills.map((s, i) => (
                                <span key={i} className="text-xs bg-[var(--bg-elevated)] text-[var(--danger)] border border-[var(--danger)]/20 px-3 py-1.5 rounded-full font-bold shadow-sm">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.experienceGap && (
                          <div className="bg-[var(--warning-soft)] border border-[var(--warning)]/20 rounded-2xl p-6">
                            <p className="text-xs font-bold text-[var(--warning)] uppercase tracking-wider mb-2">Experience Gap</p>
                            <p className="text-sm font-medium text-[var(--text)] leading-relaxed">{analysis.experienceGap}</p>
                          </div>
                        )}
                      </div>
                    )}

                      {/* Interactive Score Breakdown Panel */}
                      <div className="border-t border-[var(--border)] pt-8">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-accent)] mb-5 flex items-center gap-2">
                          <span className="text-base">📊</span> Interactive ATS Score Breakdown
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          {(() => {
                            const defaultSub = { structure: 0, impact: 0, skillAlignment: 0, complexity: 0, professionalism: 0, skillProjectFit: 0 };
                            const rawSub = analysis.subScores || defaultSub;
                            const totalSub = rawSub.structure + rawSub.impact + rawSub.skillAlignment + rawSub.complexity + rawSub.professionalism + rawSub.skillProjectFit;
                            
                            const ats = analysis.atsScore || 0;
                            const items = totalSub > 0 ? [
                              { name: 'Formatting & Layout', score: rawSub.structure, max: 20, desc: 'Checks structure and formatting standards.', color: 'from-[#0066cc] to-[#3399ff]', icon: '📝', type: 'Programmatic' },
                              { name: 'Impact & Metrics', score: rawSub.impact, max: 20, desc: 'Checks presence of measurable results.', color: 'from-[#34c759] to-[#30d158]', icon: '📈', type: 'Programmatic' },
                              { name: 'Skill Alignment', score: rawSub.skillAlignment, max: 20, desc: 'Keyword alignment against expected tech terms.', color: 'from-[#ff9f0a] to-[#ffb340]', icon: '🔑', type: 'Programmatic' },
                              { name: 'Technical Complexity', score: rawSub.complexity, max: 15, desc: 'Depth of roles, infrastructure, and tools.', color: 'from-[#bf5af2] to-[#c56cf0]', icon: '🏗️', type: 'AI Cognitive' },
                              { name: 'Professional Phrasing', score: rawSub.professionalism, max: 5, desc: 'Usage of active words and formal phrasing.', color: 'from-[#ff375f] to-[#ff6b8b]', icon: '✍️', type: 'AI Cognitive' },
                              { name: 'Skill-Project Match', score: rawSub.skillProjectFit, max: 10, desc: 'Verification that skills are proven in roles.', color: 'from-[#30d158] to-[#66bb6a]', icon: '🎯', type: 'AI Cognitive' }
                            ] : [
                              { name: 'Formatting & Layout', score: Math.round((ats / 100) * 20), max: 20, desc: 'Checks structure and formatting standards.', color: 'from-[#0066cc] to-[#3399ff]', icon: '📝', type: 'Programmatic' },
                              { name: 'Impact & Metrics', score: Math.round((ats / 100) * 20), max: 20, desc: 'Checks presence of measurable results.', color: 'from-[#34c759] to-[#30d158]', icon: '📈', type: 'Programmatic' },
                              { name: 'Skill Alignment', score: Math.round((ats / 100) * 20), max: 20, desc: 'Keyword alignment against expected tech terms.', color: 'from-[#ff9f0a] to-[#ffb340]', icon: '🔑', type: 'Programmatic' },
                              { name: 'Technical Complexity', score: Math.round((ats / 100) * 15), max: 15, desc: 'Depth of roles, infrastructure, and tools.', color: 'from-[#bf5af2] to-[#c56cf0]', icon: '🏗️', type: 'AI Cognitive' },
                              { name: 'Professional Phrasing', score: Math.round((ats / 100) * 5), max: 5, desc: 'Usage of active words and formal phrasing.', color: 'from-[#ff375f] to-[#ff6b8b]', icon: '✍️', type: 'AI Cognitive' },
                              { name: 'Skill-Project Match', score: Math.round((ats / 100) * 10), max: 10, desc: 'Verification that skills are proven in roles.', color: 'from-[#30d158] to-[#66bb6a]', icon: '🎯', type: 'AI Cognitive' }
                            ];

                            return items.map((item, idx) => {
                              const percent = Math.round((item.score / item.max) * 100);
                              return (
                                <div 
                                  key={idx} 
                                  className="group relative flex flex-col p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--color-accent-soft)] transition-all duration-300 overflow-hidden cursor-help"
                                >
                                  {/* Hover overlay for descriptions */}
                                  <div className="absolute inset-0 bg-[var(--bg-muted)] opacity-0 group-hover:opacity-100 flex flex-col justify-center p-4 transition-all duration-300 translate-y-full group-hover:translate-y-0">
                                    <span className="text-base mb-1">{item.icon}</span>
                                    <p className="text-xs font-bold text-[var(--text)] mb-1">{item.name}</p>
                                    <p className="text-[0.7rem] text-[var(--text-secondary)] leading-relaxed font-medium">{item.desc}</p>
                                    <div className="mt-3 flex items-center justify-between text-[0.65rem] font-bold text-[var(--text-muted)]">
                                      <span>Category: {item.type}</span>
                                      <span>Target: {item.max}pts</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg">{item.icon}</span>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="text-xs font-bold text-[var(--text)] truncate leading-tight">{item.name}</h5>
                                      <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">{item.type}</span>
                                    </div>
                                  </div>

                                  <div className="mt-auto flex items-center justify-between gap-4">
                                    <div className="flex-1 bg-[var(--border)] rounded-full h-2 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`} 
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-black text-[var(--text)] tabular-nums shrink-0">
                                      {item.score}<span className="text-[10px] font-bold text-[var(--text-muted)]">/{item.max}</span>
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      <div className="border-t border-[var(--border)] pt-8">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-accent)] mb-3 flex items-center gap-2"><span className="text-base">🤖</span> AI Summary</p>
                        <p className="text-sm font-medium text-[var(--text)] leading-relaxed italic">
                          {analysis.studentFeedback?.summary || analysis.summary}
                        </p>
                      </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="bg-[var(--success-soft)] border border-[var(--success)]/20 rounded-2xl p-6">
                        <h4 className="font-bold text-[var(--success)] text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">🟢 Top Strengths</h4>
                        <ul className="space-y-3">
                          {(analysis.studentFeedback?.strengths || analysis.strengths || []).map((s, i) => (
                            <li key={i} className="text-sm font-medium text-[var(--text)] flex items-start gap-2.5 leading-relaxed">
                              <span className="text-[var(--success)] mt-0.5 shrink-0 font-bold">✓</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-2xl p-6">
                        <h4 className="font-bold text-[var(--danger)] text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">🔴 Improvements</h4>
                        <ul className="space-y-3">
                          {(analysis.studentFeedback?.improvements || analysis.improvements || []).map((imp, i) => (
                            <li key={i} className="text-sm font-medium text-[var(--text)] flex items-start gap-2.5 leading-relaxed">
                              <span className="text-[var(--danger)] mt-0.5 shrink-0 font-bold">→</span>{imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ HISTORY TAB ══════════════════ */}
        {activeTab === 'history' && (
          <div className="animate-fade-up">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <span className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-sm font-bold">Loading history…</span>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-3xl bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-3xl mb-5 shadow-sm">📭</div>
                <p className="font-bold text-lg text-[var(--text)] mb-1">No resumes analyzed yet</p>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Upload your first resume to get started.</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-6">
                  {history.length} resume{history.length !== 1 ? 's' : ''} analyzed — click any card for the full report.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {history.map((item, index) => (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/resume/${item._id}`)}
                      className="group bg-[var(--bg-elevated)] rounded-3xl border-2 border-[var(--border)] p-6 flex flex-col gap-4 cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--bg-muted)] shadow-sm hover:shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/resume/${item._id}`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-1.5">
                            Resume {history.length - index}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-black tracking-tight" style={{ color: scoreAccent(item.atsScore) }}>
                              {item.atsScore}
                            </span>
                            <span className="text-sm font-bold text-[var(--text-muted)]">/100</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold border ${scoreBadge(item.atsScore)}`}>
                            {scoreLabel(item.atsScore)}
                          </span>
                          {item.analysisMode === 'targeted' && (
                            <span className="px-3 py-1 rounded-full text-[0.65rem] font-bold bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20">
                              Targeted
                            </span>
                          )}
                        </div>
                      </div>

                      {item.roleName && (
                        <p className="text-sm font-bold text-[var(--color-accent)] truncate">
                          {item.company ? `${item.company} · ` : ''}{item.roleName}
                        </p>
                      )}

                      <p className="text-sm font-medium text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">
                        {item.feedback?.summary}
                      </p>

                      <div className="flex items-center gap-1.5 pt-4 border-t border-[var(--border)]">
                        <span className="text-xs font-bold text-[var(--color-accent)] group-hover:underline">View full analysis</span>
                        <span className="text-[var(--color-accent)] text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════ TAILOR TAB ══════════════════ */}
        {activeTab === 'tailor' && (
          <div className="flex flex-col h-full gap-6">
            
            {/* Mobile Tabbed Toggle */}
            <div className="lg:hidden flex p-1.5 bg-[var(--bg-muted)] rounded-2xl border border-[var(--border)] mb-2">
              <button
                onClick={() => setMobileTailorTab('edit')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${mobileTailorTab === 'edit' ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                ✏️ Inputs
              </button>
              <button
                onClick={() => setMobileTailorTab('preview')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${mobileTailorTab === 'preview' ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                👀 Preview Output
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-280px)] items-start">
              
              {/* Left: Inputs */}
              <div className={`bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden flex-col h-full max-h-full ${mobileTailorTab === 'edit' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--bg-muted)] shrink-0">
                  <h2 className="text-lg font-bold text-[var(--text)] font-display">Target a Specific Role</h2>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Select a resume and paste the job description below.</p>
                </div>

                <div className="p-8 overflow-y-auto grow custom-scrollbar">
                {history.length === 0 ? (
                  <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl p-4 text-sm text-[var(--danger)] font-bold">
                    Please upload and analyze a resume first to use this feature.
                  </div>
                ) : (
                  <>
                    {/* Resume selector */}
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                        Select Base Resume
                      </label>
                      <select
                        className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300"
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                      >
                        {history.map((item, index) => (
                          <option key={item._id} value={item._id}>
                            Resume {history.length - index} — Score: {item.atsScore} ({new Date(item.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Job description */}
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                        Job Description
                      </label>
                      <textarea
                        className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300 min-h-[180px] resize-y leading-relaxed"
                        placeholder="Paste the full job description here…"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      {jobDescription.trim() && (
                        <p className="text-xs font-bold text-[var(--text-muted)] mt-2 text-right">
                          {jobDescription.trim().split(/\s+/).length} words
                        </p>
                      )}
                    </div>

                    {/* ── Profile links (collapsible) ───────────────────── */}
                    <div className="mb-6">
                      <button
                        type="button"
                        onClick={() => setLinksOpen((o) => !o)}
                        className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider py-2 hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg px-2 -mx-2"
                      >
                        <span>
                          Profile Links{' '}
                          <span className="normal-case font-medium text-[var(--text-muted)]">(optional)</span>
                        </span>
                        <span className="text-[var(--color-accent)] text-lg">{linksOpen ? '−' : '+'}</span>
                      </button>

                      {linksOpen && (
                      <div className="space-y-4 pt-3 animate-fade-up">
                        {/* LinkedIn */}
                        <div>
                          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">LinkedIn</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium select-none">in/</span>
                            <input
                              type="text"
                              className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] pl-9 pr-4 py-2.5 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300"
                              placeholder="yourprofile"
                              value={linkedinUrl}
                              onChange={(e) => setLinkedinUrl(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* GitHub */}
                        <div>
                          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">GitHub</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium select-none">gh/</span>
                            <input
                              type="text"
                              className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] pl-10 pr-4 py-2.5 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300"
                              placeholder="yourusername"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Portfolio */}
                        <div>
                          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Portfolio Website</label>
                          <input
                            type="url"
                            className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300"
                            placeholder="https://yourportfolio.com"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                          />
                        </div>

                        {/* Competitive programming */}
                        <div>
                          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Competitive Programming</label>
                          <input
                            type="url"
                            className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all duration-300"
                            placeholder="https://leetcode.com/u/yourhandle"
                            value={competitiveProgrammingUrl}
                            onChange={(e) => setCompetitiveProgrammingUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleTailor}
                      disabled={isTailoring || !jobDescription.trim()}
                      className="w-full py-4 px-6 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                    >
                      {isTailoring ? (
                        <span className="flex items-center justify-center gap-2.5">
                          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Rewriting your resume…
                        </span>
                      ) : 'Generate Tailored Resume'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right: AI Output */}
            <div className={`bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden flex-col h-full max-h-full ${mobileTailorTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--bg-muted)] shrink-0">
                <h2 className="text-lg font-bold text-[var(--text)] font-display">AI Tailored Results</h2>
              </div>

              <div className="p-8 overflow-y-auto grow custom-scrollbar">
                  {!tailoredData && !isTailoring && (
                    <div className="text-center py-8">
                      <div className="inline-flex w-16 h-16 rounded-3xl bg-[var(--color-brand-50)] items-center justify-center text-3xl mb-6 shadow-sm border border-[var(--color-brand-100)]">🪄</div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-2">How AI Tailoring Works</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed max-w-sm mx-auto font-medium">
                        We never invent fake experience. Our AI analyzes your actual background and rewrites it to match the employer's exact needs.
                      </p>
                      <div className="space-y-6 text-left">
                        {[
                          { n: 1, title: 'Keyword Extraction',    desc: 'Scans the JD for required technical and soft skills.' },
                          { n: 2, title: 'Smart Reordering',      desc: 'Prioritizes your projects that match the tech stack in the JD.' },
                          { n: 3, title: 'STAR Method Rewriting', desc: 'Enhances bullet points for maximum ATS compatibility.' },
                        ].map(({ n, title, desc }) => (
                          <div key={n} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                              {n}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text)]">{title}</h4>
                              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1 leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isTailoring && (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                      <div className="w-16 h-16 rounded-3xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] flex items-center justify-center mb-6 shadow-sm">
                        <span className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></span>
                      </div>
                      <p className="font-black text-[var(--color-accent)] text-lg mb-2">Analyzing Job Description…</p>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">Rewriting bullets using the STAR method.</p>
                    </div>
                  )}

                  {tailoredData && !isTailoring && (
                    <div className="space-y-8 animate-fade-up">
                      {/* ── Success banner ── */}
                      <div className="bg-[var(--success-soft)] border border-[var(--success)]/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-[var(--success)] font-bold text-lg">
                          ✓
                        </div>
                        <div>
                          <p className="text-base font-bold text-[var(--success)]">Optimization Complete</p>
                          <p className="text-sm font-medium text-[var(--text)] mt-1.5 leading-relaxed">
                            Review all sections below, then export as PDF or LaTeX.
                          </p>
                        </div>
                      </div>

                      <TailoredPreview data={tailoredData} />

                      {/* ── Export ── */}
                      <ExportPanel
                        tailoredData={tailoredData}
                        parsedText={parsedText}
                        user={userRecord}
                        resumeId={selectedResumeId}
                        userLinks={userLinks}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}