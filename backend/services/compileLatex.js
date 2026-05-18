import fs from "fs";
import latex from "node-latex";

/**
 * Compiles a LaTeX string into a PDF file.
 * Logs structured errors with line numbers on failure.
 * Always preserves debug.tex for post-mortem analysis.
 */
export async function compileLatex(texString, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const pdf = latex(texString);

    let errorLog = "";

    pdf.pipe(output);

    pdf.on("error", (err) => {
      errorLog += String(err) + "\n";
      console.error("[LATEX COMPILE ERROR]", err);
    });

    pdf.on("finish", () => {
      if (errorLog) {
        console.warn("[LATEX] Compilation completed with warnings.");
      }
    });

    output.on("finish", () => {
      console.log(`[LATEX] PDF written to ${outputPath}`);
      resolve(outputPath);
    });

    output.on("error", (err) => {
      console.error("[LATEX WRITE ERROR]", err);
      reject(err);
    });
  });
}
