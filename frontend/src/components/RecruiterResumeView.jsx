import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  headingClass, cardClass, mutedText, bodyText,
  primaryBtn, secondaryBtn, divider
} from '../styles/common';

// Dynamic Recruiter Recommendation Builder
const getRecommendation = (resume) => {
  const ats = resume.atsScore || 0;
  const match = resume.feedback?.matchScore ?? null;
  const missingCount = resume.feedback?.missingSkills?.length ?? 0;
  const complexity = resume.subScores?.complexity || 0;

  if (match !== null) {
    if (match >= 80 && ats >= 75 && missingCount <= 2 && complexity >= 9) {
      return {
        label: "Strong Match",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        desc: "Highly qualified candidate. Excellent ATS alignment, strong project complexity, and minimal keyword gaps."
      };
    } else if (match >= 60 && ats >= 60 && missingCount <= 4) {
      return {
        label: "Potential Match",
        cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
        desc: "Good candidate fit. Suitable skills match with moderate complexity. Missing cloud or advanced systems exposure."
      };
    } else if (match >= 35 || ats >= 45) {
      return {
        label: "Needs Review",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Requires further validation. Re-examine projects and credentials for transferable skill alignment."
      };
    } else {
      return {
        label: "Low Match",
        cls: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Candidate skills or experience do not match the minimum requirements of this role."
      };
    }
  }

  // Fallback for general scanned resumes
  if (ats >= 75 && complexity >= 9) {
    return {
      label: "Strong Match",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Excellent general candidate. High structure, complexity, and phrasing rating."
    };
  }
  if (ats >= 55) {
    return {
      label: "Potential Match",
      cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
      desc: "Good candidate profile. Meets standard early-career guidelines."
    };
  }
  if (ats >= 35) {
    return {
      label: "Needs Review",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Low general scores. Review experience metrics manually."
    };
  }
  return {
    label: "Low Match",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
    desc: "Unoptimized general resume template or lack of relevant details."
  };
};

// SVG Score Ring Component
function ScoreRing({ score, size = 64, strokeWidth = 6, color = "#0066cc" }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score ?? 0) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
      />
    </svg>
  );
}

