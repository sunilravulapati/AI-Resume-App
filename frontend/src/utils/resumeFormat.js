export function trimWords(text = '', maxWords = 14) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(text).trim();
  return words.slice(0, maxWords).join(' ');
}

function looksLikeBadName(name = '') {
  const n = name.trim();
  if (!n || n.length < 2) return true;
  if (n.length > 60) return true;
  if (/@|https?:|linkedin|github|www\.|\.com\b/i.test(n)) return true;
  if (/^\d|resume|curriculum vitae|^cv$/i.test(n)) return true;
  if (n.split(/\s+/).length > 6) return true;
  return false;
}

export function resolveDisplayName(basicsName = '', resumeText = '', user = null) {
  const profile = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  if (profile.length >= 2 && !looksLikeBadName(profile)) return profile;

  const lines = (resumeText || '')
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

  const fromBasics = (basicsName || '').trim();
  if (fromBasics && !looksLikeBadName(fromBasics)) return fromBasics;

  return profile || fromBasics || 'Candidate';
}

/**
 * Enforce content limits for PDF rendering so the resume fits on a single page.
 * Maintains expanded word counts (horizontal space) to avoid mid-sentence
 * truncation, while strictly reducing array lengths (vertical space) to prevent
 * the renderer from squishing text or overflowing the single page.
 */
export function enforceLimitsForPdf(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data, basics: { ...(data.basics || {}) } };

  if (!out.tailoredSkills && out.skills) {
    out.tailoredSkills = out.skills;
  }
  if (!out.tailoredSummary && out.summary) {
    out.tailoredSummary = out.summary;
  }

  // Combine experience and projects for single-page PDF rendering under Experience & Projects
  const rawExperience = out.tailoredExperience || out.experience || [];
  const rawProjects = out.projects || [];

  const formattedExp = rawExperience.slice(0, 3).map((entry) => ({
    ...entry,
    title:   trimWords(entry.title   || '', 22),
    company: trimWords(entry.company || '', 22),
    location: trimWords(entry.location || '', 18),
    dates:   trimWords(entry.dates || entry.date || '', 18),
    tech:    trimWords(entry.tech    || '', 28),
    meta:    entry.meta ? trimWords(entry.meta || '', 20) : '',
    bullets: (entry.bullets || []).slice(0, 3).map((b) => trimWords(b, 38)),
  }));

  const formattedProj = rawProjects.slice(0, 3).map((entry) => ({
    ...entry,
    title:   trimWords(entry.title   || '', 22),
    company: '', // Projects don't have a company
    location: '',
    dates:   trimWords(entry.meta || entry.date || '', 18),
    tech:    trimWords(entry.tech    || '', 28),
    meta:    entry.meta ? trimWords(entry.meta || '', 20) : '',
    bullets: (entry.bullets || []).slice(0, 3).map((b) => trimWords(b, 38)),
  }));

  // Combine to a single experience/projects array (cap at 5 items to keep it strictly on a single page)
  out.tailoredExperience = [...formattedExp, ...formattedProj].slice(0, 5);

  if (out.tailoredSummary) {
    out.tailoredSummary = trimWords(out.tailoredSummary, 65);
  }

  // Up to 6 skill categories
  if (Array.isArray(out.tailoredSkills)) {
    out.tailoredSkills = out.tailoredSkills.slice(0, 6).map((row) => ({
      label: trimWords(row.label || '', 8),
      value: trimWords(row.value || '', 24),
    }));
  }

  // Up to 3 education entries
  if (Array.isArray(out.education)) {
    out.education = out.education.slice(0, 3).map((edu) => ({
      ...edu,
      institution: trimWords(edu.institution || '', 12),
      degree:      trimWords(edu.degree      || '', 16),
      extra:       (edu.extra || []).slice(0, 3).map((e) => trimWords(e, 18)),
    }));
  }

  // Up to 4 awards
  if (Array.isArray(out.awards)) {
    out.awards = out.awards.slice(0, 4).map((a) => ({
      ...a,
      title: trimWords(a.title || '', 20),
      desc:  a.desc ? trimWords(a.desc, 30) : '',
    }));
  }

  // FIX: Preserve original achievement category names instead of always
  // overwriting with the hardcoded 'Additional Achievements' label.
  // Only limit bullets per category and cap total categories.
  if (Array.isArray(out.achievements) && out.achievements.length > 0) {
    out.achievements = out.achievements.slice(0, 2).map((a) => ({
      ...a,
      bullets: (a.bullets || []).slice(0, 4).map((b) => trimWords(b, 30)),
    }));
  } else {
    out.achievements = [];
  }

  // Up to 3 DSA lines
  out.dsaProficiency = (out.dsaProficiency || []).slice(0, 3);

  // Up to 4 certifications
  if (Array.isArray(out.certifications)) {
    out.certifications = out.certifications.slice(0, 4).map((c) => ({
      ...c,
      title: trimWords(c.title || '', 18),
    }));
  }

  // Up to 3 extracurricular activities
  if (Array.isArray(out.extracurricular)) {
    out.extracurricular = out.extracurricular.slice(0, 3).map((item) => ({
      ...item,
      title:   trimWords(item.title || '', 12),
      bullets: (item.bullets || []).slice(0, 3).map((b) => trimWords(b, 35)),
    }));
  }

  if (out.languages) out.languages = trimWords(out.languages, 20);

  return out;
}

export function preparePdfData(tailoredData, parsedText, user) {
  const limited = enforceLimitsForPdf(tailoredData);
  limited.basics = limited.basics || {};
  limited.basics.name = resolveDisplayName(limited.basics.name, parsedText, user);
  if (user?.email  && !limited.basics.email) limited.basics.email = user.email;
  if (user?.mobile && !limited.basics.phone) limited.basics.phone = user.mobile;
  return limited;
}