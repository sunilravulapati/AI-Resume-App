/**
 * textCleaner.js — Lightweight post-processing to improve bullet readability
 * by stripping overly verbose filler phrases while preserving metrics.
 */

const FILLER_PHRASES = [
  /\b(?:successfully )?responsible for\b/gi,
  /\btasked with(?: the responsibility to)?\b/gi,
  /\bin order to\b/gi,
  /\bsuccessfully managed to\b/gi,
  /\bwas responsible for\b/gi,
  /\bproven ability to\b/gi,
  /\bdemonstrated success in\b/gi,
  /\bplayed a key role in\b/gi,
  /\bduties included\b/gi,
  /\bworked on\b/gi,
  /\bhelped to\b/gi,
  /\bresponsible for the development of\b/gi,
  /\bcollaborated with team to\b/gi,
  /\bin order to ensure\b/gi,
  /\butilizing\b/gi
];

export function cleanBulletVerbosity(bullet) {
  if (!bullet) return bullet;
  let cleaned = String(bullet);
  
  FILLER_PHRASES.forEach(regex => {
    // Replace with empty string, but handle spacing
    cleaned = cleaned.replace(regex, "").trim();
  });

  // Capitalize first letter after cleanup if it was lowercased
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Remove double spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  // Ensure it ends with a period if it doesn't already, for consistency
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}
