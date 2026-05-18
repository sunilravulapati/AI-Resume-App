// scorer.js — Calibrated and Rigorous ATS Scoring Engine

/* ------------------------------ */
/* Structure Score (max 20)       */
/* ------------------------------ */
export function structureScore(text) {
  const sections = ["education", "skills", "projects", "experience", "certifications", "achievements"];
  let found = 0;
  sections.forEach((s) => {
    if (new RegExp(`\\b${s}\\b`, "i").test(text)) found++;
  });
  
  // Strict structure check: 3 sections = 8pts, each extra section = +2, hard cap at 20
  if (found <= 3) return found * 2.5;
  return Math.min(7.5 + (found - 3) * 2.5, 20);
}

/* ------------------------------ */
/* Impact Score (max 20)          */
/* ------------------------------ */
export function impactScore(text) {
  // Quantitative metrics check: looks for percentage signs or numbers related to outcomes
  const impactRegex = /\b\d+(\.\d+)?%|\b\d+\+?\s*(users?|customers?|clients?|requests?|ms|seconds?|hours?|days?|latency|accuracy|reduction|increase|growth|improvement)\b/gi;
  const matches = text.match(impactRegex);
  if (!matches) return 0;
  
  const count = new Set(matches).size;
  // Scaled strictly to deflate scores: requires 8+ distinct metrics to hit near-perfect score
  if (count <= 2) return count * 3; // max 6
  if (count <= 5) return 6 + (count - 2) * 2.5; // max 13.5
  if (count <= 8) return 13.5 + (count - 5) * 1.5; // max 18
  return Math.min(18 + (count - 8) * 0.5, 20);
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
  // Calibrated alignment: requires wider set of foundational skills to scale high
  if (count <= 4) return count * 2; // max 8
  if (count <= 8) return 8 + (count - 4) * 2; // max 16
  return Math.min(16 + (count - 8) * 0.8, 20);
}

/* ------------------------------ */
/* Realism Penalty (calibrated)   */
/* ------------------------------ */
export function realismPenalty(text) {
  let penalty = 0;

  const isStudent = /expected|ongoing|pursuing/i.test(text);
  const hasWork = /(intern|software engineer|developer|analyst|backend|frontend)/i.test(text);
  const wordCount = text.split(/\s+/).length;

  // Student or entry-level profiles are marked strictly against senior roles
  if (isStudent) penalty += 8;
  if (!hasWork) penalty += 12;

  // Hard penalty for zero percentages or numerical metrics in the entire resume
  if (!text.includes("%") && !/percent|latency|reduction/i.test(text)) {
    penalty += 8;
  }

  // Thin resume text caps
  if (wordCount < 200) penalty += 15;
  else if (wordCount < 350) penalty += 7;

  return penalty;
}

/* ------------------------------ */
/* Programmatic Score (max 50)    */
/* ------------------------------ */
export function calculateProgrammaticScore(text) {
  const rawStructure  = structureScore(text);       // 0–20
  const rawImpact     = impactScore(text);           // 0–20
  const rawSkills     = skillAlignmentScore(text);   // 0–20
  const penalty       = realismPenalty(text);        // 0–43

  // Subtraction with calibrated penalty scaling, mapped to 50
  const raw = rawStructure + rawImpact + rawSkills - penalty;
  const clamped = Math.max(0, raw);                  
  return Math.round((clamped / 60) * 50);            
}

/* ------------------------------ */
/* Final Score Combiner           */
/* ------------------------------ */
export function calculateFinalScore(programmaticScore, semanticScore) {
  // programmaticScore is 0-50
  // semanticScore comes from AI as 0-30; scale to 45 (max 95)
  const scaledSemantic = Math.round((semanticScore / 30) * 45);
  
  // Total naturally sums up to 95; no free base points to avoid score inflation
  const total = programmaticScore + scaledSemantic;
  return Math.min(total, 100);
}