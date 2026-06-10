import { createRequire } from "module";
const require = createRequire(import.meta.url);

// pdf-parse tries to read a test file on import — bypass it
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export default pdfParse;