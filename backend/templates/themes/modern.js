/**
 * Modern theme — Helvetica (helvet), navy accent color, bold section headers.
 */
export default {
  name: "modern",
  fontPackages: [
    "\\usepackage{helvet}",
    "\\renewcommand{\\familydefault}{\\sfdefault}",
  ].join("\n"),
  fontDefault: "",
  accentColor: "004c99",
  sectionSetup: "\\definecolor{resumeSectionRule}{HTML}{004c99}",
  sectionRuleColor: "resumeSectionRule",
  sectionTitleStyle:
    "\\bfseries\\raggedright\\large\\color{resumeSectionRule}",
};
