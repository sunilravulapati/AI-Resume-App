import { useState, useRef } from "react";
import axios from "axios";

// ─── styles (same font + token system as Home.jsx) ──────────────────────────
const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .um-root * { box-sizing: border-box; }
  .um-root { font-family: 'DM Sans', sans-serif; }
  .um-display { font-family: 'DM Serif Display', serif; }

  @keyframes um-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes um-card-in {
    from { opacity: 0; transform: scale(0.96) translateY(14px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  .um-overlay { animation: um-overlay-in 0.18s ease both; }
  .um-card    { animation: um-card-in 0.24s cubic-bezier(0.34,1.4,0.64,1) both; }

  @keyframes um-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .um-fade-up { animation: um-fade-up 0.3s ease both; }

  /* mode toggle pills */
  .um-pill {
    cursor: pointer;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  }
  .um-pill-general  { background:#0066cc; color:#fff; box-shadow:0 4px 14px rgba(0,102,204,.28); }
  .um-pill-targeted { background:#248a3d; color:#fff; box-shadow:0 4px 14px rgba(36,138,61,.28); }
  .um-pill-idle     { background:transparent; color:#6e6e73; }

  /* drop zone */
  .um-drop {
    border: 2px dashed #d2d2d7;
    transition: border-color 0.18s, background 0.18s;
    cursor: pointer;
  }
  .um-drop:hover  { border-color:#0066cc; background:#0066cc08; }
  .um-drop-over   { border-color:#0066cc !important; background:#0066cc08 !important; }
  .um-drop-filled { border-color:#34c759 !important; background:#34c75908 !important; }

  /* JD panel slide */
  .um-jd-panel {
    display: grid;
    transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1),
                opacity 0.22s ease;
  }
  .um-jd-panel-open   { grid-template-rows: 1fr; opacity: 1; }
  .um-jd-panel-closed { grid-template-rows: 0fr; opacity: 0; }
  .um-jd-inner { overflow: hidden; }

  /* progress bar */
  .um-bar-fill {
    transition: width 0.45s ease;
    background: linear-gradient(90deg, #0066cc, #004499);
  }
  .um-bar-fill-done { background: linear-gradient(90deg, #34c759, #248a3d); }

  /* shimmer skeleton */
  .um-shimmer {
    background: linear-gradient(90deg, #f5f5f7 25%, #ebebf0 50%, #f5f5f7 75%);
    background-size: 200% 100%;
    animation: um-shimmer 1.3s infinite;
  }
  @keyframes um-shimmer {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
  }

  /* SVG score ring */
  .um-ring circle:last-child {
    transition: stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1);
  }

  textarea:focus, input:focus { outline: none; }
  .um-field:focus { box-shadow: 0 0 0 3px rgba(0,102,204,.14); }
  .um-field-g:focus { box-shadow: 0 0 0 3px rgba(52,199,89,.14); }
`;

// ─── helpers ────────────────────────────────────────────────────────────────
function badge(score) {
  if (score >= 75) return { cls:"border-[#34c759]/30 bg-[#34c759]/[0.06]", text:"text-[#248a3d]", bar:"#34c759", icon:"✅", label:"Strong Match" };
  if (score >= 50) return { cls:"border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.06]", text:"text-[#b86e00]", bar:"#ff9f0a", icon:"⚠️", label:"Average" };
  return               { cls:"border-[#ff3b30]/30 bg-[#ff3b30]/[0.06]", text:"text-[#cc2f26]", bar:"#ff3b30", icon:"❌", label:"Needs Work" };
}

function ScoreRing({ score, color }) {
  const S = 64, r = 27, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg className="um-ring" width={S} height={S} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke="#e8e8ed" strokeWidth={8}/>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"/>
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex gap-3 items-center">
        <div className="w-14 h-14 rounded-full um-shimmer shrink-0"/>
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded um-shimmer w-3/4"/>
          <div className="h-3 rounded um-shimmer w-1/2"/>
        </div>
      </div>
      {[92,78,85].map((w,i)=>(
        <div key={i} className="h-2.5 rounded um-shimmer" style={{width:`${w}%`,animationDelay:`${i*0.1}s`}}/>
      ))}
    </div>
  );
}

// ─── RESULT VIEW ─────────────────────────────────────────────────────────────
function ResultView({ result, file, onReset, onClose }) {
  const gb = badge(result.atsScore);
  const hasMatch = result.matchScore != null;
  const mb = hasMatch ? badge(result.matchScore) : null;

  return (
    <div className="um-root um-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{modalStyles}</style>
      <div className="um-card bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* sticky header */}
        <div className="px-7 pt-6 pb-4 border-b border-[#e8e8ed] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="um-display text-2xl text-[#1d1d1f]">Analysis Complete</h2>
              <p className="text-[0.7rem] text-[#a1a1a6] mt-0.5 truncate max-w-[300px]">{file?.name}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-[#e8e8ed] transition-colors text-sm shrink-0">
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-7 py-6 space-y-5 um-fade-up">

          {/* ── Score cards ── */}
          <div className={`grid ${hasMatch ? "grid-cols-2" : "grid-cols-1"} gap-4`}>

            <div className={`rounded-2xl border p-5 flex items-center gap-4 ${gb.cls}`}>
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <ScoreRing score={result.atsScore} color={gb.bar}/>
                <span className={`absolute text-sm font-black ${gb.text}`}>{result.atsScore}</span>
              </div>
              <div>
                <p className="text-[0.6rem] font-bold text-[#a1a1a6] uppercase tracking-widest mb-0.5">General Score</p>
                <p className={`text-sm font-bold ${gb.text}`}>{gb.icon} {gb.label}</p>
                <p className="text-[0.65rem] text-[#a1a1a6] mt-0.5">Best practices · formatting · impact</p>
              </div>
            </div>

            {hasMatch && (
              <div className={`rounded-2xl border p-5 flex items-center gap-4 ${mb.cls}`}>
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <ScoreRing score={result.matchScore} color={mb.bar}/>
                  <span className={`absolute text-sm font-black ${mb.text}`}>{result.matchScore}</span>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold text-[#a1a1a6] uppercase tracking-widest mb-0.5">Role Match Score</p>
                  <p className={`text-sm font-bold ${mb.text}`}>{mb.icon} {mb.label}</p>
                  <p className="text-[0.65rem] text-[#a1a1a6] mt-0.5 truncate max-w-[120px]">{result.roleName || "Target role"} fit</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Keyword match bar (targeted only) ── */}
          {result.keywordMatchRate != null && (
            <div className="bg-[#f5f5f7] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-[#1d1d1f]">Keyword Match Rate</p>
                <span className="text-xs font-black text-[#0066cc]">{result.keywordMatchRate}%</span>
              </div>
              <div className="w-full bg-[#e8e8ed] rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full bg-[#0066cc]"
                  style={{width:`${result.keywordMatchRate}%`, transition:"width 1s ease"}}/>
              </div>
            </div>
          )}

          {/* ── Missing skills (targeted only) ── */}
          {result.missingSkills?.length > 0 && (
            <div className="bg-[#ff3b30]/[0.04] border border-[#ff3b30]/20 rounded-2xl p-5">
              <h4 className="text-[0.65rem] font-bold text-[#cc2f26] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>🚨</span> Missing Critical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s,i)=>(
                  <span key={i} className="text-xs bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20 px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Experience gap (targeted only) ── */}
          {result.experienceGap && (
            <div className="bg-[#ff9f0a]/[0.05] border border-[#ff9f0a]/25 rounded-2xl p-5">
              <h4 className="text-[0.65rem] font-bold text-[#b86e00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📊</span> Experience Gap
              </h4>
              <p className="text-sm text-[#1d1d1f] leading-relaxed">{result.experienceGap}</p>
            </div>
          )}

          {/* ── AI Summary ── */}
          <div className="bg-white border-l-4 border-[#0066cc] pl-5 pr-5 py-4 rounded-r-2xl shadow-sm border border-[#e8e8ed]">
            <h4 className="text-[0.65rem] font-bold text-[#0066cc] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🤖</span> AI Assessment
            </h4>
            <p className="text-sm text-[#1d1d1f] leading-relaxed">{result.summary}</p>
          </div>

          {/* ── Strengths + Improvements ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#34c759]/[0.05] border border-[#34c759]/20 rounded-2xl p-5">
              <h4 className="text-[0.65rem] font-bold text-[#248a3d] uppercase tracking-wider mb-3">🟢 Key Strengths</h4>
              <ul className="space-y-2">
                {result.strengths?.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-[#1d1d1f] leading-relaxed">
                    <span className="text-[#34c759] shrink-0 mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#ff3b30]/[0.04] border border-[#ff3b30]/20 rounded-2xl p-5">
              <h4 className="text-[0.65rem] font-bold text-[#cc2f26] uppercase tracking-wider mb-3">🔴 Areas to Fix</h4>
              <ul className="space-y-2">
                {result.improvements?.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-[#1d1d1f] leading-relaxed">
                    <span className="text-[#ff3b30] shrink-0 mt-0.5">⚠</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button onClick={onReset}
              className="flex-1 border border-[#d2d2d7] text-[#1d1d1f] font-medium px-5 py-3 rounded-full hover:bg-[#f5f5f7] transition-colors text-sm">
              ← Analyze Another
            </button>
            <button onClick={onClose}
              className="flex-1 bg-[#0066cc] text-white font-semibold px-5 py-3 rounded-full hover:bg-[#004499] transition-colors text-sm shadow-md shadow-[#0066cc]/20">
              View Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN UPLOAD MODAL ───────────────────────────────────────────────────────
export default function UploadModal({ onClose, onSuccess }) {
  const [mode, setMode]         = useState("general"); // "general" | "targeted"
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [jd, setJd]             = useState("");
  const [company, setCompany]   = useState("");
  const [roleName, setRoleName] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [progLabel, setProgLabel] = useState("");
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");

  const fileRef = useRef();

  // ── file handling ──────────────────────────────────────────────────────
  const acceptFile = (f) => {
    if (f?.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  // ── submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) return setError("Please select a resume PDF.");
    if (mode === "targeted" && !jd.trim()) return setError("Please paste the job description.");
    setError("");
    setUploading(true);
    setProgress(10);
    setProgLabel("Parsing your PDF…");

    const fd = new FormData();
    fd.append("resume", file);
    fd.append("analysisMode", mode);
    if (mode === "targeted") {
      fd.append("jobDescription", jd);
      if (company.trim()) fd.append("company", company);
      if (roleName.trim()) fd.append("roleName", roleName);
    }

    // Staged progress labels
    const stages = [
      [28, "Extracting text & keywords…"],
      [50, "Running programmatic ATS score…"],
      [70, mode === "targeted" ? "Matching against Job Description…" : "Running Llama-3 semantic layer…"],
      [88, "Generating AI feedback…"],
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < stages.length) {
        setProgress(stages[si][0]);
        setProgLabel(stages[si][1]);
        si++;
      }
    }, 950);

    try {
      const res = await axios.post("https://ai-resume-tauw.onrender.com/api/resume/upload", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(ticker);
      setProgress(100);
      setProgLabel("Done!");
      setResult(res.data.analysis);
      onSuccess?.(res.data.analysis);
    } catch (err) {
      clearInterval(ticker);
      setError(err.response?.data?.error || "Upload failed — please try again.");
      setUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null); setJd(""); setCompany(""); setRoleName("");
    setResult(null); setUploading(false); setProgress(0); setError(""); setMode("general");
  };

  // ── result screen ──────────────────────────────────────────────────────
  if (result) {
    return <ResultView result={result} file={file} onReset={reset} onClose={onClose}/>;
  }

  // ── drop zone state classes ────────────────────────────────────────────
  const dropCls = [
    "um-drop rounded-2xl p-6 text-center select-none",
    dragging ? "um-drop-over" : "",
    file     ? "um-drop-filled" : "",
  ].join(" ");

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="um-root um-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{modalStyles}</style>

      <div className="um-card bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* ── header ── */}
        <div className="px-7 pt-7 pb-5 border-b border-[#e8e8ed]">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="um-display text-2xl text-[#1d1d1f] leading-tight">Analyze Resume</h2>
              <p className="text-[0.7rem] text-[#a1a1a6] mt-0.5">Choose your analysis path below</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-[#e8e8ed] transition-colors text-sm shrink-0">
              ✕
            </button>
          </div>

          {/* mode toggle */}
          <div className="flex gap-2 p-1 bg-[#f5f5f7] rounded-full">
            <button
              onClick={() => { setMode("general"); setError(""); }}
              className={`um-pill flex-1 text-xs font-semibold px-4 py-2 rounded-full ${mode === "general" ? "um-pill-general" : "um-pill-idle"}`}>
              ⚡ General Analysis
            </button>
            <button
              onClick={() => { setMode("targeted"); setError(""); }}
              className={`um-pill flex-1 text-xs font-semibold px-4 py-2 rounded-full ${mode === "targeted" ? "um-pill-targeted" : "um-pill-idle"}`}>
              🎯 Match My Resume
            </button>
          </div>

          <p className="text-[0.7rem] text-[#6e6e73] mt-3 leading-relaxed">
            {mode === "general"
              ? "Quick scan for formatting, impact language, metrics & ATS best practices. No JD needed."
              : "Deep analysis against a specific Job Description — reveals keyword gaps, role fit score & seniority alignment."}
          </p>
        </div>

        {/* ── body ── */}
        <div className="px-7 py-6 space-y-5 overflow-y-auto max-h-[58vh]">

          {/* drop zone */}
          <div
            className={dropCls}
            onClick={() => !file && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => acceptFile(e.target.files[0])}/>

            {file ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#248a3d] truncate">{file.name}</p>
                  <p className="text-xs text-[#a1a1a6]">{(file.size/1024).toFixed(0)} KB · PDF</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="w-6 h-6 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] text-xs flex items-center justify-center hover:bg-[#ff3b30]/20 transition-colors shrink-0">
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-2">☁️</div>
                <p className="text-sm font-semibold text-[#1d1d1f]">Drop your PDF here</p>
                <p className="text-xs text-[#a1a1a6] mt-1">or click to browse · PDF only</p>
              </>
            )}
          </div>

          {/* JD panel — slides open when mode === "targeted" */}
          <div className={`um-jd-panel ${mode === "targeted" ? "um-jd-panel-open" : "um-jd-panel-closed"}`}>
            <div className="um-jd-inner">
              <div className="space-y-3 pt-1">

                {/* Company + Role row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-wider block mb-1.5">
                      Company <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="um-field w-full text-sm border border-[#e8e8ed] rounded-xl px-3.5 py-2.5 text-[#1d1d1f] placeholder-[#c7c7cc] transition-shadow"/>
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-wider block mb-1.5">
                      Role Title <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Senior SWE"
                      className="um-field w-full text-sm border border-[#e8e8ed] rounded-xl px-3.5 py-2.5 text-[#1d1d1f] placeholder-[#c7c7cc] transition-shadow"/>
                  </div>
                </div>

                {/* JD textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-wider">
                      Job Description <span className="text-[#ff3b30]">*</span>
                    </label>
                    <span className="text-[0.6rem] text-[#c7c7cc]">{jd.length} chars</span>
                  </div>
                  <textarea
                    value={jd} onChange={(e) => setJd(e.target.value)}
                    rows={6} placeholder={"Paste the full job description here…\n\nTip: include the tech stack, requirements & responsibilities for the most accurate analysis."}
                    className="um-field-g w-full text-sm border border-[#e8e8ed] rounded-xl px-3.5 py-3 text-[#1d1d1f] placeholder-[#c7c7cc] transition-shadow resize-none leading-relaxed"/>
                </div>

                {/* what you unlock tags */}
                <div className="flex flex-wrap gap-1.5">
                  {["Keyword Match %", "Missing Skills", "Experience Gap", "Role Fit Score"].map(tag => (
                    <span key={tag} className="text-[0.6rem] font-semibold bg-[#248a3d]/[0.07] text-[#248a3d] border border-[#248a3d]/20 px-2 py-0.5 rounded-full">
                      ✓ {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="bg-[#ff3b30]/[0.06] border border-[#ff3b30]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#cc2f26] font-medium">{error}</p>
            </div>
          )}

          {/* progress */}
          {uploading && (
            <div className="space-y-2.5 um-fade-up">
              <div className="flex justify-between">
                <p className="text-xs text-[#6e6e73] font-medium">{progLabel}</p>
                <p className="text-xs font-bold text-[#0066cc]">{progress}%</p>
              </div>
              <div className="w-full bg-[#e8e8ed] rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full um-bar-fill ${progress === 100 ? "um-bar-fill-done" : ""}`}
                  style={{ width:`${progress}%` }}/>
              </div>
              {progress < 100 && <Skeleton/>}
            </div>
          )}
        </div>

        {/* ── footer ── */}
        {!uploading && (
          <div className="px-7 pb-7 pt-1 flex gap-3 border-t border-[#e8e8ed]">
            <button onClick={onClose}
              className="border border-[#d2d2d7] text-[#1d1d1f] font-medium px-5 py-3 rounded-full hover:bg-[#f5f5f7] transition-colors text-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!file}
              className={`flex-1 font-semibold px-5 py-3 rounded-full transition-all text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed
                ${mode === "general"
                  ? "bg-[#0066cc] text-white hover:bg-[#004499] shadow-[#0066cc]/20"
                  : "bg-[#248a3d] text-white hover:bg-[#1a6b2e] shadow-[#248a3d]/20"}`}>
              {mode === "general" ? "⚡ Analyze Resume" : "🎯 Match to Job"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}