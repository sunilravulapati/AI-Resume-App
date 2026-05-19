import { normalizeBasicsLinks } from "../utils/normalizeLinks.js";
import { validateResumeData } from "../utils/validateResumeData.js";
import { shouldKeepRewrittenBullet } from "../utils/compareResumeQuality.js";
import { sectionAwareTrimming } from "../utils/sectionAwareTrimming.js";

/**
 * Counts words in a string.
 */
function wordCount(str = "") {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extracts distinct lowercase keywords from a job description to score keyword alignments.
 */
function getJDKeywords(jd = "") {
  return jd.toLowerCase()
    .split(/[^a-z0-9+#\-]+/)
    .filter(w => w.length > 1);
}

/**
 * Dynamically detects the target role category based on keywords inside the JD (Task 8).
 */
function detectTargetRole(jd = "") {
  const lower = jd.toLowerCase();
  if (/machine learning|deep learning|nlp|vision|pytorch|tensorflow|data scientist|analytics|model|ai\b/i.test(lower)) {
    return "ai";
  }
  if (/react|vue|angular|frontend|ui|ux|css|html|client|browser/i.test(lower)) {
    return "frontend";
  }
  if (/backend|database|sql|postgres|api|redis|kafka|server|microservice/i.test(lower)) {
    return "backend";
  }
  return "general";
}

/**
 * Helper to compute similarities between titles/companies for matching.
 */
function isMatch(nameA = "", nameB = "") {
  const clean = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean(nameA) === clean(nameB) || clean(nameA).includes(clean(nameB)) || clean(nameB).includes(clean(nameA));
}

/**
 * Core Intelligent Merge and Content Preservation Engine (Task 2 & 13).
 * Combines original parsed canonical resume with AI tailored patches.
 */
export function mergeTailoredResume(original, patches = {}, jobDescription = "") {
  // Start with a deep clone of the original canonical resume
  const merged = JSON.parse(JSON.stringify(original));

  const role = detectTargetRole(jobDescription);
  const jdKeywords = getJDKeywords(jobDescription);

  // ── 1. Contact & Link Preservation (Task 2 & 12) ──
  merged.basics = normalizeBasicsLinks(merged.basics || {});

  // ── 2. Summary Generation (Task 10) ──
  if (patches.summary && patches.summary.trim()) {
    merged.summary = patches.summary.trim();
  }

  // ── 3. Skills Optimization (Task 8) ──
  // Reorder skills to front-load matching JD technologies without losing other technical depth
  if (Array.isArray(patches.skills) && patches.skills.length > 0) {
    const originalSkillSet = new Set(
      (original.skills || [])
        .flatMap(cat => cat.value.split(","))
        .map(s => s.trim().toLowerCase())
    );

    merged.skills = patches.skills.map(cat => {
      // Keep only skills actually present in original to prevent LLM hallucinations
      const filteredValue = cat.value
        .split(",")
        .map(s => s.trim())
        .filter(s => originalSkillSet.has(s.toLowerCase()))
        .join(", ");
      
      return {
        label: cat.label.trim(),
        value: filteredValue || cat.value
      };
    }).filter(cat => cat.value.length > 0);
  }

  // ── 4. Experience Bullets Optimization (Task 2, 6, 9) ──
  if (Array.isArray(patches.experience) && patches.experience.length > 0) {
    merged.experience = merged.experience.map(originalRole => {
      const patchRole = patches.experience.find(p => 
        isMatch(p.title, originalRole.title) || 
        (p.company && isMatch(p.company, originalRole.company))
      );

      if (patchRole && Array.isArray(patchRole.bullets) && patchRole.bullets.length > 0) {
        // Compare rewritten bullets against original bullets using content quality comparator!
        const mergedBullets = originalRole.bullets.map((origBullet, idx) => {
          const rewBullet = patchRole.bullets[idx];
          if (shouldKeepRewrittenBullet(origBullet, rewBullet, role, jdKeywords)) {
            return rewBullet;
          }
          return origBullet; // Fallback to strong original bullet (retains metrics/tech depth)
        });

        return {
          ...originalRole,
          bullets: mergedBullets
        };
      }
      return originalRole;
    });
  }

  // ── 5. Project Bullets Optimization (Task 2, 6, 9) ──
  if (Array.isArray(patches.projects) && patches.projects.length > 0) {
    merged.projects = merged.projects.map(originalProject => {
      const patchProj = patches.projects.find(p => isMatch(p.title, originalProject.title));

      if (patchProj && Array.isArray(patchProj.bullets) && patchProj.bullets.length > 0) {
        const mergedBullets = originalProject.bullets.map((origBullet, idx) => {
          const rewBullet = patchProj.bullets[idx];
          if (shouldKeepRewrittenBullet(origBullet, rewBullet, role, jdKeywords)) {
            return rewBullet;
          }
          return origBullet;
        });

        return {
          ...originalProject,
          bullets: mergedBullets
        };
      }
      return originalProject;
    });
  }

  // ── 6. Section Presence Guards & Untouched Sections (Task 5, 7) ──
  // Intelligently merge awards/achievements metadata (preserve winner status, rank, organization)
  if (Array.isArray(patches.awards) && patches.awards.length > 0) {
    merged.awards = merged.awards.map(originalAward => {
      const patchAward = patches.awards.find(a => isMatch(a.title, originalAward.title));
      if (patchAward) {
        return {
          ...originalAward,
          // Enhance title/desc only if patch contains better ATS alignment, else keep verbatim
          title: originalAward.title.length >= patchAward.title.length ? originalAward.title : patchAward.title,
          desc: originalAward.desc.length >= patchAward.desc.length ? originalAward.desc : patchAward.desc
        };
      }
      return originalAward;
    });
  }

  // Extracurricular activity bullet optimization with fallback
  if (Array.isArray(patches.extracurricular) && patches.extracurricular.length > 0) {
    merged.extracurricular = merged.extracurricular.map(originalExtra => {
      const patchExtra = patches.extracurricular.find(e => isMatch(e.role || e.title, originalExtra.role || originalExtra.title));
      if (patchExtra && Array.isArray(patchExtra.bullets)) {
        const mergedBullets = originalExtra.bullets.map((origBullet, idx) => {
          const rewBullet = patchExtra.bullets[idx];
          return shouldKeepRewrittenBullet(origBullet, rewBullet, role, jdKeywords) ? rewBullet : origBullet;
        });
        return {
          ...originalExtra,
          bullets: mergedBullets
        };
      }
      return originalExtra;
    });
  }

  // ── 7. Page-Aware Compression and Section-Aware Trimming Engine (Task 1, 11) ──
  const trimmed = sectionAwareTrimming(merged, original, role);

  // ── 8. Enforce clean limits and structure validation (Task 12) ──
  const validated = validateResumeData(trimmed);

  // ── 9. Resume Diff Engine ──
  const diffs = generateDiffReport(original, validated);
  validated.diffReport = diffs;

  return validated;
}

/**
 * Generates an internal report comparing original vs tailored resumes to safeguard quality.
 */
function generateDiffReport(original, tailored) {
  const report = {
    summaryOptimized: original.summary !== tailored.summary,
    skillsReordered: original.skills?.length !== tailored.skills?.length || 
      JSON.stringify(original.skills) !== JSON.stringify(tailored.skills),
    rewrittenBulletsCount: 0,
    preservedSections: [],
    trimmedBulletsCount: 0,
    preservationScore: tailored.preservationScore || 100
  };

  // Track rewritten experience bullets
  tailored.experience.forEach(tExp => {
    const oExp = original.experience?.find(e => isMatch(e.title, tExp.title));
    if (oExp) {
      tExp.bullets.forEach((bullet, idx) => {
        const originalBullet = oExp.bullets?.[idx];
        if (originalBullet && originalBullet !== bullet) {
          report.rewrittenBulletsCount++;
          if (wordCount(originalBullet) > 30 && wordCount(bullet) <= 30) {
            report.trimmedBulletsCount++;
          }
        }
      });
    }
  });

  // Track rewritten project bullets
  tailored.projects.forEach(tProj => {
    const oProj = original.projects?.find(p => isMatch(p.title, tProj.title));
    if (oProj) {
      tProj.bullets.forEach((bullet, idx) => {
        const originalBullet = oProj.bullets?.[idx];
        if (originalBullet && originalBullet !== bullet) {
          report.rewrittenBulletsCount++;
          if (wordCount(originalBullet) > 30 && wordCount(bullet) <= 30) {
            report.trimmedBulletsCount++;
          }
        }
      });
    }
  });

  // Track preserved sections
  const sectionsToCheck = [
    { key: "education", name: "Education" },
    { key: "awards", name: "Awards" },
    { key: "certifications", name: "Certifications" },
    { key: "dsaProfiles", name: "DSA Profiles" },
    { key: "extracurricular", name: "Extracurriculars" },
    { key: "languages", name: "Languages" }
  ];

  sectionsToCheck.forEach(sec => {
    const origLen = Array.isArray(original[sec.key]) ? original[sec.key].length : (original[sec.key] ? 1 : 0);
    const tailLen = Array.isArray(tailored[sec.key]) ? tailored[sec.key].length : (tailored[sec.key] ? 1 : 0);
    if (origLen > 0 && tailLen > 0) {
      report.preservedSections.push(sec.name);
    }
  });

  return report;
}
