// frontend/src/utils/resumeFormat.js
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
 * * FIX: We maintain the expanded word counts (horizontal space) to avoid mid-sentence
 * truncation, but strictly reduce array lengths (vertical space) to prevent the
 * renderer from squishing text or overflowing the single page.
 */
export function enforceLimitsForPdf(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data, basics: { ...(data.basics || {}) } };

  // MAX 3 experiences to ensure it fits on one page vertically
  if (Array.isArray(out.tailoredExperience)) {
    out.tailoredExperience = out.tailoredExperience.slice(0, 3).map((entry) => ({
      ...entry,
      title:   trimWords(entry.title   || '', 12),
      tech:    trimWords(entry.tech    || '', 12),
      meta:    trimWords(entry.meta    || '', 14),
      bullets: (entry.bullets || []).slice(0, 2).map((b) => trimWords(b, 16)),
    }));
  }

  if (out.tailoredSummary) {
    out.tailoredSummary = trimWords(out.tailoredSummary, 32);
  }

  // MAX 5 skill categories to save vertical space
  if (Array.isArray(out.tailoredSkills)) {
    out.tailoredSkills = out.tailoredSkills.slice(0, 5).map((row) => ({
      label: trimWords(row.label || '', 4),
      value: trimWords(row.value || '', 14),
    }));
  }

  if (Array.isArray(out.education)) {
    out.education = out.education.slice(0, 2).map((edu) => ({
      ...edu,
      institution: trimWords(edu.institution || '', 8),
      degree:      trimWords(edu.degree      || '', 12),
      extra:       (edu.extra || []).slice(0, 2).map((e) => trimWords(e, 12)),
    }));
  }

  // MAX 3 awards (4 pushes standard templates to 2 pages or causes squishing)
  if (Array.isArray(out.awards)) {
    out.awards = out.awards.slice(0, 2).map((a) => ({
      ...a,
      title: trimWords(a.title || '', 14),
      desc:  a.desc ? trimWords(a.desc, 20) : '',
    }));
  }

  // Smart Merge: achievements and DSA
  // We limit to either 2 achievement bullets OR 3 DSA lines to prevent 
  // multiple small sections from eating up vertical heading space.
  const achBullets = (out.achievements || []).flatMap((a) => a.bullets || []).slice(0, 2);
  const dsaLines = (out.dsaProficiency || []).slice(0, 1)

  const dsaInAchievements = achBullets.some((b) =>
    /leetcode|codechef|codeforces|gfg|geeksforgeeks|hackerrank|dsa/i.test(b)
  );

  if (dsaLines.length > 0 && dsaInAchievements) {
    out.achievements = [];
    out.dsaProficiency = dsaLines;
  } else if (achBullets.length) {
    out.achievements = [{ category: 'Additional Achievements', bullets: achBullets }];
    out.dsaProficiency = [];
  } else if (dsaLines.length) {
    out.dsaProficiency = dsaLines;
    out.achievements = [];
  } else {
    out.achievements = [];
    out.dsaProficiency = [];
  }

  // MAX 2 certifications
  if (Array.isArray(out.certifications)) {
    out.certifications = out.certifications.slice(0, 2).map((c) => ({
      ...c,
      title: trimWords(c.title || '', 12),
    }));
  }

  // MAX 1 extracurricular activity
  if (Array.isArray(out.extracurricular)) {
    out.extracurricular = out.extracurricular.slice(0, 1).map((item) => ({
      ...item,
      title:   trimWords(item.title || '', 8),
      bullets: (item.bullets || []).slice(0, 1).map((b) => trimWords(b, 25)),
    }));
  }

  if (out.languages) out.languages = trimWords(out.languages, 14);

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