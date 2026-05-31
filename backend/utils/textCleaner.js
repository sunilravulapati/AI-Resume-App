// lightweight post-processing to improve bullet readability
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
    cleaned = cleaned.replace(regex, "").trim();
  });
  //capitalise the first word
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  //remove extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}
