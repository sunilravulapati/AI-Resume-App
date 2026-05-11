// aiAnalyzer.js
import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL ANALYSIS — your original, unchanged
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
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices?.[0]?.message?.content;
}


// ─────────────────────────────────────────────────────────────────────────────
// TARGETED ANALYSIS — NEW
// Same brutal recruiter persona, cross-referenced against a real JD.
// Returns the standard fields PLUS matchScore, keywordMatchRate,
// missingSkills, and experienceGap.
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
  - keywordMatchRate = (matched skills ÷ total JD skills) × 100, rounded to nearest integer
  - matchScore = holistic 0–100 fit score. Weight: keyword overlap 40%, project relevance 35%, seniority alignment 25%.
    Apply these bands:
    - Resume missing most required skills / wrong seniority level: 10–35
    - Resume has some relevant skills but notable gaps: 36–59
    - Resume covers most required skills with minor gaps: 60–79
    - Strong match, nearly all skills present, correct seniority: 80–100
  - missingSkills = skills/technologies EXPLICITLY required or strongly preferred in the JD that are ABSENT from the resume. Max 8 items. Be specific (e.g. "Kubernetes", not "DevOps tools").
  - experienceGap = 1–2 blunt sentences referencing SPECIFIC projects from the resume and whether their complexity matches the seniority level of the target role.

RULES:
- Do NOT hallucinate or invent credentials. Only analyse what is in the resume.
- strengths and improvements must be role-specific, not generic advice.
- summary must reference the target role by name if provided.
- missingSkills must only list things the JD explicitly requires — do not guess.

Return ONLY valid JSON, no markdown, no explanation:
{
  "semanticScore": <number 0–30>,
  "matchScore": <number 0–100>,
  "keywordMatchRate": <number 0–100>,
  "missingSkills": ["skill1", "skill2"],
  "experienceGap": "1–2 blunt sentences about seniority/complexity alignment.",
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
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices?.[0]?.message?.content;
}


// ─────────────────────────────────────────────────────────────────────────────
// TAILOR RESUME — your original, unchanged
// ─────────────────────────────────────────────────────────────────────────────
export async function tailorResume(resumeText, jobDescription) {
  const prompt = `
You are an expert Executive Resume Writer.
Rewrite the BASE RESUME to align with the TARGET JOB DESCRIPTION.

RULES:
1. DO NOT invent new jobs, degrees, or fake metrics. Only enhance what exists.
2. Rewrite the Professional Summary using keywords from the Job Description.
3. Rewrite project/experience bullets using the STAR method, emphasising JD-relevant skills.
4. Prioritise skills from the JD in the skills section.

Return ONLY valid JSON, no markdown:
{
  "tailoredSummary": "2–3 sentence optimised professional summary.",
  "tailoredSkills": ["Skill1", "Skill2", "Skill3"],
  "tailoredExperience": [
    {
      "title": "Project or Role Name",
      "bullets": ["Optimised bullet 1", "Optimised bullet 2"]
    }
  ]
}

TARGET JOB DESCRIPTION:
${jobDescription}

BASE RESUME:
${resumeText}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices?.[0]?.message?.content;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE LATEX WITH AI
// Merges the candidate's full raw resume with AI-tailored suggestions
// and outputs a single, complete, Overleaf-ready .tex file.
// Replace generateLatexWithAI in aiAnalyzer.js with this.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateLatexWithAI(resumeText, tailoredData) {
  const tailoredJSON = JSON.stringify(tailoredData, null, 2);

  const prompt = `
You are a LaTeX expert. Your job is to merge a candidate's existing resume with AI-improved content and produce a single, complete, compile-ready LaTeX file.

You are given two inputs:
1. FULL RESUME TEXT — the complete text extracted from the candidate's uploaded PDF. This is the ground truth. Every fact (name, contact info, education, companies, dates, project names, awards, achievements, links) comes from here.
2. AI TAILORED CONTENT — JSON containing an improved summary, improved skill list, and improved bullets for experience/projects. These are replacements for the relevant parts only.

YOUR TASK:
Produce a LaTeX resume that:
- Takes ALL structural facts from the FULL RESUME TEXT (name, phone, email, LinkedIn, GitHub, portfolio, education with GPA and coursework, company names, job titles, dates, project names, tech stacks, awards, achievements, rankings, LeetCode stats, certifications — everything)
- Replaces the professional summary with tailoredSummary from the JSON
- Replaces the skills section with tailoredSkills from the JSON
- For each experience/project entry, finds the matching entry in tailoredExperience by name and replaces its bullets. If no match is found, keep the original bullets from the resume text.
- Keeps every section that exists in the original resume. If the resume has awards, include awards. If it has achievements, include them. If it has links, include them.
- Does NOT invent any new facts, companies, projects, or credentials.

LATEX REQUIREMENTS:
- Use this exact preamble (do not add or remove anything):

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
\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]
\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
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

- NEVER include \\input{glyphtounicode} or \\pdfgentounicode — these cause compile failures.
- Heading: centre the name as \\textbf{\\Huge \\scshape NAME}, then one line of contacts separated by $|$. Wrap every URL with \\href{}.
- Sections: use \\section{} for each section heading.
- Experience entries: \\resumeSubheading{Company}{Location}{Title}{Dates} then \\resumeItemListStart ... \\resumeItemListEnd
- Project entries: \\resumeProjectHeading{\\textbf{Name} $|$ \\emph{\\small{Stack}}}{Dates} then \\resumeItemListStart ... \\resumeItemListEnd
- Skills: \\resumeSubHeadingListStart with one \\item per category: \\textbf{Category:} item, item, item
- Awards / Achievements: \\resumeSubHeadingListStart with one \\resumeItem per award/achievement
- Escape special characters in all user data: & → \\&, % → \\%, $ → \\$, # → \\#, _ → \\_, { → \\{, } → \\}
- Use -- for date ranges.
- Output ONLY the raw LaTeX. No markdown code fences, no explanation text before \\documentclass.

═══════════════════════════════
FULL RESUME TEXT:
═══════════════════════════════
${resumeText}

═══════════════════════════════
AI TAILORED CONTENT (JSON):
═══════════════════════════════
${tailoredJSON}
`;

  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    temperature: 0.1,
    max_tokens:  4096,
    messages:    [{ role: 'user', content: prompt }],
  });

  const raw = completion.choices?.[0]?.message?.content ?? '';

  // Strip any accidental markdown fences
  return raw
    .replace(/^```(?:latex|tex)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}