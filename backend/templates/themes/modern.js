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
  sectionFormat: [
    "\\definecolor{accentNav}{HTML}{004c99}",
    "\\titleformat{\\section}{",
    "  \\vspace{-4pt}\\bfseries\\raggedright\\large\\color{accentNav}",
    "}{}{0em}{}[\\color{accentNav}\\titlerule\\vspace{-4pt}]",
  ].join("\n"),
};
