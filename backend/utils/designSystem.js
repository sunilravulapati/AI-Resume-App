/**
 * Premium Recruiter-First Resume PDF Design System with Adaptive Layouts.
 * Implements Task 1, 2, 3, 4, 5, 6, 7, 8, 9, and 10.
 * Dynamically scales base font sizes, line heights, tabular spacing,
 * and section rhythms, ensuring visual page-balance for all resume lengths.
 */

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

  lineStretch: "1.14",
  arrayStretch: "1.16",

  sectionSpacingBefore: "14pt",
  sectionSpacingAfter: "6pt",

  itemSpacing: "8pt",
  bulletSpacing: "2.5pt",

  headerSpacing: "10pt",

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
  baseFontSize: "10pt",

  lineStretch: "1.04",
  arrayStretch: "1.06",

  sectionSpacingBefore: "9pt",
  sectionSpacingAfter: "3pt",

  itemSpacing: "3.5pt",
  bulletSpacing: "1.0pt",

  headerSpacing: "5pt",

  bulletSize: "\\small",
  metaSize: "\\footnotesize",
  skillsSize: "\\small"
};


/**
 * COMPACT
 * Used ONLY for dense resumes.
 * Keeps one-page layout stable.
 */
const compactPreset = {
  baseFontSize: "10pt",

  lineStretch: "0.99",
  arrayStretch: "1.00",

  sectionSpacingBefore: "6pt",
  sectionSpacingAfter: "1.5pt",

  itemSpacing: "1.5pt",
  bulletSpacing: "0.3pt",

  headerSpacing: "1.5pt",

  bulletSize: "\\footnotesize",
  metaSize: "\\scriptsize",
  skillsSize: "\\footnotesize"
};

/**
 * Calculates total layout density from the tailored resume data structure.
 *
 * FIX: Was referencing raw field names (data.summary, data.skills,
 * data.experience, data.projects) which never exist on the tailored data
 * object — the correct names are data.tailoredSummary, data.tailoredSkills,
 * and data.tailoredExperience (projects are merged into tailoredExperience).
 * This caused countResumeElements to always return 0, forcing every resume
 * into spaciousPreset regardless of actual content density.
 */
export function countResumeElements(data) {
  if (!data) return 0;
  let count = 0;

  // Summary block counts as 2 lines
  const summary = data.tailoredSummary || data.summary || "";
  if (summary.trim().length > 0) count += 2;

  // Each skill row is one line
  const skills = data.tailoredSkills || data.skills || [];
  if (Array.isArray(skills)) count += skills.length;

  // Experience & projects are merged or separate; each entry has 2 header lines + its bullets
  const experience = data.tailoredExperience || data.experience || [];
  if (Array.isArray(experience)) {
    experience.forEach((exp) => {
      if (!exp) return;
      count += 2; // title + tech/meta line
      if (Array.isArray(exp.bullets)) count += exp.bullets.length;
    });
  }

  const projects = data.projects || [];
  if (Array.isArray(projects)) {
    projects.forEach((proj) => {
      if (!proj) return;
      count += 2; // title + tech/meta line
      if (Array.isArray(proj.bullets)) count += proj.bullets.length;
    });
  }

  // Each education entry counts as 2 lines (institution + degree/date)
  if (Array.isArray(data.education)) count += data.education.length * 2;

  // Awards, certifications — one line each
  if (Array.isArray(data.awards)) count += data.awards.length;
  if (Array.isArray(data.certifications)) count += data.certifications.length;

  // Extracurricular: 1 header line + its bullets
  if (Array.isArray(data.extracurricular)) {
    data.extracurricular.forEach((ex) => {
      if (!ex) return;
      count += 1;
      if (Array.isArray(ex.bullets)) count += ex.bullets.length;
    });
  }

  // Achievements: 1 category header + its bullets
  if (Array.isArray(data.achievements)) {
    data.achievements.forEach((a) => {
      if (!a) return;
      count += 1;
      if (Array.isArray(a.bullets)) count += a.bullets.length;
    });
  }

  // DSA proficiency lines
  if (Array.isArray(data.dsaProficiency)) count += data.dsaProficiency.length;

  return count;
}

/**
 * Resolves the perfectly balanced design system tokens based on content density.
 *
 * FIX: Raised the moderate threshold from 22 → 26 so that a typical
 * entry-level resume (3 projects, 5 skill rows, 1 education, a few awards)
 * lands in moderatePreset rather than compactPreset, preventing text from
 * appearing overly tight for low-to-medium content volumes.
 */
export function getDesignTokens(themeName = "classic", totalElements = 0) {
  const base = themesBase[themeName] || themesBase.classic;

  let preset;
  if (totalElements <= 14) {
    // Very sparse resume — use generous spacing to avoid a half-empty page
    preset = spaciousPreset;
  } else if (totalElements <= 26) {
    // Medium-density resume — balanced spacing
    preset = moderatePreset;
  } else {
    // Dense resume — compact to fit everything on one page
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