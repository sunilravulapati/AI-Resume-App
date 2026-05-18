import fs from "fs";
import path from "path";

import { normalizeResume } from "../utils/normalizeResume.js";
import { validateResumeData } from "../utils/validateResumeData.js";
import { sanitizeResume } from "../utils/sanitizeResume.js";
import { renderLatex } from "../utils/renderLatex.js";
import { compileLatex } from "./compileLatex.js";

/**
 * Full deterministic PDF generation pipeline:
 *
 * 1. Normalize (AI output → canonical schema)
 * 2. Validate (enforce limits — single source)
 * 3. Sanitize (escape LaTeX chars)
 * 4. Render (Handlebars template + theme → LaTeX string)
 * 5. Debug (write debug.tex)
 * 6. Compile (LaTeX → PDF)
 */
export async function generateResumePdf(data, template = "classic") {
  const startTime = Date.now();
  console.log(`[PDF] Starting generation (theme: ${template})`);

  // 1. Normalize
  const normalized = normalizeResume(data);
  console.log(`[PDF] Normalized: ${normalized.experience?.length || 0} experiences, ${normalized.skills?.length || 0} skill rows`);

  // 2. Validate
  const validated = validateResumeData(normalized);

  // 3. Sanitize
  const sanitized = sanitizeResume(validated);

  // 4. Render
  const texString = await renderLatex(sanitized, template);

  // 5. Debug — always write debug.tex
  const debugPath = path.join(process.cwd(), "debug.tex");
  try {
    fs.writeFileSync(debugPath, texString, "utf8");
    console.log(`[PDF] debug.tex written (${texString.length} chars)`);
  } catch (err) {
    console.warn(`[PDF] Could not write debug.tex: ${err.message}`);
  }

  // 6. Compile
  const outputDir = path.join(process.cwd(), "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "resume.pdf");

  await compileLatex(texString, outputPath);

  const elapsed = Date.now() - startTime;
  console.log(`[PDF] Generation complete in ${elapsed}ms`);

  return { outputPath, texString };
}

/**
 * Generates just the LaTeX string without PDF compilation.
 * Used by the /generate-latex endpoint.
 */
export async function generateResumeLatex(data, template = "classic") {
  const normalized = normalizeResume(data);
  const validated = validateResumeData(normalized);
  const sanitized = sanitizeResume(validated);
  const texString = await renderLatex(sanitized, template);

  // Write debug.tex
  try {
    fs.writeFileSync(path.join(process.cwd(), "debug.tex"), texString, "utf8");
  } catch (err) {
    console.warn(`[LATEX] Could not write debug.tex: ${err.message}`);
  }

  return texString;
}
