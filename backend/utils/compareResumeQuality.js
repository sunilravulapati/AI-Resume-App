import { scoreBullet } from "./rankBullets.js";

/**
 * Technical Recruiter Content Quality Comparator.
 * Compares an original bullet point to its AI-rewritten version.
 * Keeps the rewritten version ONLY if it is of equal or better technical quality, 
 * retains original metrics/scale, and has stronger recruiter/ATS impact.
 * Otherwise, falls back to the original bullet.
 */
export function shouldKeepRewrittenBullet(original = "", rewritten = "", role = "general", jdKeywords = []) {
  const cleanOrig = (original || "").trim();
  const cleanRew = (rewritten || "").trim();

  if (!cleanRew) return false; // AI returned empty or null, keep original
  if (!cleanOrig) return true; // No original, keep rewritten

  const origScore = scoreBullet(cleanOrig, role);
  const rewScore = scoreBullet(cleanRew, role);

  // 1. Metric Preservation Check (Task 2 & 5)
  // If the original bullet has quantified metrics (%, $, numbers, latency improvement),
  // but the AI version stripped it, reject the AI version to prevent loss of critical evidence.
  const metricRegex = /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\s*(?:K|M|B|users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?)\b/i;
  const origHasMetric = metricRegex.test(cleanOrig);
  const rewHasMetric = metricRegex.test(cleanRew);

  if (origHasMetric && !rewHasMetric) {
    return false; // Metrics must never be lost during tailoring!
  }

  // 2. Specific Technical Keyword Alignment Check
  let origJdMatches = 0;
  let rewJdMatches = 0;
  const lowerOrig = cleanOrig.toLowerCase();
  const lowerRew = cleanRew.toLowerCase();

  if (Array.isArray(jdKeywords)) {
    jdKeywords.forEach(kw => {
      const cleanKw = kw.toLowerCase().trim();
      if (!cleanKw) return;
      if (lowerOrig.includes(cleanKw)) origJdMatches++;
      if (lowerRew.includes(cleanKw)) rewJdMatches++;
    });
  }

  // 3. Evaluation Rules
  // A: If rewritten bullet score is significantly lower than original, reject it
  if (rewScore < origScore - 2) {
    return false;
  }

  // B: If rewritten matches more JD keywords AND does not lose metrics, accept it
  if (rewJdMatches > origJdMatches) {
    return true;
  }

  // C: If rewritten bullet score is noticeably higher, accept it
  if (rewScore > origScore + 2) {
    return true;
  }

  // D: Otherwise, preserve the original candidate's authentic detail and architecture mentions!
  return false;
}
