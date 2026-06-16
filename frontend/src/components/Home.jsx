import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import {
  ZapIcon, TargetIcon, TrendingUpIcon, SearchIcon,
  UsersIcon, MessageSquareIcon, MonitorIcon, CloudUploadIcon,
  SparklesIcon, CheckCircleIcon, XCircleIcon
} from "./icons";

// ─── Ticker data ───────────────────────────────────────────────────────────────
const tickerItems = [
  { score: "ATS Scan", label: "Get a general formatting & hygiene score in seconds" },
  { score: "Targeted Match", label: "Map resume keywords to any Job Description" },
  { score: "STAR Method", label: "Tailor experience bullet points without inventing credentials" },
  { score: "Keyword Gaps", label: "Identify missing technical & soft skills in real time" },
  { score: "LaTeX Export", label: "Download clean, Overleaf-ready LaTeX code" },
  { score: "Talent Ranking", label: "Hiring managers view candidate ATS fit instantly" },
  { score: "Version History", label: "Track your score improvement across edits" },
];

// ─── Step data ─────────────────────────────────────────────────────────────────
const steps = [
  { 
    n: "01", 
    icon: <CloudUploadIcon size={22} />, 
    title: "Upload & choose mode", 
    desc: "Drop your PDF. Pick General for a best-practices scan, or Targeted to match a specific role." 
  },
  { 
    n: "02", 
    icon: <TargetIcon size={22} />, 
    title: "Paste your target JD", 
    desc: "In Targeted mode, paste the job description. The AI maps every keyword to your resume." 
  },
  { 
    n: "03", 
    icon: <SparklesIcon size={22} />, 
    title: "Get tailored output", 
    desc: "Receive a rewritten resume. Export via Copy, PDF, or Overleaf LaTeX." 
  },
];

// ─── Feature data ──────────────────────────────────────────────────────────────
const studentFeatures = [
  { icon: <ZapIcon size={20} />, title: "Two-path analysis", desc: "General ATS scan or deep Targeted Match — with role fit score, keyword gap, and seniority alignment." },
  { icon: <TargetIcon size={20} />, title: "Zero-hallucination tailoring", desc: "Rewrites your experience using the STAR method — without inventing fake credentials." },
  { icon: <TrendingUpIcon size={20} />, title: "Version history", desc: "Every upload is saved with its score. Watch your ATS number climb as you iterate." },
  { icon: <SearchIcon size={20} />, title: "Keyword gap analysis", desc: "See exactly which skills from the JD are missing — listed as chips, not vague advice." },
];
const recruiterFeatures = [
  { icon: <UsersIcon size={20} />, title: "Instant talent pool", desc: "Candidates ranked by verified ATS score the moment they upload." },
  { icon: <MessageSquareIcon size={20} />, title: "Objective summaries", desc: "Biggest technical asset + most glaring red flag. No fluff." },
  { icon: <MonitorIcon size={20} />, title: "Split-screen review", desc: "Original PDF side-by-side with the AI's breakdown. Everything in one screen." },
];

// ─── Stats data (47k resumes analyzed removed as requested) ─────────────────────
const stats = [
  { target: 28, prefix: "+", suffix: " pts", label: "Avg ATS score increase" },
  { target: 62, suffix: "%", label: "Interview rate improvement" },
];

// ─── Demo mode configs ─────────────────────────────────────────────────────────
const MODES = {
  general: {
    scoreValue: 72,
    scoreColor: "var(--color-accent)",
    scoreTitle: "ATS Score",
    scoreSub: "Good · Best-practices scan",
    bars: [
      { name: "Action verbs", pct: 88, color: "var(--color-accent)" },
      { name: "Quantified", pct: 60, color: "#f59e0b" },
      { name: "Formatting", pct: 90, color: "var(--color-accent)" },
      { name: "ATS hygiene", pct: 45, color: "#ef4444" },
    ],
    found: ["Strong verbs", "Formatting"],
    missing: ["Metrics sparse", "ATS hygiene"],
  },
  targeted: {
    scoreValue: 80,
    scoreColor: "var(--color-accent)",
    scoreTitle: "Role Match Score",
    scoreSub: "Strong match · Senior SWE at Stripe",
    bars: [
      { name: "Python", pct: 95, color: "var(--color-accent)" },
      { name: "React", pct: 80, color: "var(--color-accent)" },
      { name: "Kubernetes", pct: 55, color: "#f59e0b" },
      { name: "AWS", pct: 40, color: "#ef4444" },
    ],
    found: ["Python", "React", "CI/CD"],
    missing: ["Kubernetes", "AWS", "Distributed sys"],
  },
};

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const raf = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return value;
}

