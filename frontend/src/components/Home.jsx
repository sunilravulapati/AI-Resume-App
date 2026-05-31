import { NavLink } from "react-router";



const marqueeItems = [
  "ATS Scoring", "Role Fit Analysis", "Keyword Gap Detection",
  "Zero Hallucination", "Overleaf Export", "Recruiter Portal",
  "STAR Method Rewrites", "Version History", "PDF Download",
  "Two-Path Analysis",
];

const steps = [
  { n: "01", title: "Upload & choose mode", desc: "Drop your PDF. Pick General for a best-practices scan, or Targeted to match a specific role." },
  { n: "02", title: "Paste your target JD", desc: "In Targeted mode, paste the job description. The AI extracts every keyword and maps them to your resume." },
  { n: "03", title: "Get tailored output", desc: "Receive a fully rewritten resume. Export via Copy, PDF download, or Overleaf LaTeX." },
];

const studentFeatures = [
  { icon: "⚡", title: "Two-path analysis", desc: "General scan for ATS best practices, or deep Targeted Match — with role fit score, keyword gap, and seniority alignment." },
  { icon: "🎯", title: "Zero-hallucination tailoring", desc: "Rewrites your existing experience using the STAR method — without inventing a single fake credential." },
  { icon: "📈", title: "Version history & tracking", desc: "Every upload is saved with its score. Watch your ATS number climb as you iterate." },
  { icon: "🔍", title: "Keyword gap analysis", desc: "See exactly which required skills from the JD are missing — listed as chips, not vague advice." },
];

const recruiterFeatures = [
  { icon: "🏊", title: "Instant talent pool", desc: "Candidates ranked by verified ATS score the moment they upload — no manual shortlisting needed." },
  { icon: "💬", title: "\"Harsh but fair\" summaries", desc: "Objective executive summary: biggest technical asset + most glaring red flag. No fluff." },
  { icon: "🖥️", title: "Split-screen review portal", desc: "Original PDF side-by-side with the AI's candid breakdown. Everything in one screen." },
];

const exportOptions = [
  {
    icon: "📋",
    badge: "Instant",
    badgeColor: "#1A5CFF",
    badgeBg: "rgba(26,92,255,0.08)",
    iconBg: "rgba(26,92,255,0.08)",
    title: "Copy & paste",
    desc: "Copy all AI suggestions as plain text. Drop straight into Word, Notion, Google Docs — any editor you already use.",
  },
  {
    icon: "⬇️",
    badge: "One click",
    badgeColor: "#15803D",
    badgeBg: "rgba(21,128,61,0.08)",
    iconBg: "rgba(21,128,61,0.08)",
    title: "Download PDF",
    desc: "ATS-ready PDF built from your actual uploaded resume with AI content applied on top.",
  },
  {
    icon: "🧪",
    badge: "Best quality",
    badgeColor: "#B45309",
    badgeBg: "rgba(180,83,9,0.08)",
    iconBg: "rgba(180,83,9,0.08)",
    title: "Overleaf / LaTeX",
    desc: "Jake's Resume template pre-filled with your AI-tailored content. Paste into Overleaf, recompile, done.",
  },
];

const differentiators = [
  {
    tag: "vs. ChatGPT",
    tagColor: "#1A5CFF",
    tagBg: "rgba(26,92,255,0.08)",
    accent: "#1A5CFF",
    title: "We don't hallucinate.",
    desc: "Generic AI tools invent fake metrics and jobs to pad resumes — getting candidates blacklisted. We are hard-coded to only enhance what you actually did.",
  },
  {
    tag: "vs. Resume Builders",
    tagColor: "#15803D",
    tagBg: "rgba(21,128,61,0.08)",
    accent: "#22C55E",
    title: "A two-sided marketplace.",
    desc: "Most builders are a dead end. When you optimize here, you're instantly placed in a searchable talent pool seen by verified recruiters.",
  },
  {
    tag: "vs. \"AI Score\" tools",
    tagColor: "#B45309",
    tagBg: "rgba(180,83,9,0.08)",
    accent: "#F59E0B",
    title: "Mathematically grounded.",
    desc: "Regex proves the existence of GitHub links, metrics, and action verbs before Llama-3 judges prose quality. Two layers. One reliable number.",
  },
];

