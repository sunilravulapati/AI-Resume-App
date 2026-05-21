/**
 * Elegant theme — Charter serif, italic section headers, refined dividers.
 */
export default {
  name: "elegant",
  fontPackages: "\\usepackage{charter}",
  fontDefault: "",
  accentColor: "333333",
  sectionSetup: "\\definecolor{resumeSectionRule}{HTML}{333333}",
  sectionRuleColor: "resumeSectionRule",
  sectionTitleStyle:
    "\\itshape\\bfseries\\raggedright\\large\\color{resumeSectionRule}",
};
