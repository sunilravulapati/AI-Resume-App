import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import {
  loadingClass, headingClass, cardClass,
  primaryBtn, secondaryBtn, mutedText, bodyText, divider
} from '../styles/common';
import useUserStore from '../store/userStore';

export default function Resume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRecord } = useUserStore();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfFailed, setPdfFailed] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`/api/resume/${id}`, {
          withCredentials: true
        });
        setResume(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return <p className={loadingClass}>Loading candidate profile…</p>;
  if (!resume) return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🔒</div>
      <p className="font-semibold text-[#1d1d1f] mb-1">Resume not found</p>
      <p className={`${mutedText} mb-6`}>This resume may have been removed or you don't have access.</p>
      <button onClick={() => navigate(-1)} className={secondaryBtn}>← Go Back</button>
    </div>
  );

  const isRecruiter = userRecord?.role === 'recruiter';
  const student = resume.userId;
  const score = resume.atsScore;

  const scoreBadge = () => {
    if (score >= 75) return { bg: 'bg-[#34c759]/10 border-[#34c759]/20', text: 'text-[#248a3d]', bar: 'bg-[#34c759]', label: '✅ Strong Match' };
    if (score >= 50) return { bg: 'bg-[#ff9f0a]/10 border-[#ff9f0a]/20', text: 'text-[#b86e00]', bar: 'bg-[#ff9f0a]', label: '⚠️ Average' };
    return { bg: 'bg-[#ff3b30]/10 border-[#ff3b30]/20', text: 'text-[#cc2f26]', bar: 'bg-[#ff3b30]', label: '❌ Needs Work' };
  };

  const badge = scoreBadge();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`${secondaryBtn} mb-5 flex items-center gap-1.5`}
        >
          ← Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e8e8ed] pb-6">
          <div>
            {isRecruiter ? (
              <>
                {/* Recruiter sees candidate identity */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-base font-bold uppercase">
                    {student?.firstName?.[0] || '?'}
                  </div>
                  <div>
                    <h1 className={`${headingClass} text-2xl`}>
                      {student?.firstName} {student?.lastName}
                    </h1>
                    <p className={`${mutedText} flex items-center gap-2`}>
                      <span>{student?.email}</span>
                      {student?.mobile && <><span>•</span><span>{student.mobile}</span></>}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <h1 className={`${headingClass} text-2xl`}>Detailed Resume Analysis</h1>
            )}
          </div>

          {/* Score panel */}
          <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${badge.bg}`}>
            <div className="text-right">
              <p className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5`}>ATS Score</p>
              <p className={`text-4xl font-black tracking-tight ${badge.text}`}>
                {score}
                <span className="text-base font-normal text-[#a1a1a6]">/100</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5 min-w-25">
              <span className={`text-xs font-semibold ${badge.text}`}>{badge.label}</span>
              <div className="w-full bg-[#e8e8ed] rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${badge.bar}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: PDF / Text Preview */}
        <div className="bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed] overflow-hidden flex flex-col h-[800px] shadow-sm">
          <div className="bg-[#ebebf0] px-4 py-2.5 border-b border-[#e8e8ed]">
            <p className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold text-center`}>
              Original Document
            </p>
          </div>
          {resume.fileUrl && !pdfFailed ? (
            <iframe
              src={`${resume.fileUrl}#toolbar=0`}
              className="w-full h-full border-none bg-white"
              title="Resume PDF"
              onError={() => setPdfFailed(true)}
            />
          ) : (
            <div className="p-6 h-full overflow-y-auto bg-white text-sm text-[#1d1d1f] whitespace-pre-wrap font-mono leading-relaxed">
              {resume.parsedText || 'No document preview available.'}
            </div>
          )}
        </div>

        {/* RIGHT: AI Breakdown */}
        <div className="space-y-6 flex flex-col">

          {/* Candid AI Summary */}
          <div className="bg-white border-l-4 border-[#0066cc] pl-5 pr-5 py-5 rounded-r-2xl shadow-sm border border-[#e8e8ed]">
            <h3 className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold mb-3 flex items-center gap-2`}>
              <span>🤖</span> {isRecruiter ? 'Recruiter Fit Assessment' : 'Candid AI Assessment'}
            </h3>
            <p className={`${bodyText} text-sm leading-relaxed`}>
              {isRecruiter
                ? (resume.feedback?.recruiterFeedback?.recruiterSummary || resume.feedback?.summary)
                : (resume.feedback?.studentFeedback?.summary || resume.feedback?.summary)
              }
            </p>
          </div>

          {/* Interactive Score Breakdown Panel */}
          <div className={`${cardClass} shadow-sm border border-[#e8e8ed]`}>
            <h3 className="text-[0.65rem] font-bold text-[#0066cc] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📊</span> Interactive Score Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(() => {
                const defaultSub = { structure: 0, impact: 0, skillAlignment: 0, complexity: 0, professionalism: 0, skillProjectFit: 0 };
                const rawSub = resume.subScores || defaultSub;
                const totalSub = rawSub.structure + rawSub.impact + rawSub.skillAlignment + rawSub.complexity + rawSub.professionalism + rawSub.skillProjectFit;

                const ats = resume.atsScore || 0;
                const items = totalSub > 0 ? [
                  { name: 'Formatting & Layout', score: rawSub.structure, max: 20, desc: 'Structure and standard section presence.', color: 'from-[#0066cc] to-[#3399ff]', icon: '📝', type: 'Programmatic' },
                  { name: 'Impact & Metrics', score: rawSub.impact, max: 20, desc: 'Presence of quantified engineering metrics.', color: 'from-[#34c759] to-[#30d158]', icon: '📈', type: 'Programmatic' },
                  { name: 'Skill Alignment', score: rawSub.skillAlignment, max: 20, desc: 'Tech stack keywords match rate.', color: 'from-[#ff9f0a] to-[#ffb340]', icon: '🔑', type: 'Programmatic' },
                  { name: 'Technical Complexity', score: rawSub.complexity, max: 15, desc: 'Depth of projects, APIs, ML, DB scale.', color: 'from-[#bf5af2] to-[#c56cf0]', icon: '🏗️', type: 'AI Cognitive' },
                  { name: 'Professional Phrasing', score: rawSub.professionalism, max: 5, desc: 'Active voice and strong past-tense verbs.', color: 'from-[#ff375f] to-[#ff6b8b]', icon: '✍️', type: 'AI Cognitive' },
                  { name: 'Skill-Project Fit', score: rawSub.skillProjectFit, max: 10, desc: 'Project support for stated skills.', color: 'from-[#30d158] to-[#66bb6a]', icon: '🎯', type: 'AI Cognitive' }
                ] : [
                  { name: 'Formatting & Layout', score: Math.round((ats / 100) * 20), max: 20, desc: 'Structure and standard section presence.', color: 'from-[#0066cc] to-[#3399ff]', icon: '📝', type: 'Programmatic' },
                  { name: 'Impact & Metrics', score: Math.round((ats / 100) * 20), max: 20, desc: 'Presence of quantified engineering metrics.', color: 'from-[#34c759] to-[#30d158]', icon: '📈', type: 'Programmatic' },
                  { name: 'Skill Alignment', score: Math.round((ats / 100) * 20), max: 20, desc: 'Tech stack keywords match rate.', color: 'from-[#ff9f0a] to-[#ffb340]', icon: '🔑', type: 'Programmatic' },
                  { name: 'Technical Complexity', score: Math.round((ats / 100) * 15), max: 15, desc: 'Depth of projects, APIs, ML, DB scale.', color: 'from-[#bf5af2] to-[#c56cf0]', icon: '🏗️', type: 'AI Cognitive' },
                  { name: 'Professional Phrasing', score: Math.round((ats / 100) * 5), max: 5, desc: 'Active voice and strong past-tense verbs.', color: 'from-[#ff375f] to-[#ff6b8b]', icon: '✍️', type: 'AI Cognitive' },
                  { name: 'Skill-Project Fit', score: Math.round((ats / 100) * 10), max: 10, desc: 'Project support for stated skills.', color: 'from-[#30d158] to-[#66bb6a]', icon: '🎯', type: 'AI Cognitive' }
                ];

                return items.map((item, idx) => {
                  const percent = Math.round((item.score / item.max) * 100);
                  return (
                    <div
                      key={idx}
                      className="group relative flex flex-col p-3.5 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl hover:border-[#0066cc]/30 transition-all duration-200 overflow-hidden cursor-help"
                    >
                      {/* Hover definition overlay */}
                      <div className="absolute inset-0 bg-[#ebebf0] opacity-0 group-hover:opacity-100 flex flex-col justify-center p-3.5 transition-all duration-200 translate-y-full group-hover:translate-y-0">
                        <p className="text-[11px] font-bold text-[#1d1d1f] mb-0.5">{item.name}</p>
                        <p className="text-[10px] text-[#6e6e73] leading-relaxed font-medium">{item.desc}</p>
                        <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-[#86868b]">
                          <span>{item.type}</span>
                          <span>Max: {item.max}pts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-bold text-[#1d1d1f] truncate leading-tight">{item.name}</h5>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">{item.type}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="flex-1 bg-[#e8e8ed] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-extrabold text-[#1d1d1f] tabular-nums shrink-0">
                          {item.score}<span className="text-[9px] font-bold text-[#86868b]">/{item.max}</span>
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className={divider} />

          {/* Strengths / Green Flags */}
          <div className={`${cardClass} shadow-sm border border-[#e8e8ed]`}>
            <h3 className={`text-[0.65rem] font-bold ${isRecruiter ? 'text-[#0066cc]' : 'text-[#248a3d]'} uppercase tracking-wider mb-4 flex items-center gap-2`}>
              <span>🟢</span> {isRecruiter ? 'Candidate Green Flags' : 'Key Strengths'}
            </h3>
            <ul className="space-y-3">
              {(isRecruiter
                ? (resume.feedback?.recruiterFeedback?.greenFlags?.length > 0 ? resume.feedback.recruiterFeedback.greenFlags : resume.feedback?.strengths)
                : (resume.feedback?.studentFeedback?.strengths || resume.feedback?.strengths)
              )?.map((str, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#1d1d1f]">
                  <span className={`shrink-0 mt-0.5 font-bold ${isRecruiter ? 'text-[#0066cc]' : 'text-[#34c759]'}`}>✓</span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas of Concern / Red Flags */}
          <div className={`${cardClass} shadow-sm border border-[#e8e8ed]`}>
            <h3 className="text-[0.65rem] font-bold text-[#cc2f26] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🔴</span> {isRecruiter ? 'Candidate Red Flags' : 'Areas of Concern'}
            </h3>
            <ul className="space-y-3">
              {(isRecruiter
                ? (resume.feedback?.recruiterFeedback?.redFlags?.length > 0 ? resume.feedback.recruiterFeedback.redFlags : resume.feedback?.improvements)
                : (resume.feedback?.studentFeedback?.improvements || resume.feedback?.improvements)
              )?.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#1d1d1f]">
                  <span className="text-[#ff3b30] mt-0.5 shrink-0">⚠</span>
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recruiter-only: Contact CTA */}
          {isRecruiter && (
            <div className="flex gap-3 pt-2">
              <a
                href={`mailto:${student?.email}`}
                className={`${primaryBtn} flex-1 text-center py-3`}
              >
                ✉️ Email Candidate
              </a>
              {student?.mobile && (
                <a
                  href={`tel:${student.mobile}`}
                  className={`${secondaryBtn} flex-1 text-center py-3`}
                >
                  📞 Call Candidate
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}