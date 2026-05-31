//this function is used to normalize the links
export function normalizeLink(url, type) {
  if (!url || typeof url !== "string") return "";
  let clean = url.trim();

  // Strip duplicate protocols or leading slashes
  clean = clean.replace(/^(https?:\/\/)+/i, "https://");

  if (type === "linkedin") {
    // If it's just a username/handle, construct full link
    if (!clean.includes("linkedin.com")) {
      // Remove leading '@' or trailing slashes
      const handle = clean.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
      clean = `https://linkedin.com/in/${handle}`;
    } else if (!clean.startsWith("http")) {
      clean = `https://${clean}`;
    }
  } else if (type === "github") {
    // If it's just a username/handle, construct full link
    if (!clean.includes("github.com")) {
      const handle = clean.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
      clean = `https://github.com/${handle}`;
    } else if (!clean.startsWith("http")) {
      clean = `https://${clean}`;
    }
  } else if (type === "email") {
    clean = clean.toLowerCase();
  } else {
    // Portfolio or other links
    if (clean && !clean.startsWith("http")) {
      clean = `https://${clean}`;
    }
  }

  return clean;
}

export function normalizeBasicsLinks(basics = {}) {
  const normalized = { ...basics };
  if (normalized.email) normalized.email = normalizeLink(normalized.email, "email");
  if (normalized.linkedin) normalized.linkedin = normalizeLink(normalized.linkedin, "linkedin");
  if (normalized.github) normalized.github = normalizeLink(normalized.github, "github");
  if (normalized.portfolio) normalized.portfolio = normalizeLink(normalized.portfolio, "portfolio");
  return normalized;
}
