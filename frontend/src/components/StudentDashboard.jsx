import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  cardClass, headingClass, primaryBtn, secondaryBtn,
  formCard, inputClass, labelClass, mutedText, bodyText,
  successClass, loadingClass, emptyStateClass, divider
} from '../styles/common';
import ExportPanel from './ExportPanel';
import useUserStore from '../store/userStore';
import UploadModal from './UploadModal';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const { userRecord } = useUserStore();

  // ── Upload / Modal state ───────────────────────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [analysis,  setAnalysis]    = useState(null);   // last completed analysis

  // ── History state ──────────────────────────────────────────────────────
  const [history,        setHistory]        = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── Tailor state ───────────────────────────────────────────────────────
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription,   setJobDescription]   = useState('');
  const [isTailoring,      setIsTailoring]      = useState(false);
  const [tailoredData,     setTailoredData]      = useState(null);
  const [parsedText,       setParsedText]        = useState('');

  // ── Fetch history when History or Tailor tabs are opened ──────────────
  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'tailor') && history.length === 0) {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('http://localhost:4000/api/resume/history', { withCredentials: true });
      setHistory(res.data);
      if (res.data.length > 0) setSelectedResumeId(res.data[0]._id);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Called by UploadModal's onSuccess prop when analysis finishes
  const handleAnalysisComplete = (analysisResult) => {
    setAnalysis(analysisResult);
    setShowModal(false);
    // Invalidate cached history so next visit to History tab re-fetches
    setHistory([]);
    toast.success('Analysis complete!');
  };

  // ── Tailor ────────────────────────────────────────────────────────────
  const handleTailor = async () => {
    if (!selectedResumeId)      return toast.error('Please select a base resume');
    if (!jobDescription.trim()) return toast.error('Please paste a Job Description');
    setIsTailoring(true);
    setTailoredData(null);
    setParsedText('');
    try {
      const res = await axios.post(
        'http://localhost:4000/api/resume/tailor',
        { resumeId: selectedResumeId, jobDescription },
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

  // ── Score helpers ──────────────────────────────────────────────────────
  const scoreBadge = (score) => {
    if (score >= 75) return 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20';
    if (score >= 50) return 'bg-[#ff9f0a]/10 text-[#b86e00] border border-[#ff9f0a]/20';
    return 'bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20';
  };
  const scoreLabel = (score) => {
    if (score >= 75) return '✅ Strong';
    if (score >= 50) return '⚠️ Average';
    return '❌ Needs Work';
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Modal — rendered at root level so it overlays everything */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAnalysisComplete}
        />
      )}

      <h1 className={`${headingClass} text-3xl mb-1`}>Student Dashboard</h1>
      <p className={`${bodyText} mb-8 text-sm`}>Analyze, track, and tailor your resume with AI</p>

      {/* ── TABS ── */}
      <div className="flex gap-2 mb-8 border-b border-[#e8e8ed]">
        {[
          { key: 'upload',  label: '📄 Analyze Resume' },
          { key: 'history', label: '🗂 Resume History'  },
          { key: 'tailor',  label: '✨ Tailor to Job'   },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? `${primaryBtn} rounded-b-none rounded-t-xl px-5 py-2.5 text-sm`
                : `${secondaryBtn} rounded-b-none rounded-t-xl px-5 py-2.5 text-sm border-b-0`
            }
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* ══════════════════════════════════════════════
          UPLOAD TAB
      ══════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div className={`${formCard} max-w-2xl mx-auto`}>

          {/* ── No analysis yet — invite user to open the modal ── */}
          {!analysis && (
            <>
              <h2 className={`${headingClass} mb-1`}>Analyze Your Resume</h2>
              <p className={`${mutedText} mb-8`}>
                Choose between a quick best-practices scan or a targeted match against a specific job description.
              </p>

              {/* Two-path cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

                {/* General */}
                <button
                  onClick={() => setShowModal(true)}
                  className="text-left p-5 rounded-2xl border-2 border-[#e8e8ed] hover:border-[#0066cc] hover:bg-[#0066cc]/[0.03] transition-all duration-200 group"
                >
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="font-bold text-[#1d1d1f] text-sm mb-1 group-hover:text-[#0066cc] transition-colors">
                    General Analysis
                  </h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed">
                    Best practices scan — formatting, impact language, metrics & ATS hygiene. No JD needed.
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold text-[#0066cc]">Start →</span>
                </button>

                {/* Targeted */}
                <button
                  onClick={() => setShowModal(true)}
                  className="text-left p-5 rounded-2xl border-2 border-[#e8e8ed] hover:border-[#248a3d] hover:bg-[#248a3d]/[0.03] transition-all duration-200 group"
                >
                  <div className="text-2xl mb-3">🎯</div>
                  <h3 className="font-bold text-[#1d1d1f] text-sm mb-1 group-hover:text-[#248a3d] transition-colors">
                    Match My Resume
                  </h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed">
                    Deep JD analysis — keyword gaps, role fit score, missing skills & seniority alignment.
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold text-[#248a3d]">Start →</span>
                </button>
              </div>

              {/* Tip strip */}
              <div className="flex items-start gap-3 bg-[#0066cc]/[0.05] border border-[#0066cc]/15 rounded-xl px-4 py-3">
                <span className="text-base shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-[#1d1d1f] leading-relaxed">
                  <span className="font-semibold">Tip:</span> Run a General Analysis first to get your baseline score, then use Match My Resume for every specific role you apply to.
                </p>
              </div>
            </>
          )}

          {/* ── Analysis result (shown after modal completes) ── */}
          {analysis && (
            <>
              {/* Header row: score + re-analyze button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className={`${mutedText} uppercase tracking-wider text-[0.65rem] font-semibold mb-1`}>
                    {analysis.matchScore != null ? 'General Score' : 'ATS Score'}
                  </p>
                  <p className="text-4xl font-bold text-[#0066cc] tracking-tight">
                    {analysis.atsScore}
                    <span className="text-lg text-[#a1a1a6] font-normal">/100</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${scoreBadge(analysis.atsScore)}`}>
                    {scoreLabel(analysis.atsScore)}
                  </span>
                  <button
                    onClick={() => { setAnalysis(null); setShowModal(true); }}
                    className={`${secondaryBtn} text-xs px-3 py-1.5`}
                  >
                    + Analyze Another
                  </button>
                </div>
              </div>

              {/* Targeted extras */}
              {analysis.matchScore != null && (
                <div className="space-y-4 mb-6">

                  {/* Dual score row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-2xl border p-4 text-center ${scoreBadge(analysis.atsScore)}`}>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest mb-1 opacity-70">General</p>
                      <p className="text-2xl font-black">{analysis.atsScore}<span className="text-sm font-normal opacity-60">/100</span></p>
                    </div>
                    <div className={`rounded-2xl border p-4 text-center ${scoreBadge(analysis.matchScore)}`}>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest mb-1 opacity-70">Role Match</p>
                      <p className="text-2xl font-black">{analysis.matchScore}<span className="text-sm font-normal opacity-60">/100</span></p>
                    </div>
                  </div>

                  {/* Keyword match bar */}
                  {analysis.keywordMatchRate != null && (
                    <div className="bg-[#f5f5f7] rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <p className="text-xs font-bold text-[#1d1d1f]">Keyword Match Rate</p>
                        <span className="text-xs font-black text-[#0066cc]">{analysis.keywordMatchRate}%</span>
                      </div>
                      <div className="w-full bg-[#e8e8ed] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0066cc]"
                          style={{ width: `${analysis.keywordMatchRate}%`, transition: 'width 1s ease' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Missing skills */}
                  {analysis.missingSkills?.length > 0 && (
                    <div className="bg-[#ff3b30]/[0.04] border border-[#ff3b30]/20 rounded-xl p-4">
                      <p className="text-[0.65rem] font-bold text-[#cc2f26] uppercase tracking-wider mb-2">🚨 Missing Critical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((s, i) => (
                          <span key={i} className="text-xs bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20 px-2.5 py-1 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience gap */}
                  {analysis.experienceGap && (
                    <div className="bg-[#ff9f0a]/[0.05] border border-[#ff9f0a]/25 rounded-xl p-4">
                      <p className="text-[0.65rem] font-bold text-[#b86e00] uppercase tracking-wider mb-1.5">📊 Experience Gap</p>
                      <p className="text-sm text-[#1d1d1f] leading-relaxed">{analysis.experienceGap}</p>
                    </div>
                  )}
                </div>
              )}

              <div className={divider} />

              {/* AI Summary */}
              <p className={`${bodyText} text-sm italic mb-6`}>{analysis.summary}</p>

              {/* Strengths + Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#34c759]/[0.06] border border-[#34c759]/20 rounded-2xl p-5">
                  <h4 className="font-bold text-[#248a3d] text-sm mb-3">✅ Top Strengths</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-[#1d1d1f] flex items-start gap-2">
                        <span className="text-[#34c759] mt-0.5 shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#ff3b30]/[0.05] border border-[#ff3b30]/15 rounded-2xl p-5">
                  <h4 className="font-bold text-[#cc2f26] text-sm mb-3">🔧 Improvements</h4>
                  <ul className="space-y-2">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-[#1d1d1f] flex items-start gap-2">
                        <span className="text-[#ff3b30] mt-0.5 shrink-0">•</span>{imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}


      {/* ══════════════════════════════════════════════
          HISTORY TAB
      ══════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div>
          {loadingHistory ? (
            <p className={loadingClass}>Loading your resume history…</p>
          ) : history.length === 0 ? (
            <div className={emptyStateClass}>
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium text-[#6e6e73]">No resumes analyzed yet.</p>
              <p className={`${mutedText} mt-1`}>Upload your first resume to get started.</p>
            </div>
          ) : (
            <>
              <p className={`${mutedText} mb-4`}>Click any card to view the full analysis.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {history.map((item, index) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/resume/${item._id}`)}
                    className={`${cardClass} flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5`}>
                          Resume {history.length - index}
                        </p>
                        <span className="text-2xl font-bold text-[#0066cc] tracking-tight">
                          {item.atsScore}
                          <span className="text-sm font-normal text-[#a1a1a6]">/100</span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`${mutedText} text-xs`}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${scoreBadge(item.atsScore)}`}>
                            {scoreLabel(item.atsScore)}
                          </span>
                          {item.analysisMode === 'targeted' && (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-[#248a3d]/10 text-[#248a3d] border border-[#248a3d]/20">
                              🎯 Targeted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.roleName && (
                      <p className="text-[0.7rem] font-semibold text-[#248a3d]">
                        {item.company ? `${item.company} · ` : ''}{item.roleName}
                      </p>
                    )}

                    <p className="text-sm text-[#6e6e73] line-clamp-3 leading-relaxed">
                      {item.feedback?.summary}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-[#0066cc] font-medium">View full analysis</span>
                      <span className="text-[#0066cc] text-xs">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}


      {/* ══════════════════════════════════════════════
          TAILOR TAB
      ══════════════════════════════════════════════ */}
      {activeTab === 'tailor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Inputs */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm h-fit">
            <h2 className={`${headingClass} mb-1`}>Target a Specific Role</h2>
            <p className={`${mutedText} mb-6`}>Select a resume and paste the job description below.</p>

            {history.length === 0 ? (
              <div className="bg-[#ff3b30]/[0.05] border border-[#ff3b30]/15 rounded-xl p-4 text-sm text-[#cc2f26]">
                Please upload and analyze a resume first to use this feature.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className={labelClass}>Select Base Resume</label>
                  <select
                    className={inputClass}
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

                <div className="mb-6">
                  <label className={labelClass}>Paste Job Description</label>
                  <textarea
                    className={`${inputClass} min-h-[240px] resize-y`}
                    placeholder="Paste the full job description here…"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleTailor}
                  disabled={isTailoring || !jobDescription.trim()}
                  className={`${primaryBtn} w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isTailoring ? '🧠 Rewriting your resume…' : 'Generate Tailored Resume'}
                </button>
              </>
            )}
          </div>

          {/* Right: AI Output */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-[#e8e8ed] h-fit">
            <h2 className={`${headingClass} mb-5`}>AI Tailored Results</h2>

            {!tailoredData && !isTailoring && (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#d2d2d7] rounded-2xl bg-white">
                <div className="text-5xl mb-4">🪄</div>
                <h3 className="text-base font-bold text-[#1d1d1f] mb-2">How AI Tailoring Works</h3>
                <p className={`${bodyText} text-sm mb-8 px-2`}>
                  We never invent fake experience. Our AI analyzes your actual background and dynamically rewrites it to match the employer's exact needs.
                </p>
                <div className="space-y-5 text-left w-full max-w-sm">
                  {[
                    { n: 1, title: 'Keyword Extraction',    desc: 'Scans the JD for required technical and soft skills.' },
                    { n: 2, title: 'Smart Reordering',      desc: 'Prioritizes your projects that match the tech stack in the JD.' },
                    { n: 3, title: 'STAR Method Rewriting', desc: 'Enhances bullet points for maximum ATS compatibility.' },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="flex items-start gap-4">
                      <div className="bg-[#0066cc]/10 text-[#0066cc] px-3 py-1.5 rounded-lg text-sm font-bold mt-0.5 shrink-0">{n}</div>
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f] text-sm">{title}</h4>
                        <p className={`${mutedText} mt-0.5 leading-relaxed`}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isTailoring && (
              <div className="h-[380px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-[#0066cc]/20 animate-pulse">
                <div className="text-5xl mb-5">⚙️</div>
                <p className="font-bold text-[#0066cc] text-base mb-1">Analyzing Job Description…</p>
                <p className={mutedText}>Rewriting bullets using the STAR method.</p>
              </div>
            )}

            {tailoredData && !isTailoring && (
              <div className="space-y-6">
                <div className={`${successClass} flex items-start gap-3`}>
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="font-bold text-sm">Optimization Complete</p>
                    <p className="text-xs mt-0.5 leading-relaxed opacity-80">
                      Your resume has been rewritten. Copy these updates into your final document.
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`${mutedText} uppercase tracking-wider text-[0.65rem] font-semibold mb-2`}>Professional Summary</p>
                  <div className="bg-white p-4 rounded-xl border border-[#e8e8ed] text-sm text-[#1d1d1f] leading-relaxed shadow-sm">
                    {tailoredData.tailoredSummary}
                  </div>
                </div>

                <div>
                  <p className={`${mutedText} uppercase tracking-wider text-[0.65rem] font-semibold mb-2`}>Targeted Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {tailoredData.tailoredSkills?.map((skill, i) => (
                      <span key={i} className="bg-[#0066cc]/[0.07] text-[#0066cc] border border-[#0066cc]/20 px-3 py-1 rounded-full text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`${mutedText} uppercase tracking-wider text-[0.65rem] font-semibold mb-2`}>Tailored Experience Bullets</p>
                  <div className="space-y-3">
                    {tailoredData.tailoredExperience?.map((exp, i) => (
                      <div key={i} className="bg-white p-5 rounded-xl border border-[#e8e8ed] shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h4 className="font-bold text-[#1d1d1f] text-sm mb-3">{exp.title}</h4>
                        <ul className="space-y-2">
                          {exp.bullets.map((bullet, bi) => (
                            <li key={bi} className="text-sm text-[#6e6e73] flex items-start gap-2 leading-relaxed">
                              <span className="text-[#0066cc] mt-0.5 shrink-0">→</span>{bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* ── Export Panel — Copy / PDF / LaTeX ── */}
                  <ExportPanel
                    tailoredData={tailoredData}
                    parsedText={parsedText}
                    user={userRecord}
                    resumeId={selectedResumeId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}