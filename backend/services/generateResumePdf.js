import fs from "fs";
import path from "path";

import { normalizeResume } from "../utils/normalizeResume.js";
import { validateResumeData } from "../utils/validateResumeData.js";
import { compileLatex } from "./compileLatex.js";
import { buildPreamble, buildHeader, buildJakeLatex } from "./jakeLatexBuilder.js";

function injectTemplate(basics, aiBody) {
  const preamble = buildPreamble();
  const header = buildHeader(basics);
  const footer = "\n\\end{document}\n";
  return `${preamble}\n\\begin{document}\n${header}\n${aiBody}\n${footer}`;
}

/**
 * Full AI-based PDF generation pipeline:
 *
 * 1. Normalize (AI output → canonical schema)
 * 2. Validate (enforce limits — single source)
 * 3. Generate LaTeX using Groq AI
 * 4. Debug (write debug.tex)
 * 5. Compile (LaTeX → PDF)
 */
export async function generateResumePdf(data, template = "classic") {
  const startTime = Date.now();
  console.log(`[PDF] Starting AI-based generation`);

  // 1. Normalize
  const normalized = normalizeResume(data);
  console.log(`[PDF] Normalized: ${normalized.experience?.length || 0} experiences, ${normalized.skills?.length || 0} skill rows`);

  // 2. Validate
  const validated = validateResumeData(normalized);

  // 3. Generate LaTeX using Deterministic Template Builder
  const texString = buildJakeLatex(validated);

  // 4. Debug — always write debug.tex
  const debugPath = path.join(process.cwd(), "debug.tex");
  try {
    fs.writeFileSync(debugPath, texString, "utf8");
    console.log(`[PDF] debug.tex written (${texString.length} chars)`);
  } catch (err) {
    console.warn(`[PDF] Could not write debug.tex: ${err.message}`);
  }

  // 5. Compile
  const outputDir = path.join(process.cwd(), "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "resume.pdf");

  await compileLatex(texString, outputPath);

  const elapsed = Date.now() - startTime;
  console.log(`[PDF] AI PDF generation complete in ${elapsed}ms`);

  return { outputPath, texString };
}

/**
 * Generates the LaTeX string using Groq AI without PDF compilation.
 * Used by the /generate-latex endpoint.
 */
export async function generateResumeLatex(data, template = "classic") {
  const normalized = normalizeResume(data);
  const validated = validateResumeData(normalized);
  const texString = buildJakeLatex(validated);

  // Write debug.tex
  try {
    fs.writeFileSync(path.join(process.cwd(), "debug.tex"), texString, "utf8");
  } catch (err) {
    console.warn(`[LATEX] Could not write debug.tex: ${err.message}`);
  }

  return texString;
}
