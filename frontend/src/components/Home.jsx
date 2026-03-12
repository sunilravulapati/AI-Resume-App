import { NavLink } from "react-router";

// ─── tiny inline style block for the font import + custom animations ───────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .home-root { font-family: 'DM Sans', sans-serif; }
  .display-font { font-family: 'DM Serif Display', serif; }

  /* subtle dot grid */
  .dot-grid {
    background-image: radial-gradient(circle, #d2d2d7 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* staggered fade-up */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up   { animation: fadeUp 0.65s ease both; }
  .delay-1   { animation-delay: 0.10s; }
  .delay-2   { animation-delay: 0.22s; }
  .delay-3   { animation-delay: 0.34s; }
  .delay-4   { animation-delay: 0.46s; }
  .delay-5   { animation-delay: 0.58s; }

  /* score ticker */
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .score-tick { animation: countUp 0.5s ease both; animation-delay: 0.8s; }

  /* hover lift */
  .card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .card-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }

  /* gradient text */
  .grad-text {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* split-section slant */
  .slant-left  { clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%); }
  .slant-right { clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%); }
`;

// ─── data ───────────────────────────────────────────────────────────────────
const studentFeatures = [
  {
    icon: "⚡",
    title: "Hybrid ATS Scoring",
    desc: "60-point deterministic baseline via regex + 40-point Llama-3 semantic layer. Mathematically grounded, never a guess.",
  },
  {
    icon: "🎯",
    title: "Zero-Hallucination Tailoring",
    desc: "Rewrites your existing experience to match any JD using the STAR method — without inventing a single fake credential.",
  },
  {
    icon: "📈",
    title: "Version History & Tracking",
    desc: "Every upload is saved with its score. Watch your ATS number climb as you iterate.",
  },
  {
    icon: "🔍",
    title: "Actionable AI Feedback",
    desc: "Specific \"Top Strengths\" and \"Red Flags\" — not vague tips, but fixable issues a recruiter would actually flag.",
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
  { n: "01", title: "Upload Base Resume", desc: "Drop your PDF. Our hybrid engine parses and scores it in seconds." },
  { n: "02", title: "Paste Target JD", desc: "Copy the job description. The AI cross-references every keyword and requirement." },
  { n: "03", title: "Get Tailored Output", desc: "Receive a fully rewritten, ATS-optimized resume — ready to submit." },
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

// ─── component ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{globalStyles}</style>

      <main className="home-root bg-white text-[#1d1d1f] overflow-x-hidden">

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center dot-grid">
          {/* radial fade over grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">

            {/* eyebrow pill */}
            <div className="fade-up delay-1 inline-flex items-center gap-2 bg-[#0066cc]/[0.07] border border-[#0066cc]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] animate-pulse" />
              <span className="text-[0.72rem] font-semibold text-[#0066cc] uppercase tracking-widest">AI-Powered · ATS-Proven</span>
            </div>

            <h1 className="display-font fade-up delay-2 text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-[#1d1d1f] mb-6">
              Stop Guessing.<br />
              <em className="grad-text not-italic">Start Landing Interviews.</em>
            </h1>

            <p className="fade-up delay-3 text-[#6e6e73] text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Upload your resume. Paste a job description. Get an AI-tailored, ATS-optimized version — without a single hallucinated credential.
            </p>

            {/* dual CTAs */}
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

            {/* floating score card */}
            <div className="fade-up delay-5 inline-flex items-center gap-6 bg-white border border-[#e8e8ed] rounded-2xl px-7 py-4 shadow-xl shadow-black/5">
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-0.5">ATS Score</p>
                <p className="score-tick text-3xl font-black text-[#0066cc] tracking-tight leading-none">
                  87<span className="text-base font-normal text-[#a1a1a6]">/100</span>
                </p>
              </div>
              <div className="w-px h-10 bg-[#e8e8ed]" />
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-1">Verdict</p>
                <span className="text-xs font-semibold text-[#248a3d] bg-[#34c759]/10 border border-[#34c759]/20 px-2.5 py-0.5 rounded-full">✅ Strong Match</span>
              </div>
              <div className="w-px h-10 bg-[#e8e8ed]" />
              <div className="text-left">
                <p className="text-[0.65rem] font-semibold text-[#a1a1a6] uppercase tracking-widest mb-0.5">Tailored for</p>
                <p className="text-xs font-medium text-[#1d1d1f]">Senior Frontend Eng.</p>
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
        <section className="py-4 px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <p className="text-[0.65rem] font-semibold text-[#0066cc] uppercase tracking-widest mb-3 text-center">Two sides. One platform.</p>
            <h2 className="display-font text-4xl text-center text-[#1d1d1f] mb-12">Built for both sides of the table</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Student side */}
              <div className="bg-[#0066cc] rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4 block">Student View</span>
                  <h3 className="display-font text-3xl mb-4 leading-tight">Your resume,<br />optimized for every role.</h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-8">
                    Upload once. Tailor infinitely. Track your ATS score improving in real time as you refine your resume for different companies.
                  </p>
                  <div className="space-y-3">
                    {["Upload & Score in seconds", "Tailor to any Job Description", "Track score history over time"].map((item, i) => (
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

              {/* Recruiter side */}
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