import Groq from "groq-sdk";
import "dotenv/config";
import { prepareResumeExport, enforceLimits } from "./resumeFormat.js";

const groq      = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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

// SCORING RUBRIC  (shared between both analysis functions)
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

// general analysis
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


// TARGETED ANALYSIS
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

// TAILOR RESUME
export async function tailorResume(resumeText, jobDescription) {
  requireText(resumeText,     "Resume text");
  requireText(jobDescription, "Job description");

  const systemPrompt = `
You are an elite technical recruiter and expert structured data extractor.
Your task is to analyze the raw resume text, extract its complete content verbatim into a canonical schema, and generate highly targeted tailored enhancements in the same call.

--------------------------------------------------------------------------------
CANONICAL SCHEMA STRUCTURE (The "original" block)
--------------------------------------------------------------------------------
You must parse the raw resume text into this exact JSON schema under the "original" key:
{
  "summary": "Original summary or professional objective (empty string if none)",
  "skills": [
    { "label": "Category Name", "value": "Comma-separated technologies verbatim" }
  ],
  "experience": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "location": "Location",
      "dates": "Date Range",
      "bullets": ["Verbatim bullet 1", "Verbatim bullet 2"],
      "tech": "Technologies used (comma-separated)"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "meta": "Context, organization, or dates",
      "bullets": ["Verbatim bullet 1", "Verbatim bullet 2"],
      "tech": "Technologies used (comma-separated)",
      "githubUrl": "GitHub repo URL if present (leave empty if none)",
      "liveDemoUrl": "Live demo/deployment URL if present (leave empty if none)"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "dates": "Date Range",
      "gpa": "GPA (e.g. 9.1/10 - plain number, no CGPA prefix)",
      "extra": ["Extras/achievements at school"]
    }
  ],
  "awards": [
    { "title": "Award Title", "org": "Issuing Organization", "desc": "Key details", "date": "Date" }
  ],
  "certifications": [
    { "title": "Certification Title", "org": "Issuing Org", "dates": "Date", "url": "" }
  ],
  "achievements": [
    { "category": "Category", "bullets": ["Specific achievement bullet"] }
  ],
  "extracurricular": [
    { "role": "Role Title", "org": "Organization", "dates": "Dates", "bullets": ["Bullet"] }
  ],
  "dsaProfiles": ["Full competitive coding profiles/stats verbatim"],
  "languages": "Comma-separated languages spoken"
}

--------------------------------------------------------------------------------
EXTRACTION RULES (Preserve everything by default)
--------------------------------------------------------------------------------
1. SPLIT EXPERIENCE AND PROJECTS: Real work/internships go in "experience". Personal, academic, side, and research projects go in "projects".
2. VERBATIM ACCURACY: Extract all names, degrees, links, certifications, awards, languages, extracurriculars, achievements, and competitive programming stats exactly as they appear in the resume. Silently dropping any section is a critical failure.
3. LeetCode, CodeChef, Codeforces, HackerRank profiles, and DSA metrics belong verbatim in "dsaProfiles".
4. DO NOT GENERATE OR EXTRACT PERSONAL INFO: Do NOT generate Name, Email, Phone, Github, LinkedIn, or Portfolio links in the JSON. The template engine handles this exclusively from user input.

--------------------------------------------------------------------------------
TAILORED PATCHES RULES (The "tailoredPatches" block)
--------------------------------------------------------------------------------
Under the "tailoredPatches" key, provide highly professional, recruiter-grade optimization details designed to align the candidate with the target Job Description:
1. summary: Exactly 3 sentences, maximum 60 words total. Lead with the candidate's strongest technical capability, highlight 2-3 JD-relevant skills with concrete evidence, and state direct value. Avoid buzzwords ("passionate", "enthusiastic", "hardworking", "team player"). Prefer keywords like "architecture", "scalability", "measurable engineering capability", and technical stacks. Focus on high information density.
2. skills: Reorder categories and individual skills to front-load matching JD technologies. Keep category labels consistent.
3. experience: For each work experience entry, write exactly 2 or 3 optimized bullets (each strictly <= 30 words) starting with a strong past-tense action verb (Built, Designed, Optimised, Implemented). Highlight WHAT was done, WHY it mattered, and the exact technologies/metrics. Rewrite weak phrases ("worked on", "helped with"). Do NOT invent fake metrics.
4. projects: For each project entry, write exactly 2 or 3 optimized bullets (each strictly <= 30 words) starting with a strong action verb.

--------------------------------------------------------------------------------
OUTPUT SPECIFICATION
--------------------------------------------------------------------------------
Return ONLY a valid JSON object. No markdown fences, no explanatory prose.
{
  "original": <Complete, verbatim parsed canonical resume structure>,
  "tailoredPatches": {
    "summary": "3-sentence JD-aligned summary",
    "skills": [
      { "label": "Category Name", "value": "Reordered skills matching JD" }
    ],
    "experience": [
      { "title": "Role Title", "company": "Company Name", "bullets": ["Optimized bullet 1", "Optimized bullet 2"] }
    ],
    "projects": [
      { "title": "Project Name", "bullets": ["Optimized bullet 1", "Optimized bullet 2"], "githubUrl": "Preserved github URL", "liveDemoUrl": "Preserved demo URL" }
    ]
  }
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
  } catch (parseErr) {
    console.warn("[aiAnalyzer] tailorResume: initial JSON parse failed, attempting repair.", parseErr.message);
    try {
      parsed = await repairJSON(raw);
    } catch (repairErr) {
      // throw instead of silently returning raw string — callers expect an object
      console.error("[aiAnalyzer] tailorResume: JSON parse + repair both failed.", repairErr.message);
      throw new Error(`tailorResume: could not produce valid JSON after repair. Original error: ${repairErr.message}`);
    }
  }

  // If the parsed object contains original and tailoredPatches fails
  if (parsed && parsed.original && parsed.tailoredPatches) {
    const { mergeTailoredResume } = await import("./mergeTailoredResume.js");
    const mergedResume = mergeTailoredResume(parsed.original, parsed.tailoredPatches, jobDescription);
    return JSON.stringify(mergedResume);
  }
  // Hard-enforce structural limits even if the LLM ignored instructions
  return JSON.stringify(enforceLimits(parsed, jobDescription));
}

// GENERATE COVER LETTER  (AI prompt → Tailored Cover Letter)
export async function generateCoverLetterWithAI(resumeText, tailoredData, company = "Target Company", roleName = "Target Position", jobDescription = "") {
  const systemPrompt = `
You are an expert executive resume writer. Your job is to output a highly compelling, professional, and custom-tailored cover letter on behalf of an applicant.

The cover letter must:
1. Be structured professionally (with space for Applicant Name/Contact details at the top, followed by Date, Hiring Manager salutation).
2. Express deep interest and genuine enthusiasm for the role of "${roleName}" at "${company}".
3. Match the applicant's engineering accomplishments, skills, and quantified metrics (from their resume details) directly against the key challenges and requirements listed in the job description.
4. Keep the tone authentic, warm, and highly professional. Avoid generic templates or boring cliches.
5. Limit the length strictly to 1 page (around 300 to 400 words) with clear paragraph spacing.

Output ONLY the plain cover letter text, properly structured with professional paragraph breaks. No markdown code blocks, no intro notes, and no commentary.
`.trim();

  const userPrompt = `
Applicant Resume Context:
${resumeText ? resumeText.slice(0, 3000) : ""}

Target Company: ${company}
Target Role: ${roleName}
Job Description:
${jobDescription ? jobDescription.slice(0, 2000) : "A dynamic developer role needing strong technical skills and problem-solving abilities."}

Tailored Data Reference:
${JSON.stringify(tailoredData)}

Output the custom-tailored cover letter now.
`.trim();

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.3, jsonMode: false, maxRetries: 2 }
  );

  return raw.trim();
}

// Recruiter Feature: AI-powered candidate ranker.
// Screens all candidates against the provided job description/keywords in a single batched call.
export async function rankCandidatesWithAI(candidates, jobDescription) {
  if (!candidates || candidates.length === 0) {
    return { matches: [] };
  }

  const candidatesData = candidates
    // guard against docs without _id before calling .toString()
    .filter(c => c && c._id)
    .map(c => ({
      id: c._id.toString(),
      name: `${c.userId?.firstName || ''} ${c.userId?.lastName || ''}`.trim() || "Unknown Candidate",
      summary: c.feedback?.summary || "",
      parsedSnippet: c.parsedText ? c.parsedText.slice(0, 1500) : ""
    }));

  if (candidatesData.length === 0) {
    return { matches: [] };
  }

  const systemPrompt = `
You are an expert AI recruiting assistant. Your job is to screen a pool of candidates against a job description.
For each candidate, calculate a matchScore (integer between 0 and 100) and provide a concise suitability status and a 1-2 sentence explanation.

Return STRICTLY a JSON object with this exact shape:
{
  "matches": [
    {
      "id": "candidate_id_here",
      "matchScore": 85,
      "suitability": "Strong Match", // Options: "Strong Match", "Good Match", "Potential Match", "Unsuitable"
      "explanation": "Brief 1-2 sentence explanation of why they fit or what they lack."
    }
  ]
}
`.trim();

  const userPrompt = `
Job Description:
${jobDescription}

Candidate Pool:
${JSON.stringify(candidatesData, null, 2)}
`.trim();

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.2, jsonMode: true, maxRetries: 2 }
  );

  try {
    return parseJSONRobust(raw);
  } catch (err) {
    console.error("Failed to parse rankCandidatesWithAI response, trying repair:", err);
    try {
      return await repairJSON(raw);
    } catch (repErr) {
      console.error("JSON repair failed too:", repErr);
      return { matches: [] };
    }
  }
}

// ENHANCE TEXT INLINE (AI prompt -> specific bullet/section improvement)
export async function enhanceTextWithAI(text, action, context = "") {
  let instruction = "";
  switch (action) {
    case "improve":
      instruction = "Improve the professionalism, phrasing, and impact of the following text.";
      break;
    case "concise":
      instruction = "Make the following text more concise and punchy without losing key achievements.";
      break;
    case "ats_optimize":
      instruction = "Optimize the following text for ATS by ensuring strong action verbs and clear tech keywords.";
      break;
    case "stronger":
      instruction = "Rewrite the following text using stronger, more authoritative vocabulary and active voice.";
      break;
    case "metrics":
      instruction = "Rewrite the following text to emphasize and highlight any metrics or quantifiable results.";
      break;
    default:
      instruction = "Improve the following text for a professional resume.";
  }

  const systemPrompt = `
You are an expert executive resume writer. Your task is to rewrite a specific snippet of text based on the user's instructions.
Rules:
1. ONLY return the plain rewritten text. No markdown blocks, no conversational text.
2. Maintain the same general format (e.g., if it's a single bullet point, return a single bullet point).
3. Do not make up fake metrics if none were provided or implied.
4. Keep it focused and avoid unnecessary filler words.
`.trim();

  const userPrompt = `
Instruction: ${instruction}
Context about this text (if any): ${context}

Original Text:
${text}
`.trim();

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    { temperature: 0.3, jsonMode: false, maxRetries: 2 }
  );

  return raw.trim().replace(/^['"]|['"]$/g, "").trim();
}