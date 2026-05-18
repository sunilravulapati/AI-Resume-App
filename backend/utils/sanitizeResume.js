import { escapeLatex, escapeLatexDeep } from "./escapeLatex.js";

/**
 * Sanitizes a normalized resume object for safe LaTeX rendering.
 *
 * Escapes all text fields. Preserves raw URL copies (email_raw, linkedin_raw, etc.)
 * that templates use inside \\href{} where LaTeX escaping would break compilation.
 */
export function sanitizeResume(data) {
  if (!data || typeof data !== "object") return data;

  // Preserve raw URLs before escaping
  const raw = {
    email_raw:     data.email     || "",
    linkedin_raw:  data.linkedin  || "",
    github_raw:    data.github    || "",
    portfolio_raw: data.portfolio || "",
  };

  // Deep-escape everything except URL fields
  const urlKeys = ["email_raw", "linkedin_raw", "github_raw", "portfolio_raw"];
  const escaped = escapeLatexDeep(data, urlKeys);

  // Attach raw URLs for \\href{} usage
  escaped.email_raw     = raw.email_raw;
  escaped.linkedin_raw  = raw.linkedin_raw;
  escaped.github_raw    = raw.github_raw;
  escaped.portfolio_raw = raw.portfolio_raw;

  return escaped;
}