export default function Home() {
  return (
    <>
      <main className="home-root" style={{ position: "relative", zIndex: 1 }}>

        {/* ═══════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════ */}
        <section className="page-section" style={{ paddingBottom: 100 }}>
          <div style={{ maxWidth: 760 }}>

            <div className="hero-badge a-up d1">
              <span className="dot" />
              AI-Powered · ATS-Proven · Overleaf-Ready
            </div>

            <h1 className="hero-title a-up d2" style={{ margin: "28px 0 24px" }}>
              Stop guessing.<br />
              <em>Start landing</em><br />
              interviews.
            </h1>

            <p className="hero-sub a-up d3" style={{ marginBottom: 40 }}>
              Upload your resume. Get a general ATS score — or match it against a specific job description for a role fit score, keyword gap analysis, and a tailored rewrite.
            </p>

            <div className="hero-btns a-up d4">
              <NavLink to="/register" className="btn-primary">
                I'm a student / job seeker →
              </NavLink>
              <NavLink to="/register" className="btn-ghost">
                I'm a recruiter / hiring manager
              </NavLink>
            </div>

          </div>

          {/* ── Score card widget ── */}
          <div className="a-up d5" style={{ maxWidth: 680 }}>
            <div className="score-widget">

              {/* FIX: Use flex-based columns with explicit divider elements */}
              <div className="score-cols">

                {/* General Score */}
                <div className="score-col" style={{ paddingRight: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,13,0.5)", marginBottom: 8 }}>General Score</p>
                  <div className="score-num" style={{ color: "#0F0F0D" }}>85</div>
                  <p style={{ fontSize: 10, color: "rgba(15,15,13,0.4)", marginTop: 4 }}>out of 100</p>
                  <div className="score-bar-track" style={{ marginTop: 12 }}>
                    <div className="score-bar-fill" style={{ width: "85%", background: "#0F0F0D" }} />
                  </div>
                </div>

                {/* Divider — explicit flex child, not a grid cell bleeding into content */}
                <div className="score-col-divider" />

                {/* Role Match */}
                <div className="score-col" style={{ padding: "0 4px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,13,0.5)", marginBottom: 8 }}>Role match</p>
                  <div className="score-num" style={{ color: "#22C55E", animationDelay: "1s" }}>72</div>
                  <p style={{ fontSize: 10, color: "rgba(15,15,13,0.4)", marginTop: 4 }}>out of 100</p>
                  <div className="score-bar-track" style={{ marginTop: 12 }}>
                    <div className="score-bar-fill" style={{ width: "72%", background: "#22C55E", animationDelay: "1.2s" }} />
                  </div>
                </div>

                {/* Divider */}
                <div className="score-col-divider" />

                {/* Tailored for — FIX: full column, no divider bleeding in */}
                <div className="score-col" style={{ paddingLeft: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,13,0.5)", marginBottom: 12 }}>Tailored for</p>
                  <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#15803D", marginBottom: 2 }}>Senior SWE @ JPMC</p>
                    <p style={{ fontSize: 10, color: "rgba(15,15,13,0.5)" }}>Role match enabled</p>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(15,15,13,0.5)", marginBottom: 8 }}>Keyword match</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="score-bar-track" style={{ flex: 1 }}>
                      <div className="score-bar-fill" style={{ width: "68%", background: "#1A5CFF", animationDelay: "1.3s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1A5CFF" }}>68%</span>
                  </div>
                </div>

              </div>

              {/* Missing skills chips */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(15,15,13,0.1)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(15,15,13,0.5)", marginBottom: 10 }}>Missing keywords</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Kubernetes", "gRPC", "System Design", "Distributed Systems"].map(k => (
                    <span key={k} className="chip" style={{ color: "#DC2626", borderColor: "rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)" }}>{k}</span>
                  ))}
                  {["Spring Boot", "AWS Lambda"].map(k => (
                    <span key={k} className="chip" style={{ color: "rgba(15,15,13,0.6)", borderColor: "rgba(15,15,13,0.15)", background: "rgba(15,15,13,0.03)" }}>{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            MARQUEE
        ═══════════════════════════════════════════════ */}
        <div className="marquee-wrap">
          <div className="marquee-inner">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div className="marquee-item" key={i}>
                <span className="marquee-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════ */}
        <section className="page-section">
          <p className="section-eyebrow">Process</p>
          <h2 className="section-title" style={{ marginBottom: 56, maxWidth: 500 }}>Three steps to a better resume</h2>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-cell" key={i}>
                <span className="step-num">{step.n}</span>
                <div className="step-arrow">
                  {i < steps.length - 1 ? "→" : "✓"}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0F0F0D" }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            TWO ANALYSIS MODES
        ═══════════════════════════════════════════════ */}
        <section className="page-section-bg" style={{ background: "#F0EFE8" }}>
          <div className="inner">
            <p className="section-eyebrow">Two analysis modes</p>
            <h2 className="section-title" style={{ marginBottom: 12 }}>General or <em>Targeted</em> — you choose</h2>
            <p style={{ color: "#6B6B62", fontSize: 14, maxWidth: 440, marginBottom: 56, lineHeight: 1.7 }}>
              Run a General scan to get your baseline ATS score. Then use Targeted mode for every specific role you apply to.
            </p>

            <div className="mode-cards-grid">

              {/* General */}
              <div className="mode-card general">
                {/* FIX: single tag, no sibling badge needed here */}
                <div className="mode-tag-row">
                  <span className="mode-tag general">
                    <span>⚡</span> General analysis
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontFamily: "'Instrument Serif', serif", marginBottom: 12, lineHeight: 1.2 }}>Best-practices baseline scan</h3>
                <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7, marginBottom: 28 }}>
                  No JD needed. Checks formatting, impact language, metrics usage, action verbs, and ATS hygiene. Get a 0–100 score in seconds.
                </p>
                <ul className="check-list">
                  {["ATS score (0–100)", "Top 3 strengths", "Top 3 fixable issues", "Brutally honest AI summary"].map((item, i) => (
                    <li key={i}>
                      <span className="check-icon blue">✓</span>
                      <span style={{ fontSize: 13, color: "#0F0F0D", fontWeight: 500 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Targeted */}
              <div className="mode-card targeted">
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,92,255,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  {/* FIX: tag + NEW badge in a proper flex row — both baseline-aligned */}
                  <div className="mode-tag-row">
                    <span className="mode-tag targeted">
                      <span>🎯</span> Match my resume
                    </span>
                    <span className="new-badge">New</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontFamily: "'Instrument Serif', serif", marginBottom: 12, lineHeight: 1.2, color: "#FAFAF8" }}>Deep JD match analysis</h3>
                  <p style={{ fontSize: 13, color: "rgba(250,250,248,0.55)", lineHeight: 1.7, marginBottom: 28 }}>
                    Paste a job description. The AI extracts every required skill, cross-references your resume, and scores how well you fit the role.
                  </p>
                  <ul className="check-list">
                    {["Role Match Score (0–100)", "Keyword Match Rate (%)", "Missing critical skills — listed explicitly", "Experience gap vs. seniority level", "Role-specific strengths & improvements"].map((item, i) => (
                      <li key={i}>
                        <span className="check-icon green">✓</span>
                        <span style={{ fontSize: 13, color: "rgba(250,250,248,0.85)", fontWeight: 500 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            EXPORT OPTIONS
        ═══════════════════════════════════════════════ */}
        <section className="page-section">
          <p className="section-eyebrow">Three ways to export</p>
          <h2 className="section-title" style={{ marginBottom: 12 }}>Use your tailored resume <em>anywhere</em></h2>
          <p style={{ color: "#6B6B62", fontSize: 14, maxWidth: 440, marginBottom: 56, lineHeight: 1.7 }}>
            After the AI rewrites your resume, choose how you want it. Every format is designed for a different workflow.
          </p>

          <div className="export-grid">
            {exportOptions.map((f, i) => (
              <div className="export-card" key={i}>
                <div className="export-icon-wrap" style={{ background: f.iconBg }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                </div>
                <div className="export-header">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F0F0D" }}>{f.title}</h3>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: f.badgeColor, background: f.badgeBg, border: `1px solid ${f.badgeColor}30`, padding: "3px 8px", borderRadius: 99, flexShrink: 0 }}>{f.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="overleaf-banner">
            <span style={{ fontSize: 28, flexShrink: 0 }}>🧪</span>
            <div className="overleaf-banner-text">
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0F0F0D", marginBottom: 4 }}>Why LaTeX / Overleaf?</p>
              <p style={{ fontSize: 12, color: "#6B6B62", lineHeight: 1.7 }}>
                LaTeX produces typographically perfect output that looks identical on every device. ATS scanners parse LaTeX-generated PDFs more reliably than Word or Google Docs exports. We generate Jake's Resume template — the most popular ATS-proven template on Overleaf — pre-filled with your tailored content.
              </p>
            </div>
            <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#B45309", border: "1px solid rgba(180,83,9,0.25)", background: "rgba(180,83,9,0.06)", padding: "8px 16px", borderRadius: 99, textDecoration: "none", whiteSpace: "nowrap", display: "inline-block" }}>
              Learn about Overleaf →
            </a>
          </div>
        </section>

        {/* features */}
        <section className="page-section-bg" style={{ background: "#F0EFE8" }}>
          <div className="inner">

            {/* Students */}
            <div style={{ marginBottom: 72 }}>
              <div className="section-label-row">
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A5CFF", background: "rgba(26,92,255,0.08)", border: "1px solid rgba(26,92,255,0.2)", padding: "5px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>For students & job seekers</span>
                <div className="section-label-divider" />
              </div>
              <div className="feature-grid">
                {studentFeatures.map((f, i) => (
                  <div className="feature-card" key={i}>
                    <span className="feature-icon">{f.icon}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0F0F0D" }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <div className="section-label-row">
                <span className="recruiter-badge" style={{ marginBottom: 0 }}>For recruiters & hiring managers</span>
                <div className="section-label-divider" />
              </div>
              <div className="feature-grid">
                {recruiterFeatures.map((f, i) => (
                  <div className="feature-card" key={i}>
                    <span className="feature-icon">{f.icon}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0F0F0D" }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/*SPLIT VALUE PROP*/}
        <section className="page-section">
          <p className="section-eyebrow" style={{ textAlign: "center" }}>Two sides. One platform.</p>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: 56 }}>Built for both sides of the table</h2>

          <div className="split-grid">

            {/* Student */}
            <div className="split-card light">
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6B62", display: "block", marginBottom: 20 }}>Student view</span>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, lineHeight: 1.1, color: "#0F0F0D", marginBottom: 16 }}>Your resume,<br />optimized for every role.</h3>
              <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7, marginBottom: 28 }}>
                Upload once. Run a General scan for your baseline. Switch to Targeted mode for any role — get keyword gaps, role fit score, and a fully rewritten resume.
              </p>
              {["General & Targeted analysis modes", "Keyword gap + role match scoring", "Export via Copy, PDF, or Overleaf LaTeX"].map((item, i) => (
                <div className="numbered-item" key={i}>
                  <div className="n-bubble" style={{ background: "rgba(15,15,13,0.07)", color: "#0F0F0D" }}>{i + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0D" }}>{item}</span>
                </div>
              ))}
              <NavLink to="/register" className="btn-primary" style={{ marginTop: 28, display: "inline-flex" }}>
                Start for free →
              </NavLink>
            </div>

            {/* Recruiter */}
            <div className="split-card dark">
              <div className="deco-circle" style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(26,92,255,0.25) 0%, transparent 70%)", top: -80, right: -80 }} />
              <div style={{ position: "relative" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,248,0.35)", display: "block", marginBottom: 20 }}>Recruiter view</span>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, lineHeight: 1.1, color: "#FAFAF8", marginBottom: 16 }}>A ranked talent pool,<br />ready to hire from.</h3>
                <p style={{ fontSize: 13, color: "rgba(250,250,248,0.55)", lineHeight: 1.7, marginBottom: 28 }}>
                  Skip the 200-resume pile. Browse pre-scored candidates, read objective AI summaries, and contact top talent in one click.
                </p>
                {["Candidates ranked by ATS score", "AI-generated objective summaries", "Split-screen PDF + analysis view"].map((item, i) => (
                  <div className="numbered-item" key={i}>
                    <div className="n-bubble" style={{ background: "rgba(250,250,248,0.1)", color: "rgba(250,250,248,0.7)" }}>{i + 1}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(250,250,248,0.8)" }}>{item}</span>
                  </div>
                ))}
                <NavLink to="/register" className="btn-ghost" style={{ marginTop: 28, display: "inline-flex", color: "#FAFAF8", borderColor: "rgba(250,250,248,0.25)" }}>
                  Access talent pool →
                </NavLink>
              </div>
            </div>

          </div>
        </section>

        {/*DIFFERENTIATOR */}
        <section className="page-section-bg" style={{ background: "#F0EFE8" }}>
          <div className="inner">
            <p className="section-eyebrow">Why not just use ChatGPT?</p>
            <h2 className="section-title" style={{ marginBottom: 56 }}>The differences <em>that matter</em></h2>

            <div className="diff-grid">
              {differentiators.map((d, i) => (
                <div className="diff-card" key={i}>
                  <div className="diff-accent-line" style={{ background: d.accent }} />
                  <span className="diff-tag" style={{ color: d.tagColor, background: d.tagBg }}>{d.tag}</span>
                  <h3 style={{ fontSize: 19, fontFamily: "'Instrument Serif', serif", marginBottom: 14, lineHeight: 1.25, color: "#0F0F0D" }}>{d.title}</h3>
                  <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.75 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*FINAL CTA*/}
        <section className="page-section" style={{ paddingBottom: 100 }}>
          <div className="cta-section">
            <div className="cta-glow" />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15,15,13,0.05)", border: "1px solid rgba(15,15,13,0.1)", borderRadius: 99, padding: "6px 14px", marginBottom: 32 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,13,0.6)" }}>Free to get started</span>
              </div>

              <h2 className="cta-title">
                Your next interview<br />
                starts with <em>one upload.</em>
              </h2>

              <p style={{ color: "rgba(15,15,13,0.6)", fontSize: 15, marginBottom: 44, maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.7 }}>
                Join the platform where students get hired and recruiters find talent — powered by a scoring engine that never lies.
              </p>

              <div className="cta-btns">
                <NavLink to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0F0F0D", color: "#FAFAF8", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", padding: "14px 28px", borderRadius: 99, textDecoration: "none", transition: "background 0.2s, transform 0.15s" }}>
                  Create free account →
                </NavLink>
                <NavLink to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "rgba(15,15,13,0.8)", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, padding: "14px 28px", borderRadius: 99, textDecoration: "none", border: "1.5px solid rgba(15,15,13,0.2)", transition: "border-color 0.2s, color 0.2s" }}>
                  Sign in
                </NavLink>
              </div>

              <p style={{ color: "rgba(15,15,13,0.4)", fontSize: 11, marginTop: 20, letterSpacing: "0.05em" }}>No credit card required · Takes 30 seconds</p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}