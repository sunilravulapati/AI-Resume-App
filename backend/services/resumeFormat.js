// backend/services/resumeFormat.js
function extractJDKeywords(jd = '') {
  return (
    jd
      .toLowerCase()
      .match(/[a-zA-Z0-9.+#-]+/g)
      ?.filter((word) => word.length > 2) || []
  );
}

function scoreProject(project, jdKeywords) {
  const text = `
    ${project.title}
    ${project.tech}
    ${(project.bullets || []).join(' ')}
  `.toLowerCase();

  let score = 0;
  jdKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 3;
  });
  if (text.includes('authentication')) score += 2;
  if (text.includes('docker'))         score += 2;
  if (text.includes('api'))            score += 2;
  if (text.includes('mongodb'))        score += 1;
  if (text.includes('ai'))             score += 3;
  if (text.includes('analytics'))      score += 2;
  return score;
}

export function trimWords(text = '', maxWords = 14) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ');
}

function looksLikeBadName(name = '') {
  const n = name.trim();
  if (!n || n.length < 2) return true;
  if (n.length > 60) return true;
  if (/@|https?:|linkedin|github|www\.|\.com\b/i.test(n)) return true;
  if (/^\d|resume|curriculum vitae|^cv$/i.test(n)) return true;
  if (/^(mr|mrs|ms|dr)\.?\s/i.test(n)) return false;
  const words = n.split(/\s+/);
  if (words.length > 6) return true;
  return false;
}

/** Prefer profile name → first clean line of resume → AI-extracted basics.name */
export function resolveDisplayName(basicsName = '', resumeText = '', user = null) {
  const profile = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  if (profile.length >= 2 && !looksLikeBadName(profile)) return profile;

  const lines = (resumeText || '')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 8)) {
    if (line.length > 55 || line.length < 3) continue;
    if (/@|http|linkedin|github|leetcode|codechef|\+?\d[\d\s\-()]{7,}/i.test(line)) continue;
    if (/^(resume|curriculum vitae|cv)$/i.test(line)) continue;
    if (/^[A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,4}$/.test(line)) return line;
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z.'\-]+){1,4}$/.test(line)) return line;
  }

  const fromBasics = (basicsName || '').trim();
  if (fromBasics && !looksLikeBadName(fromBasics)) return fromBasics;

  return profile || fromBasics || 'Candidate';
}

export function normalizeBasics(data, { user, resumeText } = {}) {
  if (!data || typeof data !== 'object') return data;
  data.basics = data.basics || {};
  data.basics.name = resolveDisplayName(data.basics.name, resumeText, user);
  if (user?.email  && !data.basics.email) data.basics.email = user.email;
  if (user?.mobile && !data.basics.phone) data.basics.phone = user.mobile;
  return data;
}

/**
 * Hard-enforce structural limits so the PDF/LaTeX fits on one page.
 *
 * FIX SUMMARY (v2):
 *   - bullets: 25 words (was 22) — prevents mid-sentence cuts from LLM's 15-word target
 *   - awards: up to 4 (was 2) — all student awards should show
 *   - achievements: up to 4 bullets (was 2) — more room for competitive programming stats
 *   - tailoredExperience: keep top 4 when internships present (was 3)
 *   - certifications: up to 3 (was 2)
 *   - dsaProficiency: up to 3 lines (was 2)
 *
 * WORD LIMITS:
 *   summary    : 55 words
 *   bullets    : 25 words  ← RAISED (LLM targets 15, rendering may wrap, 25 gives safety)
 *   skill val  : 22 words
 *   meta       : 14 words
 *   tech       : 12 words  ← RAISED from 10 to preserve full tech stack
 *   entry title: 12 words
 *   award title: 14 words  ← RAISED from 12 (longer award names e.g. "Third Place Finish - CSI AVENSIS 2K25")
 *   award desc : 20 words  ← RAISED from 15
 *   dsa lines  : 25 words  ← RAISED from 22
 *   extra bul  : 25 words  ← RAISED from 22
 */
