import fs from "fs";
import latex from "node-latex";

/** Timeout in milliseconds before we abandon a compilation attempt. */
const COMPILE_TIMEOUT_MS = 30_000;

/** Maximum number of attempts (initial + retries). */
const MAX_ATTEMPTS = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses raw LaTeX / node-latex error output and separates fatal errors
 * from non-fatal warnings.
 *
 * FATAL  — lines starting with `!`  (e.g. `! Missing $ inserted.`)
 * WARNING — lines containing `Warning:`, `Overfull`, or `Underfull`
 *
 * @param {string} raw  The accumulated error log text.
 * @returns {{ fatal: string[], warnings: string[] }}
 */
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

/**
 * Safely removes a file if it exists. Errors during removal are logged but
 * never propagated — we don't want cleanup failures to mask the real error.
 *
 * @param {string} filePath
 */
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

// ---------------------------------------------------------------------------
// Core single-attempt compilation
// ---------------------------------------------------------------------------

/**
 * Runs a single LaTeX compilation attempt.
 *
 * @param {string} texString   Raw LaTeX source.
 * @param {string} outputPath  Destination PDF path.
 * @returns {Promise<string>}  Resolves with `outputPath` on success.
 */
function compileOnce(texString, outputPath) {
  return new Promise((resolve, reject) => {
    let settled = false; // guard against double-settle
    let errorLog = "";
    let timeoutId;

    const output = fs.createWriteStream(outputPath);
    const pdf = latex(texString);

    // ---- settle helpers (ensure we only resolve/reject once) ----

    function settle(fn, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn(value);
    }

    function cleanup() {
      // Destroy both streams so we don't leak resources.
      if (!pdf.destroyed) pdf.destroy();
      if (!output.destroyed) output.destroy();
    }

    // ---- timeout ----

    timeoutId = setTimeout(() => {
      console.error(
        `[LATEX] Compilation timed out after ${COMPILE_TIMEOUT_MS / 1000}s`
      );
      cleanup();
      removeFileIfExists(outputPath);
      settle(reject, new Error("[LATEX] Compilation timed out"));
    }, COMPILE_TIMEOUT_MS);

    // ---- wire up streams ----

    pdf.pipe(output);

    /**
     * node-latex emits "error" for every LaTeX diagnostic — including
     * non-fatal warnings.  We accumulate the log and decide severity
     * only once the stream ends.
     */
    pdf.on("error", (err) => {
      errorLog += String(err) + "\n";
    });

    /**
     * When the pdf stream finishes we inspect the accumulated log.
     * If there are fatal errors we reject; otherwise we let the
     * output stream's "finish" event resolve the promise.
     */
    pdf.on("finish", () => {
      const { fatal, warnings } = parseLatexErrors(errorLog);

      // Log warnings (non-fatal) so they're visible in server logs.
      if (warnings.length > 0) {
        console.warn(
          `[LATEX] Compilation completed with ${warnings.length} warning(s):`
        );
        warnings.forEach((w) => console.warn(`[LATEX]   ${w}`));
      }

      // Fatal errors → reject immediately and clean up the partial PDF.
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
      // If no fatal errors, the output "finish" handler below will resolve.
    });

    output.on("finish", () => {
      // Only resolve if the pdf stream didn't report fatal errors.
      // (If it did, `settled` is already true and this is a no-op.)
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

// ---------------------------------------------------------------------------
// Public API — compile with retry
// ---------------------------------------------------------------------------

/**
 * Compiles a LaTeX string into a PDF file.
 *
 * Production behaviour:
 * - 30-second timeout per attempt (rejects + cleans up streams).
 * - One automatic retry on failure before giving up.
 * - Fatal LaTeX errors (lines starting with `!`) cause rejection.
 * - Non-fatal warnings (Overfull/Underfull/Warning) are logged, not rejected.
 * - Partial output files are removed on failure.
 *
 * @param {string} texString   Raw LaTeX source.
 * @param {string} outputPath  Destination PDF path.
 * @returns {Promise<string>}  Resolves with `outputPath` on success.
 */
export async function compileLatex(texString, outputPath) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[LATEX] Retry attempt ${attempt}/${MAX_ATTEMPTS}…`);
      }

      const result = await compileOnce(texString, outputPath);
      return result; // success — return immediately
    } catch (err) {
      lastError = err;
      console.error(
        `[LATEX] Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );
    }
  }

  // All attempts exhausted — propagate the last error.
  throw lastError;
}
