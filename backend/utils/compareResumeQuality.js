import { scoreBullet } from "./rankBullets.js";
// this function is used to compare the quality of the rewritten bullet point with the original bullet point
export function shouldKeepRewrittenBullet(original = "", rewritten = "", role = "general", jdKeywords = []) {
  const cleanOrig = (original || "").trim();
  const cleanRew = (rewritten || "").trim();

  if (!cleanRew) return false; // AI returned empty or null, keep original
  if (!cleanOrig) return true; // No original, keep rewritten

  const origScore = scoreBullet(cleanOrig, role);
  const rewScore = scoreBullet(cleanRew, role);

  const metricRegex = /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\s*(?:K|M|B|users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?)\b/i;
  const origHasMetric = metricRegex.test(cleanOrig);
  const rewHasMetric = metricRegex.test(cleanRew);

  if (origHasMetric && !rewHasMetric) {
    return false;
  }

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

  if (rewScore < origScore - 2) {
    return false;
  }

  if (rewJdMatches > origJdMatches) {
    return true;
  }
  if (rewScore > origScore + 2) {
    return true;
  }

  return false;
}
