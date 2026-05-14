import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import ExportPanel from './ExportPanel';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';

/* ─── score helpers ──────────────────────────────────────────────────── */
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100';
  return 'bg-red-50 text-red-600 border border-red-200 ring-1 ring-red-100';
};
const scoreLabel = (score) => {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Average';
  return 'Needs Work';
};
const scoreAccent = (score) => {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
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

  /* ── URL override states (fix: were missing before) ─────────────────── */
  const [linkedinUrl, setLinkedinUrl]                       = useState('');
  const [githubUrl, setGithubUrl]                           = useState('');
  const [portfolioUrl, setPortfolioUrl]                     = useState('');
  const [competitiveProgrammingUrl, setCompetitiveProgrammingUrl] = useState('');

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
          /* pass user-supplied links so backend can embed them in parsedText
             or return them alongside tailoredResume */
          userLinks: {
            linkedin:            linkedinUrl.trim()            || null,
            github:              githubUrl.trim()              || null,
            portfolio:           portfolioUrl.trim()           || null,
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

  /* ── userLinks object passed to ExportPanel → TailoredPDF ───────────── */
  const userLinks = {
    linkedin:            linkedinUrl.trim()            || null,
    github:              githubUrl.trim()              || null,
    portfolio:           portfolioUrl.trim()           || null,
    competitiveProgramming: competitiveProgrammingUrl.trim() || null,
  };

  /* ─── tabs config ─────────────────────────────────────────────────── */
  const TABS = [
    { key: 'upload',  icon: '⚡', label: 'Analyze Resume' },
    { key: 'history', icon: '🗂',  label: 'Resume History' },
    { key: 'tailor',  icon: '✨', label: 'Tailor to Job'  },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAnalysisComplete}
        />
      )}

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#ebebf0]">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-0">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9191a0] mb-1">
                AI Resume Studio
              </p>
              <h1 className="text-2xl font-bold text-[#111118] tracking-tight leading-none">
                Student Dashboard
              </h1>
              <p className="text-sm mt-1 text-[#70708c]">
                Analyze, track, and tailor your resume with AI
              </p>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'relative px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 select-none',
                  activeTab === tab.key
                    ? 'bg-[#f8f8fc] text-[#0055cc] border border-b-0 border-[#ebebf0] shadow-[0_-1px_0_0_#f8f8fc] -mb-px z-10'
                    : 'text-[#70708c] hover:text-[#111118] hover:bg-[#f0f0f8]',
                ].join(' ')}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0055cc] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ══════════════════ UPLOAD TAB ══════════════════ */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#ebebf0] shadow-sm overflow-hidden">
              {!analysis ? (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-[#111118] mb-1">Analyze Your Resume</h2>
                  <p className="text-sm text-[#70708c] mb-8 leading-relaxed">
                    Choose a quick best-practices scan or a targeted match against a specific job description.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={() => setShowModal(true)}
                      className="group relative text-left p-5 rounded-xl border border-[#ebebf0] hover:border-[#0055cc]/40 hover:bg-[#f0f5ff] transition-all duration-200 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-2xl mb-3">⚡</div>
                      <h3 className="font-bold text-[#111118] text-sm mb-1.5 group-hover:text-[#0055cc] transition-colors">
                        General Analysis
                      </h3>
                      <p className="text-xs text-[#70708c] leading-relaxed">
                        Best-practices scan — formatting, impact language, metrics & ATS hygiene. No JD needed.
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0055cc] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        Get started <span>→</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowModal(true)}
                      className="group relative text-left p-5 rounded-xl border border-[#ebebf0] hover:border-emerald-500/40 hover:bg-[#f0faf5] transition-all duration-200 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-2xl mb-3">🎯</div>
                      <h3 className="font-bold text-[#111118] text-sm mb-1.5 group-hover:text-emerald-700 transition-colors">
                        Match My Resume
                      </h3>
                      <p className="text-xs text-[#70708c] leading-relaxed">
                        Deep JD analysis — keyword gaps, role fit score, missing skills & seniority alignment.
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        Get started <span>→</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-start gap-3 bg-[#f0f5ff] border border-[#0055cc]/12 rounded-xl px-4 py-3.5">
                    <span className="text-base shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-[#111118] leading-relaxed">
                      <span className="font-semibold">Pro tip:</span>{' '}
                      Run a General Analysis first to get your baseline score, then use Match My Resume for each specific role you apply to.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Analysis result ── */
                <div>
                  <div className="px-8 py-7 border-b border-[#ebebf0] bg-gradient-to-br from-[#f7f7fc] to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-2">
                          {analysis.matchScore != null ? 'General Score' : 'ATS Score'}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tight" style={{ color: scoreAccent(analysis.atsScore) }}>
                            {analysis.atsScore}
                          </span>
                          <span className="text-lg text-[#c0c0cc] font-normal">/100</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2.5">
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${scoreBadge(analysis.atsScore)}`}>
                          {scoreLabel(analysis.atsScore)}
                        </span>
                        <button
                          onClick={() => { setAnalysis(null); setShowModal(true); }}
                          className="text-xs font-semibold text-[#0055cc] hover:text-[#003fa8] border border-[#0055cc]/25 hover:border-[#0055cc]/50 bg-white hover:bg-[#f0f5ff] px-3 py-1.5 rounded-lg transition-all duration-150"
                        >
                          + Analyze Another
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    {analysis.matchScore != null && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`rounded-xl border p-4 text-center ${scoreBadge(analysis.atsScore)}`}>
                            <p className="text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 opacity-60">General</p>
                            <p className="text-2xl font-black">{analysis.atsScore}<span className="text-sm font-normal opacity-50">/100</span></p>
                          </div>
                          <div className={`rounded-xl border p-4 text-center ${scoreBadge(analysis.matchScore)}`}>
                            <p className="text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 opacity-60">Role Match</p>
                            <p className="text-2xl font-black">{analysis.matchScore}<span className="text-sm font-normal opacity-50">/100</span></p>
                          </div>
                        </div>

                        {analysis.keywordMatchRate != null && (
                          <div className="bg-[#f7f7fc] rounded-xl p-4 border border-[#ebebf0]">
                            <div className="flex justify-between mb-2.5">
                              <p className="text-xs font-bold text-[#111118]">Keyword Match Rate</p>
                              <span className="text-xs font-black text-[#0055cc]">{analysis.keywordMatchRate}%</span>
                            </div>
                            <div className="w-full bg-[#e0e0ec] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#0055cc] transition-all duration-1000"
                                style={{ width: `${analysis.keywordMatchRate}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {analysis.missingSkills?.length > 0 && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-[0.65rem] font-bold text-red-600 uppercase tracking-wider mb-2.5">Missing Critical Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.missingSkills.map((s, i) => (
                                <span key={i} className="text-xs bg-white text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium shadow-sm">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.experienceGap && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-[0.65rem] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Experience Gap</p>
                            <p className="text-sm text-[#111118] leading-relaxed">{analysis.experienceGap}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-[#ebebf0] pt-6">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-2">AI Summary</p>
                      <p className="text-sm text-[#44445c] leading-relaxed italic">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                        <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-3">Top Strengths</h4>
                        <ul className="space-y-2">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-[#111118] flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">✓</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                        <h4 className="font-bold text-red-600 text-xs uppercase tracking-wider mb-3">Improvements</h4>
                        <ul className="space-y-2">
                          {analysis.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-[#111118] flex items-start gap-2 leading-relaxed">
                              <span className="text-red-400 mt-0.5 shrink-0 font-bold">→</span>{imp}
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
          <div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex items-center gap-3 text-[#70708c]">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-medium">Loading history…</span>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f0f8] flex items-center justify-center text-3xl mb-4">📭</div>
                <p className="font-semibold text-[#111118] mb-1">No resumes analyzed yet</p>
                <p className="text-sm text-[#70708c]">Upload your first resume to get started.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#70708c] mb-5">
                  {history.length} resume{history.length !== 1 ? 's' : ''} analyzed — click any card for the full report.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {history.map((item, index) => (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/resume/${item._id}`)}
                      className="group bg-white rounded-2xl border border-[#ebebf0] p-5 flex flex-col gap-3 cursor-pointer hover:border-[#0055cc]/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-1">
                            Resume {history.length - index}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tight" style={{ color: scoreAccent(item.atsScore) }}>
                              {item.atsScore}
                            </span>
                            <span className="text-sm font-normal text-[#c0c0cc]">/100</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[0.65rem] text-[#9191a0]">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${scoreBadge(item.atsScore)}`}>
                            {scoreLabel(item.atsScore)}
                          </span>
                          {item.analysisMode === 'targeted' && (
                            <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Targeted
                            </span>
                          )}
                        </div>
                      </div>

                      {item.roleName && (
                        <p className="text-[0.72rem] font-semibold text-emerald-700 truncate">
                          {item.company ? `${item.company} · ` : ''}{item.roleName}
                        </p>
                      )}

                      <p className="text-sm text-[#70708c] line-clamp-2 leading-relaxed flex-1">
                        {item.feedback?.summary}
                      </p>

                      <div className="flex items-center gap-1 pt-1 border-t border-[#f0f0f8]">
                        <span className="text-xs text-[#0055cc] font-semibold group-hover:underline">View full analysis</span>
                        <span className="text-[#0055cc] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Inputs */}
            <div className="bg-white rounded-2xl border border-[#ebebf0] shadow-sm overflow-hidden h-fit">
              <div className="px-7 py-6 border-b border-[#ebebf0] bg-[#f7f7fc]">
                <h2 className="text-base font-bold text-[#111118] mb-0.5">Target a Specific Role</h2>
                <p className="text-sm text-[#70708c]">Select a resume and paste the job description below.</p>
              </div>

              <div className="p-7">
                {history.length === 0 ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                    Please upload and analyze a resume first to use this feature.
                  </div>
                ) : (
                  <>
                    {/* Resume selector */}
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-[#44445c] uppercase tracking-wider mb-2">
                        Select Base Resume
                      </label>
                      <select
                        className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] px-3.5 py-2.5 text-sm text-[#111118] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150"
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
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-[#44445c] uppercase tracking-wider mb-2">
                        Job Description
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] px-3.5 py-3 text-sm text-[#111118] placeholder-[#b0b0c8] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150 min-h-[180px] resize-y leading-relaxed"
                        placeholder="Paste the full job description here…"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      {jobDescription.trim() && (
                        <p className="text-[0.65rem] text-[#9191a0] mt-1.5 text-right">
                          {jobDescription.trim().split(/\s+/).length} words
                        </p>
                      )}
                    </div>

                    {/* ── Profile links section ─────────────────────────── */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-[#44445c] uppercase tracking-wider mb-3">
                        Profile Links <span className="normal-case font-normal text-[#9191a0]">(optional — overrides parsed values)</span>
                      </p>

                      <div className="space-y-3">
                        {/* LinkedIn */}
                        <div>
                          <label className="block text-[0.7rem] font-medium text-[#70708c] mb-1.5">LinkedIn</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9191a0] text-xs select-none">in/</span>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] pl-8 pr-3.5 py-2.5 text-sm text-[#111118] placeholder-[#b0b0c8] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150"
                              placeholder="yourprofile"
                              value={linkedinUrl}
                              onChange={(e) => setLinkedinUrl(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* GitHub */}
                        <div>
                          <label className="block text-[0.7rem] font-medium text-[#70708c] mb-1.5">GitHub</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9191a0] text-xs select-none">gh/</span>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] pl-8 pr-3.5 py-2.5 text-sm text-[#111118] placeholder-[#b0b0c8] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150"
                              placeholder="yourusername"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Portfolio */}
                        <div>
                          <label className="block text-[0.7rem] font-medium text-[#70708c] mb-1.5">Portfolio Website</label>
                          <input
                            type="url"
                            className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] px-3.5 py-2.5 text-sm text-[#111118] placeholder-[#b0b0c8] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150"
                            placeholder="https://yourportfolio.com"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                          />
                        </div>

                        {/* Competitive programming */}
                        <div>
                          <label className="block text-[0.7rem] font-medium text-[#70708c] mb-1.5">Competitive Programming</label>
                          <input
                            type="url"
                            className="w-full rounded-xl border border-[#e0e0ec] bg-[#f7f7fc] px-3.5 py-2.5 text-sm text-[#111118] placeholder-[#b0b0c8] focus:outline-none focus:border-[#0055cc] focus:ring-2 focus:ring-[#0055cc]/15 transition-all duration-150"
                            placeholder="https://codeforces.com/profile/…"
                            value={competitiveProgrammingUrl}
                            onChange={(e) => setCompetitiveProgrammingUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleTailor}
                      disabled={isTailoring || !jobDescription.trim()}
                      className="w-full py-3 px-5 rounded-xl bg-[#0055cc] hover:bg-[#003fa8] active:bg-[#003090] text-white text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      {isTailoring ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
            <div className="h-fit">
              <div className="bg-white rounded-2xl border border-[#ebebf0] shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-[#ebebf0] bg-[#f7f7fc]">
                  <h2 className="text-base font-bold text-[#111118]">AI Tailored Results</h2>
                </div>

                <div className="p-7">
                  {!tailoredData && !isTailoring && (
                    <div className="text-center py-6">
                      <div className="inline-flex w-14 h-14 rounded-2xl bg-[#f0f5ff] items-center justify-center text-3xl mb-5">🪄</div>
                      <h3 className="text-sm font-bold text-[#111118] mb-2">How AI Tailoring Works</h3>
                      <p className="text-xs text-[#70708c] mb-7 leading-relaxed max-w-xs mx-auto">
                        We never invent fake experience. Our AI analyzes your actual background and rewrites it to match the employer's exact needs.
                      </p>
                      <div className="space-y-4 text-left">
                        {[
                          { n: 1, title: 'Keyword Extraction',    desc: 'Scans the JD for required technical and soft skills.' },
                          { n: 2, title: 'Smart Reordering',      desc: 'Prioritizes your projects that match the tech stack in the JD.' },
                          { n: 3, title: 'STAR Method Rewriting', desc: 'Enhances bullet points for maximum ATS compatibility.' },
                        ].map(({ n, title, desc }) => (
                          <div key={n} className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-lg bg-[#0055cc]/10 text-[#0055cc] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {n}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#111118]">{title}</h4>
                              <p className="text-xs text-[#70708c] mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isTailoring && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-12 h-12 rounded-xl bg-[#f0f5ff] flex items-center justify-center mb-5">
                        <svg className="w-6 h-6 animate-spin text-[#0055cc]" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="font-bold text-[#0055cc] text-sm mb-1">Analyzing Job Description…</p>
                      <p className="text-xs text-[#70708c]">Rewriting bullets using the STAR method.</p>
                    </div>
                  )}

                  {tailoredData && !isTailoring && (
                    <div className="space-y-6">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Optimization Complete</p>
                          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                            Your tailored PDF is ready to download below.
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-2">Professional Summary</p>
                        <div className="bg-[#f7f7fc] border border-[#ebebf0] rounded-xl p-4 text-sm text-[#111118] leading-relaxed">
                          {tailoredData.tailoredSummary}
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-2">Targeted Skills</p>
                        <div className="flex flex-col gap-3">
                          {tailoredData.tailoredSkills?.map((skillGroup, i) => (
                            <div key={i} className="flex items-start gap-2">
                              {skillGroup.label && (
                                <span className="text-xs font-bold text-[#44445c] mt-1 w-24 shrink-0">{skillGroup.label}:</span>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                {skillGroup.value?.split(',').map(s => s.trim()).filter(Boolean).map((s, j) => (
                                  <span key={j} className="bg-[#f0f5ff] text-[#0055cc] border border-[#0055cc]/20 px-2.5 py-0.5 rounded-md text-[0.7rem] font-semibold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#9191a0] mb-3">Tailored Experience</p>
                        <div className="space-y-3">
                          {tailoredData.tailoredExperience?.map((exp, i) => (
                            <div key={i} className="bg-[#f7f7fc] border border-[#ebebf0] rounded-xl p-5 hover:border-[#d0d0e0] transition-colors duration-200">
                              <h4 className="font-bold text-[#111118] text-sm mb-3">{exp.title}</h4>
                              <ul className="space-y-2">
                                {exp.bullets.map((bullet, bi) => (
                                  <li key={bi} className="text-sm text-[#44445c] flex items-start gap-2.5 leading-relaxed">
                                    <span className="text-[#0055cc] mt-0.5 shrink-0 text-xs font-bold">→</span>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Pass userLinks through to ExportPanel → TailoredPDF */}
                        <ExportPanel
                          tailoredData={tailoredData}
                          parsedText={parsedText}
                          user={userRecord}
                          resumeId={selectedResumeId}
                          userLinks={userLinks}
                        />
                      </div>
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