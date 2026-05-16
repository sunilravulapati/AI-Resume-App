// aiAnalyzer.js
import Groq from "groq-sdk";
import "dotenv/config";
import { prepareResumeExport, enforceLimits } from "./resumeFormat.js";

const groq      = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INFRASTRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip markdown code fences, then parse JSON.
 * Falls back to pulling the outermost {...} block via regex.
 */
function parseJSONRobust(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new Error(`Could not parse JSON from model response:\n${raw.slice(0, 400)}`);
  }
}

/**
 * If parseJSONRobust fails, make a second "repair" call asking the model
 * to return clean JSON from the malformed string.
 */
async function repairJSON(malformedRaw) {
  const raw = await callGroq(
    [
      {
        role: "system",
        content:
          "You are a JSON repair specialist. The user will give you malformed JSON. " +
          "Return ONLY the corrected, valid JSON object — no markdown, no explanation.",
      },
      { role: "user", content: `Fix this JSON:\n\n${malformedRaw}` },
    ],
    { temperature: 0, jsonMode: true }
  );
  return parseJSONRobust(raw);
}

/**
 * Central Groq API caller.
 * - Enables JSON mode (response_format) to reduce hallucinated prose.
 * - Retries automatically on 429 rate-limit with exponential back-off.
 */
