import { escapeLatex, escapeLatexDeep, escapeLatexUrl } from "./escapeLatex.js";

/**
 * Sanitizes a normalized resume object for safe, deterministic LaTeX rendering.
 *
 * Architecture:
 *   AI structured data → normalizeResume → validateResumeData → sanitizeResume → renderLatex
 *
 * This function:
 * 1. Deep-clones input to avoid upstream mutation
 * 2. Preserves raw URL values before escaping (for use inside \href{})
 * 3. Context-aware escaping: different treatment for text vs URLs vs names
 * 4. Builds ATS-safe contact line with proper hyperlinks
 * 5. Preserves all certification/project URLs for \href{} rendering
 *
 * AI NEVER produces raw LaTeX — only structured data. This function is the
 * single gateway that converts safe text into LaTeX-safe text.
 */
export function sanitizeResume(data) {
  if (!data || typeof data !== "object") return data;

  // ── 1. Deep clone to avoid mutating upstream data ─────────────────────────
  const input = structuredClone(data);

  // ── 2. Collect ALL raw URL values before escaping corrupts them ────────────
  const raw = {
    email:     input.email     || "",
    linkedin:  input.linkedin  || "",
    github:    input.github    || "",
    portfolio: input.portfolio || "",
    phone:     input.phone     || "",
  };

  // Collect certification URLs (nested in array)
  const certUrls = [];
  if (Array.isArray(input.certifications)) {
    input.certifications.forEach((cert, i) => {
      if (cert && cert.url) certUrls[i] = cert.url;
    });
  }

  // Collect project URLs (nested in array)
  const projectUrls = [];
  if (Array.isArray(input.projects)) {
    input.projects.forEach((proj, i) => {
      if (proj && (proj.url || proj.link)) projectUrls[i] = proj.url || proj.link;
    });
  }

  // ── 3. Deep-escape all text fields ────────────────────────────────────────
  // Skip raw URL key names that we added — they don't exist yet,
  // but we skip the source field names to protect them during deep escape
  const urlFieldNames = [
    "email_raw", "linkedin_raw", "github_raw", "portfolio_raw",
  ];
  const escaped = escapeLatexDeep(input, urlFieldNames);

  // ── 4. Attach raw URLs for \href{} usage in templates ─────────────────────
  escaped.email_raw     = raw.email;
  escaped.linkedin_raw  = raw.linkedin;
  escaped.github_raw    = raw.github;
  escaped.portfolio_raw = raw.portfolio;

  // ── 5. Restore certification URLs (they were escaped by escapeLatexDeep) ──
  if (Array.isArray(escaped.certifications)) {
    escaped.certifications.forEach((cert, i) => {
      if (certUrls[i]) {
        cert.url = certUrls[i];  // Restore raw URL for \href{}
      }
    });
  }

  // ── 6. Restore project URLs ───────────────────────────────────────────────
  if (Array.isArray(escaped.projects)) {
    escaped.projects.forEach((proj, i) => {
      if (projectUrls[i]) {
        proj.url = projectUrls[i];
        proj.link = projectUrls[i];
      }
    });
  }

  // ── 7. Build ATS-safe contact line ────────────────────────────────────────
  escaped.contactLine = buildContactLine(escaped, raw);

  return escaped;
}


/**
 * Builds the contact line with proper hyperlinks and ATS-safe separators.
 *
 * Uses \textbar{} separator instead of math-mode $|$ for ATS compatibility.
 * Uses \textbullet separator for visual consistency.
 * All URLs go through escapeLatexUrl() for safe \href{} rendering.
 */
function buildContactLine(escaped, raw) {
  const parts = [];

  // Phone (with tel: link for clickability)
  if (raw.phone) {
    const cleanPhone = raw.phone.replace(/[^+\d]/g, "");
    parts.push(`\\href{tel:${cleanPhone}}{${escaped.phone || escapeLatex(raw.phone)}}`);
  }

  // Email (mailto link)
  if (raw.email) {
    const safeUrl = escapeLatexUrl(raw.email);
    parts.push(`\\href{mailto:${safeUrl}}{${escaped.email || escapeLatex(raw.email)}}`);
  }

  // LinkedIn
  if (raw.linkedin) {
    let url = raw.linkedin.trim();
    let display;

    if (!url.startsWith("http")) {
      const handle = url.replace(/^@/, "").replace(/^linkedin\.com\/in\//i, "");
      url = `https://linkedin.com/in/${handle}`;
      display = `linkedin.com/in/${handle}`;
    } else {
      const match = url.match(/linkedin\.com\/in\/([^/?\s]+)/i);
      display = match ? `linkedin.com/in/${match[1]}` : url.replace(/^https?:\/\//i, "");
    }

    parts.push(`\\href{${escapeLatexUrl(url)}}{${escapeLatex(display)}}`);
  }

  // GitHub
  if (raw.github) {
    let url = raw.github.trim();
    let display;

    if (!url.startsWith("http")) {
      const handle = url.replace(/^@/, "").replace(/^github\.com\//i, "");
      url = `https://github.com/${handle}`;
      display = `github.com/${handle}`;
    } else {
      const match = url.match(/github\.com\/([^/?\s]+)/i);
      display = match ? `github.com/${match[1]}` : url.replace(/^https?:\/\//i, "");
    }

    parts.push(`\\href{${escapeLatexUrl(url)}}{${escapeLatex(display)}}`);
  }

  // Portfolio (generic hyperlink)
  if (raw.portfolio) {
    let url = raw.portfolio.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    const display = url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

    parts.push(`\\href{${escapeLatexUrl(url)}}{${escapeLatex(display)}}`);
  }

  // Location (plain text, no link)
  if (escaped.location) {
    parts.push(escaped.location);
  }

  // Join with ATS-safe text-mode separator with proper breathing room
  return parts.join(" \\quad \\textbullet \\quad ");
}
