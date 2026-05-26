import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import ExportPanel from './ExportPanel';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';
import InteractiveEditor from './InteractiveEditor';

// ─── Score helpers ─────────────────────────────────────────────────────────────
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20';
  if (score >= 50) return 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20';
  return 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20';
};
const scoreLabel = (score) => {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Average';
  return 'Needs work';
};
const scoreAccent = (score) => {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

// ─── Reusable card ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Score breakdown card — tap to expand ─────────────────────────────────────
function ScoreBreakdownCard({ item }) {
  const [open, setOpen] = useState(false);
  const percent = Math.round((item.score / item.max) * 100);

  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl transition-all duration-200 hover:border-[var(--color-accent-soft)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg shrink-0" aria-hidden="true">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[var(--text)] truncate">{item.name}</p>
          <p className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">{item.type}</p>
        </div>
        <span className="text-xs font-black text-[var(--text)] tabular-nums shrink-0">
          {item.score}
          <span className="text-[10px] font-bold text-[var(--text-muted)]">/{item.max}</span>
        </span>
      </div>

      <div className="w-full bg-[var(--border)] rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: item.barColor }}
        />
      </div>

      {open && (
        <p className="text-[0.7rem] font-medium text-[var(--text-secondary)] leading-relaxed mt-2 pt-2 border-t border-[var(--border)]">
          {item.desc}
        </p>
      )}
      <p className="text-[0.6rem] font-bold text-[var(--color-accent)] mt-1">
        {open ? 'Tap to collapse' : 'Tap for details'}
      </p>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
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
  const [editedData, setEditedData]             = useState(null);
  const [parsedText, setParsedText]             = useState('');

  const [linkedinUrl, setLinkedinUrl]                             = useState('');
  const [githubUrl, setGithubUrl]                                 = useState('');
  const [portfolioUrl, setPortfolioUrl]                           = useState('');
  const [competitiveProgrammingUrl, setCompetitiveProgrammingUrl] = useState('');
  const [linksOpen, setLinksOpen]                                 = useState(false);

  // Tailor tab view: 'inputs' | 'output'
  const [tailorView, setTailorView] = useState('inputs');

  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'tailor') && history.length === 0) {
      fetchHistory();
    }
  }, [activeTab]);

  // When tailored data arrives, switch to output view on mobile
  useEffect(() => {
    if (tailoredData) setTailorView('output');
  }, [tailoredData]);

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

  const handleAnalysisComplete = (result) => {
    setAnalysis(result);
    setShowModal(false);
    setHistory([]);
    toast.success('Analysis complete!');
  };

  const handleTailor = async () => {
    if (!selectedResumeId)      return toast.error('Please select a base resume');
    if (!jobDescription.trim()) return toast.error('Please paste a job description');
    setIsTailoring(true);
    setTailoredData(null);
    setEditedData(null);
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

  const userLinks = {
    linkedin:               linkedinUrl.trim()               || null,
    github:                 githubUrl.trim()                 || null,
    portfolio:              portfolioUrl.trim()              || null,
    competitiveProgramming: competitiveProgrammingUrl.trim() || null,
  };

  const TABS = [
    { key: 'upload',  icon: '⚡', label: 'Analyze' },
    { key: 'history', icon: '📁', label: 'History' },
    { key: 'tailor',  icon: '✨', label: 'Tailor'  },
  ];

  const bestScore = history.length
    ? Math.max(...history.map((h) => h.atsScore || 0))
    : analysis?.atsScore ?? null;

  const buildBreakdownItems = (analysis) => {
    const defaultSub = {
      structure: 0, impact: 0, skillAlignment: 0,
      complexity: 0, professionalism: 0, skillProjectFit: 0,
    };
    const rawSub  = analysis.subScores || defaultSub;
    const totalSub = Object.values(rawSub).reduce((a, b) => a + b, 0);
    const ats     = analysis.atsScore || 0;

    const defs = [
      { name: 'Formatting & layout',   max: 20, key: 'structure',       icon: '📝', type: 'Programmatic', barColor: '#3399ff', desc: 'Checks structure and formatting standards.' },
      { name: 'Impact & metrics',      max: 20, key: 'impact',          icon: '📈', type: 'Programmatic', barColor: '#34c759', desc: 'Checks presence of measurable results.' },
      { name: 'Skill alignment',       max: 20, key: 'skillAlignment',  icon: '🔑', type: 'Programmatic', barColor: '#ff9f0a', desc: 'Keyword alignment against expected tech terms.' },
      { name: 'Technical complexity',  max: 15, key: 'complexity',      icon: '🏗️', type: 'AI Cognitive',  barColor: '#bf5af2', desc: 'Depth of roles, infrastructure, and tools.' },
      { name: 'Professional phrasing', max: 5,  key: 'professionalism', icon: '✍️', type: 'AI Cognitive',  barColor: '#ff375f', desc: 'Usage of active words and formal phrasing.' },
      { name: 'Skill–project match',   max: 10, key: 'skillProjectFit', icon: '🎯', type: 'AI Cognitive',  barColor: '#30d158', desc: 'Verification that skills are proven in roles.' },
    ];

    return defs.map((d) => ({
      ...d,
      score: totalSub > 0 ? rawSub[d.key] : Math.round((ats / 100) * d.max),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleAnalysisComplete} />
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Wordmark + meta row */}
          <div className="pt-4 pb-2 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-0.5">
                ResumeAI
              </p>
              <h1 className="text-lg font-bold text-[var(--text)] truncate">
                {userRecord?.firstName ? `Hey, ${userRecord.firstName} 👋` : 'Your dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {history.length > 0 && (
                <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {history.length} resume{history.length !== 1 ? 's' : ''}
                </span>
              )}
              {bestScore != null && (
                <span
                  className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full border"
                  style={{ color: scoreAccent(bestScore) }}
                >
                  Best {bestScore}/100
                </span>
              )}
            </div>
          </div>

          {/* Tab nav
            FIX: `hidden xs:inline sm:inline` used a non-existent `xs` breakpoint,
            so labels were invisible on mobile. Now always visible; icon + label
            both show at all sizes using a min-width approach on the button.
          */}
          <div className="flex gap-1 pb-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-t-lg
                  ${activeTab === tab.key
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]/30'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]'
                  }`}
              >
                <span className="text-sm" aria-hidden="true">{tab.icon}</span>
                {/* FIX: was `hidden xs:inline sm:inline` — xs breakpoint doesn't exist
                    in Tailwind by default so labels never showed on mobile.
                    Using `inline` so the label is always visible. The flex-1 buttons
                    already ensure they share space equally without overflowing. */}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">

        {/* ══ UPLOAD TAB ══════════════════════════════════════════════ */}
        {activeTab === 'upload' && (
          <div className="space-y-5">
            {!analysis ? (
              <>
                {/* CTA cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: '⚡',
                      title: 'General analysis',
                      desc: 'Best-practices scan — formatting, impact language, metrics & ATS hygiene. No JD needed.',
                    },
                    {
                      icon: '🎯',
                      title: 'Match my resume',
                      desc: 'Deep JD analysis — keyword gaps, role fit score, missing skills & seniority alignment.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.title}
                      onClick={() => setShowModal(true)}
                      className="group text-left p-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--color-accent)] transition-all duration-200 active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <div className="text-2xl mb-3">{opt.icon}</div>
                      <p className="font-bold text-[var(--text)] text-sm mb-1.5">{opt.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{opt.desc}</p>
                      <p className="mt-4 text-xs font-bold text-[var(--color-accent)] flex items-center gap-1">
                        Get started <span>→</span>
                      </p>
                    </button>
                  ))}
                </div>

                {/* Pro tip */}
                <div className="flex items-start gap-3 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-4">
                  <span className="text-lg shrink-0">💡</span>
                  <p className="text-sm text-[var(--text)] leading-relaxed font-medium">
                    <span className="font-bold text-[var(--color-accent)]">Pro tip:</span>{' '}
                    Run a general analysis first to get your baseline score, then use Match my resume for each specific role.
                  </p>
                </div>
              </>
            ) : (
              /* ── Analysis result ── */
              <div className="space-y-4 animate-fade-up">

                {/* Score hero */}
                <Card>
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                        ATS score
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-5xl font-black tabular-nums leading-none"
                          style={{ color: scoreAccent(analysis.atsScore) }}
                        >
                          {analysis.atsScore}
                        </span>
                        <span className="text-base font-bold text-[var(--text-muted)]">/100</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge(analysis.atsScore)}`}>
                        {scoreLabel(analysis.atsScore)}
                      </span>
                      <button
                        onClick={() => { setAnalysis(null); setShowModal(true); }}
                        className="text-xs font-bold text-[var(--color-accent)] border border-[var(--color-accent-soft)] px-3 py-1.5 rounded-xl hover:bg-[var(--color-accent-soft)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      >
                        + Analyze another
                      </button>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${analysis.atsScore}%`,
                          backgroundColor: scoreAccent(analysis.atsScore),
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Targeted mode extras */}
                {analysis.matchScore != null && (
                  <Card>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div className={`rounded-xl p-4 text-center border ${scoreBadge(analysis.atsScore)}`}>
                        <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-1 opacity-70">General</p>
                        <p className="text-2xl font-black">
                          {analysis.atsScore}
                          <span className="text-sm font-bold opacity-50">/100</span>
                        </p>
                      </div>
                      <div className={`rounded-xl p-4 text-center border ${scoreBadge(analysis.matchScore)}`}>
                        <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-1 opacity-70">Role match</p>
                        <p className="text-2xl font-black">
                          {analysis.matchScore}
                          <span className="text-sm font-bold opacity-50">/100</span>
                        </p>
                      </div>
                    </div>

                    {analysis.keywordMatchRate != null && (
                      <div className="px-4 pb-4">
                        <div className="flex justify-between mb-2">
                          <p className="text-xs font-bold text-[var(--text)]">Keyword match rate</p>
                          <span className="text-xs font-black text-[var(--color-accent)]">
                            {analysis.keywordMatchRate}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-1000"
                            style={{ width: `${analysis.keywordMatchRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {analysis.missingSkills?.length > 0 && (
                  <Card>
                    <div className="p-4 bg-[var(--danger-soft)]">
                      <p className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider mb-3">
                        Missing critical skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs bg-[var(--bg-elevated)] text-[var(--danger)] border border-[var(--danger)]/20 px-3 py-1 rounded-full font-bold"
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3 flex items-center gap-1.5">
                    <span>📊</span> Score breakdown{' '}
                    <span className="normal-case font-medium text-[var(--text-muted)] tracking-normal">
                      (tap any card)
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {buildBreakdownItems(analysis).map((item, i) => (
                      <ScoreBreakdownCard key={i} item={item} />
                    ))}
                  </div>
                </div>

                {/* AI summary
                  FIX: was `style={{ borderRadius: 0 }}` which overrode the Card's
                  `overflow-hidden rounded-2xl`, making the left border appear inside a
                  sharp-cornered box. Fixed by removing the inline override and using
                  a class-only approach with rounded-l-none to get the flush left border. */}
                <Card>
                  <div className="p-4 border-l-4 border-[var(--color-accent)] rounded-l-none">
                    <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      🤖 AI summary
                    </p>
                    <p className="text-sm font-medium text-[var(--text)] leading-relaxed">
                      {analysis.studentFeedback?.summary || analysis.summary}
                    </p>
                  </div>
                </Card>

                {/* Strengths & improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <div className="p-4 bg-[var(--success-soft)]">
                      <p className="text-xs font-bold text-[var(--success)] uppercase tracking-wider mb-3">
                        🟢 Strengths
                      </p>
                      <ul className="space-y-2.5">
                        {(analysis.studentFeedback?.strengths || analysis.strengths || []).map((s, i) => (
                          <li
                            key={i}
                            className="text-sm font-medium text-[var(--text)] flex items-start gap-2 leading-relaxed"
                          >
                            <span className="text-[var(--success)] shrink-0 mt-0.5 font-bold">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4 bg-[var(--danger-soft)]">
                      <p className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider mb-3">
                        🔴 To improve
                      </p>
                      <ul className="space-y-2.5">
                        {(analysis.studentFeedback?.improvements || analysis.improvements || []).map((s, i) => (
                          <li
                            key={i}
                            className="text-sm font-medium text-[var(--text)] flex items-start gap-2 leading-relaxed"
                          >
                            <span className="text-[var(--danger)] shrink-0 mt-0.5 font-bold">→</span>
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

        {/* ══ HISTORY TAB ════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="animate-fade-up">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                  <span className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold">Loading history…</span>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-2xl mb-4">
                  📭
                </div>
                <p className="font-bold text-base text-[var(--text)] mb-1">No resumes yet</p>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Upload your first resume to get started.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-4">
                  {history.length} resume{history.length !== 1 ? 's' : ''} analyzed — tap any card for the full report.
                </p>
                <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 xl:grid-cols-3">
                  {history.map((item, index) => (
                    <button
                      key={item._id}
                      onClick={() => navigate(`/resume/${item._id}`)}
                      className="w-full text-left bg-[var(--bg-elevated)] rounded-2xl border-2 border-[var(--border)] p-5 flex items-start justify-between gap-4 hover:border-[var(--color-accent)] active:scale-[0.98] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      {/* Score */}
                      <div className="shrink-0">
                        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                          Resume {history.length - index}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-3xl font-black tabular-nums leading-none"
                            style={{ color: scoreAccent(item.atsScore) }}
                          >
                            {item.atsScore}
                          </span>
                          <span className="text-xs font-bold text-[var(--text-muted)]">/100</span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center justify-end gap-2 mb-2 flex-wrap">
                          <span className="text-[0.6rem] text-[var(--text-muted)] font-medium">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold border ${scoreBadge(item.atsScore)}`}>
                            {scoreLabel(item.atsScore)}
                          </span>
                          {item.analysisMode === 'targeted' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20">
                              Targeted
                            </span>
                          )}
                        </div>
                        {item.roleName && (
                          <p className="text-xs font-bold text-[var(--color-accent)] truncate mb-1">
                            {item.company ? `${item.company} · ` : ''}{item.roleName}
                          </p>
                        )}
                        <p className="text-xs font-medium text-[var(--text-secondary)] line-clamp-2 leading-relaxed text-left">
                          {item.feedback?.summary}
                        </p>
                        <p className="text-xs font-bold text-[var(--color-accent)] mt-2">View report →</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ TAILOR TAB ═════════════════════════════════════════════ */}
        {activeTab === 'tailor' && (
          <div className="space-y-4 animate-fade-up">

            {/* Mobile view toggle */}
            {(tailoredData || isTailoring) && (
              <div className="flex p-1 bg-[var(--bg-muted)] rounded-xl border border-[var(--border)] lg:hidden">
                {[
                  { key: 'inputs', label: '✏️ Inputs' },
                  { key: 'output', label: '✨ Results' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setTailorView(v.key)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
                      ${tailorView === v.key
                        ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                      }`}
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
                  <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-muted)]">
                    <h2 className="text-base font-bold text-[var(--text)]">Target a specific role</h2>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                      Select a resume and paste the job description.
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    {history.length === 0 ? (
                      <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl p-4 text-sm text-[var(--danger)] font-bold">
                        Upload and analyze a resume first to use this feature.
                      </div>
                    ) : (
                      <>
                        {/* Resume selector */}
                        <div>
                          <label className="block text-[0.65rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                            Base resume
                          </label>
                          <select
                            className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all"
                            value={selectedResumeId}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                          >
                            {history.map((item, index) => (
                              <option key={item._id} value={item._id}>
                                Resume {history.length - index} — {item.atsScore}/100 · {new Date(item.createdAt).toLocaleDateString()}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Job description */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[0.65rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                              Job description
                            </label>
                            {jobDescription.trim() && (
                              <span className="text-[0.6rem] font-bold text-[var(--text-muted)]">
                                {jobDescription.trim().split(/\s+/).length} words
                              </span>
                            )}
                          </div>
                          <textarea
                            className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all min-h-[120px] sm:min-h-[160px] resize-y leading-relaxed"
                            placeholder="Paste the full job description here…"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                          />
                        </div>

                        {/* Profile links — collapsible */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setLinksOpen((o) => !o)}
                            className="w-full flex items-center justify-between text-[0.65rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider py-2 hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
                          >
                            <span>
                              Profile links{' '}
                              <span className="normal-case font-medium text-[var(--text-muted)]">(optional)</span>
                            </span>
                            <span className="text-[var(--color-accent)] text-base">{linksOpen ? '−' : '+'}</span>
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
                                  <label className="block text-[0.65rem] font-bold text-[var(--text-secondary)] mb-1.5">
                                    {field.label}
                                  </label>
                                  <div className="relative">
                                    {field.prefix && (
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium select-none">
                                        {field.prefix}
                                      </span>
                                    )}
                                    <input
                                      type={field.type}
                                      className={`w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] ${field.prefix ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all`}
                                      placeholder={field.placeholder}
                                      value={field.val}
                                      onChange={(e) => field.set(e.target.value)}
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
                          className="w-full py-4 px-5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                        >
                          {isTailoring ? (
                            <span className="flex items-center justify-center gap-2.5">
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Rewriting your resume…
                            </span>
                          ) : (
                            'Generate tailored resume ✨'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* ── Right: AI Output ── */}
              <div className={`${(tailoredData || isTailoring) && tailorView !== 'output' ? 'hidden lg:block' : 'block'}`}>
                <Card>
                  <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-muted)]">
                    <h2 className="text-base font-bold text-[var(--text)]">AI tailored results</h2>
                  </div>

                  <div className="p-5">
                    {/* Empty state */}
                    {!tailoredData && !isTailoring && (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] flex items-center justify-center text-2xl mx-auto mb-4">
                          🪄
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text)] mb-2">How AI tailoring works</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed max-w-xs mx-auto font-medium">
                          We never invent fake experience — we rewrite your real background to match what employers want.
                        </p>
                        <div className="space-y-4 text-left">
                          {[
                            { n: 1, title: 'Keyword extraction',    desc: 'Scans the JD for required technical and soft skills.' },
                            { n: 2, title: 'Smart reordering',      desc: 'Prioritizes your projects that match the tech stack.' },
                            { n: 3, title: 'STAR method rewriting', desc: 'Enhances bullet points for maximum ATS compatibility.' },
                          ].map(({ n, title, desc }) => (
                            <div key={n} className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                {n}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[var(--text)]">{title}</p>
                                <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">{desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loading */}
                    {isTailoring && (
                      <div className="flex flex-col items-center justify-center py-14">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] flex items-center justify-center mb-4">
                          <span className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="font-bold text-[var(--color-accent)] text-sm mb-1">Analyzing job description…</p>
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Rewriting bullets using the STAR method
                        </p>
                      </div>
                    )}

                    {/* Results */}
                    {tailoredData && !isTailoring && (
                      <div className="space-y-6">
                        <div className="bg-[var(--success-soft)] border border-[var(--success)]/20 rounded-xl p-4 flex items-start gap-3">
                          <span className="text-[var(--success)] font-bold text-base shrink-0">✓</span>
                          <div>
                            <p className="text-sm font-bold text-[var(--success)]">Optimization complete</p>
                            <p className="text-xs font-medium text-[var(--text)] mt-0.5 leading-relaxed">
                              Review all sections below, then export as PDF or LaTeX.
                            </p>
                          </div>
                        </div>

                        <InteractiveEditor
                          initialData={tailoredData}
                          onDataChange={setEditedData}
                        />

                        <ExportPanel
                          tailoredData={editedData || tailoredData}
                          parsedText={parsedText}
                          user={userRecord}
                          resumeId={selectedResumeId}
                          userLinks={userLinks}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom FAB — mobile only, upload tab ────────────── */}
      {activeTab === 'upload' && !analysis && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 sm:hidden">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 bg-[var(--color-accent)] text-white text-sm font-bold px-6 py-3.5 rounded-full shadow-lg active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            <span className="text-base">⚡</span>
            Analyze resume
          </button>
        </div>
      )}
    </div>
  );
}