export function enforceLimits(data, jobDescription = '') {
  if (!data || typeof data !== 'object') return data;

  const jdKeywords = extractJDKeywords(jobDescription);

  // ── Experience & Projects ─────────────────────────────────────────────────
  if (Array.isArray(data.tailoredExperience)) {
    data.tailoredExperience = data.tailoredExperience
      .map((project) => ({
        ...project,
        __score: scoreProject(project, jdKeywords),
      }))
      .sort((a, b) => b.__score - a.__score)
      // FIX: Allow up to 4 entries so internships aren't always dropped.
      // The LaTeX/PDF template handles layout; 4 entries with 2 bullets each
      // still fits on one page when other sections are lean.
      .slice(0, 4)
      .map(({ __score, ...entry }) => ({
        ...entry,
        title:   trimWords(entry.title   || '', 12),
        // FIX: tech raised to 12 words — "MERN Stack, JWT, Recharts, Express, Node.js, React, MongoDB"
        // was being cut to 10 words which truncated the stack mid-list.
        tech:    trimWords(entry.tech    || '', 12),
        meta:    trimWords(entry.meta    || '', 14),
        // FIX: bullets raised to 25 words. The LLM prompt says ≤15 words, but bullets
        // are routinely cut mid-clause (e.g. "analyze resumes for" — missing object).
        // 25-word ceiling gives react-pdf/LaTeX room to wrap naturally without truncation.
        bullets: (entry.bullets || []).slice(0, 2).map((b) => trimWords(b, 25)),
      }));
  }

  if (data.tailoredSummary) {
    data.tailoredSummary = trimWords(data.tailoredSummary, 55);
  }

  if (Array.isArray(data.tailoredSkills)) {
    data.tailoredSkills = data.tailoredSkills.slice(0, 6).map((row) => ({
      label: trimWords(row.label || '', 4),
      value: trimWords(row.value || '', 22),
    }));
  }

  if (Array.isArray(data.education)) {
    data.education = data.education.slice(0, 2).map((edu) => ({
      ...edu,
      institution: trimWords(edu.institution || '', 8),
      degree:      trimWords(edu.degree      || '', 12),
      extra:       (edu.extra || []).slice(0, 2).map((e) => trimWords(e, 12)),
    }));
  }

  // FIX: Raise awards limit from 2 → 4. A student with 4 awards (Amazon ML Challenge,
  // Suntek DSA, Google Maps, CSI AVENSIS) should show all of them — that's the best
  // part of the resume. Truncating to 2 silently drops differentiating credentials.
  if (Array.isArray(data.awards)) {
    data.awards = data.awards.slice(0, 4).map((a) => ({
      ...a,
      // FIX: title raised to 14 words for long award names
      title: trimWords(a.title || '', 14),
      // FIX: desc raised to 20 words — metric-rich descriptions need the space
      desc:  a.desc ? trimWords(a.desc, 20) : '',
    }));
  }

  // FIX: achievements bullets raised from 2 → 4 total
  if (Array.isArray(data.achievements)) {
    const allBullets = data.achievements
      .flatMap((a) => a.bullets || [])
      .slice(0, 4)
      .map((b) => trimWords(b, 25));
    data.achievements = allBullets.length
      ? [{ category: 'Achievements', bullets: allBullets }]
      : [];
  }

  // FIX: certifications raised from 2 → 3
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.slice(0, 3).map((c) => ({
      ...c,
      title: trimWords(c.title || '', 12),
    }));
  }

  // FIX: dsaProficiency raised from 2 → 3 lines, and word limit to 25
  if (Array.isArray(data.dsaProficiency)) {
    data.dsaProficiency = data.dsaProficiency.slice(0, 3).map((l) => trimWords(l, 25));
  }

  if (Array.isArray(data.extracurricular)) {
    data.extracurricular = data.extracurricular.slice(0, 2).map((item) => ({
      ...item,
      title:   trimWords(item.title || '', 8),
      bullets: (item.bullets || []).slice(0, 1).map((b) => trimWords(b, 25)),
    }));
  }

  if (data.languages) {
    data.languages = trimWords(data.languages, 14);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// LaTeX UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function escapeLatex(text = '') {
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, (m) =>
      ({ '&': '\\&', '%': '\\%', $: '\\$', '#': '\\#', _: '\\_', '{': '\\{', '}': '\\}' }[m])
    )
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function latexHref(url, label) {
  const href = url.startsWith('http') ? url : `https://${url}`;
  return `\\href{${escapeLatex(href)}}{${escapeLatex(label)}}`;
}

