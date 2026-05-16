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
 *
 * v2 FIXES — mirrors backend/services/resumeFormat.js enforceLimits():
 *
 *  BULLET TRUNCATION (root cause of "analyze resumes for" mid-sentence cuts):
 *    bullets: 25 words (was 22). The LLM prompt targets ≤15 words, but the
 *    LLM frequently outputs 16–22 word bullets, trimWords(b, 22) was silently
 *    cutting them mid-clause. Raising to 25 gives a true safety ceiling.
 *
 *  MISSING SECTIONS:
 *    awards: up to 4 (was 2) — all 4 of Sunil's awards should appear
 *    achievements bullets: up to 4 (was 2)
 *    certifications: up to 3 (was 2)
 *    dsaProficiency: up to 3 lines (was 2) — LeetCode + CodeChef + GFG
 *    tailoredExperience: up to 4 (was 3) — includes internships
 *
 *  TECH STACK TRUNCATION:
 *    tech: 12 words (was 10) — "MERN Stack, JWT, Recharts, Express, Node.js, React, MongoDB"
 *    was being cut at 10 words, dropping the last items.
 *
 *  AWARD TITLE/DESC:
 *    award title: 14 words (was 12) — "Third Place Finish - CSI AVENSIS 2K25" is 7 words, fine
 *    award desc:  20 words (was 15) — descriptions with metrics need more room
 */
export function enforceLimitsForPdf(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data, basics: { ...(data.basics || {}) } };

  // FIX: Allow up to 4 experience entries (was 3) so internships survive
  if (Array.isArray(out.tailoredExperience)) {
    out.tailoredExperience = out.tailoredExperience.slice(0, 4).map((entry) => ({
      ...entry,
      title:   trimWords(entry.title   || '', 12),
      // FIX: tech 12 words (was 10) — prevents mid-list tech stack truncation
      tech:    trimWords(entry.tech    || '', 12),
      meta:    trimWords(entry.meta    || '', 14),
      // FIX: bullets 25 words (was 22) — prevents mid-sentence cuts
      bullets: (entry.bullets || []).slice(0, 2).map((b) => trimWords(b, 25)),
    }));
  }

  if (out.tailoredSummary) {
    out.tailoredSummary = trimWords(out.tailoredSummary, 55);
  }

  // FIX: Allow up to 6 skill rows (was 5) — Programming, Frameworks, Databases,
  // Cloud, Tools, Soft Skills are all valuable for a student resume
  if (Array.isArray(out.tailoredSkills)) {
    out.tailoredSkills = out.tailoredSkills.slice(0, 6).map((row) => ({
      label: trimWords(row.label || '', 4),
      value: trimWords(row.value || '', 22),
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

  // FIX: awards up to 4 (was 2) — all student awards should render
  if (Array.isArray(out.awards)) {
    out.awards = out.awards.slice(0, 4).map((a) => ({
      ...a,
      title: trimWords(a.title || '', 14),
      desc:  a.desc ? trimWords(a.desc, 20) : '',
    }));
  }

  // FIX: achievements bullets up to 4 (was 2)
  if (Array.isArray(out.achievements)) {
    const bullets = out.achievements
      .flatMap((a) => a.bullets || [])
      .slice(0, 4)
      .map((b) => trimWords(b, 25));
    out.achievements = bullets.length ? [{ category: 'Achievements', bullets }] : [];
  }

  // FIX: certifications up to 3 (was 2)
  if (Array.isArray(out.certifications)) out.certifications = out.certifications.slice(0, 3);

  // FIX: dsaProficiency up to 3 lines (was 2), 25 words (was 22)
  if (Array.isArray(out.dsaProficiency)) {
    out.dsaProficiency = out.dsaProficiency.slice(0, 3).map((l) => trimWords(l, 25));
  }

  if (Array.isArray(out.extracurricular)) {
    out.extracurricular = out.extracurricular.slice(0, 2).map((item) => ({
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