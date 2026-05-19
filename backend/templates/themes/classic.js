/**
 * Classic theme — Computer Modern (lmodern), black dividers, clean modern feel.
 *
 * REMOVED \scshape — it caused ugly letter-spaced section titles like
 * "P RO F E S S I O N A L S U M M A RY" with lmodern small-caps.
 * Replaced with \bfseries for clean, naturally-styled bold headers.
 */
export default {
  name: "classic",
  fontPackages: "\\usepackage{lmodern}",
  fontDefault: "",
  accentColor: "black",
  sectionFormat: [
    "\\titleformat{\\section}{",
    "  \\vspace{-4pt}\\bfseries\\raggedright\\large",
    "}{}{0em}{}[\\color{black}\\titlerule\\vspace{-4pt}]",
  ].join("\n"),
};