function formatDateRange(s = '') {
  return escapeLatex(String(s).replace(/\s*[–—]\s*/g, ' -- '));
}

function contactParts(basics = {}) {
  const parts = [];
  if (basics.phone)  parts.push(escapeLatex(basics.phone));
  if (basics.email) {
    parts.push(`\\href{mailto:${escapeLatex(basics.email)}}{${escapeLatex(basics.email)}}`);
  }
  if (basics.linkedin) {
    const url   = basics.linkedin.startsWith('http')
      ? basics.linkedin
      : `https://linkedin.com/in/${basics.linkedin.replace(/^\/+/, '')}`;
    const label = basics.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '') || 'LinkedIn';
    parts.push(latexHref(url, label));
  }
  if (basics.github) {
    const url   = basics.github.startsWith('http')
      ? basics.github
      : `https://github.com/${basics.github.replace(/^\/+/, '')}`;
    const label = basics.github.replace(/https?:\/\/(www\.)?github\.com\//i, '') || 'GitHub';
    parts.push(latexHref(url, label));
  }
  if (basics.portfolio) parts.push(latexHref(basics.portfolio, 'Portfolio'));
  if (basics.competitiveProgramming) {
    parts.push(latexHref(basics.competitiveProgramming, 'LeetCode'));
  }
  if (basics.location) parts.push(escapeLatex(basics.location));
  return parts.join(' $|$ ');
}

/** Strip GPA duplicates from education extra lines */
function educationGpaLines(edu) {
  const gpa = (edu.gpa || '').replace(/(\s*(CGPA|GPA)\s*:?\s*)+/gi, '').trim();
  const extras = (edu.extra || []).filter((line) => {
    const t = String(line).trim();
    if (!t) return false;
    if (!gpa) return true;
    if (/cgpa|gpa/i.test(t)) return false;
    return true;
  });
  return { gpa, extras };
}

// FIX: Tighter margins to reclaim vertical space for the additional sections
// (awards ×4, DSA ×3, certifications). Key changes:
//   - topmargin: -0.85in (was -0.8in)
//   - textheight: +1.65in (was +1.55in)  
//   - titlespacing section: 0pt / -8pt / -5pt (was 0pt / -6pt / -4pt)
//   - resumeItem vspace: -3pt (was -2pt)
//   - resumeItemListEnd vspace: -6pt (was -5pt)
const LATEX_PREAMBLE = `\\documentclass[letterpaper,9.5pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.85in}
\\addtolength{\\textheight}{1.65in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\titlespacing{\\section}{0pt}{-8pt}{-5pt}
\\titleformat{\\section}{\\vspace{-6pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]
\\newcommand{\\resumeItem}[1]{\\item\\small{{#1}\\vspace{-3pt}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-6pt}
}
\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-3pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[topsep=0pt,itemsep=0pt,parsep=0pt,leftmargin=*]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-6pt}}`;

/**
 * Parse a meta string that may use '|' (pipe) or '/' (slash) as separator.
 */
