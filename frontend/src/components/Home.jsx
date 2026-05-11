import { NavLink } from "react-router";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .home-root { font-family: 'DM Sans', sans-serif; }
  .display-font { font-family: 'DM Serif Display', serif; }

  .dot-grid {
    background-image: radial-gradient(circle, #d2d2d7 1px, transparent 1px);
    background-size: 28px 28px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up  { animation: fadeUp 0.65s ease both; }
  .delay-1  { animation-delay: 0.10s; }
  .delay-2  { animation-delay: 0.22s; }
  .delay-3  { animation-delay: 0.34s; }
  .delay-4  { animation-delay: 0.46s; }
  .delay-5  { animation-delay: 0.58s; }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .score-tick { animation: countUp 0.5s ease both; animation-delay: 0.8s; }

  .card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .card-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }

  .grad-text {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes bar-fill {
    from { width: 0%; }
    to   { width: 68%; }
  }
  .bar-animate { animation: bar-fill 1.4s cubic-bezier(0.4,0,0.2,1) both; animation-delay: 1s; }

  @keyframes shimmer-slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }
  .shimmer-line::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: shimmer-slide 2s infinite;
  }
`;

// ─── updated feature data ────────────────────────────────────────────────────

const studentFeatures = [
  {
    icon: "⚡",
    title: "Two-Path Analysis",
    desc: "General scan for ATS best practices, or a deep Targeted Match against a specific Job Description — with role fit score, keyword gap, and seniority alignment.",
  },
  {
    icon: "🎯",
    title: "Zero-Hallucination Tailoring",
    desc: "Rewrites your existing experience to match any JD using the STAR method — without inventing a single fake credential.",
  },
  {
    icon: "📈",
    title: "Version History & Tracking",
    desc: "Every upload is saved with its score. Watch your ATS number climb as you iterate across general and targeted analyses.",
  },
  {
    icon: "🔍",
    title: "Keyword Gap Analysis",
    desc: "See exactly which required skills from the JD are missing from your resume — listed as chips, not vague advice.",
  },
];

const exportFeatures = [
  {
    icon: "📋",
    badge: "Instant",
    badgeColor: "#0066cc",
    title: "Copy & Paste",
    desc: "Copy all AI suggestions as plain text. Drop straight into Word, Notion, Google Docs — any editor you already use.",
  },
  {
    icon: "⬇️",
    badge: "Quick",
    badgeColor: "#248a3d",
    title: "Download PDF",
    desc: "One-click ATS-ready PDF built from your actual uploaded resume with AI content applied on top.",
  },
  {
    icon: "🧪",
    badge: "Best Quality",
    badgeColor: "#b86e00",
    title: "Overleaf / LaTeX",
    desc: "Generate Jake's Resume template pre-filled with your AI tailored content. Paste into Overleaf, recompile, done.",
  },
];

const recruiterFeatures = [
  {
    icon: "🏊",
    title: "Instant Talent Pool",
    desc: "Candidates are ranked by verified ATS score the moment they upload — no manual shortlisting needed.",
  },
  {
    icon: "💬",
    title: "\"Harsh but Fair\" Summaries",
    desc: "Bypass resume fluff. Get an objective executive summary: biggest technical asset + most glaring red flag.",
  },
  {
    icon: "🖥️",
    title: "Split-Screen Review Portal",
    desc: "Original PDF side-by-side with the AI's candid breakdown. Everything you need in one screen.",
  },
];

const steps = [
  { n: "01", title: "Upload & Choose Mode", desc: "Drop your PDF. Pick General for a best-practices scan, or Targeted to match a specific role." },
  { n: "02", title: "Paste Target JD", desc: "In Targeted mode, paste the job description. The AI extracts every keyword and maps them to your resume." },
  { n: "03", title: "Get Tailored Output", desc: "Receive a fully rewritten resume. Export via Copy, PDF download, or Overleaf LaTeX." },
];

const differentiators = [
  {
    tag: "vs. ChatGPT",
    title: "We don't hallucinate.",
    desc: "Generic AI tools invent fake metrics and jobs to pad resumes — which gets candidates blacklisted in background checks. We are hard-coded to only enhance what you actually did.",
    accent: "#0066cc",
  },
  {
    tag: "vs. Resume Builders",
    title: "A two-sided marketplace.",
    desc: "Most builders are a dead end: you download a PDF and you're done. When you optimize here, you're instantly placed in a searchable talent pool seen by verified recruiters.",
    accent: "#248a3d",
  },
  {
    tag: "vs. \"AI Score\" tools",
    title: "Mathematically grounded.",
    desc: "Regex proves the existence of GitHub links, metrics, and strong verbs before Llama-3 judges the prose quality. Two layers. One reliable number.",
    accent: "#b86e00",
  },
];

// ─── component ───────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{globalStyles}</style>

      <main className="home-root bg-white text-[#1d1d1f] overflow-x-hidden">

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center dot-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">

            <div className="fade-up delay-1 inline-flex items-center gap-2 bg-[#0066cc]/[0.07] border border-[#0066cc]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] animate-pulse" />
              <span className="text-[0.72rem] font-semibold text-[#0066cc] uppercase tracking-widest">AI-Powered · ATS-Proven · Overleaf-Ready</span>
            </div>

            <h1 className="display-font fade-up delay-2 text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-[#1d1d1f] mb-6">
              Stop Guessing.<br />
              <em className="grad-text not-italic">Start Landing Interviews.</em>
            </h1>

            <p className="fade-up delay-3 text-[#6e6e73] text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Upload your resume. Get a general ATS score — or match it against a specific job description for a role fit score, keyword gap analysis, and a tailored rewrite.
            </p>

            <div className="fade-up delay-4 flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <NavLink
                to="/register"
                className="bg-[#0066cc] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-[#004499] transition-colors text-sm tracking-tight shadow-lg shadow-[#0066cc]/25"
              >
                I'm a Student / Job Seeker →
              </NavLink>
              <NavLink
                to="/register"
                className="border border-[#d2d2d7] text-[#1d1d1f] font-medium px-8 py-3.5 rounded-full hover:bg-[#f5f5f7] transition-colors text-sm"
              >
                I'm a Recruiter / Hiring Manager
              </NavLink>
            </div>

            {/* Hero score card — updated to show dual scores */}
            <div className="fade-up delay-5 inline-flex flex-wrap items-center justify-center gap-6 bg-white border border-[#e8e8ed] rounded-2xl px-7 py-4 shadow-xl shadow-black/5">
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-0.5">General Score</p>
                <p className="score-tick text-3xl font-black text-[#0066cc] tracking-tight leading-none">
                  85<span className="text-base font-normal text-[#a1a1a6]">/100</span>
                </p>
              </div>
              <div className="w-px h-10 bg-[#e8e8ed]" />
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-0.5">Role Match</p>
                <p className="score-tick text-3xl font-black text-[#248a3d] tracking-tight leading-none">
                  72<span className="text-base font-normal text-[#a1a1a6]">/100</span>
                </p>
              </div>
              <div className="w-px h-10 bg-[#e8e8ed]" />
              <div className="text-left min-w-[120px]">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-1.5">Keyword Match</p>
                <div className="flex items-center gap-2">
                  <div className="relative w-20 h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden shimmer-line">
                    <div className="absolute left-0 top-0 h-full bg-[#0066cc] rounded-full bar-animate" />
                  </div>
                  <span className="text-xs font-black text-[#0066cc]">68%</span>
                </div>
              </div>
              <div className="w-px h-10 bg-[#e8e8ed]" />
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-1">Tailored for</p>
                <span className="text-xs font-semibold text-[#248a3d] bg-[#34c759]/10 border border-[#34c759]/20 px-2.5 py-0.5 rounded-full">✅ Senior SWE @ JPMC</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section className="bg-[#f5f5f7] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Process</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-16">How it works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e8e8ed] rounded-2xl overflow-hidden border border-[#e8e8ed]">
              {steps.map((step, i) => (
                <div key={i} className="bg-[#f5f5f7] hover:bg-white transition-colors duration-200 p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-[#e8e8ed]">{step.n}</span>
                    {i < steps.length - 1 && (
                      <span className="hidden md:block ml-auto text-[#d2d2d7] text-xl">→</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f]">{step.title}</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            ANALYSIS MODES — NEW SECTION
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Two Analysis Modes</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-4">General or Targeted — you choose</h2>
            <p className="text-center text-[#6e6e73] text-sm max-w-lg mx-auto mb-14">
              Run a General scan to get your baseline ATS score. Then use Targeted mode for every specific role you apply to.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* General */}
              <div className="bg-white border-2 border-[#e8e8ed] rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066cc]/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-[#0066cc]/[0.07] border border-[#0066cc]/20 rounded-full px-3 py-1 mb-5">
                    <span className="text-xs">⚡</span>
                    <span className="text-[0.65rem] font-bold text-[#0066cc] uppercase tracking-wider">General Analysis</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Best-practices baseline scan</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed mb-6">
                    No JD needed. Checks formatting, impact language, metrics usage, action verbs, and ATS hygiene. Get a 0–100 score in seconds.
                  </p>
                  <ul className="space-y-2.5">
                    {["ATS score (0–100)", "Top 3 strengths", "Top 3 fixable issues", "Brutally honest AI summary"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-[#1d1d1f]">
                        <span className="w-4 h-4 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-[0.6rem] font-black flex items-center justify-center shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Targeted */}
              <div className="bg-white border-2 border-[#248a3d]/30 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-[#248a3d]/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#34c759]/[0.04] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-[#248a3d]/[0.07] border border-[#248a3d]/20 rounded-full px-3 py-1 mb-5">
                    <span className="text-xs">🎯</span>
                    <span className="text-[0.65rem] font-bold text-[#248a3d] uppercase tracking-wider">Match My Resume</span>
                    <span className="text-[0.55rem] font-bold bg-[#248a3d] text-white px-1.5 py-0.5 rounded-full">New</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Deep JD match analysis</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed mb-6">
                    Paste a job description. The AI extracts every required skill, cross-references your resume, and scores how well you fit the role.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Role Match Score (0–100)",
                      "Keyword Match Rate (%)",
                      "Missing Critical Skills — listed explicitly",
                      "Experience Gap Analysis vs. seniority level",
                      "Role-specific strengths & improvements",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-[#1d1d1f]">
                        <span className="w-4 h-4 rounded-full bg-[#248a3d]/10 text-[#248a3d] text-[0.6rem] font-black flex items-center justify-center shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            EXPORT OPTIONS — NEW SECTION
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Three Ways to Export</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-4">Use your tailored resume anywhere</h2>
            <p className="text-center text-[#6e6e73] text-sm max-w-lg mx-auto mb-14">
              After the AI rewrites your resume, choose how you want it. Every format is designed for a different workflow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {exportFeatures.map((f, i) => (
                <div key={i} className="card-lift bg-white rounded-2xl p-7 border border-[#e8e8ed]">
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-3xl">{f.icon}</span>
                    <span
                      className="text-[0.55rem] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full"
                      style={{ color: f.badgeColor, borderColor: `${f.badgeColor}40`, background: `${f.badgeColor}10` }}
                    >
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Overleaf callout */}
            <div className="mt-8 bg-white border border-[#b86e00]/25 rounded-2xl px-7 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-3xl shrink-0">🧪</div>
              <div className="flex-1">
                <p className="font-bold text-[#1d1d1f] text-sm mb-0.5">Why LaTeX / Overleaf?</p>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  LaTeX produces typographically perfect output that looks identical on every device. ATS scanners parse LaTeX-generated PDFs more reliably than Word or Google Docs exports.
                  We generate Jake's Resume template — the most popular ATS-proven template on Overleaf — pre-filled with your tailored content.
                </p>
              </div>
              <a
                href="https://www.overleaf.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#b86e00] border border-[#b86e00]/30 bg-[#b86e00]/[0.07] px-4 py-2 rounded-full hover:bg-[#b86e00]/15 transition-colors shrink-0"
              >
                Learn about Overleaf →
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FEATURE GRID
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">

            {/* Students */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-10">
                <span className="bg-[#0066cc]/10 text-[#0066cc] text-xs font-bold px-3 py-1 rounded-full border border-[#0066cc]/20">For Students & Job Seekers</span>
                <div className="h-px flex-1 bg-[#e8e8ed]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {studentFeatures.map((f, i) => (
                  <div key={i} className="card-lift bg-[#f5f5f7] rounded-2xl p-7 border border-transparent hover:border-[#e8e8ed]">
                    <div className="text-3xl mb-4">{f.icon}</div>
                    <h3 className="text-base font-bold text-[#1d1d1f] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#6e6e73] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <span className="bg-[#34c759]/10 text-[#248a3d] text-xs font-bold px-3 py-1 rounded-full border border-[#34c759]/20">For Recruiters & Hiring Managers</span>
                <div className="h-px flex-1 bg-[#e8e8ed]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {recruiterFeatures.map((f, i) => (
                  <div key={i} className="card-lift bg-[#f5f5f7] rounded-2xl p-7 border border-transparent hover:border-[#e8e8ed]">
                    <div className="text-3xl mb-4">{f.icon}</div>
                    <h3 className="text-base font-bold text-[#1d1d1f] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#6e6e73] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SPLIT VALUE PROP
        ══════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Two sides. One platform.</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-12">Built for both sides of the table</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <div className="bg-[#0066cc] rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4 block">Student View</span>
                  <h3 className="display-font text-3xl mb-4 leading-tight">Your resume,<br />optimized for every role.</h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-8">
                    Upload once. Run a General scan for your baseline. Switch to Targeted mode for any role — get keyword gaps, role fit score, and a fully rewritten resume with three export options.
                  </p>
                  <div className="space-y-3">
                    {[
                      "General & Targeted analysis modes",
                      "Keyword gap + role match scoring",
                      "Export via Copy, PDF, or Overleaf LaTeX",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[0.6rem] font-bold shrink-0">{i + 1}</span>
                        <span className="text-sm text-white/90">{item}</span>
                      </div>
                    ))}
                  </div>
                  <NavLink
                    to="/register"
                    className="mt-8 inline-block bg-white text-[#0066cc] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#f5f5f7] transition-colors"
                  >
                    Start for free →
                  </NavLink>
                </div>
              </div>

              <div className="bg-[#1d1d1f] rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4 block">Recruiter View</span>
                  <h3 className="display-font text-3xl mb-4 leading-tight">A ranked talent pool,<br />ready to hire from.</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Skip the 200-resume pile. Browse pre-scored candidates, read objective AI summaries, and contact top talent in one click.
                  </p>
                  <div className="space-y-3">
                    {["Candidates ranked by ATS score", "AI-generated objective summaries", "Split-screen PDF + analysis view"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[0.6rem] font-bold shrink-0">{i + 1}</span>
                        <span className="text-sm text-white/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <NavLink
                    to="/register"
                    className="mt-8 inline-block bg-white/10 border border-white/20 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/20 transition-colors"
                  >
                    Access Talent Pool →
                  </NavLink>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            DIFFERENTIATORS
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Why not just use ChatGPT?</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-14">The differences that matter</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {differentiators.map((d, i) => (
                <div key={i} className="card-lift rounded-2xl border border-[#e8e8ed] p-7 bg-white">
                  <span
                    className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-5 inline-block"
                    style={{ color: d.accent, borderColor: `${d.accent}30`, background: `${d.accent}0f` }}
                  >
                    {d.tag}
                  </span>
                  <h3 className="text-base font-bold text-[#1d1d1f] mb-3">{d.title}</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════ */}
        <section className="py-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#0066cc]/[0.07] border border-[#0066cc]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
              <span className="text-[0.72rem] font-semibold text-[#0066cc] uppercase tracking-widest">Free to get started</span>
            </div>

            <h2 className="display-font text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.08] text-[#1d1d1f] mb-6">
              Your next interview<br />starts with one upload.
            </h2>
            <p className="text-[#6e6e73] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Join the platform where students get hired and recruiters find talent — powered by a scoring engine that never lies.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <NavLink
                to="/register"
                className="bg-[#0066cc] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#004499] transition-colors text-sm tracking-tight shadow-lg shadow-[#0066cc]/25"
              >
                Create Free Account →
              </NavLink>
              <NavLink
                to="/login"
                className="border border-[#d2d2d7] text-[#1d1d1f] font-medium px-10 py-4 rounded-full hover:bg-[#f5f5f7] transition-colors text-sm"
              >
                Sign in
              </NavLink>
            </div>

            <p className="text-[#a1a1a6] text-xs mt-6">No credit card required · Takes 30 seconds</p>
          </div>
        </section>

      </main>
    </>
  );
}