// ─── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ value, color }) {
  const circumference = 201;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F5F9" strokeWidth="7" />
        <circle
          cx="40" cy="40" r="32" fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 600, color: "var(--text)", lineHeight: 1,
      }}>
        {value}
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>/ 100</div>
      </div>
    </div>
  );
}

// ─── Stat Box ──────────────────────────────────────────────────────────────────
function StatBox({ target, suffix, prefix, label, active }) {
  const count = useCountUp(target, 1400, active);
  return (
    <div className="bg-[var(--bg-elevated)] p-8 sm:p-12 text-center flex flex-col justify-center items-center">
      <div className="font-serif text-5xl sm:text-6xl text-[var(--color-accent)] leading-none mb-3 font-semibold flex items-center justify-center">
        {prefix && <span className="opacity-90">{prefix}</span>}
        <span>{count}</span>
        {suffix && <span className="text-3xl sm:text-4xl ml-1 font-sans font-medium text-[var(--text-secondary)]">{suffix}</span>}
      </div>
      <div className="text-sm sm:text-base text-[var(--text-secondary)] font-medium max-w-[200px] text-center">{label}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [demoMode, setDemoMode] = useState("targeted");
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef(null);

  const mode = MODES[demoMode];

  // Trigger stat count-up on scroll into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsActive(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans relative">
      
      {/* ── AMBIENT BACKGROUND GLOWS ─────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-[0.06] bg-[var(--color-accent)] z-0" />
      <div className="absolute top-[20%] left-[-100px] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-[0.04] bg-[var(--color-accent)] z-0" />
      <div className="absolute bottom-[20%] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-[0.05] bg-[var(--color-accent)] z-0" />

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 md:pt-24 pb-8 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Animated Badge */}
        <div className="animate-fade-up flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-soft)] border border-[rgba(79,70,229,0.15)] shadow-xs mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
          </span>
          AI-Powered · ATS-Proven · Overleaf-Ready
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up font-serif tracking-tight leading-[1.05] text-[var(--text)] max-w-4xl mb-6 text-balance" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Stop guessing.<br />
          <span className="italic text-[var(--color-accent)] font-normal">Start landing</span> interviews.
        </h1>

        {/* Subhead */}
        <p className="animate-fade-up text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed text-balance">
          Upload your resume to instantly check formatting, metrics, and ATS hygiene. Paste a job description to get a Targeted Match score, gap analysis, and zero-hallucination tailoring.
        </p>

        {/* Actions */}
        <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md px-4">
          <NavLink to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-accent)] text-white font-semibold rounded-full hover:bg-[var(--color-accent-hover)] transition-all duration-200 text-center shadow-indigo hover:shadow-lg hover:-translate-y-0.5">
            Get started for free
          </NavLink>
          <NavLink to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] font-semibold rounded-full hover:bg-[var(--bg-muted)] transition-all duration-200 text-center hover:-translate-y-0.5">
            Log in to your workspace
          </NavLink>
        </div>
      </section>

      {/* Ticker / Marquee */}
      <div className="w-full overflow-hidden border-y border-[var(--border)] py-4 bg-[var(--bg-elevated)] shadow-xs relative z-10">
        <div className="flex gap-0 animate-ticker w-max">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] font-medium px-12 whitespace-nowrap">
              <span className="font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-md text-[11px]">{item.score}</span>
              <span>{item.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] ml-4" />
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE DEMO CARD ───────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-preview max-w-5xl mx-auto">
          {/* macOS Browser Chrome */}
          <div className="bg-[var(--bg-muted)] px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#28C840] inline-block" />
            </div>
            <div className="text-xs text-[var(--text-muted)] font-medium font-mono select-none">resumeai_preview.app</div>
            <div className="w-10" />
          </div>

          {/* Interface grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {/* Left Panel - File and Settings */}
            <div className="p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Input Documents</h3>
                
                {/* Upload Simulator */}
                <div className="border border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden select-none mb-6">
                  {/* Scan bar */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent animate-scanLine opacity-80" />
                  <div className="text-3xl mb-3 animate-float"><CloudUploadIcon size={36} className="text-[var(--color-accent)]" /></div>
                  <div className="text-sm font-semibold text-[var(--text)] mb-1">resume_v3_final.pdf</div>
                  <div className="text-xs text-[var(--text-muted)]">Scanning ATS hygiene tags...</div>
                </div>

                {/* Mode Selectors */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Analysis Mode</h3>
                <div className="flex bg-[var(--bg-muted)] p-1 rounded-xl gap-1 mb-6 border border-[var(--border)]">
                  <button 
                    onClick={() => setDemoMode("general")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${demoMode === "general" ? "bg-[var(--bg-elevated)] text-[var(--text)] shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}
                  >
                    ⚡ General scan
                  </button>
                  <button 
                    onClick={() => setDemoMode("targeted")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${demoMode === "targeted" ? "bg-[var(--bg-elevated)] text-[var(--text)] shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}
                  >
                    🎯 Targeted match
                  </button>
                </div>
              </div>

              {/* JD simulator */}
              <div className="transition-all duration-300">
                {demoMode === "targeted" ? (
                  <div className="bg-[var(--bg-muted)] rounded-xl p-4 border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed relative animate-fadeInUp">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">Job Description</span>
                    "We're looking for a Senior Software Engineer with 5+ years of experience in Python, React, and Kubernetes. Experience with AWS is required..."
                  </div>
                ) : (
                  <div className="bg-[var(--bg-muted)]/50 rounded-xl p-4 border border-[var(--border)] border-dashed text-xs text-[var(--text-muted)] text-center py-6">
                    No target JD loaded. Scanning for formatting & general best practices.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Live results */}
            <div className="p-8 sm:p-10 bg-[var(--bg-muted)]/30 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5">AI Breakdown</h3>
                
                {/* Score Header */}
                <div className="flex items-center gap-5 mb-8">
                  <ScoreRing value={mode.scoreValue} color={mode.scoreColor} />
                  <div>
                    <h4 className="font-semibold text-base text-[var(--text)] mb-0.5">{mode.scoreTitle}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{mode.scoreSub}</p>
                  </div>
                </div>

                {/* Progress bars */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3.5">Keyword Match Coverage</h3>
                <div className="flex flex-col gap-3.5 mb-8">
                  {mode.bars.map((bar, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-secondary)] font-medium w-24 truncate">{bar.name}</span>
                      <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                        />
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono w-8 text-right">{bar.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chips */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Key Identifiers</h3>
                <div className="flex flex-wrap gap-2">
                  {mode.found.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 rounded-full">
                      <CheckCircleIcon size={12} className="text-[#22C55E]" /> {kw}
                    </span>
                  ))}
                  {mode.missing.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991b1b] bg-[#FEF2F2] border border-[#FECACA] px-3 py-1 rounded-full">
                      <XCircleIcon size={12} className="text-[#EF4444]" /> {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 bg-[var(--bg-elevated)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3 block">Simple Process</span>
            <h2 className="font-serif leading-none tracking-tight text-[var(--text)] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
              Three steps to a <span className="italic text-[var(--color-accent)] font-normal">better</span> resume
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">From upload to tailored rewrite in under a minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-card hover:-translate-y-1 relative"
              >
                <div className="absolute top-6 right-8 text-4xl font-extrabold text-[var(--text-muted)] opacity-15 font-mono select-none">{step.n}</div>
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-lg text-[var(--text)] mb-2.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO ANALYSIS MODES ───────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3 block">Flexible Scanning</span>
          <h2 className="font-serif leading-none tracking-tight text-[var(--text)] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
            General or <span className="italic text-[var(--color-accent)] font-normal">Targeted</span> — you choose
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">Run a General scan for formatting checks, or use Targeted mode to optimize for a specific job application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* General Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:-translate-y-1">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full mb-6">
                ⚡ General Baseline Scan
              </span>
              <h3 className="font-serif text-2xl mb-3 leading-snug">Best-practices audit</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                Checks formatting, quantifiable achievements, action verbs, and structural ATS layout. Get scored in seconds without pasting job descriptions.
              </p>
            </div>
            <ul className="space-y-3">
              {["ATS compatibility rating", "Formatting and structure scan", "Action verb density analysis", "Quantifiable impact checks"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                  <span className="text-[var(--color-accent)] flex-shrink-0"><CheckCircleIcon size={16} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Targeted Card */}
          <div className="bg-[linear-gradient(135deg,#09090E_0%,#121223_100%)] text-white border border-[#23233E] rounded-2xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--color-accent)] blur-[40px] opacity-15 rounded-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#86EFAC] bg-[#86EFAC]/10 px-3 py-1 rounded-full">
                  🎯 Targeted Match
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)] px-2 py-0.5 rounded-md text-white">NEW</span>
              </div>
              <h3 className="font-serif text-2xl mb-3 leading-snug">Deep JD keyword alignment</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Paste the job description. The AI extracts technical skills, credentials, and experience gaps, mapping your exact profile to the recruiter's check-list.
              </p>
            </div>
            <ul className="space-y-3">
              {["Role Match Score (0–100)", "Critical keyword gap detector", "STAR experience tailoring", "Seniority fit & education alignment"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-medium text-gray-300">
                  <span className="text-[#86EFAC] flex-shrink-0"><CheckCircleIcon size={16} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION (2-columns, centered, 47k removed) ──────────────── */}
      <section ref={statsRef} className="relative z-10 py-12 px-6 max-w-5xl mx-auto">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-card max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
            {stats.map((s, i) => (
              <StatBox key={i} {...s} active={statsActive} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 bg-[var(--bg-muted)]/30 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3 block">Complete Suite</span>
            <h2 className="font-serif leading-none tracking-tight text-[var(--text)] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
              Built for <span className="italic text-[var(--color-accent)] font-normal">every</span> side of hiring
            </h2>
          </div>

          {/* Candidates */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2 rounded-full border border-[rgba(79,70,229,0.1)]">
                For Job Seekers
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {studentFeatures.map((f, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-[var(--text)] mb-2">{f.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiters */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-[#F0FDF4] px-4 py-2 rounded-full border border-[#BBF7D0]">
                For Hiring Managers & Recruiters
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recruiterFeatures.map((f, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-[var(--text)] mb-2">{f.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-[linear-gradient(135deg,#09090E_0%,#111124_100%)] border border-[#23233E] rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-[var(--color-accent)] blur-[70px] opacity-20 rounded-full pointer-events-none" />
          <div className="absolute bottom-[-80px] right-[-80px] w-64 h-64 bg-[var(--color-accent)] blur-[70px] opacity-15 rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-serif leading-tight text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              Your next interview<br />starts <span className="italic text-[#93b4ff] font-normal">right here</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
              Upload your resume and get detailed feedback. Start optimizing for your dream job today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs">
              <NavLink to="/register" className="w-full px-8 py-3 bg-[var(--color-accent)] text-white font-semibold rounded-full hover:bg-[var(--color-accent-hover)] transition-all duration-200 shadow-indigo hover:shadow-lg">
                Get Started Free
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── CSS KEYFRAMES ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 1; }
          90%  { top: 90%;  opacity: 1; }
          100% { top: 90%;  opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scanLine {
          animation: scanLine 2.5s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}