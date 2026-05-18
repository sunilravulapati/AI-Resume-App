/**
 * Escapes LaTeX special characters in a string.
 * Handles all standard LaTeX reserved characters safely.
 */
export function escapeLatex(str = "") {
  return String(str)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Recursively escapes all string values in an object/array.
 * Skips keys listed in skipKeys (used for URL fields that go inside \\href{}).
 */
export function escapeLatexDeep(obj, skipKeys = []) {
  if (typeof obj === "string") return escapeLatex(obj);
  if (Array.isArray(obj)) return obj.map((item) => escapeLatexDeep(item, skipKeys));
  if (obj && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = skipKeys.includes(key) ? value : escapeLatexDeep(value, skipKeys);
    }
    return result;
  }
  return obj;
}
