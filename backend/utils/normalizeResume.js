/**
 * Transforms AI tailoring output into the canonical resume schema
 * that the Handlebars templates expect.
 *
 * AI keys → Template keys mapping:
 *   basics.name      → name
 *   tailoredSummary  → summary
 *   tailoredSkills   → skills [{label, value}]
 *   tailoredExperience → experience [{title, company, location, dates, tech, bullets}]
 *   education        → education [{institution, degree, dates, gpa, extras}]
 */

/**
 * Parse the combined meta string into company, location, and dates.
 * Handles formats: "Company / Location / Dates", "Company | Dates", plain text.
 */
function parseMeta(meta = "") {
  if (!meta) return { company: "", location: "", dates: "" };

  // Try pipe separator: "Company | Location | Dates"
  if (meta.includes("|")) {
    const parts = meta.split("|").map((p) => p.trim());
    if (parts.length >= 3) {
      return { company: parts[0], location: parts[1], dates: parts[2] };
    }
    if (parts.length === 2) {
      return { company: parts[0], location: "", dates: parts[1] };
    }
  }

  // Try slash separator: "Company / Location / Dates"
  if (meta.includes("/")) {
    const parts = meta.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return { company: parts[0], location: parts.slice(1, -1).join(", "), dates: parts[parts.length - 1] };
    }
    if (parts.length === 2) {
      const datePattern = /\d{4}|present/i;
      if (datePattern.test(parts[1])) {
        return { company: parts[0], location: "", dates: parts[1] };
      }
      return { company: parts[0], location: parts[1], dates: "" };
    }
  }

  // Try trailing date pattern
  const dateMatch = meta.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[–\-]\s*(?:Present|\w+ \d{4}|\d{4}))\s*$/i
  );
  if (dateMatch) {
    const dates = dateMatch[1].trim();
    const company = meta.slice(0, dateMatch.index).replace(/[,|·/]+$/, "").trim();
    return { company, location: "", dates };
  }

  return { company: meta, location: "", dates: "" };
}

export function normalizeResume(data) {
  if (!data || typeof data !== "object") return {};

  const basics = data.basics || {};

  // --- Flatten basics to root ---
  const normalized = {
    name:     basics.name     || "",
    email:    basics.email    || "",
    phone:    basics.phone    || "",
    linkedin: basics.linkedin || "",
    github:   basics.github   || "",
    portfolio: basics.portfolio || "",
    location: basics.location || "",
  };

  // --- Summary ---
  normalized.summary = data.tailoredSummary || data.summary || "";

  // --- Skills: always [{label, value}] ---
  if (Array.isArray(data.tailoredSkills)) {
    normalized.skills = data.tailoredSkills.map((s) => ({
      label: (s.label || "").trim(),
      value: (s.value || "").trim(),
    })).filter((s) => s.label && s.value);
  } else if (data.skills && typeof data.skills === "object" && !Array.isArray(data.skills)) {
    normalized.skills = Object.entries(data.skills).map(([k, v]) => ({
      label: k.trim(),
      value: Array.isArray(v) ? v.join(", ") : String(v).trim(),
    }));
  } else {
    normalized.skills = [];
  }

  // --- Experience: parse meta into company/location/dates ---
  const rawExp = data.tailoredExperience || data.experience || [];
  normalized.experience = rawExp.map((exp) => {
    // If already has company/dates, use them directly
    if (exp.company && exp.dates) {
      return {
        title:    (exp.title || "").trim(),
        company:  (exp.company || "").trim(),
        location: (exp.location || "").trim(),
        dates:    (exp.dates || "").trim(),
        tech:     (exp.tech || "").trim(),
        bullets:  (exp.bullets || []).map((b) => String(b).trim()).filter(Boolean),
      };
    }
    // Parse from meta field
    const parsed = parseMeta(exp.meta || "");
    return {
      title:    (exp.title || "").trim(),
      company:  parsed.company,
      location: parsed.location,
      dates:    parsed.dates,
      tech:     (exp.tech || "").trim(),
      bullets:  (exp.bullets || []).map((b) => String(b).trim()).filter(Boolean),
    };
  });

  // --- Education ---
  normalized.education = (data.education || []).map((edu) => {
    const gpa = edu.gpa ? String(edu.gpa).replace(/(CGPA|GPA)\s*:?\s*/gi, "").trim() : "";
    const extras = (edu.extra || []).filter(Boolean).join(" · ");
    return {
      institution: (edu.institution || "").trim(),
      degree:      (edu.degree || "").trim(),
      dates:       (edu.dates || "").trim(),
      gpa,
      extras,
    };
  });

  // --- Awards ---
  normalized.awards = (data.awards || []).map((a) => ({
    title: (a.title || "").trim(),
    desc:  (a.desc || "").trim(),
    date:  (a.date || "").trim(),
  }));

  // --- Achievements: flatten into awards ---
  if (Array.isArray(data.achievements)) {
    data.achievements.forEach((ach) => {
      (ach.bullets || []).forEach((b) => {
        normalized.awards.push({ title: String(b).trim(), desc: "", date: "" });
      });
    });
  }

  // --- Certifications ---
  normalized.certifications = (data.certifications || []).map((c) => ({
    title: (c.title || "").trim(),
    org:   (c.org || "").trim(),
    dates: (c.dates || "").trim(),
  }));

  // --- DSA Proficiency ---
  normalized.dsaProficiency = (data.dsaProficiency || []).map((l) => String(l).trim()).filter(Boolean);

  // --- Extracurricular ---
  normalized.extracurricular = (data.extracurricular || []).map((item) => ({
    title:   (item.title || item.role || "").trim(),
    bullets: (item.bullets || []).map((b) => String(b).trim()).filter(Boolean),
  }));

  return normalized;
}
