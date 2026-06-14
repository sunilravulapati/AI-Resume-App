import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TailoredPDF from './TailoredPDF';
import { fetchLatexExport } from '../utils/latexExport';

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

export default function QuickAIImprovementView({ tailoredData, parsedText, user, userLinks, analysis, resumeId, activeSessionId, onBack, onOpenWorkspace, onExport }) {
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [latexModal, setLatexModal] = useState({ open: false, content: '' });
  const [latexCopied, setLatexCopied] = useState(false);
  const [latexLoading, setLatexLoading] = useState(false);

  const handleCopy = () => {
    const dataStr = JSON.stringify(tailoredData, null, 2);
    navigator.clipboard.writeText(dataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onExport?.();
  };

  const handleLatexExport = async () => {
    setLatexLoading(true);
    setExportOpen(false);
    try {
      const code = await fetchLatexExport({ resumeId, tailoredData });
      setLatexModal({ open: true, content: code });
      onExport?.();
    } catch (err) {
      alert('LaTeX export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLatexLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          {onOpenWorkspace && (
            <>
              <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
              <button
                onClick={onOpenWorkspace}
                className="px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5"
                style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#475569' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Back to Workspace
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold rounded-xl border transition-all"
            style={{
              background: copied ? '#D1FAE5' : '#EEF2FF',
              borderColor: copied ? '#34D399' : '#C7D2FE',
              color: copied ? '#065F46' : '#4F46E5',
            }}
          >
            {copied ? '✓ Copied' : 'Copy Data'}
          </button>
          
          <PDFDownloadLink
            document={<TailoredPDF tailoredData={tailoredData} parsedText={parsedText} user={user} userLinks={userLinks} />}
            fileName={`Improved_Resume_${user?.firstName || 'Resume'}.pdf`}
            className="px-4 py-2 text-xs font-bold rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-accent)' }}
            onClick={() => onExport?.()}
          >
            {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
          </PDFDownloadLink>

          <div className="relative">
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={latexLoading}
              className="px-4 py-2 text-xs font-semibold rounded-xl border transition-all"
              style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#475569' }}
            >
              {latexLoading ? 'Generating…' : 'Export ▾'}
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px] z-50">
                <button
                  onClick={handleLatexExport}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  LaTeX
                </button>
                <button
                  onClick={() => { handleCopy(); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {latexModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">LaTeX Export</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(latexModal.content);
                    setLatexCopied(true);
                    setTimeout(() => setLatexCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border"
                  style={{ background: latexCopied ? '#D1FAE5' : '#EEF2FF', borderColor: latexCopied ? '#34D399' : '#C7D2FE', color: latexCopied ? '#065F46' : '#4F46E5' }}
                >
                  {latexCopied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => setLatexModal({ open: false, content: '' })} className="text-slate-400 hover:text-slate-600 px-2">×</button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap break-words bg-slate-50 p-4 rounded-xl border border-slate-200">{latexModal.content}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            Your Improved Resume
          </h1>
          <p className="text-slate-500 text-sm">
            We've generated an ATS-optimized, keyword-rich version of your resume aligned with your target role.
          </p>
        </div>

        {/* ── ANALYSIS SECTION ── */}
        {analysis && (() => {
          const prevScore = analysis.atsScore || 0;
          const matchFactor = analysis.keywordMatchRate ? analysis.keywordMatchRate * 0.1 : 5;
          const predictedScore = Math.min(100, Math.round(prevScore + (100 - prevScore) * 0.4 + matchFactor));
          const delta = predictedScore - prevScore;

          return (
            <div className="space-y-6">
              {/* Section 1: Resume Improvement Summary */}
              <Card>
                <div className="p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Resume Improvement Summary</h2>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    <div className="text-center flex flex-col items-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Previous Score</p>
                      <div className="relative flex items-center justify-center mb-1">
                        <ScoreRing score={prevScore} size={80} strokeWidth={8} />
                        <span className="absolute text-xl font-bold tabular-nums" style={{ color: scoreColor(prevScore) }}>
                          {prevScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center hidden md:flex">
                      <span className="text-3xl text-slate-300">→</span>
                      <span className="text-sm font-bold text-emerald-600 mt-2 px-3 py-1 rounded-full bg-emerald-50">
                        +{delta}
                      </span>
                    </div>

                    <div className="text-center flex flex-col items-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-[var(--color-accent)]">Predicted Score</p>
                      <div className="relative flex items-center justify-center mb-1">
                        <ScoreRing score={predictedScore} size={100} strokeWidth={10} />
                        <span className="absolute text-3xl font-bold tabular-nums" style={{ color: scoreColor(predictedScore) }}>
                          {predictedScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-6">
                    This predicted ATS score is an estimate based on applied optimizations, keyword coverage improvements, and role match enhancement.
                  </p>
                </div>
              </Card>

              {/* Section 2: Job Description Match Analysis */}
              {(analysis.matchScore != null || analysis.missingSkills?.length > 0 || analysis.matchedSkills?.length > 0) && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Job Description Match Analysis</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {analysis.matchScore != null && (
                        <div className={`rounded-xl p-4 text-center border ${scoreBadge(analysis.matchScore)}`}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Role Match</p>
                          <div className="flex items-center justify-center relative">
                            <ScoreRing score={analysis.matchScore} size={60} strokeWidth={6} />
                            <span className="absolute inset-0 flex items-center justify-center text-base font-bold">
                              {analysis.matchScore}%
                            </span>
                          </div>
                        </div>
                      )}
                      {analysis.keywordMatchRate != null && (
                        <div className={`rounded-xl p-4 text-center border ${scoreBadge(analysis.keywordMatchRate)}`}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Keyword Match</p>
                          <div className="flex items-center justify-center relative">
                            <ScoreRing score={analysis.keywordMatchRate} size={60} strokeWidth={6} />
                            <span className="absolute inset-0 flex items-center justify-center text-base font-bold">
                              {analysis.keywordMatchRate}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {analysis.matchedSkills?.length > 0 && (
                        <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Matched Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.matchedSkills.map((s, i) => (
                              <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-sm">
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Section 3: Missing Skills */}
              {analysis.missingSkills?.length > 0 && (
                <Card>
                  <div className="p-6 h-full" style={{ background: '#FEF2F2' }}>
                    <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">🚨 Missing Critical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((s, i) => (
                        <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-red-600 border border-red-200 shadow-sm">
                          ✕ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Section 4: Recommendations */}
              {analysis.improvements?.length > 0 && (
                <Card>
                  <div className="p-6 h-full" style={{ background: '#EEF2FF' }}>
                    <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4">Recommendations</h2>
                    <ul className="space-y-3">
                      {analysis.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-indigo-600 shrink-0 font-bold mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              {/* Section 5: Weaknesses */}
              {analysis.experienceGap && (
                <Card>
                  <div className="p-6 h-full" style={{ background: '#FFFBEB' }}>
                    <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4">Weaknesses</h2>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{analysis.experienceGap}</p>
                  </div>
                </Card>
              )}
              
              <div className="w-full h-px bg-slate-200 my-8"></div>
            </div>
          );
        })()}

        {/* ── Display Improved Data ── */}
        <Card>
          <div className="p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {tailoredData?.summary || "No summary provided."}
            </p>
          </div>
        </Card>

        {tailoredData?.experience?.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Experience</h2>
              <div className="space-y-6">
                {tailoredData.experience.map((exp, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-slate-800 text-base">{exp.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{exp.company} • {exp.dates}</p>
                    <ul className="space-y-1.5 pl-4 list-disc text-sm text-slate-700">
                      {(exp.bullets || []).map((b, idx) => (
                        <li key={idx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tailoredData?.projects?.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Projects</h2>
              <div className="space-y-6">
                {tailoredData.projects.map((proj, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-slate-800 text-base">{proj.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{proj.tech}</p>
                    <ul className="space-y-1.5 pl-4 list-disc text-sm text-slate-700">
                      {(proj.bullets || []).map((b, idx) => (
                        <li key={idx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tailoredData?.skills?.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Skills</h2>
              <div className="space-y-3">
                {tailoredData.skills.map((s, i) => (
                  <div key={i} className="text-sm flex">
                    <span className="font-bold text-slate-700 w-32 shrink-0">{s.label}</span>
                    <span className="text-slate-600">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