export default function RecruiterResumeView({ resume, onClose }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'parsed'
  const [downloading, setDownloading] = useState(false);

  const student = resume.userId;
  const recommendation = getRecommendation(resume);

  // Dynamic Skill matching parser fallback
  const getMatchedSkills = () => {
    if (resume.feedback?.matchedSkills && resume.feedback.matchedSkills.length > 0) {
      return resume.feedback.matchedSkills;
    }
    // Programmatic fallback: search text for common skills
    const text = (resume.parsedText || "").toLowerCase();
    const commonSkills = [
      "react", "node.js", "node", "express", "mongodb", "mysql", "postgresql", "redis",
      "typescript", "javascript", "python", "java", "c++", "c#", "go", "rust",
      "aws", "docker", "kubernetes", "gcp", "azure", "terraform", "html", "css",
      "git", "ci/cd", "jenkins", "graphql", "rest", "django", "flask", "fastapi"
    ];
    const found = commonSkills.filter(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return regex.test(text);
    });
    return found.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  };

  const matchedSkills = getMatchedSkills();
  const missingSkills = resume.feedback?.missingSkills || [];

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading("Downloading original PDF resume...");
    try {
      const res = await axios.get(`/api/resume/${resume._id}/download`, {
        responseType: 'blob',
        withCredentials: true
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.title ? `${resume.title}.pdf` : `${student?.firstName || 'candidate'}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download original resume", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e8ed] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className={`${secondaryBtn} flex items-center gap-1.5`}
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1d1d1f]">
                {student?.firstName} {student?.lastName}
              </h1>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                Candidate Profile
              </span>
            </div>
            <p className={`${mutedText} flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5`}>
              <span>{student?.email}</span>
              {student?.mobile && (
                <>
                  <span>•</span>
                  <span>{student.mobile}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`${secondaryBtn} flex items-center gap-1.5`}
          >
            📥 Download Original PDF
          </button>
          <a
            href={`mailto:${student?.email}`}
            className={`${primaryBtn} flex items-center gap-1.5`}
          >
            ✉️ Email Candidate
          </a>
        </div>
      </div>

      {/* TWO-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Resume Preview */}
        <div className="lg:col-span-7 flex flex-col h-[800px] border border-[#e8e8ed] rounded-2xl bg-white overflow-hidden shadow-sm">
          {/* Tab Selection */}
          <div className="bg-slate-50 border-b border-[#e8e8ed] flex items-center justify-between px-4 py-2 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'pdf' ? 'bg-[#0066cc] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Document PDF View
              </button>
              <button
                onClick={() => setActiveTab('parsed')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'parsed' ? 'bg-[#0066cc] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Parsed Text View
              </button>
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {resume.title || "Candidate Resume"}
            </span>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden relative bg-slate-100">
            {activeTab === 'pdf' ? (
              resume.fileUrl ? (
                <iframe
                  src={`${resume.fileUrl}#toolbar=0`}
                  className="w-full h-full border-none bg-white"
                  title="Resume PDF"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-white text-slate-500">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">📄</span>
                    <p className="text-sm font-semibold">PDF File URL not found.</p>
                    <p className="text-xs text-slate-400">Please switch to Parsed Text View to review content.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full bg-white overflow-y-auto p-6 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {resume.parsedText || "No text parsed from this resume."}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recruiter Insights Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2">
          
          {/* 1. Recruiter Recommendation Card */}
          <div className={`p-5 rounded-2xl border ${recommendation.cls} shadow-sm transition-all duration-300`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Recruiter Recommendation</p>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 mb-2">
              {recommendation.label === "Strong Match" && "🏆"}
              {recommendation.label === "Potential Match" && "✨"}
              {recommendation.label === "Needs Review" && "🔍"}
              {recommendation.label === "Low Match" && "⚠️"}
              {recommendation.label}
            </h3>
            <p className="text-xs leading-relaxed opacity-95 font-medium">
              {recommendation.desc}
            </p>
          </div>

          {/* 2. Candidate Match Score Panel */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0066cc] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>📊</span> Score Diagnostics
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Role Match % */}
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative flex items-center justify-center mb-2">
                  <ScoreRing score={resume.feedback?.matchScore ?? 0} color="#0066cc" />
                  <span className="absolute text-xs font-black text-slate-800">
                    {resume.feedback?.matchScore != null ? `${resume.feedback.matchScore}%` : "—"}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Role Match</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">JD Alignment</p>
              </div>

              {/* ATS Score */}
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative flex items-center justify-center mb-2">
                  <ScoreRing score={resume.atsScore ?? 0} color="#10B981" />
                  <span className="absolute text-xs font-black text-slate-800">{resume.atsScore}%</span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">ATS Score</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Structure & Format</p>
              </div>

              {/* Keyword Match % */}
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative flex items-center justify-center mb-2">
                  <ScoreRing score={resume.feedback?.keywordMatchRate ?? 0} color="#F59E0B" />
                  <span className="absolute text-xs font-black text-slate-800">
                    {resume.feedback?.keywordMatchRate != null ? `${resume.feedback.keywordMatchRate}%` : "—"}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Keywords</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Skills Match Rate</p>
              </div>
            </div>
          </div>

          {/* 3. Candidate Summary */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0066cc] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>🤖</span> Candidate Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium italic bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
              "{resume.feedback?.recruiterFeedback?.recruiterSummary || resume.feedback?.summary || 'No summary assessment parsed for this candidate.'}"
            </p>
          </div>

          {/* 4. Strengths (Green Flags) */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>🟢</span> Key Candidate Strengths
            </h3>
            <ul className="space-y-2.5">
              {(resume.feedback?.recruiterFeedback?.greenFlags?.length > 0
                ? resume.feedback.recruiterFeedback.greenFlags
                : resume.feedback?.strengths || []
              ).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
              {(resume.feedback?.recruiterFeedback?.greenFlags?.length === 0 && (!resume.feedback?.strengths || resume.feedback.strengths.length === 0)) && (
                <p className="text-xs text-slate-400">No strengths logged.</p>
              )}
            </ul>
          </div>

          {/* 5. Potential Concerns (Red Flags) */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>🔴</span> Potential Concerns / Improvement Areas
            </h3>
            <ul className="space-y-2.5">
              {(resume.feedback?.recruiterFeedback?.redFlags?.length > 0
                ? resume.feedback.recruiterFeedback.redFlags
                : resume.feedback?.improvements || []
              ).map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">⚠</span>
                  <span>{concern}</span>
                </li>
              ))}
              {(resume.feedback?.recruiterFeedback?.redFlags?.length === 0 && (!resume.feedback?.improvements || resume.feedback.improvements.length === 0)) && (
                <p className="text-xs text-slate-400">No red flags or concerns reported.</p>
              )}
            </ul>
          </div>

          {/* 6. Skill Match Breakdown */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>🛠️</span> Skill Fit Diagnostic
            </h3>
            
            <div className="space-y-4">
              {/* Matched Skills */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Matched Skills ({matchedSkills.length})</p>
                {matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full shadow-sm"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No common skills extracted in resume text.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Missing Target Skills ({missingSkills.length})</p>
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full shadow-sm"
                      >
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium">No missing skills flagged against target Job Description.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
