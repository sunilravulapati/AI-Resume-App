import { NavLink } from "react-router";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .home-root {
    font-family: 'Syne', sans-serif;
    background: #FAFAF8;
    color: #0F0F0D;
  }

  .serif { font-family: 'Instrument Serif', serif; }

  /* Noise texture overlay */
  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  /* ── Animations ── */
  @keyframes in-up {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes in-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes bar-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes score-pop {
    0%   { transform: scale(0.8); opacity: 0; }
    70%  { transform: scale(1.04); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .a-up   { animation: in-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .a-fade { animation: in-fade 0.6s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.14s; }
  .d3 { animation-delay: 0.23s; }
  .d4 { animation-delay: 0.32s; }
  .d5 { animation-delay: 0.42s; }
  .d6 { animation-delay: 0.52s; }

  /* ── Hero Badge ── */
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(15,15,13,0.15);
    border-radius: 99px;
    padding: 6px 14px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4B4B45;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
  }
  .hero-badge .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22C55E;
    animation: float 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .hero-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(3rem, 9vw, 7.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: #0F0F0D;
  }
  .hero-title em {
    font-style: italic;
    color: #1A5CFF;
  }

  .hero-sub {
    font-size: 1rem;
    font-weight: 400;
    color: #6B6B62;
    line-height: 1.7;
    max-width: 400px;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0F0F0D;
    color: #FAFAF8;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 14px 28px;
    border-radius: 99px;
    text-decoration: none;
    border: 2px solid #0F0F0D;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .btn-primary:hover {
    background: #1A5CFF;
    border-color: #1A5CFF;
    transform: translateY(-1px);
  }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    color: #0F0F0D;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 14px 28px;
    border-radius: 99px;
    text-decoration: none;
    border: 1.5px solid rgba(15,15,13,0.25);
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .btn-ghost:hover {
    border-color: #0F0F0D;
    background: rgba(15,15,13,0.04);
    transform: translateY(-1px);
  }

  /* ── Score Widget ── */
  .score-widget {
    background: #0F0F0D;
    border-radius: 20px;
    padding: 28px;
    color: #FAFAF8;
    position: relative;
    overflow: hidden;
  }
  .score-widget::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26,92,255,0.3) 0%, transparent 70%);
    pointer-events: none;
  }

  /* FIX: Score columns layout — use flex with explicit dividers, no grid column bleed */
  .score-cols {
    display: flex;
    align-items: stretch;
    gap: 0;
  }
  .score-col {
    flex: 1;
    min-width: 0;
  }
  .score-col-divider {
    width: 1px;
    background: rgba(250,250,248,0.08);
    margin: 0 20px;
    flex-shrink: 0;
    align-self: stretch;
  }

  /* Responsive score widget: stack on mobile */
  @media (max-width: 600px) {
    .score-cols {
      flex-direction: column;
      gap: 0;
    }
    .score-col-divider {
      width: 100%;
      height: 1px;
      margin: 16px 0;
    }
  }

  .score-num {
    font-family: 'Instrument Serif', serif;
    font-size: 4.5rem;
    line-height: 1;
    animation: score-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.9s both;
  }
  .score-bar-track {
    height: 3px;
    background: rgba(255,255,255,0.12);
    border-radius: 99px;
    overflow: hidden;
  }
  .score-bar-fill {
    height: 100%;
    border-radius: 99px;
    transform-origin: left;
    animation: bar-grow 1.2s cubic-bezier(0.4,0,0.2,1) 1.1s both;
  }
  .chip {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    border: 1px solid;
  }

  /* ── Marquee ── */
  .marquee-wrap {
    overflow: hidden;
    border-top: 1px solid rgba(15,15,13,0.1);
    border-bottom: 1px solid rgba(15,15,13,0.1);
    background: #F0EFE8;
    padding: 14px 0;
  }
  .marquee-inner {
    display: flex;
    gap: 48px;
    width: max-content;
    animation: marquee 22s linear infinite;
    white-space: nowrap;
  }
  .marquee-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #4B4B45;
  }
  .marquee-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #1A5CFF;
    flex-shrink: 0;
  }

  /* ── Section Labels ── */
  .section-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #1A5CFF;
    margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 5vw, 3.8rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: #0F0F0D;
  }
  .section-title em {
    font-style: italic;
    color: #1A5CFF;
  }

  /* ── Numbered Steps ── */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1px;
    background: rgba(15,15,13,0.1);
    border: 1px solid rgba(15,15,13,0.1);
    border-radius: 20px;
    overflow: hidden;
  }
  .step-cell {
    background: #FAFAF8;
    padding: 36px 32px;
    transition: background 0.2s;
    position: relative;
  }
  .step-cell:hover { background: #fff; }
  .step-num {
    font-family: 'Instrument Serif', serif;
    font-size: 5rem;
    line-height: 1;
    color: rgba(15,15,13,0.06);
    position: absolute;
    top: 16px; right: 20px;
    user-select: none;
  }
  .step-arrow {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #0F0F0D;
    display: flex; align-items: center; justify-content: center;
    color: #FAFAF8;
    font-size: 13px;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  /* ── Mode cards ── */
  .mode-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .mode-card {
    border-radius: 24px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    border: 1.5px solid rgba(15,15,13,0.1);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .mode-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 56px rgba(15,15,13,0.08);
  }
  .mode-card.general { background: #fff; }
  .mode-card.targeted { background: #0F0F0D; color: #FAFAF8; border-color: #0F0F0D; }

  /* FIX: mode-tag row — align-items: center, gap, wrap naturally */
  .mode-tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .mode-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 99px;
    border: 1px solid;
  }
  .mode-tag.general { color: #1A5CFF; border-color: rgba(26,92,255,0.25); background: rgba(26,92,255,0.06); }
  .mode-tag.targeted { color: #86EFAC; border-color: rgba(134,239,172,0.25); background: rgba(134,239,172,0.08); }

  .new-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: #1A5CFF;
    color: #fff;
    padding: 3px 8px;
    border-radius: 99px;
    line-height: 1.4;
    flex-shrink: 0;
  }

  .check-list {
    margin: 0;
    padding: 0;
  }
  .check-list li {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 0;
  }
  .check-icon {
    width: 18px; height: 18px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
    flex-shrink: 0;
    font-weight: 900;
  }
  .check-icon.blue { background: rgba(26,92,255,0.1); color: #1A5CFF; }
  .check-icon.green { background: rgba(134,239,172,0.15); color: #86EFAC; }

  /* ── Export cards ── */
  .export-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .export-card {
    background: #fff;
    border: 1px solid rgba(15,15,13,0.08);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .export-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(15,15,13,0.07);
  }
  .export-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    margin-bottom: 20px;
  }
  .export-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  /* ── Feature grid ── */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .feature-card {
    background: #fff;
    border: 1px solid rgba(15,15,13,0.08);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.2s, border-color 0.2s;
  }
  .feature-card:hover {
    transform: translateY(-3px);
    border-color: rgba(15,15,13,0.2);
  }
  .feature-icon {
    font-size: 28px;
    margin-bottom: 18px;
    display: block;
  }

  /* ── Split CTA ── */
  .split-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .split-card {
    border-radius: 28px;
    padding: 52px 48px;
    position: relative;
    overflow: hidden;
  }
  .split-card.light {
    background: #fff;
    border: 1.5px solid rgba(15,15,13,0.1);
  }
  .split-card.dark {
    background: #0F0F0D;
    color: #FAFAF8;
  }
  .split-card .deco-circle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .numbered-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  .n-bubble {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Differentiator cards ── */
  .diff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .diff-card {
    background: #fff;
    border: 1px solid rgba(15,15,13,0.08);
    border-radius: 20px;
    padding: 36px;
    transition: transform 0.2s;
    position: relative;
  }
  .diff-card:hover { transform: translateY(-3px); }
  .diff-accent-line {
    width: 32px;
    height: 2px;
    border-radius: 99px;
    margin-bottom: 24px;
  }
  .diff-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    margin-bottom: 20px;
    display: inline-block;
  }

  /* ── Final CTA ── */
  .cta-section {
    background: #0F0F0D;
    border-radius: 28px;
    padding: 80px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.2rem, 6vw, 5rem);
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: #FAFAF8;
    margin-bottom: 20px;
  }
  .cta-title em { font-style: italic; color: #7AADFF; }
  .cta-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(26,92,255,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── Overleaf Banner ── */
  .overleaf-banner {
    background: #FDF6EC;
    border: 1px solid rgba(180,115,0,0.2);
    border-radius: 16px;
    padding: 24px 28px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .overleaf-banner-text {
    flex: 1;
    min-width: 200px;
  }

  /* ── Recruiter label ── */
  .recruiter-badge {
    background: rgba(34,197,94,0.08);
    color: #15803D;
    border: 1px solid rgba(34,197,94,0.2);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 99px;
    display: inline-block;
    margin-bottom: 32px;
  }

  /* ── Section label divider row ── */
  .section-label-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 40px;
    flex-wrap: nowrap;
  }
  .section-label-divider {
    height: 1px;
    flex: 1;
    background: rgba(15,15,13,0.1);
    min-width: 20px;
  }

  /* ── Hero CTA buttons row ── */
  .hero-btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 64px;
  }

  /* ── Page section containers ── */
  .page-section {
    max-width: 1160px;
    margin: 0 auto;
    padding: 100px 32px;
  }
  .page-section-bg {
    padding: 100px 32px;
  }
  .page-section-bg > .inner {
    max-width: 1160px;
    margin: 0 auto;
  }

  /* ── Responsive overrides ── */
  @media (max-width: 900px) {
    .page-section { padding: 72px 24px; }
    .page-section-bg { padding: 72px 24px; }
    .split-card { padding: 36px 28px; }
    .cta-section { padding: 60px 28px; }
    .mode-card { padding: 32px 28px; }
  }

  @media (max-width: 640px) {
    .page-section { padding: 56px 16px; }
    .page-section-bg { padding: 56px 16px; }
    .hero-btns { flex-direction: column; align-items: flex-start; }
    .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
    .split-card { padding: 28px 20px; }
    .cta-section { padding: 48px 20px; border-radius: 20px; }
    .cta-btns { flex-direction: column; align-items: center; }
    .cta-btns a { width: 100%; max-width: 320px; justify-content: center; }
    .steps-grid { grid-template-columns: 1fr; }
    .score-widget { padding: 20px; }
    .overleaf-banner { flex-direction: column; }
    .overleaf-banner a { align-self: flex-start; }
    .mode-card { padding: 28px 20px; }
    .export-card { padding: 24px 20px; }
    .feature-card { padding: 24px 20px; }
    .diff-card { padding: 28px 20px; }
    .section-label-row { flex-wrap: wrap; }
    .section-label-divider { display: none; }
  }

  @media (max-width: 480px) {
    .score-num { font-size: 3.5rem; }
    .hero-title { font-size: 2.6rem; }
  }
`;

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
      <style>{globalStyles}</style>
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
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,248,0.4)", marginBottom: 8 }}>General Score</p>
                  <div className="score-num" style={{ color: "#FAFAF8" }}>85</div>
                  <p style={{ fontSize: 10, color: "rgba(250,250,248,0.4)", marginTop: 4 }}>out of 100</p>
                  <div className="score-bar-track" style={{ marginTop: 12 }}>
                    <div className="score-bar-fill" style={{ width: "85%", background: "#FAFAF8" }} />
                  </div>
                </div>

                {/* Divider — explicit flex child, not a grid cell bleeding into content */}
                <div className="score-col-divider" />

                {/* Role Match */}
                <div className="score-col" style={{ padding: "0 4px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,248,0.4)", marginBottom: 8 }}>Role match</p>
                  <div className="score-num" style={{ color: "#86EFAC", animationDelay: "1s" }}>72</div>
                  <p style={{ fontSize: 10, color: "rgba(250,250,248,0.4)", marginTop: 4 }}>out of 100</p>
                  <div className="score-bar-track" style={{ marginTop: 12 }}>
                    <div className="score-bar-fill" style={{ width: "72%", background: "#86EFAC", animationDelay: "1.2s" }} />
                  </div>
                </div>

                {/* Divider */}
                <div className="score-col-divider" />

                {/* Tailored for — FIX: full column, no divider bleeding in */}
                <div className="score-col" style={{ paddingLeft: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,248,0.4)", marginBottom: 12 }}>Tailored for</p>
                  <div style={{ background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#86EFAC", marginBottom: 2 }}>Senior SWE @ JPMC</p>
                    <p style={{ fontSize: 10, color: "rgba(250,250,248,0.4)" }}>Role match enabled</p>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,248,0.4)", marginBottom: 8 }}>Keyword match</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="score-bar-track" style={{ flex: 1 }}>
                      <div className="score-bar-fill" style={{ width: "68%", background: "#7AADFF", animationDelay: "1.3s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#7AADFF" }}>68%</span>
                  </div>
                </div>

              </div>

              {/* Missing skills chips */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(250,250,248,0.08)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,248,0.35)", marginBottom: 10 }}>Missing keywords</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Kubernetes", "gRPC", "System Design", "Distributed Systems"].map(k => (
                    <span key={k} className="chip" style={{ color: "#F87171", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}>{k}</span>
                  ))}
                  {["Spring Boot", "AWS Lambda"].map(k => (
                    <span key={k} className="chip" style={{ color: "rgba(250,250,248,0.5)", borderColor: "rgba(250,250,248,0.1)", background: "rgba(250,250,248,0.04)" }}>{k}</span>
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

        {/* ═══════════════════════════════════════════════
            FEATURES GRID
        ═══════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════
            SPLIT VALUE PROP
        ═══════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════
            DIFFERENTIATORS
        ═══════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════ */}
        <section className="page-section" style={{ paddingBottom: 100 }}>
          <div className="cta-section">
            <div className="cta-glow" />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(250,250,248,0.08)", border: "1px solid rgba(250,250,248,0.12)", borderRadius: 99, padding: "6px 14px", marginBottom: 32 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "float 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,248,0.6)" }}>Free to get started</span>
              </div>

              <h2 className="cta-title">
                Your next interview<br />
                starts with <em>one upload.</em>
              </h2>

              <p style={{ color: "rgba(250,250,248,0.55)", fontSize: 15, marginBottom: 44, maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.7 }}>
                Join the platform where students get hired and recruiters find talent — powered by a scoring engine that never lies.
              </p>

              <div className="cta-btns">
                <NavLink to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FAFAF8", color: "#0F0F0D", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", padding: "14px 28px", borderRadius: 99, textDecoration: "none", transition: "background 0.2s, transform 0.15s" }}>
                  Create free account →
                </NavLink>
                <NavLink to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "rgba(250,250,248,0.7)", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, padding: "14px 28px", borderRadius: 99, textDecoration: "none", border: "1.5px solid rgba(250,250,248,0.15)", transition: "border-color 0.2s, color 0.2s" }}>
                  Sign in
                </NavLink>
              </div>

              <p style={{ color: "rgba(250,250,248,0.3)", fontSize: 11, marginTop: 20, letterSpacing: "0.05em" }}>No credit card required · Takes 30 seconds</p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}