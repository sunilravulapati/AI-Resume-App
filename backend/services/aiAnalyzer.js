// aiAnalyzer.js
import Groq from "groq-sdk";
import "dotenv/config";
import { enforceLimits, prepareResumeExport, buildLatexDocument } from "./resumeFormat.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Tailoring / analysis model (LaTeX is template-based, not LLM-generated). */
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeResume(text) {
  const prompt = `
You are a HARSH Tier-1 Silicon Valley Technical Recruiter evaluating a student or early-career resume.

BE BRUTAL AND REALISTIC. Apply these strict scoring bands:
- Most student resumes (basic CRUD projects, no internships): score 8–14 out of 30
- Decent student resume (1 internship OR strong projects with metrics): score 15–20 out of 30
- Strong resume (2+ internships, measurable impact, system depth): score 21–25 out of 30
- Exceptional (FAANG internship, published work, or exceptional systems): score 26–30 out of 30

Score on these three dimensions (add them for semanticScore):
1. Complexity (0–15): Are projects deep backend/systems, or basic CRUD/tutorial clones?
   - Tutorial clone / to-do app / basic CRUD: 2–4
   - Multi-feature app, no depth: 5–8
   - Real backend depth (auth, queues, caching, DBs): 9–12
   - Distributed systems, ML pipelines, notable scale: 13–15
2. Professionalism (0–5): Is language precise and result-oriented? Are there metrics?
   - Vague ("worked on", "helped with"): 0–1
   - Some action verbs, few metrics: 2–3
   - Strong STAR-method bullets with quantified results: 4–5
3. Skill-Project Fit (0–10): Are listed skills actually demonstrated in projects?
   - Skills listed but no evidence in projects: 0–3
   - Partial evidence: 4–6
   - Every key skill clearly used in a described project: 7–10

Return ONLY valid JSON, no markdown, no explanation:
{
  "semanticScore": <number 0–30>,
  "strengths": ["specific point 1", "specific point 2", "specific point 3"],
  "improvements": ["specific actionable improvement 1", "specific actionable improvement 2", "specific actionable improvement 3"],
  "summary": "One brutally honest sentence summarising this resume's level."
}

Resume:
${text}
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices?.[0]?.message?.content;
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeResumeTargeted(
  resumeText,
  jobDescription,
  company = "",
  roleName = ""
) {
  const companyLine = company  ? `Target Company : ${company}\n`  : "";
  const roleLine    = roleName ? `Target Role    : ${roleName}\n` : "";

  const prompt = `
You are a HARSH Tier-1 Silicon Valley Technical Recruiter doing a targeted resume-to-JD fit analysis.
${companyLine}${roleLine}
Your job has TWO parts:

PART 1 — General quality score (same brutal rubric as always):
Score on these three dimensions (add them for semanticScore, max 30):
1. Complexity (0–15): Are projects deep backend/systems, or basic CRUD/tutorial clones?
   - Tutorial clone / to-do app / basic CRUD: 2–4
   - Multi-feature app, no depth: 5–8
   - Real backend depth (auth, queues, caching, DBs): 9–12
   - Distributed systems, ML pipelines, notable scale: 13–15
2. Professionalism (0–5): Is language precise and result-oriented? Are there metrics?
   - Vague ("worked on", "helped with"): 0–1
   - Some action verbs, few metrics: 2–3
   - Strong STAR-method bullets with quantified results: 4–5
3. Skill-Project Fit (0–10): Are listed skills actually demonstrated in projects?
   - Skills listed but no evidence in projects: 0–3
   - Partial evidence: 4–6
   - Every key skill clearly used in a described project: 7–10

PART 2 — JD match analysis:
Step 1: Extract EVERY required or strongly preferred skill, technology, tool, and qualification from the Job Description.
Step 2: For each one, check if it appears (by name or clear equivalent) anywhere in the resume.
Step 3: Calculate:
  - keywordMatchRate = (matched skills / total JD skills) x 100, rounded to nearest integer
  - matchScore = holistic 0-100 fit score. Weight: keyword overlap 40%, project relevance 35%, seniority alignment 25%.
    Apply these bands:
    - Resume missing most required skills / wrong seniority level: 10-35
    - Resume has some relevant skills but notable gaps: 36-59
    - Resume covers most required skills with minor gaps: 60-79
    - Strong match, nearly all skills present, correct seniority: 80-100
  - missingSkills = skills/technologies EXPLICITLY required or strongly preferred in the JD that are ABSENT from the resume. Max 8 items. Be specific (e.g. "Kubernetes", not "DevOps tools").
  - experienceGap = 1-2 blunt sentences referencing SPECIFIC projects from the resume and whether their complexity matches the seniority level of the target role.

RULES:
- Do NOT hallucinate or invent credentials. Only analyse what is in the resume.
- strengths and improvements must be role-specific, not generic advice.
- summary must reference the target role by name if provided.
- missingSkills must only list things the JD explicitly requires.

Return ONLY valid JSON, no markdown, no explanation:
{
  "semanticScore": <number 0-30>,
  "matchScore": <number 0-100>,
  "keywordMatchRate": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "experienceGap": "1-2 blunt sentences about seniority/complexity alignment.",
  "strengths": ["role-specific strength 1", "strength 2", "strength 3"],
  "improvements": ["actionable fix that directly improves match score 1", "fix 2", "fix 3"],
  "summary": "One brutally honest sentence about fit for this specific role."
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices?.[0]?.message?.content;
}


// ─────────────────────────────────────────────────────────────────────────────
// TAILOR RESUME
// ─────────────────────────────────────────────────────────────────────────────
export async function tailorResume(resumeText, jobDescription) {
  const prompt = `
You are an expert Executive Resume Writer and Data Extractor.
Your output will be rendered onto a SINGLE A4 page PDF. Space is EXTREMELY limited.
Parse the BASE RESUME into structured JSON AND rewrite/trim sections for the TARGET JOB DESCRIPTION.

READ EVERY RULE BEFORE OUTPUTTING. VIOLATING ANY RULE RUINS THE LAYOUT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — EXTRACT ALL DATA VERBATIM
Extract name, contact details (email, phone, linkedin, github, portfolio, location),
education, awards, achievements, DSA stats, certifications, extracurricular activities,
and spoken languages exactly as they appear. Do NOT lose any of these non-experience sections.

RULE 2 — DO NOT INVENT
Never invent jobs, degrees, metrics, skills, or contact info. Only enhance what exists.
If a skill is not explicitly named in the resume, do NOT add it. This is non-negotiable.
Example: resume lists "React.js" but not "Next.js" → do NOT add "Next.js".
Example: resume lists "MongoDB" but not "PostgreSQL" → do NOT add "PostgreSQL".

RULE 3 — SKILLS ANTI-HALLUCINATION (CRITICAL)
Only include skills/technologies EXPLICITLY NAMED in the resume text.
Reorder skills to front-load JD keywords, but never invent new ones.

RULE 4 — TAILOR SUMMARY (2 SENTENCES, ≤40 WORDS TOTAL)
Write exactly 2 tight sentences. Use JD keywords. No filler phrases like "highly motivated"
or "detail-oriented". Lead with your strongest credential, end with your value to this role.
Count your words. If over 40, trim.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT & EXPERIENCE SELECTION RULES — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 5 — UNIFIED tailoredExperience (projects + internships together)
The "tailoredExperience" array holds BOTH projects AND internship/work experience entries.
Do NOT lose internships. An internship at a real company (Walmart, J.P. Morgan) is MORE
valuable to an employer than a side project. Always include internships.

RULE 6 — SELECT TOP ENTRIES (hard limit: up to 4 total)
Step 1: Score every project AND internship entry against the JD:
        skill overlap + domain match + complexity depth + internship bonus (+5 for real company).
Step 2: Sort highest to lowest.
Step 3: Take the TOP 4. If the resume has ≤4 entries total, take all of them.
        Entry #5 and beyond MUST NOT appear in tailoredExperience.

RULE 7 — EXACTLY 2 BULLETS PER ENTRY (hard limit)
Each entry in tailoredExperience MUST have EXACTLY 2 bullets — not 1, not 3.
Choose the 2 strongest bullets: one with a measurable outcome, one naming a JD-relevant tech.

RULE 8 — BULLET WORD LIMIT (hard limit: ≤20 words per bullet)
Count the words. If a bullet exceeds 20 words, rewrite it to fit in 20 words.
Every bullet MUST be a COMPLETE SENTENCE or COMPLETE CLAUSE — never cut mid-phrase.
Every bullet must start with a strong past-tense action verb.

GOOD examples (complete, ≤20 words):
  "Architected real-time dashboard using Kafka to process live stock data with sub-200ms latency."  (15 words ✓)
  "Optimized MongoDB aggregation pipelines for personalized feeds, achieving sub-100ms response times."  (11 words ✓)
  "Engineered NLP keyword matcher and role-based scoring, improving parse accuracy by 40%."  (12 words ✓)

BAD examples (cut mid-phrase — these break the layout and confuse readers):
  "Developed a full-stack MERN application using the Groq LPU Inference engine to analyze resumes for"  ← INCOMPLETE
  "Architected a scalable full-stack Twitter/Threads clone using the MERN Stack, ensuring complex user relationships and"  ← INCOMPLETE

If a bullet is incomplete or cut mid-phrase, that is a CRITICAL ERROR. Rewrite it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 9  — GPA: plain number only: "9.05/10". Strip all "CGPA:" / "GPA:" prefixes.

RULE 10 — EDUCATION DATES: date range only (e.g. "Aug 2023 – Present").

RULE 11 — DSA PROFICIENCY: scan for LeetCode/CodeChef/Codeforces/HackerRank/GFG stats.
Extract ALL lines as plain strings. Return [] if none found.
Example: ["Solved 450 problems on LeetCode; global ranking 224,015.", "Solved ~760 problems on CodeChef.", "Solved ~50 problems on GFG."]

RULE 12 — CERTIFICATIONS: extract ALL certs even without a URL. "url" defaults to "". Return [] if none.

RULE 13 — ACHIEVEMENTS (category-based): named subcategories with bullets → "achievements".
MAX 4 BULLETS TOTAL across all categories. Return [] if none found.

RULE 14 — AWARDS (individual named recognitions) → "awards".
Extract ALL awards found in the resume — do NOT limit to 2. Return [] if none.
Each award: { "title": "...", "org": "...", "desc": "...", "date": "..." }
"desc" should be the key metric or outcome (e.g. "Ranked 1050 / 82,794 (Top 1.3%) for ML model accuracy").

RULE 15 — EXTRACURRICULAR: role titles + bullets → "extracurricular". Return [] if none.

RULE 16 — LANGUAGES SPOKEN: comma-separated string. Return "" if none.

RULE 17 — EMAIL & PHONE: copy EXACTLY as written, including country code ("+91", "+1").

RULE 18 — TAGLINE: if the resume has a professional tagline/headline line below the name,
copy it verbatim (full text, no truncation with "..."). Return "" if none.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE OUTPUTTING — MANDATORY SELF-CHECK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ tailoredExperience includes ALL internships from the resume
□ tailoredExperience has at most 4 entries total
□ EACH entry has EXACTLY 2 bullets
□ EACH bullet is a complete sentence/clause — not cut mid-phrase
□ EACH bullet is ≤20 words — count them
□ tailoredSummary is exactly 2 sentences, ≤40 words total
□ awards array contains ALL awards from the resume (not just 2)
□ dsaProficiency contains ALL DSA platform stats found (LeetCode, CodeChef, GFG, etc.)
□ tailoredSkills contains ONLY skills explicitly named in the resume — no invented skills
□ tailoredSummary uses no filler like "highly motivated", "detail-oriented", "passionate"
If any check fails, fix it before outputting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — return ONLY this JSON, no markdown, no explanation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "basics": {
    "name": "Candidate Full Name",
    "email": "email@example.com",
    "phone": "+91 9550145568",
    "linkedin": "linkedin username or full url",
    "github": "github username or full url",
    "portfolio": "portfolio url or empty string",
    "location": "City, State/Country",
    "tagline": "Full tagline verbatim, no truncation"
  },
  "tailoredSummary": "Exactly 2 complete sentences, ≤40 words total, no filler.",
  "tailoredSkills": [
    { "label": "Category Name", "value": "Only explicitly listed skills from resume, JD-relevant ones first" }
  ],
  "tailoredExperience": [
    {
      "title": "Role or Project Name",
      "meta": "Company or Location | Date Range",
      "bullets": ["Complete bullet 1 — ≤20 words, strong verb + result", "Complete bullet 2 — ≤20 words, strong verb + result"],
      "tech": "Comma separated technologies"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "dates": "Aug 2023 – Present",
      "gpa": "9.05/10",
      "extra": []
    }
  ],
  "awards": [
    { "title": "Award Title", "org": "Awarding Org", "desc": "Key metric or outcome", "date": "Month Year" }
  ],
  "achievements": [
    {
      "category": "Category Name",
      "bullets": ["Complete bullet ≤20 words"]
    }
  ],
  "extracurricular": [],
  "dsaProficiency": ["Full stat line 1", "Full stat line 2", "Full stat line 3"],
  "certifications": [
    { "title": "Cert Title", "org": "Issuing Org", "dates": "Month Year", "url": "" }
  ],
  "languages": "English, Telugu, Hindi"
}

Missing fields: use "", null, or [] as appropriate. Do NOT omit any key.

TARGET JOB DESCRIPTION:
${jobDescription}

BASE RESUME:
${resumeText}
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";

  // Parse JSON
  let parsed;
  try {
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    return raw; // return raw string if parse fails; caller handles it
  }

  // Hard-enforce limits even if the LLM ignored instructions
  return JSON.stringify(
    enforceLimits(parsed, jobDescription)
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// GENERATE LATEX (deterministic Jake-style template)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLatexWithAI(resumeText, tailoredData, user = null) {
  const prepared = prepareResumeExport(tailoredData, { resumeText, user });
  return buildLatexDocument(prepared);
}