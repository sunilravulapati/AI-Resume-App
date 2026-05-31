// extract keywords from jd
function extractJDKeywords(jd = "") {
  return (
    jd
      .toLowerCase()
      .match(/[a-zA-Z0-9.+#-]+/g)
      ?.filter((word) => word.length > 2) || []
  );
}

function scoreProject(project, jdKeywords) {
  const text = `
    ${project.title}
    ${project.tech}
    ${(project.bullets || []).join(" ")}
  `.toLowerCase();

  let score = 0;
  jdKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 3;
  });
  if (text.includes("authentication")) score += 2;
  if (text.includes("docker")) score += 2;
  if (text.includes("api")) score += 2;
  if (text.includes("mongodb")) score += 1;
  if (text.includes("ai")) score += 3;
  if (text.includes("analytics")) score += 2;
  return score;
}

function looksLikeBadName(name = "") {
  const n = name.trim();
  if (!n || n.length < 2) return true;
  if (n.length > 60) return true;
  if (/@|https?:|linkedin|github|www\.|\\.com\b/i.test(n)) return true;
  if (/^\d|resume|curriculum vitae|^cv$|^summary$|^professional summary$|^objective$|^profile$|^unil$/i.test(n)) return true;
  if (/^(mr|mrs|ms|dr)\.?\s/i.test(n)) return false;
  const words = n.split(/\s+/);
  if (words.length > 6) return true;
  return false;
}

//trim words
export function trimWords(text = "", maxWords = 30) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

//resolve display name
export function resolveDisplayName(basicsName = "", resumeText = "  ", user = null) {
  // User profile name
  const profile = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  if (profile.length >= 2 && !looksLikeBadName(profile)) return profile;

  // Fall back to what was explicitly provided (frontend/AI)
  const fromBasics = (basicsName || "").trim();
  if (fromBasics && !looksLikeBadName(fromBasics)) return fromBasics;

  // Try to extract the name directly from the resume text
  const lines = (resumeText || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 8)) {
    if (line.length > 55 || line.length < 3) continue;
    if (/@|http|linkedin|github|leetcode|codechef|\+?\d[\d\s\-()]{7,}/i.test(line)) continue;
    if (/^(resume|curriculum vitae|cv)$/i.test(line)) continue;
    if (/^[A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,4}$/.test(line)) return line;
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z.'\-]+){1,4}$/.test(line)) return line;
  }

  return "Candidate";
}

export function normalizeBasics(data, { user, resumeText } = {}) {
  if (!data || typeof data !== "object") return data;
  data.basics = data.basics || {};
  data.basics.name = resolveDisplayName(data.basics.name, resumeText, user);
  // Only inject DB contact data when the resume itself has nothing — never overwrite
  if (user?.email && !data.basics.email) data.basics.email = user.email;
  if (user?.mobile && !data.basics.phone) data.basics.phone = user.mobile;
  return data;
}

// hard-enforce structural limits so content doesn't overflow a single page.
export function enforceLimits(data, jobDescription = "") {
  if (!data || typeof data !== "object") return data;

  const jdKeywords = extractJDKeywords(jobDescription);

  // Experience
  if (Array.isArray(data.experience)) {
    data.experience = data.experience.slice(0, 5).map((entry) => ({
      ...entry,
      title: (entry.title || "").trim(),
      company: (entry.company || "").trim(),
      location: (entry.location || "").trim(),
      dates: (entry.dates || "").trim(),
      tech: (entry.tech || "").trim(),
      bullets: (entry.bullets || []).slice(0, 3).map((b) => (b || "").trim()),
    }));
  }

  if (Array.isArray(data.tailoredExperience)) {
    const scored = data.tailoredExperience.map((entry) => ({
      ...entry,
      __score: scoreProject(entry, jdKeywords),
    }));
    const [first, ...rest] = scored;
    const topRest = rest
      .sort((a, b) => b.__score - a.__score)
      .slice(0, 4);
    const combined = first ? [first, ...topRest] : topRest;

    data.tailoredExperience = combined
      .slice(0, 5)
      .map(({ __score, ...entry }) => ({
        ...entry,
        title: (entry.title || "").trim(),
        tech: (entry.tech || "").trim(),
        meta: (entry.meta || "").trim(),
        bullets: (entry.bullets || []).slice(0, 3).map((b) => (b || "").trim()),
      }));
  }

  // Projects
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.slice(0, 4).map((entry) => ({
      ...entry,
      title: (entry.title || "").trim(),
      tech: (entry.tech || "").trim(),
      meta: (entry.meta || "").trim(),
      bullets: (entry.bullets || []).slice(0, 3).map((b) => (b || "").trim()),
    }));
  }

  //Summary
  if (data.summary) {
    data.summary = (data.summary || "").trim();
  }
  if (data.tailoredSummary) {
    data.tailoredSummary = (data.tailoredSummary || "").trim();
  }

  //Skills
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.slice(0, 8).map((row) => ({
      label: (row.label || "").trim(),
      value: (row.value || "").trim(),
    }));
  }
  if (Array.isArray(data.tailoredSkills)) {
    data.tailoredSkills = data.tailoredSkills.slice(0, 8).map((row) => ({
      label: (row.label || "").trim(),
      value: (row.value || "").trim(),
    }));
  }

  // Education
  if (Array.isArray(data.education)) {
    data.education = data.education.slice(0, 2).map((edu) => ({
      ...edu,
      institution: (edu.institution || "").trim(),
      degree: (edu.degree || "").trim(),
      extra: (edu.extra || []).slice(0, 2).map((e) => (e || "").trim()),
    }));
  }

  // Awards
  if (Array.isArray(data.awards)) {
    data.awards = data.awards.slice(0, 3).map((a) => ({
      ...a,
      title: (a.title || "").trim(),
      desc: (a.desc || "").trim(),
    }));
  }

  // Achievements
  if (Array.isArray(data.achievements)) {
    const allBullets = data.achievements
      .flatMap((a) => a.bullets || [])
      .slice(0, 4)
      .map((b) => (b || "").trim());
    data.achievements = allBullets.length
      ? [{ category: "Achievements", bullets: allBullets }]
      : [];
  }

  // Certifications
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.slice(0, 3).map((c) => ({
      ...c,
      title: (c.title || "").trim(),
    }));
  }

  //DSA Proficiency
  if (Array.isArray(data.dsaProficiency)) {
    data.dsaProficiency = data.dsaProficiency
      .slice(0, 3)
      .map((l) => (l || "").trim());
  }
  if (Array.isArray(data.dsaProfiles)) {
    data.dsaProfiles = data.dsaProfiles
      .slice(0, 3)
      .map((l) => (l || "").trim());
  }

  //Extracurricular
  if (Array.isArray(data.extracurricular)) {
    data.extracurricular = data.extracurricular.slice(0, 1).map((item) => ({
      ...item,
      role: (item.role || item.title || "").trim(),
      bullets: (item.bullets || []).slice(0, 2).map((b) => (b || "").trim()),
    }));
  }

  if (data.languages) {
    data.languages = (data.languages || "").trim();
  }

  return data;
}

//Prepare resume export
export function prepareResumeExport(data, { jobDescription = "", user, resumeText } = {}) {
  let parsed = typeof data === "string" ? JSON.parse(data) : { ...data };
  parsed = enforceLimits(parsed, jobDescription);
  parsed = normalizeBasics(parsed, { user, resumeText });
  return parsed;
}