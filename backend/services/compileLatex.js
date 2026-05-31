import fs from "fs";
import latex from "node-latex";

const COMPILE_TIMEOUT_MS = 30_000;

const MAX_ATTEMPTS = 2;

function parseLatexErrors(raw) {
  const fatal = [];
  const warnings = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("!")) {
      fatal.push(trimmed);
    } else if (
      /Warning:/i.test(trimmed) ||
      /Overfull/i.test(trimmed) ||
      /Underfull/i.test(trimmed)
    ) {
      warnings.push(trimmed);
    }
    // Other diagnostic lines are silently ignored.
  }

  return { fatal, warnings };
}

function removeFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[LATEX] Cleaned up partial file: ${filePath}`);
    }
  } catch (err) {
    console.warn(`[LATEX] Failed to clean up ${filePath}:`, err.message);
  }
}

function compileOnce(texString, outputPath) {
  return new Promise((resolve, reject) => {
    let settled = false; // guard against double-settle
    let errorLog = "";
    let timeoutId;

    const output = fs.createWriteStream(outputPath);
    const pdf = latex(texString);

    function settle(fn, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn(value);
    }

    function cleanup() {
      if (!pdf.destroyed) pdf.destroy();
      if (!output.destroyed) output.destroy();
    }
    //timeout
    timeoutId = setTimeout(() => {
      console.error(
        `[LATEX] Compilation timed out after ${COMPILE_TIMEOUT_MS / 1000}s`
      );
      cleanup();
      removeFileIfExists(outputPath);
      settle(reject, new Error("[LATEX] Compilation timed out"));
    }, COMPILE_TIMEOUT_MS);

    pdf.pipe(output);

    pdf.on("error", (err) => {
      errorLog += String(err) + "\n";
    });
    pdf.on("finish", () => {
      const { fatal, warnings } = parseLatexErrors(errorLog);
      if (warnings.length > 0) {
        console.warn(
          `[LATEX] Compilation completed with ${warnings.length} warning(s):`
        );
        warnings.forEach((w) => console.warn(`[LATEX]   ${w}`));
      }
      if (fatal.length > 0) {
        const summary = fatal.join(" | ");
        console.error(`[LATEX] Fatal LaTeX error(s): ${summary}`);
        cleanup();
        removeFileIfExists(outputPath);
        settle(
          reject,
          new Error(`[LATEX] Compilation failed: ${summary}`)
        );
      }
    });

    output.on("finish", () => {
      console.log(`[LATEX] PDF written to ${outputPath}`);
      settle(resolve, outputPath);
    });

    output.on("error", (err) => {
      console.error("[LATEX] Write-stream error:", err.message);
      cleanup();
      removeFileIfExists(outputPath);
      settle(reject, err);
    });
  });
}

export async function compileLatex(texString, outputPath) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[LATEX] Retry attempt ${attempt}/${MAX_ATTEMPTS}…`);
      }
      const result = await compileOnce(texString, outputPath);
      return result
    } catch (err) {
      lastError = err;
      console.error(
        `[LATEX] Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );
    }
  }
  throw lastError;
}
