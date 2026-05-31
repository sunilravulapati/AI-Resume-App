const LIMITS = {
  MAX_SUMMARY_CHARS: 400,
  MAX_EXPERIENCES: 5,
  MAX_PROJECTS: 4,
  MAX_BULLETS_PER_EXP: 3,
  MAX_BULLETS_PER_PROJECT: 3,
  MAX_SKILL_ROWS: 8,
  MAX_EDUCATION: 2,
  MAX_AWARDS: 4,
  MAX_CERTIFICATIONS: 3,
  MAX_DSA_LINES: 3,
  MAX_EXTRACURRICULAR: 2,
  MAX_EXTRA_BULLETS: 2,
};

export function validateResumeData(data) {
  if (!data || typeof data !== "object") return data;

  // Summary
  if (typeof data.summary === "string" && data.summary.length > LIMITS.MAX_SUMMARY_CHARS) {
    data.summary = data.summary.slice(0, LIMITS.MAX_SUMMARY_CHARS);
  }

  // Experience
  if (Array.isArray(data.experience)) {
    data.experience = data.experience.slice(0, LIMITS.MAX_EXPERIENCES);
    data.experience.forEach((exp) => {
      if (Array.isArray(exp.bullets)) {
        exp.bullets = exp.bullets.slice(0, LIMITS.MAX_BULLETS_PER_EXP);
      }
    });
  }

  // Projects
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.slice(0, LIMITS.MAX_PROJECTS);
    data.projects.forEach((proj) => {
      if (Array.isArray(proj.bullets)) {
        proj.bullets = proj.bullets.slice(0, LIMITS.MAX_BULLETS_PER_PROJECT);
      }
    });
  }

  // Skills
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.slice(0, LIMITS.MAX_SKILL_ROWS);
  }

  // Education
  if (Array.isArray(data.education)) {
    data.education = data.education.slice(0, LIMITS.MAX_EDUCATION);
  }

  // Awards
  if (Array.isArray(data.awards)) {
    data.awards = data.awards.slice(0, LIMITS.MAX_AWARDS);
  }

  // Certifications
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.slice(0, LIMITS.MAX_CERTIFICATIONS);
  }

  // DSA Proficiency
  if (Array.isArray(data.dsaProfiles)) {
    data.dsaProfiles = data.dsaProfiles.slice(0, LIMITS.MAX_DSA_LINES);
  }
  if (Array.isArray(data.dsaProficiency)) {
    data.dsaProficiency = data.dsaProficiency.slice(0, LIMITS.MAX_DSA_LINES);
  }

  // Extracurricular
  if (Array.isArray(data.extracurricular)) {
    data.extracurricular = data.extracurricular.slice(0, LIMITS.MAX_EXTRACURRICULAR);
    data.extracurricular.forEach((item) => {
      if (Array.isArray(item.bullets)) {
        item.bullets = item.bullets.slice(0, LIMITS.MAX_EXTRA_BULLETS);
      }
    });
  }

  return data;
}

export function evaluateResumeQuality(data) {
  if (!data || typeof data !== "object") return data;
  const warnings = [];

  const checkBullets = (sectionName, items) => {
    if (!Array.isArray(items)) return;
    const seenBullets = new Set();
    
    items.forEach(item => {
      if (!item) return;
      if (item.bullets && item.bullets.length === 0) {
        warnings.push(`Empty bullet list in ${sectionName}: ${item.title || item.company || 'Unknown'}`);
      }
      if (Array.isArray(item.bullets)) {
        item.bullets.forEach(b => {
          const wordCount = String(b).split(/\s+/).length;
          if (wordCount > 35) {
            warnings.push(`Excessively long bullet (>35 words) in ${sectionName}: "${String(b).substring(0, 30)}..."`);
          }
          const lower = String(b).toLowerCase().trim();
          if (seenBullets.has(lower)) {
            warnings.push(`Duplicate bullet in ${sectionName}: "${String(b).substring(0, 30)}..."`);
          }
          seenBullets.add(lower);
        });
      }
    });
  };

  checkBullets("experience", data.experience);
  checkBullets("projects", data.projects);
  checkBullets("extracurricular", data.extracurricular);

  data.qualityWarnings = warnings;
  return data;
}

export { LIMITS };
