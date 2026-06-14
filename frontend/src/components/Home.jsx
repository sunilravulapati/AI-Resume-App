import { NavLink } from "react-router";
import {
  ZapIcon, TargetIcon, TrendingUpIcon, SearchIcon,
  UsersIcon, MessageSquareIcon, MonitorIcon,
} from "./icons";

const steps = [
  { n: "01", title: "Upload & choose mode", desc: "Drop your PDF. Pick General for a best-practices scan, or Targeted to match a specific role." },
  { n: "02", title: "Paste your target JD", desc: "In Targeted mode, paste the job description. The AI maps every keyword to your resume." },
  { n: "03", title: "Get tailored output", desc: "Receive a rewritten resume. Export via Copy, PDF, or Overleaf LaTeX." },
];

const studentFeatures = [
  { Icon: ZapIcon, title: "Two-path analysis", desc: "General ATS scan or deep Targeted Match — with role fit score, keyword gap, and seniority alignment." },
  { Icon: TargetIcon, title: "Zero-hallucination tailoring", desc: "Rewrites your experience using the STAR method — without inventing fake credentials." },
  { Icon: TrendingUpIcon, title: "Version history", desc: "Every upload is saved with its score. Watch your ATS number climb as you iterate." },
  { Icon: SearchIcon, title: "Keyword gap analysis", desc: "See exactly which skills from the JD are missing — listed as chips, not vague advice." },
];

const recruiterFeatures = [
  { Icon: UsersIcon, title: "Instant talent pool", desc: "Candidates ranked by verified ATS score the moment they upload." },
  { Icon: MessageSquareIcon, title: "Objective summaries", desc: "Biggest technical asset + most glaring red flag. No fluff." },
  { Icon: MonitorIcon, title: "Split-screen review", desc: "Original PDF side-by-side with the AI's breakdown. Everything in one screen." },
];

export default function Home() {
  return (
    <main className="home-root" style={{ position: "relative", zIndex: 1 }}>

      {/* HERO */}
      <section className="page-section" style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 680 }}>
          <div className="hero-badge a-up d1">
            <span className="dot" />
            AI-Powered · ATS-Proven · Overleaf-Ready
          </div>

          <h1 className="hero-title a-up d2" style={{ margin: "28px 0 24px" }}>
            Stop guessing.<br />
            <em>Start landing</em> interviews.
          </h1>

          <p className="hero-sub a-up d3" style={{ marginBottom: 40 }}>
            Upload your resume. Get a general ATS score — or match it against a job description for a role fit score, keyword gap analysis, and a tailored rewrite.
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
      </section>

      {/* HOW IT WORKS */}
      <section className="page-section">
        <p className="section-eyebrow">Process</p>
        <h2 className="section-title" style={{ marginBottom: 56, maxWidth: 400 }}>Three steps to a better resume</h2>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step-cell" key={i}>
              <span className="step-num">{step.n}</span>
              <div className="step-arrow">{i < steps.length - 1 ? "→" : "✓"}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0F0F0D" }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TWO ANALYSIS MODES */}
      <section className="page-section-bg" style={{ background: "#F0EFE8" }}>
        <div className="inner">
          <p className="section-eyebrow">Two analysis modes</p>
          <h2 className="section-title" style={{ marginBottom: 12 }}>General or <em>Targeted</em> — you choose</h2>
          <p style={{ color: "#6B6B62", fontSize: 14, maxWidth: 400, marginBottom: 56, lineHeight: 1.7 }}>
            Run a General scan for your baseline ATS score, or use Targeted mode for every specific role you apply to.
          </p>

          <div className="mode-cards-grid">

            {/* General */}
            <div className="mode-card general">
              <div className="mode-tag-row">
                <span className="mode-tag general"><ZapIcon size={12} /> General analysis</span>
              </div>
              <h3 style={{ fontSize: 22, fontFamily: "'Instrument Serif', serif", marginBottom: 12, lineHeight: 1.2 }}>Best-practices baseline scan</h3>
              <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7, marginBottom: 28 }}>
                No JD needed. Checks formatting, metrics, action verbs, and ATS hygiene. Get a 0–100 score in seconds.
              </p>
              <ul className="check-list">
                {["ATS score (0–100)", "Top 3 strengths", "Top 3 fixable issues", "Honest AI summary"].map((item, i) => (
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
                <div className="mode-tag-row">
                  <span className="mode-tag targeted"><TargetIcon size={12} /> Match my resume</span>
                  <span className="new-badge">New</span>
                </div>
                <h3 style={{ fontSize: 22, fontFamily: "'Instrument Serif', serif", marginBottom: 12, lineHeight: 1.2, color: "#FAFAF8" }}>Deep JD match analysis</h3>
                <p style={{ fontSize: 13, color: "rgba(250,250,248,0.55)", lineHeight: 1.7, marginBottom: 28 }}>
                  Paste a job description. The AI extracts every required skill, cross-references your resume, and scores how well you fit the role.
                </p>
                <ul className="check-list">
                  {["Role Match Score (0–100)", "Keyword Match Rate (%)", "Missing critical skills", "Experience gap vs. seniority", "Role-specific improvements"].map((item, i) => (
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

      {/* FEATURES */}
      <section className="page-section-bg" style={{ background: "#F0EFE8" }}>
        <div className="inner">

          {/* Students */}
          <div style={{ marginBottom: 72 }}>
            <div className="section-label-row">
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A5CFF", background: "rgba(26,92,255,0.08)", border: "1px solid rgba(26,92,255,0.2)", padding: "5px 14px", borderRadius: 99 }}>For students & job seekers</span>
              <div className="section-label-divider" />
            </div>
            <div className="feature-grid">
              {studentFeatures.map((f, i) => (
                <div className="feature-card" key={i}>
                  <span className="feature-icon"><f.Icon size={20} /></span>
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
                  <span className="feature-icon"><f.Icon size={20} /></span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0F0F0D" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#6B6B62", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}