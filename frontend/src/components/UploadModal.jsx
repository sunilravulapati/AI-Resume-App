import { useState, useRef } from "react";
import axios from "axios";

// ─── helpers ────────────────────────────────────────────────────────────────
function badge(score) {
  if (score >= 75) return { cls:"border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]", bar:"var(--success)", icon:"✓", label:"Strong Match" };
  if (score >= 50) return { cls:"border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning)]", bar:"var(--warning)", icon:"!", label:"Average" };
  return               { cls:"border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger)]", bar:"var(--danger)", icon:"✕", label:"Needs Work" };
}

function ScoreRing({ score, color }) {
  const S = 72, r = 32, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg className="transform -rotate-90 transition-all duration-1000 ease-out" width={S} height={S}>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={8}/>
      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" className="transition-all duration-1000 ease-out"/>
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-muted)] animate-pulse shrink-0"/>
        <div className="flex-1 space-y-3">
          <div className="h-3 rounded-full bg-[var(--bg-muted)] animate-pulse w-3/4"/>
          <div className="h-3 rounded-full bg-[var(--bg-muted)] animate-pulse w-1/2"/>
        </div>
      </div>
      {[92,78,85].map((w,i)=>(
        <div key={i} className="h-2.5 rounded-full bg-[var(--bg-muted)] animate-pulse" style={{width:`${w}%`,animationDelay:`${i*0.1}s`}}/>
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6 animate-fade-in">
      <div className="bg-[var(--bg-elevated)] w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-glass flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-fade-up">
        
        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-50" />

        {/* sticky header */}
        <div className="px-8 pt-6 pb-5 border-b border-[var(--border)] shrink-0 flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)]">Analysis Complete</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 truncate max-w-[300px]">{file?.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-7 space-y-6">

          {/* ── Score cards ── */}
          <div className={`grid ${hasMatch ? "grid-cols-2" : "grid-cols-1"} gap-5`}>
            <div className={`rounded-2xl border p-5 flex items-center gap-5 ${gb.cls}`}>
              <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
                <ScoreRing score={result.atsScore} color={gb.bar}/>
                <span className="absolute text-lg font-black">{result.atsScore}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">General Score</p>
                <p className="text-base font-bold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-sm shadow-sm">{gb.icon}</span> 
                  {gb.label}
                </p>
                <p className="text-xs mt-1 opacity-80">Formatting & best practices</p>
              </div>
            </div>

            {hasMatch && (
              <div className={`rounded-2xl border p-5 flex items-center gap-5 ${mb.cls}`}>
                <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
                  <ScoreRing score={result.matchScore} color={mb.bar}/>
                  <span className="absolute text-lg font-black">{result.matchScore}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Role Match</p>
                  <p className="text-base font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white text-sm shadow-sm">{mb.icon}</span> 
                    {mb.label}
                  </p>
                  <p className="text-xs mt-1 opacity-80 truncate max-w-[140px]">{result.roleName || "Target role"} fit</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Keyword match bar (targeted only) ── */}
          {result.keywordMatchRate != null && (
            <div className="bg-[var(--bg-muted)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-[var(--text)]">Keyword Match Rate</p>
                <span className="text-lg font-black text-[var(--color-accent)]">{result.keywordMatchRate}%</span>
              </div>
              <div className="w-full bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-1000 ease-out"
                  style={{width:`${result.keywordMatchRate}%`}}/>
              </div>
            </div>
          )}

          {/* ── Missing skills (targeted only) ── */}
          {result.missingSkills?.length > 0 && (
            <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-base">🚨</span> Missing Critical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s,i)=>(
                  <span key={i} className="text-xs bg-white text-[var(--danger)] border border-[var(--danger)]/20 px-3 py-1.5 rounded-full font-semibold shadow-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Summary ── */}
          <div className="bg-white border-l-4 border-[var(--color-accent)] pl-6 pr-5 py-5 rounded-r-2xl shadow-sm border border-[var(--border)] border-l-[var(--color-accent)]">
            <h4 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span className="text-base">🤖</span> AI Assessment
            </h4>
            <p className="text-sm text-[var(--text)] leading-relaxed font-medium">{result.summary}</p>
          </div>

          {/* ── Strengths + Improvements ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[var(--success-soft)] border border-[var(--success)]/20 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-[var(--success)] uppercase tracking-wider mb-4 flex items-center gap-1.5">🟢 Key Strengths</h4>
              <ul className="space-y-3">
                {result.strengths?.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text)] leading-relaxed font-medium">
                    <span className="text-[var(--success)] shrink-0 mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider mb-4 flex items-center gap-1.5">🔴 Areas to Fix</h4>
              <ul className="space-y-3">
                {result.improvements?.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text)] leading-relaxed font-medium">
                    <span className="text-[var(--danger)] shrink-0 mt-0.5">⚠</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* ── Actions ── */}
        <div className="px-8 py-5 flex gap-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 sm:rounded-b-3xl">
          <button onClick={onReset}
            className="flex-1 border-2 border-[var(--border-strong)] text-[var(--text)] font-bold px-6 py-3.5 rounded-xl hover:bg-[var(--bg-muted)] hover:border-[var(--text-secondary)] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
            Analyze Another
          </button>
          <button onClick={onClose}
            className="flex-1 bg-[var(--text)] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[var(--text-secondary)] transition-colors text-sm shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2">
            View Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

//MAIN UPLOAD MODAL
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

  const acceptFile = (f) => {
    if (f?.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

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
      const res = await axios.post("/api/resume/upload", fd, {
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

  if (result) {
    return <ResultView result={result} file={file} onReset={reset} onClose={onClose}/>;
  }

  const dropCls = `
    rounded-2xl p-8 text-center select-none border-2 border-dashed transition-all duration-300 cursor-pointer
    ${dragging ? "border-[var(--color-accent)] bg-[var(--color-brand-50)]" : "border-[var(--border-strong)] hover:border-[var(--color-accent)] hover:bg-[var(--bg-muted)]"}
    ${file ? "border-[var(--success)] bg-[var(--success-soft)]" : ""}
  `;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-[var(--bg-elevated)] w-full max-w-xl sm:rounded-3xl rounded-t-3xl shadow-glass flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-fade-up">
        
        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-50" />

        {/* ── header ── */}
        <div className="px-8 pt-5 pb-5 border-b border-[var(--border)] shrink-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text)] leading-tight">Choose Analysis Type</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Select how you want to evaluate your resume</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors text-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
              ✕
            </button>
          </div>

          {/* mode toggle */}
          <div className="flex gap-2 p-1.5 bg-[var(--bg-muted)] rounded-2xl border border-[var(--border)]">
            <button
              onClick={() => { setMode("general"); setError(""); }}
              className={`flex-1 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${mode === "general" ? "bg-[var(--text)] text-[var(--bg-elevated)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]"}`}>
              ⚡ A. General Resume Analysis
            </button>
            <button
              onClick={() => { setMode("targeted"); setError(""); }}
              className={`flex-1 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${mode === "targeted" ? "bg-[var(--text)] text-[var(--bg-elevated)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]"}`}>
              🎯 B. Job Description Analysis
            </button>
          </div>
          
          <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed font-medium">
            {mode === "general"
              ? "Quick scan for formatting, impact language, metrics & ATS best practices. No JD needed."
              : "Deep analysis against a specific Job Description — reveals keyword gaps, role fit score & seniority alignment."}
          </p>
        </div>

        {/* ── body ── */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto">

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
              <div className="flex items-center gap-4 text-left">
                <span className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-[var(--success)]/20">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[var(--success)] truncate">{file.name}</p>
                  <p className="text-sm text-[var(--success)]/70 font-medium">{(file.size/1024).toFixed(0)} KB · PDF Document</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="w-8 h-8 rounded-full bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:border-[var(--danger)] flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]">
                  ✕
                </button>
              </div>
            ) : (
              <div className="py-2">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-[var(--border)] flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">☁️</div>
                <p className="text-base font-bold text-[var(--text)] mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-[var(--text-secondary)] font-medium">PDF files only (max 5MB)</p>
              </div>
            )}
          </div>

          {/* JD panel — slides open when mode === "targeted" */}
          <div className={`grid transition-all duration-300 ease-in-out ${mode === "targeted" ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 m-0"}`}>
            <div className="overflow-hidden">
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Company <span className="normal-case opacity-70 font-medium">(optional)</span>
                    </label>
                    <input
                      type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full text-sm border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all font-medium bg-[var(--bg)]"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Role Title <span className="normal-case opacity-70 font-medium">(optional)</span>
                    </label>
                    <input
                      type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Senior SWE"
                      className="w-full text-sm border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all font-medium bg-[var(--bg)]"/>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Job Description <span className="text-[var(--danger)]">*</span>
                    </label>
                    <span className="text-xs font-bold text-[var(--text-muted)]">{jd.length} chars</span>
                  </div>
                  <textarea
                    value={jd} onChange={(e) => setJd(e.target.value)}
                    rows={5} placeholder={"Paste the full job description here...\nInclude tech stack, requirements & responsibilities."}
                    className="w-full text-sm border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)] transition-all font-medium bg-[var(--bg)] resize-y leading-relaxed"/>
                </div>
              </div>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl px-5 py-4 animate-fade-up">
              <p className="text-sm text-[var(--danger)] font-bold flex items-start gap-2 whitespace-pre-line"><span className="mt-0.5">⚠️</span> {error}</p>
            </div>
          )}

          {/* progress */}
          {uploading && (
            <div className="space-y-3 animate-fade-up p-5 border border-[var(--border-strong)] rounded-2xl bg-[var(--bg-muted)]">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></span>
                  {progLabel}
                </p>
                <p className="text-sm font-black text-[var(--color-accent)]">{progress}%</p>
              </div>
              <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? "bg-[var(--success)]" : "bg-[var(--color-accent)]"}`}
                  style={{ width:`${progress}%` }}/>
              </div>
            </div>
          )}
        </div>

        {/* ── footer ── */}
        {!uploading && (
          <div className="px-8 pb-8 pt-5 flex gap-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 sm:rounded-b-3xl">
            <button onClick={onClose}
              className="border-2 border-[var(--border-strong)] text-[var(--text)] font-bold px-6 py-3.5 rounded-xl hover:bg-[var(--bg-muted)] hover:border-[var(--text-secondary)] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!file}
              className={`flex-1 font-bold px-6 py-3.5 rounded-xl transition-all text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${mode === "general"
                  ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)]"
                  : "bg-[var(--text)] text-white hover:bg-[var(--text-secondary)] focus-visible:ring-[var(--text)]"}`}>
              {mode === "general" ? "⚡ Analyze Resume" : "🎯 Match to Job"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
