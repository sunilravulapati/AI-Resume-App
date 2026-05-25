const themesBase = {
  classic: {
    fontPackage: "\\usepackage{lmodern}",
    dividerColor: "black",
    dividerThickness: "0.35pt",
    bulletSymbol: "\\bullet"
  },

  modern: {
    fontPackage:
      "\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}",
    dividerColor: "accentNav",
    dividerThickness: "0.45pt",
    bulletSymbol: "\\bullet"
  },

  elegant: {
    fontPackage: "\\usepackage{charter}",
    dividerColor: "accentElg",
    dividerThickness: "0.35pt",
    bulletSymbol: "\\bullet"
  }
};


/**
 * SPACIOUS
 * Used for resumes with less content.
 * Expands layout naturally to fill page.
 */
const spaciousPreset = {
  baseFontSize: "11pt",

  lineStretch: "1.05",
  arrayStretch: "1.10",

  sectionSpacingBefore: "8pt",
  sectionSpacingAfter: "3pt",

  itemSpacing: "4pt",
  bulletSpacing: "2pt",

  headerSpacing: "4pt",

  bulletSize: "\\small",
  metaSize: "\\small",
  skillsSize: "\\small"
};


/**
 * MODERATE
 * Default balanced layout.
 * Best for most resumes.
 */
const moderatePreset = {
  baseFontSize: "11pt",

  lineStretch: "1.02",
  arrayStretch: "1.02",

  sectionSpacingBefore: "6pt",
  sectionSpacingAfter: "2pt",

  itemSpacing: "3pt",
  bulletSpacing: "1.5pt",

  headerSpacing: "3pt",

  bulletSize: "\\small",
  metaSize: "\\small",
  skillsSize: "\\small"
};


/**
 * COMPACT
 * Used ONLY for dense resumes.
 * Keeps one-page layout stable without over-compressing.
 */
const compactPreset = {
  baseFontSize: "10pt",

  lineStretch: "1.00",
  arrayStretch: "1.00",

  sectionSpacingBefore: "5pt",
  sectionSpacingAfter: "2pt",

  itemSpacing: "2pt",
  bulletSpacing: "1pt",

  headerSpacing: "2pt",

  bulletSize: "\\small",
  metaSize: "\\small",
  skillsSize: "\\small"
};

/**
 * Calculates total layout density from the tailored resume data structure.
 *
 * Uses weighted density scoring instead of raw line counts to provide a 
 * more accurate visual rhythm.
 */
export function countResumeElements(data) {
  if (!data) return 0;
  let count = 0;

  // Summary block counts as 2
  const summary = data.tailoredSummary || data.summary || "";
  if (summary.trim().length > 0) count += 2;

  // Each skill row is ~0.8 lines
  const skills = data.tailoredSkills || data.skills || [];
  if (Array.isArray(skills)) count += skills.length * 0.8;

  // Experience & projects: header is ~1, bullets are ~0.7
  const experience = data.tailoredExperience || data.experience || [];
  if (Array.isArray(experience)) {
    experience.forEach((exp) => {
      if (!exp) return;
      count += 1; // title + tech/meta line (compressed)
      if (Array.isArray(exp.bullets)) count += exp.bullets.length * 0.7;
    });
  }

  const projects = data.projects || [];
  if (Array.isArray(projects)) {
    projects.forEach((proj) => {
      if (!proj) return;
      count += 1; // title + tech/meta line (compressed)
      if (Array.isArray(proj.bullets)) count += proj.bullets.length * 0.7;
    });
  }

  // Each education entry counts as 1 line weight 
  if (Array.isArray(data.education)) count += data.education.length * 1;

  // Awards, certifications
  if (Array.isArray(data.awards)) count += data.awards.length * 0.8;
  if (Array.isArray(data.certifications)) count += data.certifications.length * 0.6;

  // Extracurricular: 0.8 header + its bullets
  if (Array.isArray(data.extracurricular)) {
    data.extracurricular.forEach((ex) => {
      if (!ex) return;
      count += 0.8;
      if (Array.isArray(ex.bullets)) count += ex.bullets.length * 0.7;
    });
  }

  // Achievements: 0.8 category header + its bullets
  if (Array.isArray(data.achievements)) {
    data.achievements.forEach((a) => {
      if (!a) return;
      count += 0.8;
      if (Array.isArray(a.bullets)) count += a.bullets.length * 0.7;
    });
  }

  // DSA proficiency lines
  if (Array.isArray(data.dsaProficiency)) count += data.dsaProficiency.length * 0.7;

  return count;
}

/**
 * Resolves the perfectly balanced design system tokens based on content density.
 */
export function getDesignTokens(themeName = "classic", totalElements = 0) {
  const base = themesBase[themeName] || themesBase.classic;

  let preset;
  if (totalElements <= 18) {
    // Very sparse resume — use generous spacing to avoid a half-empty page
    preset = spaciousPreset;
  } else if (totalElements <= 38) {
    // Medium-density resume — balanced spacing
    preset = moderatePreset;
  } else {
    // Dense resume — compact to fit everything on one page without being unreadable
    preset = compactPreset;
  }

  return {
    ...base,
    ...preset,
    nameSize: "\\Huge",
    taglineSize: "\\large",
    sectionHeaderSize: "\\large",
    titleSize: "\\textbf"
  };
}

// Keep default export for backwards compatibility
export default {
  classic: { ...themesBase.classic, ...spaciousPreset },
  modern: { ...themesBase.modern, ...spaciousPreset },
  elegant: { ...themesBase.elegant, ...spaciousPreset }
};