async function callGroq(
  messages,
  { temperature = 0.1, maxRetries = 2, jsonMode = true } = {}
) {
  const body = {
    model: GROQ_MODEL,
    temperature,
    messages,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create(body);
      return completion.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      const isRateLimit =
        err?.status === 429 || err?.error?.code === "rate_limit_exceeded";
      if (isRateLimit && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
}

/** Validate that a required argument is a non-empty string. */
function requireText(value, label) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error(`[aiAnalyzer] ${label} must be a non-empty string.`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SCORING RUBRIC  (shared between both analysis functions)
// ─────────────────────────────────────────────────────────────────────────────
const SCORING_RUBRIC = `
══ SCORING RUBRIC ══════════════════════════════════════════════════
Score all three dimensions independently. Sum them for semanticScore.

DIMENSION 1 — Complexity  (0–15)
Measures the technical depth of projects and work experience.
  2–4   : Tutorial clone, to-do app, basic CRUD with no real architecture
  5–8   : Multi-feature app; some thought put in but no real depth
  9–12  : Real backend work — auth flows, job queues, caching, multiple DBs, APIs
  13–15 : Distributed systems, ML pipelines, notable scale, open-source contribution

DIMENSION 2 — Professionalism  (0–5)
Measures the quality and precision of written language.
  0–1 : Vague filler ("worked on", "helped with", "was involved in")
  2–3 : Action verbs present but few/no metrics; passive or fluffy phrasing
  4–5 : Every bullet starts with a strong past-tense verb; quantified results throughout

DIMENSION 3 — Skill–Project Fit  (0–10)
Measures whether listed skills are backed up by evidence in projects/roles.
  0–3 : Laundry-list of skills with no project evidence
  4–6 : Some skills demonstrably used, others dangling
  7–10: Every key skill is clearly exercised in at least one described project or role

CALIBRATION ANCHORS (use these to normalise your scoring):
  • "Built a to-do app with React and Node.js." → Complexity 3
  • "Developed a REST API with JWT auth and Redis caching." → Complexity 9
  • "Architected a Kafka-based event pipeline serving 50K req/s." → Complexity 14
  • "Worked on the backend." → Professionalism 0
  • "Reduced API latency by 40% by introducing a Redis cache layer." → Professionalism 5
════════════════════════════════════════════════════════════════════
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// GENERAL ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeResume(text) {
  requireText(text, "Resume text");

  const systemPrompt = `
You are a HARSH Tier-1 Silicon Valley Technical Recruiter evaluating a student or early-career resume.
Your job is to give an unfiltered, calibrated assessment — not encouragement.

${SCORING_RUBRIC}

OVERALL BAND GUIDANCE:
  8–14  : Typical student resume — basic CRUD projects, no real internships
  15–20 : Decent — at least 1 internship OR strong projects with real metrics
  21–25 : Strong — 2+ internships, measurable impact, genuine system depth
  26–30 : Exceptional — FAANG-level internship, published work, or outstanding systems

OUTPUT FORMAT:
Return ONLY a single valid JSON object. No markdown, no prose outside the JSON.
{
  "scores": {
    "complexity":      <integer 0–15>,
    "professionalism": <integer 0–5>,
    "skillProjectFit": <integer 0–10>
  },
  "semanticScore": <integer — MUST equal complexity + professionalism + skillProjectFit>,
  "strengths": [
    "<concrete observation about THIS resume — not generic praise>",
    "<concrete observation>",
    "<concrete observation>"
  ],
  "improvements": [
    "<specific, actionable improvement with an example of how to fix it>",
    "<specific, actionable improvement>",
    "<specific, actionable improvement>"
  ],
  "summary": "<One brutally honest sentence. Reference actual content from the resume.>"
}

RULES:
- strengths and improvements must be specific to this resume — never generic advice.
- semanticScore MUST equal the sum of the three sub-scores. Double-check before outputting.
- Do not invent or assume credentials not present in the resume.
`.trim();

  const userPrompt = `Evaluate this resume:\n\n${text}`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.1 }
  );

  return raw;
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeResumeTargeted(
  resumeText,
  jobDescription,
  company  = "",
  roleName = ""
) {
  requireText(resumeText,     "Resume text");
  requireText(jobDescription, "Job description");

  const contextLine = [
    company  ? `Target Company : ${company}`  : "",
    roleName ? `Target Role    : ${roleName}` : "",
  ].filter(Boolean).join("\n");

  const systemPrompt = `
You are a HARSH Tier-1 Silicon Valley Technical Recruiter performing a targeted resume-to-JD fit analysis.
${contextLine ? `\n${contextLine}\n` : ""}
Your task has two independent parts. Complete BOTH before producing output.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — GENERAL QUALITY SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${SCORING_RUBRIC}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — JD MATCH ANALYSIS  (follow every step in order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step A — EXTRACT JD SKILLS
  List EVERY distinct required or strongly preferred skill, technology, tool, framework,
  language, platform, or qualification from the Job Description.
  Store this as "jdSkillsFound". Count the total — call it T.

Step B — MATCH AGAINST RESUME
  For each item in jdSkillsFound, check whether it appears by name (or an unambiguous
  equivalent, e.g. "Postgres" === "PostgreSQL") anywhere in the resume.
  Collect matched items in "matchedSkills". Count the matched items — call it M.

Step C — CALCULATE METRICS
  keywordMatchRate = round((M / T) × 100)   [integer 0–100]

  matchScore = holistic fit score (0–100).
    Weight: keyword overlap 40% + project relevance 35% + seniority alignment 25%.
    Apply these mandatory bands:
      10–35 : Resume missing most required skills OR clearly wrong seniority level
      36–59 : Has some relevant skills but notable, disqualifying gaps remain
      60–79 : Covers most required skills; only minor gaps
      80–100: Strong match — nearly all skills present, correct seniority

  missingSkills = items from jdSkillsFound that are ABSENT from the resume.
    Max 8 items. Be specific ("Kubernetes", not "container orchestration").

  experienceGap = 1–2 blunt sentences. Name SPECIFIC projects from the resume
    and state directly whether their complexity matches the seniority of the target role.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Do NOT hallucinate. Only analyse what is explicitly in the resume.
- strengths and improvements must be role-specific (reference the JD and role).
- summary must name the target role if provided.
- missingSkills lists only skills the JD explicitly requires or strongly prefers.
- semanticScore MUST equal complexity + professionalism + skillProjectFit.

OUTPUT FORMAT — return ONLY this JSON object, no markdown, no prose outside it:
{
  "scores": {
    "complexity":      <integer 0–15>,
    "professionalism": <integer 0–5>,
    "skillProjectFit": <integer 0–10>
  },
  "semanticScore":    <integer — must equal sum of sub-scores>,
  "matchScore":       <integer 0–100>,
  "keywordMatchRate": <integer 0–100>,
  "jdSkillsFound":   ["every skill/tool/qualification extracted from the JD"],
  "matchedSkills":   ["subset of jdSkillsFound that appears in the resume"],
  "missingSkills":   ["up to 8 specific skills required by JD but absent from resume"],
  "experienceGap":   "<1–2 blunt sentences naming specific resume projects and seniority fit>",
  "strengths":       ["role-specific strength 1", "role-specific strength 2", "role-specific strength 3"],
  "improvements":    ["role-specific improvement 1", "role-specific improvement 2", "role-specific improvement 3"],
  "summary":         "<One brutally honest sentence referencing the target role by name.>"
}
`.trim();

  const userPrompt =
    `JOB DESCRIPTION:\n${jobDescription}\n\n` +
    `RESUME:\n${resumeText}`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.1 }
  );

  return raw;
}


// ─────────────────────────────────────────────────────────────────────────────
// TAILOR RESUME
// ─────────────────────────────────────────────────────────────────────────────
export async function tailorResume(resumeText, jobDescription) {
  requireText(resumeText,     "Resume text");
  requireText(jobDescription, "Job description");

  const systemPrompt = `
You are an expert Executive Resume Writer and Structured Data Extractor.
Your output is rendered directly into a professional PDF resume via a LaTeX template.
Precision, completeness, and strict adherence to every rule below are mandatory.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-OUTPUT PLANNING  (think through this before writing JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1 — INVENTORY: Identify every project and internship/work entry in the resume.
Step 2 — SCORE each entry 1–10 against the Job Description for relevance.
Step 3 — RANK and select the TOP 6 entries (or all entries if the resume has ≤6 total).
Step 4 — Write bullets for the selected entries using the bullet rules below.
Step 5 — Run the mandatory self-check. Fix any failure before producing JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — EXTRACT ALL DATA
Extract verbatim: name, all contact details (email, phone, linkedin, github, portfolio,
location, tagline), all education records, all awards, all certifications, all DSA stats,
all extracurricular entries, and spoken languages. Omitting any section is a failure.

RULE 2 — DO NOT INVENT
Never add a job, degree, metric, skill, tool, or contact detail not present in the resume.
If it is not written in the resume, it does not exist. Embellishment is a critical failure.

RULE 3 — SKILLS: NO HALLUCINATION
tailoredSkills must contain ONLY technologies and skills EXPLICITLY NAMED in the resume.
Reorder categories and individual items to front-load JD-matching keywords.
Do not add, rename, or merge any skill that is not verbatim in the resume.

RULE 4 — SUMMARY (exactly 3 sentences, ≤ 60 words total)
Sentence 1: Lead with the candidate's single strongest credential.
Sentence 2: Highlight 2–3 JD-relevant technical skills with concrete evidence from resume.
Sentence 3: State the specific value the candidate brings to this exact role.
No filler ("passionate about", "team player", "hard worker", "eager to learn").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPERIENCE & PROJECT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 5 — UNIFIED tailoredExperience
tailoredExperience holds ALL selected entries — both internship/work roles AND projects.
Internships at real companies must always be included and appear before solo projects.

RULE 6 — ENTRY LIMIT: at most 6 entries total in tailoredExperience.

RULE 7 — BULLETS PER ENTRY: exactly 2 or 3 bullets per entry. No more, no fewer.

RULE 8 — BULLET QUALITY  (study the transformation examples carefully)
Every bullet MUST:
  ✓ Begin with a strong past-tense action verb (Built, Reduced, Designed, Implemented, Optimised…)
  ✓ State WHAT was done and WHY it mattered / what measurable result it produced
  ✓ Be ≤ 30 words — count every word; if over, rewrite until it fits
  ✓ Be a complete sentence or complete clause — no dangling fragments
  ✗ Never start with "Worked on", "Helped with", "Was responsible for", "Assisted in"
  ✗ Never be vague — always name the specific technology, metric, or outcome

BULLET TRANSFORMATION EXAMPLES — learn the pattern:
  ✗ WEAK  : "Worked on the backend API for the project."
  ✓ STRONG: "Architected a RESTful Express.js API, reducing average response time by 35%."

  ✗ WEAK  : "Helped to improve performance of the website."
  ✓ STRONG: "Optimised PostgreSQL queries with composite indexes, cutting page load from 4s to 800ms."

  ✗ WEAK  : "Used React to build UI components."
  ✓ STRONG: "Built 12 reusable React components, reducing feature delivery time by 20%."

  ✗ WEAK  : "Implemented authentication in the app."
  ✓ STRONG: "Implemented JWT auth with refresh-token rotation, securing 5,000 active user accounts."

  ✗ TOO LONG (34 words): "Developed and maintained multiple microservices using Node.js and Docker that were responsible for processing user requests and sending notifications via email and SMS."
  ✓ TRIMMED (22 words) : "Developed 4 Node.js microservices handling user requests and transactional notifications, cutting notification latency by 50%."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 9  — GPA: plain number only — "9.05/10". Strip all "CGPA:" / "GPA:" prefixes.
RULE 10 — EDUCATION DATES: date range only — "Aug 2023 – Present".
RULE 11 — DSA PROFICIENCY: extract ALL LeetCode / CodeChef / Codeforces / HackerRank / GFG stat lines verbatim as plain strings.
RULE 12 — CERTIFICATIONS: extract ALL certifications found in the resume.
RULE 13 — ACHIEVEMENTS: maximum 6 bullets total across all categories.
RULE 14 — AWARDS: extract ALL awards found. None may be omitted.
RULE 15 — EXTRACURRICULAR: include role title + relevant bullets.
RULE 16 — LANGUAGES SPOKEN: comma-separated string (e.g. "English, Telugu, Hindi").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY SELF-CHECK  (fix any failure before outputting)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Every internship and every key project is in tailoredExperience
□ tailoredExperience has AT MOST 6 entries
□ EVERY entry has exactly 2 or 3 bullets
□ EVERY bullet starts with a strong past-tense action verb
□ EVERY bullet is ≤ 30 words — count them
□ EVERY bullet is a complete sentence or clause — no fragments
□ tailoredSummary is exactly 3 sentences and ≤ 60 words total — count them
□ tailoredSkills contains ONLY skills explicitly named in the resume
□ awards contains ALL awards from the resume — none omitted
□ education dates are in "Mon YYYY – Mon YYYY" format
□ GPA has no prefix label

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — return ONLY this JSON object. No markdown, no explanation outside it.
For any missing field use "" (string), null, or [] (array) as appropriate.
DO NOT omit any key from the schema.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "basics": {
    "name":      "Candidate Full Name",
    "email":     "email@example.com",
    "phone":     "+91 1234567890",
    "linkedin":  "linkedin username or full url",
    "github":    "github username or full url",
    "portfolio": "portfolio url or empty string",
    "location":  "City, State/Country",
    "tagline":   "Professional tagline verbatim — no truncation"
  },
  "tailoredSummary": "Sentence 1. Sentence 2. Sentence 3.",
  "tailoredSkills": [
    { "label": "Category Name", "value": "Skill A, Skill B, Skill C — JD-relevant first" }
  ],
  "tailoredExperience": [
    {
      "title":   "Role or Project Name",
      "meta":    "Company or Location | Date Range",
      "bullets": ["Strong bullet 1 (≤30 words)", "Strong bullet 2 (≤30 words)"],
      "tech":    "Comma-separated technologies used"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree":      "Degree Name",
      "dates":       "Aug 2023 – Present",
      "gpa":         "9.05/10",
      "extra":       []
    }
  ],
  "awards": [
    { "title": "Award Title", "org": "Awarding Organisation", "desc": "Key metric or outcome", "date": "Month YYYY" }
  ],
  "achievements": [
    { "category": "Category Name", "bullets": ["Concise achievement bullet"] }
  ],
  "extracurricular": [
    { "role": "Role Title", "org": "Organisation", "dates": "Date Range", "bullets": ["Bullet"] }
  ],
  "dsaProficiency": ["Full stat line 1", "Full stat line 2"],
  "certifications": [
    { "title": "Cert Title", "org": "Issuing Org", "dates": "Month YYYY", "url": "" }
  ],
  "languages": "English, Telugu, Hindi"
}
`.trim();

  const userPrompt =
    `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` +
    `BASE RESUME:\n${resumeText}`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.15 }
  );

  // Parse JSON — attempt automatic repair on failure
  let parsed;
  try {
    parsed = parseJSONRobust(raw);
  } catch {
    try {
      parsed = await repairJSON(raw);
    } catch (repairErr) {
      // Return raw string as last resort so the caller can decide what to do
      console.error("[aiAnalyzer] tailorResume: JSON parse + repair both failed.", repairErr.message);
      return raw;
    }
  }

  // Hard-enforce structural limits even if the LLM ignored instructions
  return JSON.stringify(enforceLimits(parsed, jobDescription));
}


// ─────────────────────────────────────────────────────────────────────────────
// GENERATE LATEX  (AI prompt → Jake's Resume LaTeX)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLatexWithAI(resumeText, tailoredData, user = null) {
  const prepared = prepareResumeExport(tailoredData, { resumeText, user });

  const dataJson = JSON.stringify(prepared, null, 2);

  const systemPrompt = `
You are an expert LaTeX typesetter. Your ONLY job is to output a single, complete, compile-ready LaTeX document using Jake's Resume template style.

════════════════════════════════════════════════════════════════
MANDATORY TEMPLATE PREAMBLE — copy this EXACTLY, do not alter:
════════════════════════════════════════════════════════════════
\\documentclass[letterpaper,11pt]{article}

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
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{{#1 \\vspace{-2pt}}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

════════════════════════════════════════════════════════════════
CONTENT RULES — follow every rule, no exceptions:
════════════════════════════════════════════════════════════════
1. Start with \\begin{document} after the preamble.
2. Header: center-aligned name in \\Huge\\scshape, then a single line of contact links separated by $|$.
   - Use \\href{mailto:EMAIL}{EMAIL} for email.
   - Use \\href{URL}{label} for LinkedIn, GitHub, Portfolio, LeetCode.
3. Include ALL of these sections (if data exists):
   Professional Summary | Technical Skills | Experience & Projects |
   Education | Awards & Achievements | DSA Proficiency | Certifications | Extracurricular
4. Section headers: \\section{Section Name}
5. Experience & Projects: use \\resumeSubheading for internship/company roles; \\resumeProjectHeading for solo projects.
   - Every entry must have \\resumeItemListStart … \\resumeItemListEnd with 2–3 bullet \\resumeItem{} lines.
6. Technical Skills: use a \\begin{itemize}[leftmargin=0.15in, label={}] block with one \\item per category.
7. Education: use \\resumeSubheading. Include GPA and any extra lines via \\resumeItemListStart.
8. LaTeX special characters MUST be escaped: & → \\&, % → \\%, $ → \\$, # → \\#, _ → \\_, { → \\{, } → \\}.
   Backslash itself → \\textbackslash{}.
9. End with \\end{document}.
10. Output ONLY the raw LaTeX source. No markdown fences, no explanation, no commentary.

`.trim();

  const userPrompt = `
Here is the structured resume JSON. Use every field — do not skip any section that has data.

${dataJson}

Original resume text (for additional context only — do not copy raw text, use the JSON above):
${resumeText ? resumeText.slice(0, 3000) : ""}

Now output the complete LaTeX document.
`.trim();

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.1, jsonMode: false, maxRetries: 2 }
  );

  // Strip any accidental markdown fences the model may wrap around the output
  return raw
    .replace(/^```(?:latex|tex)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}