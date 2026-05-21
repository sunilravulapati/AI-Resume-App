import { escapeLatex, escapeLatexDeep } from "./escapeLatex.js";

/**
 * Sanitizes a normalized resume object for safe LaTeX rendering.
 *
 * Escapes all text fields. Preserves raw URL copies (email_raw, linkedin_raw, etc.)
 * that templates use inside \href{} where LaTeX escaping would break compilation.
 * Builds a premium contactLine with all available contact fields.
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

  // Attach raw URLs for \href{} usage
  escaped.email_raw     = raw.email_raw;
  escaped.linkedin_raw  = raw.linkedin_raw;
  escaped.github_raw    = raw.github_raw;
  escaped.portfolio_raw = raw.portfolio_raw;

  // ── Build premium contact line with ALL available contact fields ──────────
  const contactParts = [];

  // Phone (no link)
  if (escaped.phone) {
    contactParts.push(escaped.phone);
  }

  // Email (mailto link)
  if (raw.email_raw) {
    contactParts.push(`\\href{mailto:${raw.email_raw}}{${escaped.email || raw.email_raw}}`);
  }

  // LinkedIn — detect and format as full URL or handle
  if (raw.linkedin_raw) {
    let url = raw.linkedin_raw.trim();
    let display = escaped.linkedin || url;

    // If it's just a handle (no http), build full URL
    if (!url.startsWith("http")) {
      const handle = url.replace(/^@/, "").replace(/^linkedin\.com\/in\//i, "");
      url = `https://linkedin.com/in/${handle}`;
      display = `linkedin.com/in/${handle}`;
    } else {
      // Extract a clean display handle from URL
      const match = url.match(/linkedin\.com\/in\/([^/?\s]+)/i);
      display = match ? `linkedin.com/in/${match[1]}` : display;
    }

    contactParts.push(`\\href{${url}}{${escapeLatex(display)}}`);
  }

  // GitHub — detect and format as full URL or handle
  if (raw.github_raw) {
    let url = raw.github_raw.trim();
    let display = escaped.github || url;

    // If it's just a handle (no http), build full URL
    if (!url.startsWith("http")) {
      const handle = url.replace(/^@/, "").replace(/^github\.com\//i, "");
      url = `https://github.com/${handle}`;
      display = `github.com/${handle}`;
    } else {
      const match = url.match(/github\.com\/([^/?\s]+)/i);
      display = match ? `github.com/${match[1]}` : display;
    }

    contactParts.push(`\\href{${url}}{${escapeLatex(display)}}`);
  }

  // Portfolio (generic hyperlink)
  if (raw.portfolio_raw) {
    let url = raw.portfolio_raw.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    const display = escaped.portfolio || url.replace(/^https?:\/\//i, "");
    contactParts.push(`\\href{${url}}{${escapeLatex(display)}}`);
  }

  // Location (plain text, last)
  if (escaped.location) {
    contactParts.push(escaped.location);
  }

  escaped.contactLine = contactParts.join(" \\textbullet ");

  return escaped;
}
