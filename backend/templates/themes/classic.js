/**
 * Classic theme — Computer Modern (lmodern), black dividers, traditional academic feel.
 */
export default {
  name: "classic",
  fontPackages: "\\usepackage{lmodern}",
  fontDefault: "",
  accentColor: "black",
  sectionFormat: [
    "\\titleformat{\\section}{",
    "  \\vspace{-4pt}\\scshape\\raggedright\\large",
    "}{}{0em}{}[\\color{black}\\titlerule\\vspace{-4pt}]",
  ].join("\n"),
};
