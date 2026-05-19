import { scoreBullet } from "./rankBullets.js";
import { deduplicateResumeContent } from "./deduplicateResumeContent.js";

/**
 * Calculates a content preservation score between 0 and 100.
 * Measures how much original high-value detail, sections, metrics, 
 * and technical depth survived after tailoring and compression.
 */
export function calculatePreservationScore(original, tailored) {
  if (!original || !tailored) return 100;

  // 1. Section Survival (40% Weight)
  const sectionsToCheck = [
    "summary", "skills", "experience", "projects", "education", 
    "awards", "certifications", "achievements", "extracurricular", 
    "dsaProfiles", "languages"
  ];
  let origSectionCount = 0;
  let tailoredSectionCount = 0;

  sectionsToCheck.forEach(section => {
    const origVal = original[section];
    const tailVal = tailored[section];

    const origExists = origVal && (Array.isArray(origVal) ? origVal.length > 0 : String(origVal).trim().length > 0);
    const tailExists = tailVal && (Array.isArray(tailVal) ? tailVal.length > 0 : String(tailVal).trim().length > 0);

    if (origExists) {
      origSectionCount++;
      if (tailExists) {
        tailoredSectionCount++;
      }
    }
  });

  const sectionScore = origSectionCount > 0 ? (tailoredSectionCount / origSectionCount) * 100 : 100;

  // 2. Metrics & Numbers Survival (30% Weight)
  const metricRegex = /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\s*(?:K|M|B|users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?)\b/i;
  
  function countMetrics(obj) {
    let count = 0;
    const str = JSON.stringify(obj).toLowerCase();
    const matches = str.match(new RegExp(metricRegex, "g"));
    if (matches) count = matches.length;
    return count;
  }

  const origMetrics = countMetrics(original);
  const tailMetrics = countMetrics(tailored);
  const metricsScore = origMetrics > 0 ? Math.min((tailMetrics / origMetrics) * 100, 100) : 100;

  // 3. Technical Specificity / Word Count Density Survival (30% Weight)
  // Extract all single words matching tech keyword lists to check presence
  const techKeywords = [
    "react", "vue", "angular", "tailwind", "css", "html", "typescript", "javascript",
    "python", "java", "spring", "c++", "golang", "node", "express", "sql", "postgresql",
    "mongodb", "redis", "kafka", "rabbitmq", "aws", "gcp", "azure", "docker", 
    "kubernetes", "ci/cd", "microservice", "distributed", "auth", "jwt"
  ];

  function countTechKeywords(obj) {
    let count = 0;
    const str = JSON.stringify(obj).toLowerCase();
    techKeywords.forEach(kw => {
      if (str.includes(kw)) count++;
    });
    return count;
  }

  const origTech = countTechKeywords(original);
  const tailTech = countTechKeywords(tailored);
  const techScore = origTech > 0 ? Math.min((tailTech / origTech) * 100, 100) : 100;

  // Combine scores
  const finalScore = Math.round((sectionScore * 0.40) + (metricsScore * 0.30) + (techScore * 0.30));
  return finalScore;
}

/**
 * Intelligent Section-Aware Trimming Engine.
 * Intelligently compresses a resume to fit page layout rules (Task 1 & 11)
 * without dropping high-value bullet points or entire sections.
 */
export function sectionAwareTrimming(resume, originalResume = null, role = "general") {
  if (!resume || typeof resume !== "object") return resume;

  // STEP 1 & 3: Keep ALL sections populated and run deduplication first
  let processed = deduplicateResumeContent(resume);

  // STEP 2: Compress verbosity - Trim individual experience/project bullets to max 30 words
  const maxWords = 30;

  function trimBulletVerbosity(bullet) {
    if (!bullet || typeof bullet !== "string") return bullet;
    const words = bullet.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return bullet;

    // Smart compression: take the first 30 words and add a clean concluding period
    return words.slice(0, maxWords).join(" ").replace(/[;,]+$/, "") + ".";
  }

  if (Array.isArray(processed.experience)) {
    processed.experience = processed.experience.map(exp => {
      if (exp && Array.isArray(exp.bullets)) {
        exp.bullets = exp.bullets.map(b => trimBulletVerbosity(b));
      }
      return exp;
    });
  }

  if (Array.isArray(processed.projects)) {
    processed.projects = processed.projects.map(proj => {
      if (proj && Array.isArray(proj.bullets)) {
        proj.bullets = proj.bullets.map(b => trimBulletVerbosity(b));
      }
      return proj;
    });
  }

  // STEP 4: Spacing-sensitive smart bullet ranking & trimming
  // If the total layout elements exceed generous limits, trim the weakest bullets first
  
  // Enforce bullet counts: keeps at least 2 bullets per job/project, trims excess based on scores
  if (Array.isArray(processed.experience)) {
    processed.experience = processed.experience.map(exp => {
      if (exp && Array.isArray(exp.bullets) && exp.bullets.length > 3) {
        // Sort bullets by technical score (keep highest)
        const scored = exp.bullets.map(b => ({
          text: b,
          score: scoreBullet(b, role)
        }));
        
        // Retain top 3, maintaining chronological array order
        const topScored = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(item => item.text);

        // Map back in correct relative order
        exp.bullets = exp.bullets.filter(b => topScored.includes(b));
      }
      return exp;
    });
  }

  if (Array.isArray(processed.projects)) {
    processed.projects = processed.projects.map(proj => {
      if (proj && Array.isArray(proj.bullets) && proj.bullets.length > 3) {
        const scored = proj.bullets.map(b => ({
          text: b,
          score: scoreBullet(b, role)
        }));
        
        const topScored = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(item => item.text);

        proj.bullets = proj.bullets.filter(b => topScored.includes(b));
      }
      return proj;
    });
  }

  // Enforce minimum project threshold (preserve at least 2 projects, Task 6)
  if (Array.isArray(processed.projects) && processed.projects.length < 2 && originalResume && Array.isArray(originalResume.projects)) {
    const missingCount = 2 - processed.projects.length;
    const addedProjects = originalResume.projects
      .filter(p => !processed.projects.some(ep => ep.title === p.title))
      .slice(0, missingCount);
    processed.projects = [...processed.projects, ...addedProjects];
  }

  // STEP 5: Low-value content removal as absolute last resort
  // Calculate final preservation metrics
  if (originalResume) {
    processed.preservationScore = calculatePreservationScore(originalResume, processed);
  } else {
    processed.preservationScore = 100;
  }

  return processed;
}
