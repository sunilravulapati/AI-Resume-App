// scorer.js — fixed version

/* ------------------------------ */
/* Structure Score (max 20)       */
/* ------------------------------ */
export function structureScore(text) {
  const sections = ["education", "skills", "projects", "experience", "certifications", "achievements"];
  let found = 0;
  sections.forEach((s) => {
    if (new RegExp(`\\b${s}\\b`, "i").test(text)) found++;
  });
  // 3 sections = 12pts, each extra section = +2, hard cap at 20
  if (found <= 3) return found * 4;
  return Math.min(12 + (found - 3) * 2, 20);
}

/* ------------------------------ */
/* Impact Score (max 20)          */
/* ------------------------------ */
export function impactScore(text) {
  const impactRegex = /\b\d+(\.\d+)?%|\b\d+\+?\s*(users?|customers?|clients?|requests?|ms|seconds?|hours?|days?|latency|accuracy|reduction|increase|growth|improvement)\b/gi;
  const matches = text.match(impactRegex);
  if (!matches) return 0;
  const count = new Set(matches).size;
  if (count === 1) return 6;
  if (count <= 3) return 6 + (count - 1) * 3;
  if (count <= 6) return 12 + (count - 3) * 2;
  return Math.min(18 + (count - 6), 20);
}

/* ------------------------------ */
/* Skill Alignment (max 20)       */
/* ------------------------------ */
export function skillAlignmentScore(text) {
  const skills = ["python", "java", "c++", "javascript", "react", "node", "mongodb", "aws", "docker", "fastapi", "sql", "nextjs", "tailwindcss", "kafka", "azure", "go"];
  const detected = new Set();
  skills.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) detected.add(skill);
  });
  const count = detected.size;
  if (count <= 4) return count * 3;
  if (count <= 8) return 12 + (count - 4) * 1.5;
  return Math.min(18 + (count - 8) * 0.5, 20);
}

/* ------------------------------ */
/* Realism Penalty (aggressive)   */
/* ------------------------------ */
export function realismPenalty(text) {
  let penalty = 0;

  const isStudent = /expected|ongoing|pursuing/i.test(text);
  const hasWork = /(intern|software engineer|developer|analyst|backend|frontend)/i.test(text);
  const wordCount = text.split(/\s+/).length;

  // Student with no real work experience is penalised hard
  if (isStudent) penalty += 8;
  if (!hasWork) penalty += 12;

  // Very short resume (< 200 words) = low effort
  if (wordCount < 200) penalty += 10;
  // Short resume (200–350 words) — still thin
  else if (wordCount < 350) penalty += 5;

  return penalty;
}

/* ------------------------------ */
/* Programmatic Score (max 50)    */
/* ------------------------------ */
export function calculateProgrammaticScore(text) {
  const rawStructure  = structureScore(text);       // 0–20
  const rawImpact     = impactScore(text);           // 0–20
  const rawSkills     = skillAlignmentScore(text);   // 0–20
  const penalty       = realismPenalty(text);        // 0–30

  // Raw sum is 0–60, subtract penalty, then scale down to 0–50
  const raw = rawStructure + rawImpact + rawSkills - penalty;
  const clamped = Math.max(0, raw);                  // never negative
  return Math.round((clamped / 60) * 50);            // scale to 50
}

/* ------------------------------ */
/* Final Score combiner           */
/* ------------------------------ */
export function calculateFinalScore(programmaticScore, semanticScore) {
  // programmaticScore is already 0–50
  // semanticScore comes from AI as 0–30, scale it to 0–40
  const scaledSemantic = Math.round((semanticScore / 30) * 40);

  const total = programmaticScore + scaledSemantic;  // 0–90 naturally
  // Add a flat 5pt "base" so perfect-zero resumes don't hit 0
  const withBase = Math.min(total + 5, 100);

  return withBase;
}