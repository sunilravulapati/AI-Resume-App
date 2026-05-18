/**
 * Elegant theme — Charter serif, italic section headers, refined dividers.
 */
export default {
  name: "elegant",
  fontPackages: "\\usepackage{charter}",
  fontDefault: "",
  accentColor: "333333",
  sectionFormat: [
    "\\definecolor{accentElg}{HTML}{333333}",
    "\\titleformat{\\section}{",
    "  \\vspace{-4pt}\\itshape\\bfseries\\raggedright\\large\\color{accentElg}",
    "}{}{0em}{}[\\color{accentElg}\\titlerule\\vspace{-4pt}]",
  ].join("\n"),
};
