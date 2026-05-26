/**
 * validateLatex.js
 * 
 * Aggressively sanitizes and validates AI-generated LaTeX body content
 * to ensure compilation stability and prevent document-level disruption.
 */

/**
 * Sanitizes the raw AI LaTeX output.
 * - Removes markdown fences.
 * - Removes forbidden document-level commands.
 * - Escapes unsafe unescaped characters (like bare ampersands) if possible, though
 *   we rely mostly on the initial data escaping.
 */
export function sanitizeLatex(rawTex) {
  let tex = rawTex || "";
  
  // 1. Remove markdown fences
  tex = tex.replace(/^```(?:latex|tex)?\s*/im, "");
  tex = tex.replace(/\s*```\s*$/m, "");

  // 2. Strip forbidden commands that would break injection architecture
  const forbidden = [
    /\\documentclass(\[.*?\])?\{.*?\}/g,
    /\\usepackage(\[.*?\])?\{.*?\}/g,
    /\\begin\{document\}/g,
    /\\end\{document\}/g,
    /\\geometry\{.*?\}/g,
    /\\newcommand\{.*?\}/g,
    /\\renewcommand\{.*?\}/g,
    /\\pagestyle\{.*?\}/g,
  ];

  for (const regex of forbidden) {
    if (regex.test(tex)) {
      console.warn(`[LatexSanitizer] Removed forbidden command matching: ${regex}`);
      tex = tex.replace(regex, "");
    }
  }

  // 3. Normalize spacing slightly
  tex = tex.replace(/\n{3,}/g, "\n\n").trim();

  return tex;
}

/**
 * Validates the sanitized LaTeX for fatal syntax errors.
 * Returns { valid: boolean, error?: string }
 */
export function validateLatex(tex) {
  if (!tex) {
    return { valid: false, error: "LaTeX content is empty." };
  }

  // 1. Check for balanced environments (\begin and \end)
  const begins = [...tex.matchAll(/\\begin\{([^}]+)\}/g)].map(m => m[1]);
  const ends = [...tex.matchAll(/\\end\{([^}]+)\}/g)].map(m => m[1]);

  if (begins.length !== ends.length) {
    return { valid: false, error: `Unbalanced environments: found ${begins.length} \\begin and ${ends.length} \\end commands.` };
  }

  // Basic stack check for proper nesting
  const stack = [];
  const envRegex = /\\(begin|end)\{([^}]+)\}/g;
  let match;
  while ((match = envRegex.exec(tex)) !== null) {
    const type = match[1];
    const env = match[2];
    
    if (type === 'begin') {
      stack.push(env);
    } else {
      if (stack.length === 0) {
        return { valid: false, error: `Found \\end{${env}} without matching \\begin.` };
      }
      const last = stack.pop();
      if (last !== env) {
        return { valid: false, error: `Environment mismatch: expected \\end{${last}} but found \\end{${env}}.` };
      }
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: `Unclosed environments: ${stack.join(", ")}.` };
  }

  // 2. Ensure it starts with a \section or similar body command, not arbitrary text
  // (Assuming AI always generates sections as requested)
  // We'll just warn on this, not strictly fail, as some templates might just have raw text.
  if (!/^\s*\\(section|resumeSubHeadingListStart)/.test(tex)) {
    console.warn("[LatexValidator] Content does not start with \\section. Proceeding anyway.");
  }

  // 3. Check for nested itemize (often causes issues if not supported by Jake's template)
  // Actually Jake's template supports nested itemize via \resumeItemListStart inside \resumeSubheading.
  // But we want to avoid raw \begin{itemize} if possible, though we won't fail it.
  
  return { valid: true };
}
