/**
 * escapeLatex.js — Production-grade LaTeX escaping utilities.
 *
 * Exports:
 *   escapeLatex(str)            – full escaping for body text
 *   escapeLatexDeep(obj, skip)  – recursive deep escape (backward-compat)
 *   escapeLatexUrl(str)         – minimal escaping for URLs inside \href{}
 *   escapeLatexName(str)        – light escaping for names (preserves diacritics)
 *   normalizeUnicode(str)       – converts smart quotes, em-dashes, etc.
 */

// ─── Unicode → LaTeX-safe replacement map ────────────────────────────────────
const UNICODE_MAP = new Map([
  // Smart quotes
  ["\u2018", "`"],        // left single quote  → `
  ["\u2019", "'"],        // right single quote  → '
  ["\u201C", "``"],       // left double quote   → ``
  ["\u201D", "''"],       // right double quote  → ''

  // Dashes
  ["\u2013", "--"],       // en-dash  → --
  ["\u2014", "---"],      // em-dash  → ---

  // Misc punctuation / symbols
  ["\u2026", "\\ldots{}"],          // ellipsis          → \ldots{}
  ["\u00A0", "~"],                  // non-breaking space → ~
  ["\u2022", "\\textbullet{}"],     // bullet
  ["\u00A9", "\\textcopyright{}"],  // ©
  ["\u00AE", "\\textregistered{}"], // ®
  ["\u2122", "\\texttrademark{}"],  // ™
  ["\u00B0", "\\textdegree{}"],     // °
  ["\u00B1", "\\textpm{}"],         // ±
]);

// Pre-build a single regex that matches any key in UNICODE_MAP.
const UNICODE_RE = new RegExp(
  [...UNICODE_MAP.keys()].map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|"),
  "g",
);

// ─── normalizeUnicode ────────────────────────────────────────────────────────
/**
 * Replaces common Unicode characters (smart quotes, em-dashes, symbols, etc.)
 * with their LaTeX-safe equivalents. 
 *
 * @param {string} str - Input string.
 * @returns {string} String with Unicode characters replaced.
 */
export function normalizeUnicode(str) {
  if (str == null) return "";
  const s = String(str);

  // 1. Replace known characters via the map.
  return s.replace(UNICODE_RE, (ch) => UNICODE_MAP.get(ch) ?? ch);
}

// ─── escapeLatex ─────────────────────────────────────────────────────────────
/**
 * Escapes all LaTeX special characters in a string for use in body text.
 *
 * Order matters:  backslash is replaced first so that the backslashes
 * introduced by subsequent replacements are not double-escaped.
 *
 * @param {string} str - Input string (null / undefined → "").
 * @returns {string} LaTeX-safe string.
 */
export function escapeLatex(str) {
  if (str == null) return "";
  const s = normalizeUnicode(String(str));

  return s
    .replace(/\\/g, "\\textbackslash{}")   // \ → \textbackslash{}  (MUST be first)
    .replace(/\{/g, "\\{")                  // { → \{
    .replace(/\}/g, "\\}")                  // } → \}
    .replace(/\$/g, "\\$")                  // $ → \$
    .replace(/&/g, "\\&")                   // & → \&
    .replace(/#/g, "\\#")                   // # → \#
    .replace(/%/g, "\\%")                   // % → \%
    .replace(/_/g, "\\_")                   // _ → \_
    .replace(/\^/g, "\\textasciicircum{}")  // ^ → \textasciicircum{}
    .replace(/~/g, "\\textasciitilde{}")    // ~ → \textasciitilde{}
    .replace(/</g, "\\textless{}")          // < → \textless{}
    .replace(/>/g, "\\textgreater{}")       // > → \textgreater{}
    .replace(/\|/g, "\\textbar{}");         // | → \textbar{}
}

// ─── escapeLatexUrl ──────────────────────────────────────────────────────────
/**
 * Minimal escaping for URLs that appear inside `\href{<url>}{...}`.
 *
 * Only escapes characters that would break the \href{}{} LaTeX command itself.
 * Characters like %, #, ~, _, & are intentionally left as-is because they are
 * valid inside URLs and hyperref handles them correctly.
 *
 * @param {string} str - URL string.
 * @returns {string} LaTeX-safe URL string.
 */
export function escapeLatexUrl(str) {
  if (str == null) return "";
  const s = normalizeUnicode(String(str));

  return s
    .replace(/\\/g, "\\\\")  // \ → \\
    .replace(/\{/g, "\\{")   // { → \{
    .replace(/\}/g, "\\}");  // } → \}
}

// ─── escapeLatexName ─────────────────────────────────────────────────────────
/**
 * Light escaping for personal names.
 *
 * Common accented characters (é, è, ê, ë, á, à, â, ä, ñ, ü, ö, ç, etc.) are
 * preserved because the document already uses lmodern + T1 encoding + utf8
 * input encoding, which handles them natively.
 *
 * In practice this is identical to `escapeLatex` — the font/encoding packages
 * take care of diacritics, so no special-casing is needed here.
 *
 * @param {string} str - Name string.
 * @returns {string} LaTeX-safe name string.
 */
export function escapeLatexName(str) {
  return escapeLatex(str);
}

// ─── escapeLatexDeep ─────────────────────────────────────────────────────────
/**
 * Recursively escapes every string value in an object / array tree using
 * `escapeLatex`.  Keys listed in `skipKeys` are passed through verbatim
 * (useful for URL fields that will be placed inside `\href{}`).
 *
 * Handles null, undefined, numbers, booleans, and other non-object types
 * gracefully — they are returned as-is without crashing.
 *
 * @param {*}        obj      - Value to escape (object, array, string, etc.).
 * @param {string[]} skipKeys - Object keys whose values should NOT be escaped.
 * @returns {*} Deep-escaped copy of the input.
 */
export function escapeLatexDeep(obj, skipKeys = []) {
  // Null / undefined — pass through.
  if (obj == null) return obj;

  // Strings — escape.
  if (typeof obj === "string") return escapeLatex(obj);

  // Numbers / booleans / other primitives — pass through.
  if (typeof obj !== "object") return obj;

  // Arrays — recurse into each element.
  if (Array.isArray(obj)) {
    return obj.map((item) => escapeLatexDeep(item, skipKeys));
  }

  // Plain objects — recurse, respecting skipKeys.
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = skipKeys.includes(key) ? value : escapeLatexDeep(value, skipKeys);
  }
  return result;
}
