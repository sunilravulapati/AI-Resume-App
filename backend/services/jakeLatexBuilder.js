/**
 * jakeLatexBuilder.js
 *
 * Deterministic Jake's Resume LaTeX generator.
 * Produces a compilable, single-page pdflatex document with ZERO AI involvement.
 * Drop this file into your services/ directory.
 *
 * Usage:
 *   import { buildJakeLatex } from "./jakeLatexBuilder.js";
 *   const latexString = buildJakeLatex(tailoredData);
 */

// ─────────────────────────────────────────────────────────────────────────────
// LaTeX character escaping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escapes all LaTeX special characters in a plain-text string.
 * Must be applied to EVERY user-supplied string before embedding in LaTeX.
 */
function esc(str = "") {
  if (typeof str !== "string") str = String(str ?? "");
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    .replace(/\|/g, "\\textbar{}")
    .replace(/"/g, "''")
    .replace(/'/g, "'")
    // Remove any remaining non-ASCII characters that pdflatex can't handle
    .replace(/[^\x00-\x7F]/g, (ch) => {
      const map = {
        "–": "--", "—": "---", "…": "...", "\u2019": "'", "\u2018": "`",
        "\u201C": "``", "\u201D": "''", "\u00e9": "\\'e", "\u00e8": "\\`e",
        "\u00ea": "\\^e", "\u00e0": "\\`a", "\u00e2": "\\^a", "\u00f4": "\\^o",
        "\u00fc": '\\"u', "\u00e4": '\\"a', "\u00f6": '\\"o',
      };
      return map[ch] ?? "";
    });
}

/** Escape and strip leading bullet/dash characters from bullet strings. */
function bullet(str = "") {
  return esc(str.replace(/^[\s•\-–*>]+/, "").trim());
}

/** Wrap a URL in \href so it's clickable but the display text is escaped. */
function href(url = "", display = "") {
  if (!url) return esc(display || "");
  const safeUrl = url.replace(/[\\%#{}^~<>|]/g, "");
  return `\\href{${safeUrl}}{${esc(display || url)}}`;
}

// latex preamble for jake's resume
export function buildPreamble() {
  return String.raw`%---------------------------------------------------------------------------%
% Jake's Resume – pdflatex-compatible template
% Adapted from Jake Gutierrez's original (MIT License)
%---------------------------------------------------------------------------%
\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{multicol}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

%---------------------------------------------------------------------------%
% Custom commands
%---------------------------------------------------------------------------%
\newcommand{\resumeItem}[1]{
  \item\small{#1 \vspace{-2pt}}
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubheadingThree}[3]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textit{\small #2} \\
      \textit{\small#3} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section builders
// ─────────────────────────────────────────────────────────────────────────────

export function buildHeader(basics = {}) {
  const name    = esc(basics.name    || "Candidate");
  const email   = basics.email    || "";
  const phone   = basics.phone    || "";
  const location = basics.location || "";
  const linkedin = basics.linkedin || "";
  const github  = basics.github   || "";
  const portfolio = basics.portfolio || "";
  const leetcode = basics.leetcode || "";
  const hackerrank = basics.hackerrank || "";
  const codeforces = basics.codeforces || "";

  // Build contact items (only non-empty)
  const contactItems = [];
  if (phone)     contactItems.push(esc(phone));
  if (email)     contactItems.push(`\\href{mailto:${email}}{${esc(email)}}`);
  if (location)  contactItems.push(esc(location));
  if (linkedin) {
    const liDisplay = linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "linkedin.com/in/");
    const liUrl = linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`;
    contactItems.push(`\\href{${liUrl}}{${esc(liDisplay)}}`);
  }
  if (github) {
    const ghDisplay = github.replace(/^https?:\/\/(www\.)?github\.com\//i, "github.com/");
    const ghUrl = github.startsWith("http") ? github : `https://github.com/${github}`;
    contactItems.push(`\\href{${ghUrl}}{${esc(ghDisplay)}}`);
  }
  if (portfolio) {
    const portDisplay = portfolio.replace(/^https?:\/\/(www\.)?/i, "");
    const portUrl = portfolio.startsWith("http") ? portfolio : `https://${portfolio}`;
    contactItems.push(`\\href{${portUrl}}{${esc(portDisplay)}}`);
  }
  if (leetcode) {
    const lcDisplay = leetcode.replace(/^https?:\/\/(www\.)?leetcode\.com\//i, "leetcode.com/");
    const lcUrl = leetcode.startsWith("http") ? leetcode : `https://leetcode.com/${leetcode}`;
    contactItems.push(`\\href{${lcUrl}}{${esc(lcDisplay)}}`);
  }
  if (hackerrank) {
    const hrDisplay = hackerrank.replace(/^https?:\/\/(www\.)?hackerrank\.com\//i, "hackerrank.com/");
    const hrUrl = hackerrank.startsWith("http") ? hackerrank : `https://hackerrank.com/${hackerrank}`;
    contactItems.push(`\\href{${hrUrl}}{${esc(hrDisplay)}}`);
  }
  if (codeforces) {
    const cfDisplay = codeforces.replace(/^https?:\/\/(www\.)?codeforces\.com\/(profile\/)?/i, "codeforces.com/");
    const cfUrl = codeforces.startsWith("http") ? codeforces : `https://codeforces.com/profile/${codeforces}`;
    contactItems.push(`\\href{${cfUrl}}{${esc(cfDisplay)}}`);
  }

  const contactLine = contactItems.join(" $|$ ");

  return `
\\begin{center}
    {\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}
`;
}

function buildEducation(education = []) {
  if (!education.length) return "";
  const items = education.map((edu) => {
    const gpa = edu.gpa ? `, GPA: ${esc(edu.gpa)}` : "";
    const extras = (edu.extra || []).filter(Boolean);
    const extraLine = extras.length
      ? `\n      \\resumeItem{${extras.map(esc).join("; ")}}`
      : "";
    return `    \\resumeSubheading
      {${esc(edu.institution)}}{${esc(edu.dates || "")}}
      {${esc(edu.degree)}${gpa}}{${esc(edu.location || "")}}${extraLine}`;
  });

  return `
\\section{Education}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function buildExperience(experience = []) {
  if (!experience.length) return "";
  const items = experience.map((exp) => {
    const bullets = (exp.bullets || []).filter(Boolean);
    const bulletLines = bullets.map((b) => `        \\resumeItem{${bullet(b)}}`).join("\n");
    const techLine = exp.tech
      ? `\n        \\resumeItem{\\textit{Technologies: }${esc(exp.tech)}}`
      : "";
    return `    \\resumeSubheading
      {${esc(exp.title)}}{${esc(exp.dates || "")}}
      {${esc(exp.company)}}{${esc(exp.location || "")}}
      \\resumeItemListStart
${bulletLines}${techLine}
      \\resumeItemListEnd`;
  });

  return `
\\section{Experience}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function buildProjects(projects = []) {
  if (!projects.length) return "";
  const items = projects.map((proj) => {
    const bullets = (proj.bullets || []).filter(Boolean);
    const bulletLines = bullets.map((b) => `        \\resumeItem{${bullet(b)}}`).join("\n");
    const meta  = proj.meta  ? ` -- \\textit{\\small ${esc(proj.meta)}}` : "";
    const tech  = proj.tech  ? ` $|$ \\emph{\\small ${esc(proj.tech)}}` : "";
    
    // Add links if provided
    const links = [];
    if (proj.githubUrl) links.push(`\\href{${proj.githubUrl.startsWith('http') ? proj.githubUrl : 'https://' + proj.githubUrl}}{Github}`);
    if (proj.liveDemoUrl) links.push(`\\href{${proj.liveDemoUrl.startsWith('http') ? proj.liveDemoUrl : 'https://' + proj.liveDemoUrl}}{Live Demo}`);
    const linksDisplay = links.length ? ` $|$ ${links.join(" $|$ ")}` : "";

    return `    \\resumeProjectHeading
        {\\textbf{${esc(proj.title)}}${linksDisplay}${tech}${meta}}{}
      \\resumeItemListStart
${bulletLines}
      \\resumeItemListEnd`;
  });

  return `
\\section{Projects}
    \\resumeSubHeadingListStart
${items.join("\n")}
    \\resumeSubHeadingListEnd
`;
}

function buildSkills(skills = []) {
  if (!skills.length) return "";

  // Handle both array-of-objects [{label, value}] and flat arrays
  const rows = skills
    .filter((s) => s && (s.value || s.label))
    .map((s) => {
      const label = s.label || "";
      const value = s.value || "";
      return `     \\textbf{${esc(label)}}{: ${esc(value)}} \\\\`;
    });

  if (!rows.length) return "";

  return `
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${rows.join("\n")}
    }}
 \\end{itemize}
`;
}

function buildAchievements(achievements = [], awards = []) {
  const allBullets = [];

  // Normalise achievements (may be [{category, bullets}] or [{title, desc}])
  for (const a of achievements) {
    if (a.bullets && Array.isArray(a.bullets)) {
      a.bullets.filter(Boolean).forEach((b) => allBullets.push(bullet(b)));
    } else if (a.title || a.desc) {
      const line = [a.title, a.desc].filter(Boolean).map(esc).join(" -- ");
      allBullets.push(line);
    }
  }

  // Awards folded in here to save vertical space
  for (const aw of awards) {
    const parts = [aw.title, aw.org, aw.date].filter(Boolean).map(esc);
    if (aw.desc) parts.push(esc(aw.desc));
    allBullets.push(parts.join(", "));
  }

  if (!allBullets.length) return "";

  const lines = allBullets
    .slice(0, 5)
    .map((b) => `      \\resumeItem{${b}}`)
    .join("\n");

  return `
\\section{Achievements \\& Awards}
  \\resumeSubHeadingListStart
    \\item
    \\resumeItemListStart
${lines}
    \\resumeItemListEnd
  \\resumeSubHeadingListEnd
`;
}

function buildCertifications(certifications = []) {
  if (!certifications.length) return "";
  const lines = certifications
    .slice(0, 4)
    .map((c) => {
      const parts = [c.title, c.org, c.dates].filter(Boolean).map(esc);
      return `      \\resumeItem{${parts.join(", ")}}`;
    })
    .join("\n");

  return `
\\section{Certifications}
  \\resumeSubHeadingListStart
    \\item
    \\resumeItemListStart
${lines}
    \\resumeItemListEnd
  \\resumeSubHeadingListEnd
`;
}

function buildExtracurricular(extracurricular = []) {
  if (!extracurricular.length) return "";
  const items = extracurricular.slice(0, 2).map((item) => {
    const bullets = (item.bullets || []).filter(Boolean);
    const bulletLines = bullets.map((b) => `        \\resumeItem{${bullet(b)}}`).join("\n");
    return `    \\resumeSubheadingThree
      {${esc(item.role || item.title || "")}}
      {${esc(item.dates || "")}}
      {${esc(item.org || "")}}
      \\resumeItemListStart
${bulletLines}
      \\resumeItemListEnd`;
  });

  return `
\\section{Extracurricular}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function buildDsaProfiles(dsaProfiles = []) {
  if (!dsaProfiles.length) return "";
  const lines = dsaProfiles
    .slice(0, 3)
    .filter(Boolean)
    .map((p) => `      \\resumeItem{${esc(p)}}`)
    .join("\n");

  if (!lines) return "";

  return `
\\section{Competitive Programming}
  \\resumeSubHeadingListStart
    \\item
    \\resumeItemListStart
${lines}
    \\resumeItemListEnd
  \\resumeSubHeadingListEnd
`;
}

function buildSummary(summary = "") {
  if (!summary || !summary.trim()) return "";
  return `
\\section{Professional Summary}
\\small{${esc(summary.trim())}}
\\vspace{2pt}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a complete Jake's Resume LaTeX document from a tailored resume object.
 *
 * The input schema matches what `prepareResumeExport` produces:
 *   basics, summary / tailoredSummary, skills / tailoredSkills,
 *   experience, projects, education, awards, achievements,
 *   certifications, extracurricular, dsaProfiles, languages
 *
 * @param {object} data  Tailored resume data object.
 * @returns {string}     Complete LaTeX source, ready for pdflatex.
 */
export function buildJakeLatex(data = {}) {
  // Prefer tailored variants where present
  const summary       = data.tailoredSummary || data.summary || "";
  const skills        = data.tailoredSkills  || data.skills  || [];
  const experience    = data.tailoredExperience || data.experience || [];
  const projects      = data.tailoredProjects   || data.projects   || [];
  const education     = data.education     || [];
  const awards        = data.awards        || [];
  const achievements  = data.achievements  || [];
  const certifications = data.certifications || [];
  const extracurricular = data.extracurricular || [];
  const dsaProfiles   = data.dsaProfiles   || data.dsaProficiency || [];
  const basics        = data.basics        || {};

  // Determine which optional sections to include (only if non-empty)
  const hasAchievements = achievements.length || awards.length;

  const body = [
    buildHeader(basics),
    summary    ? buildSummary(summary) : "",
    education.length ? buildEducation(education) : "",
    experience.length ? buildExperience(experience) : "",
    projects.length ? buildProjects(projects) : "",
    skills.length ? buildSkills(skills) : "",
    hasAchievements ? buildAchievements(achievements, awards) : "",
    certifications.length ? buildCertifications(certifications) : "",
    dsaProfiles.length ? buildDsaProfiles(dsaProfiles) : "",
    extracurricular.length ? buildExtracurricular(extracurricular) : "",
  ].filter(Boolean).join("\n");

  return `${buildPreamble()}
\\begin{document}

${body}

\\end{document}
`;
}