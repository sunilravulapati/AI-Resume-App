import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { getDesignTokens, countResumeElements } from "./designSystem.js";
import { escapeLatex } from "./escapeLatex.js";

function filterRedundantBullets(bullets) {
    if (!Array.isArray(bullets)) return bullets;
    let filtered = [];

    for (let b of bullets) {
        if (!b || typeof b !== 'string') continue;
        b = b.trim();
        if (b.length === 0) continue;

        const normB = b.toLowerCase().replace(/[^a-z0-9]/g, '');
        let isRedundant = false;
        let indexToReplace = -1;

        for (let i = 0; i < filtered.length; i++) {
            const existing = filtered[i];
            const normE = existing.toLowerCase().replace(/[^a-z0-9]/g, '');

            if (normB === normE) {
                isRedundant = true;
                break;
            }
            if (normB.includes(normE) && normE.length > 10) {
                indexToReplace = i;
                break;
            }
            if (normE.includes(normB) && normB.length > 10) {
                isRedundant = true;
                break;
            }
        }

        if (indexToReplace !== -1) {
            filtered[indexToReplace] = b;
        } else if (!isRedundant) {
            filtered.push(b);
        }
    }
    return filtered;
}

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
    // Filter redundant bullets before density calculation
    if (data.tailoredExperience) {
        data.tailoredExperience.forEach(exp => {
            if (exp.bullets) exp.bullets = filterRedundantBullets(exp.bullets);
        });
    }
    if (data.experience) {
        data.experience.forEach(exp => {
            if (exp.bullets) exp.bullets = filterRedundantBullets(exp.bullets);
        });
    }
    if (data.projects) {
        data.projects.forEach(proj => {
            if (proj.bullets) proj.bullets = filterRedundantBullets(proj.bullets);
        });
    }
    if (data.extracurricular) {
        data.extracurricular.forEach(ex => {
            if (ex.bullets) ex.bullets = filterRedundantBullets(ex.bullets);
        });
    }
    if (data.achievements) {
        data.achievements.forEach(ach => {
            if (ach.bullets) ach.bullets = filterRedundantBullets(ach.bullets);
        });
    }

    const theme = await loadTheme(themeName);
    const totalElements = countResumeElements(data);

    let preset;
    if (totalElements <= 18) {
        // Sparse Volume Matrix
        preset = {
            baseFontSize: "11pt",
            lineStretch: "1.15",
            sectionSpacingBefore: "11pt",
            sectionSpacingAfter: "5pt",
            headerSpacing: "8pt",
            bulletItemSep: "3pt"
        };
    } else if (totalElements <= 38) {
        // Standard Volume Matrix
        preset = {
            baseFontSize: "10.5pt",
            lineStretch: "1.05",
            sectionSpacingBefore: "6pt",
            sectionSpacingAfter: "2pt",
            headerSpacing: "3pt",
            bulletItemSep: "1.5pt"
        };
    } else {
        // Dense Volume Matrix
        preset = {
            baseFontSize: "10pt",
            lineStretch: "0.96",
            sectionSpacingBefore: "4pt",
            sectionSpacingAfter: "1.5pt",
            headerSpacing: "2pt",
            bulletItemSep: "0pt"
        };
    }

    const designTokens = {
        fontPackage: themeName === "modern" ? "\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}" : (themeName === "elegant" ? "\\usepackage{charter}" : "\\usepackage{lmodern}"),
        dividerColor: themeName === "modern" ? "accentNav" : (themeName === "elegant" ? "accentElg" : "black"),
        dividerThickness: themeName === "modern" ? "0.45pt" : "0.35pt",
        bulletSymbol: "\\bullet",
        nameSize: "\\Huge",
        taglineSize: "\\large",
        sectionHeaderSize: "\\large",
        titleSize: "\\textbf",
        ...preset
    };

    // Fresh Handlebars instance to avoid partial collisions
    const hbs = Handlebars.create();
    registerPartials(hbs);

    // Register helpers
    hbs.registerHelper("sep", () => " $|$ ");
    hbs.registerHelper("escapeLatex", (val) => escapeLatex(val));

    const basePath = path.join(process.cwd(), "templates", "base.tex");
    const baseTemplate = fs.readFileSync(basePath, "utf8");

    const compiled = hbs.compile(baseTemplate, { noEscape: true });

    // Merge theme config with resume data
    const context = {
        ...data,
        theme: {
            ...theme,
            designSystem: designTokens
        },
    };

    return compiled(context);
}
