import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

// Theme registry — lazy loaded
const themeCache = {};

async function loadTheme(themeName) {
  if (themeCache[themeName]) return themeCache[themeName];
  const allowed = ["classic", "modern", "elegant"];
  const safe = allowed.includes(themeName) ? themeName : "classic";
  const themePath = path.join(process.cwd(), "templates", "themes", `${safe}.js`);
  const mod = await import(`file://${themePath.replace(/\\/g, "/")}`);
  themeCache[safe] = mod.default;
  return mod.default;
}

/**
 * Load and register all Handlebars partials from templates/partials/.
 * Each .hbs file becomes a partial named after the file (without extension).
 */
function registerPartials(hbs) {
  const partialsDir = path.join(process.cwd(), "templates", "partials");
  if (!fs.existsSync(partialsDir)) return;

  const files = fs.readdirSync(partialsDir).filter((f) => f.endsWith(".hbs"));
  for (const file of files) {
    const name = path.basename(file, ".hbs");
    const content = fs.readFileSync(path.join(partialsDir, file), "utf8");
    hbs.registerPartial(name, content);
  }
}

/**
 * Compiles the base LaTeX template with theme styling and resume data.
 *
 * Pipeline: load theme → register partials → merge data → compile
 *
 * Uses noEscape:true so double braces {{ }} do NOT HTML-encode output.
 * All LaTeX escaping is handled upstream by sanitizeResume.
 */
export async function renderLatex(data, themeName = "classic") {
  const theme = await loadTheme(themeName);

  // Fresh Handlebars instance to avoid partial collisions
  const hbs = Handlebars.create();
  registerPartials(hbs);

  // Register helpers
  hbs.registerHelper("sep", () => " $|$ ");

  const basePath = path.join(process.cwd(), "templates", "base.tex");
  const baseTemplate = fs.readFileSync(basePath, "utf8");

  const compiled = hbs.compile(baseTemplate, { noEscape: true });

  // Merge theme config with resume data
  const context = {
    ...data,
    theme,
  };

  return compiled(context);
}