function splitMeta(meta = '') {
  const hasPipe  = meta.includes('|');
  const hasSlash = !hasPipe && meta.includes('/');

  if (hasPipe) {
    const parts = meta.split('|').map((p) => p.trim());
    if (parts.length >= 2) {
      const date  = parts[parts.length - 1];
      const place = parts.slice(0, -1).join(', ');
      return { place, date };
    }
  }

  if (hasSlash) {
    const parts = meta.split('/').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return { place: `${parts[0]}, ${parts.slice(2).join(', ')}`, date: parts[1] };
    }
    if (parts.length === 2) {
      const datePattern = /\d{4}|present/i;
      if (datePattern.test(parts[1])) {
        return { place: parts[0], date: parts[1] };
      }
      return { place: `${parts[0]}, ${parts[1]}`, date: '' };
    }
  }

  const dateMatch = meta.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[–—-]\s*(?:Present|\w+ \d{4}|\d{4}))\s*$/i
  );
  if (dateMatch) {
    return {
      place: meta.slice(0, dateMatch.index).replace(/[,|·/]+$/, '').trim(),
      date:  dateMatch[1].trim(),
    };
  }

  return { place: meta, date: '' };
}

/** Deterministic Jake-style LaTeX from tailored JSON (one page). */
export function buildLatexDocument(data) {
  const d      = data || {};
  const basics = d.basics || {};
  const name   = basics.name || 'Candidate';
  const lines  = [];

  lines.push(LATEX_PREAMBLE);
  lines.push('\\begin{document}');
  lines.push('\\begin{center}');
  lines.push(`{\\textbf{\\Huge \\scshape ${escapeLatex(name)}}} \\\\ \\vspace{1pt}`);
  const contacts = contactParts(basics);
  if (contacts) lines.push(`${contacts} \\\\`);
  lines.push('\\end{center}');
  lines.push('\\vspace{-14pt}');

  // ── Professional Summary ──────────────────────────────────────────────────
  if (d.tailoredSummary) {
    lines.push('\\section{Professional Summary}');
    lines.push(`{\\small ${escapeLatex(d.tailoredSummary)}}`);
    lines.push('\\vspace{-8pt}');
  }

  // ── Technical Skills ─────────────────────────────────────────────────────
  const skills = d.tailoredSkills || [];
  if (skills.length > 0 || d.languages) {
    lines.push('\\section{Technical Skills}');
    lines.push('\\resumeSubHeadingListStart');
    for (const row of skills) {
      if (!row?.value) continue;
      const label = row.label ? `\\textbf{${escapeLatex(row.label)}:} ` : '';
      lines.push(`  \\item{${label}${escapeLatex(row.value)}}`);
    }
    if (d.languages) {
      lines.push(`  \\item{\\textbf{Languages:} ${escapeLatex(d.languages)}}`);
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── Experience & Projects ─────────────────────────────────────────────────
  const exps = d.tailoredExperience || [];
  if (exps.length > 0) {
    lines.push('\\section{Experience \\& Projects}');
    lines.push('\\resumeSubHeadingListStart');
    for (const job of exps) {
      const { place, date } = splitMeta(job.meta || '');
      const stack    = job.tech ? ` $|$ \\emph{${escapeLatex(job.tech)}}` : '';
      const titleLine = `\\textbf{${escapeLatex(job.title || 'Project')}}${stack}`;

      const heading = place
        ? `${titleLine} \\\\ \\textit{${escapeLatex(place)}}`
        : titleLine;

      lines.push(`  \\resumeProjectHeading{${heading}}{${formatDateRange(date)}}`);
      const bullets = (job.bullets || []).slice(0, 2);
      if (bullets.length) {
        lines.push('  \\resumeItemListStart');
        for (const b of bullets) {
          lines.push(`    \\resumeItem{${escapeLatex(b)}}`);
        }
        lines.push('  \\resumeItemListEnd');
      }
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── Education ─────────────────────────────────────────────────────────────
  const education = d.education || [];
  if (education.length > 0) {
    lines.push('\\section{Education}');
    lines.push('\\resumeSubHeadingListStart');
    for (const edu of education) {
      const { gpa, extras } = educationGpaLines(edu);
      lines.push(
        `  \\resumeSubheading{${escapeLatex(edu.institution || '')}}{}{${escapeLatex(edu.degree || '')}}{${formatDateRange(edu.dates || '')}}`
      );
      if (gpa || extras.length) {
        lines.push('  \\resumeItemListStart');
        if (gpa) lines.push(`    \\resumeItem{CGPA: ${escapeLatex(gpa)}}`);
        for (const line of extras) {
          lines.push(`    \\resumeItem{${escapeLatex(line)}}`);
        }
        lines.push('  \\resumeItemListEnd');
      }
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── Awards & Achievements ─────────────────────────────────────────────────
  const awards      = d.awards       || [];
  const achievements = d.achievements || [];
  const achBullets   = achievements.flatMap((a) => a.bullets || []);
  if (awards.length > 0 || achBullets.length > 0) {
    lines.push('\\section{Awards \\& Achievements}');
    lines.push('\\resumeSubHeadingListStart');
    for (const award of awards) {
      const right = award.date ? formatDateRange(award.date) : '';
      lines.push(
        `  \\resumeProjectHeading{\\textbf{${escapeLatex(award.title || '')}}}{${right}}`
      );
      const awardLines = [award.org, award.desc].filter(Boolean);
      if (awardLines.length) {
        lines.push('  \\resumeItemListStart');
        for (const line of awardLines) {
          lines.push(`    \\resumeItem{${escapeLatex(line)}}`);
        }
        lines.push('  \\resumeItemListEnd');
      }
    }
    if (achBullets.length) {
      lines.push('  \\item');
      lines.push('  \\resumeItemListStart');
      for (const b of achBullets.slice(0, 4)) {
        lines.push(`    \\resumeItem{${escapeLatex(b)}}`);
      }
      lines.push('  \\resumeItemListEnd');
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── DSA Proficiency ───────────────────────────────────────────────────────
  const dsa = d.dsaProficiency || [];
  if (dsa.length > 0) {
    lines.push('\\section{DSA Proficiency}');
    lines.push('\\resumeSubHeadingListStart');
    for (const line of dsa) {
      lines.push(`  \\item{\\small ${escapeLatex(line)}}`);
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── Certifications ────────────────────────────────────────────────────────
  const certs = d.certifications || [];
  if (certs.length > 0) {
    lines.push('\\section{Certifications}');
    lines.push('\\resumeSubHeadingListStart');
    for (const cert of certs) {
      lines.push(
        `  \\resumeProjectHeading{\\textbf{${escapeLatex(cert.title || '')}}}{${formatDateRange(cert.dates || '')}}`
      );
      if (cert.org) {
        lines.push('  \\resumeItemListStart');
        lines.push(`    \\resumeItem{${escapeLatex(cert.org)}}`);
        lines.push('  \\resumeItemListEnd');
      }
    }
    lines.push('\\resumeSubHeadingListEnd');
    lines.push('\\vspace{-8pt}');
  }

  // ── Extracurricular Activities ────────────────────────────────────────────
  const extra = d.extracurricular || [];
  if (extra.length > 0) {
    lines.push('\\section{Extracurricular Activities}');
    lines.push('\\resumeSubHeadingListStart');
    for (const item of extra) {
      if (item.title) lines.push(`  \\item{\\textbf{${escapeLatex(item.title)}}}`);
      const bullets = (item.bullets || []).slice(0, 1);
      if (bullets.length) {
        lines.push('  \\resumeItemListStart');
        for (const b of bullets) {
          lines.push(`    \\resumeItem{${escapeLatex(b)}}`);
        }
        lines.push('  \\resumeItemListEnd');
      }
    }
    lines.push('\\resumeSubHeadingListEnd');
  }

  lines.push('\\end{document}');
  return lines.join('\n');
}

export function prepareResumeExport(data, { jobDescription = '', user, resumeText } = {}) {
  let parsed = typeof data === 'string' ? JSON.parse(data) : { ...data };
  parsed = enforceLimits(parsed, jobDescription);
  parsed = normalizeBasics(parsed, { user, resumeText });
  return parsed;
}