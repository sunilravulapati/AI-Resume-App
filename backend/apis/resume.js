import express from "express";
import multer from "multer";
import PDFParser from "pdf2json";
import { Resume } from "../models/Resume.js";
import User from "../models/User.js";
import { calculateProgrammaticScore, calculateFinalScore } from "../services/scorer.js";
import { analyzeResume, analyzeResumeTargeted, tailorResume, generateLatexWithAI } from "../services/aiAnalyzer.js";
import { extractJSON } from "../utils/jsonExtractor.js";
import { verifyToken } from "../middleware/auth.js";
import { parseResume } from "../services/resumeParser.js";
import fs from "fs";

export const resumeRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  },
});
const upload = multer({ storage });


// ─────────────────────────────────────────────────────────────────────────────
// 1. UPLOAD & ANALYZE
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.post(
  "/upload",
  verifyToken("student"),
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

      const fileUrl        = `http://localhost:4000/uploads/${req.file.filename}`;
      const analysisMode   = req.body.analysisMode   || "general";
      const jobDescription = req.body.jobDescription || "";
      const company        = req.body.company        || "";
      const roleName       = req.body.roleName       || "";

      if (analysisMode === "targeted" && !jobDescription.trim()) {
        return res.status(400).json({ error: "Job description is required for Targeted Analysis." });
      }

      const pdfParser = new PDFParser(null, 1);
      pdfParser.on("pdfParser_dataError", () => res.status(500).json({ error: "Failed to parse PDF" }));

      pdfParser.on("pdfParser_dataReady", async () => {
        try {
          // rawText keeps structure for PDF section detection
          const rawText = pdfParser.getRawTextContent();
          // extractedText is normalised for scoring, AI analysis and DB storage
          const extractedText = rawText.replace(/\s+/g, " ").trim();
          parseResume(extractedText);

          const programmaticScore = calculateProgrammaticScore(extractedText);

          let aiResponse;
          if (analysisMode === "targeted") {
            aiResponse = await analyzeResumeTargeted(extractedText, jobDescription, company, roleName);
          } else {
            aiResponse = await analyzeResume(extractedText);
          }

          const analysisData = extractJSON(aiResponse) || {};
          const finalScore   = calculateFinalScore(programmaticScore, analysisData.semanticScore || 0);

          const newResume = await Resume.create({
            userId: req.user.id, parsedText: extractedText, rawText: rawText, atsScore: finalScore, fileUrl, analysisMode,
            ...(analysisMode === "targeted" && { jobDescription, company: company || undefined, roleName: roleName || undefined }),
            feedback: {
              strengths: analysisData.strengths || [], improvements: analysisData.improvements || [], summary: analysisData.summary || "",
              ...(analysisMode === "targeted" && { matchScore: analysisData.matchScore ?? undefined, keywordMatchRate: analysisData.keywordMatchRate ?? undefined, missingSkills: analysisData.missingSkills || [], experienceGap: analysisData.experienceGap || undefined }),
            },
          });

          await User.findByIdAndUpdate(req.user.id, { $push: { resumes: newResume._id } });

          return res.status(200).json({
            message: "Analyzed successfully",
            analysis: {
              atsScore: finalScore, strengths: analysisData.strengths || [], improvements: analysisData.improvements || [], summary: analysisData.summary || "",
              ...(analysisMode === "targeted" && { matchScore: analysisData.matchScore ?? null, keywordMatchRate: analysisData.keywordMatchRate ?? null, missingSkills: analysisData.missingSkills || [], experienceGap: analysisData.experienceGap || null, roleName: roleName || null }),
            },
          });
        } catch (err) {
          console.error("AI Analysis Error:", err);
          return res.status(500).json({ error: "AI analysis failed" });
        }
      });

      pdfParser.loadPDF(req.file.path);
    } catch (err) {
      console.error("Upload Route Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);


// ─────────────────────────────────────────────────────────────────────────────
// 2. GET RESUME HISTORY
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.get("/history", verifyToken("student"), async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// 3. GET ALL RESUMES (Recruiters & Admins)
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.get("/all", verifyToken("recruiter", "admin"), async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ atsScore: -1 }).populate("userId", "firstName lastName email mobile username");
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching all resumes:", error);
    res.status(500).json({ error: "Failed to fetch candidate pool" });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// 4. TAILOR RESUME
//    Returns parsedText alongside tailoredResume so TailoredPDF can build
//    a fully dynamic PDF from the actual uploaded resume — not hardcoded data.
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.post("/tailor", verifyToken("student"), async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription)
      return res.status(400).json({ error: "Missing resume ID or job description" });

    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!baseResume) return res.status(404).json({ error: "Resume not found" });

    const aiResponse   = await tailorResume(baseResume.parsedText, jobDescription);
    const tailoredData = extractJSON(aiResponse);

    return res.status(200).json({
      message:        "Resume tailored successfully",
      tailoredResume: tailoredData,
      parsedText:     baseResume.rawText || baseResume.parsedText,  // rawText preserves structure for PDF
    });
  } catch (err) {
    console.error("Tailoring Error:", err);
    return res.status(500).json({ error: "Failed to tailor resume", details: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERATE LATEX
//    Accepts { resumeId, tailoredData } — looks up the stored resume text,
//    then asks the AI to produce a complete Overleaf-ready .tex file.
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.post("/generate-latex", verifyToken("student"), async (req, res) => {
  try {
    const { resumeId, tailoredData } = req.body;

    if (!resumeId || !tailoredData)
      return res.status(400).json({ error: "Missing resumeId or tailoredData." });

    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!baseResume) return res.status(404).json({ error: "Resume not found." });

    // Prefer rawText (preserves original structure); fall back to parsedText
    const resumeText = baseResume.rawText || baseResume.parsedText;

    const latex = await generateLatexWithAI(resumeText, tailoredData);

    if (!latex || latex.trim().length < 100)
      return res.status(500).json({ error: "AI returned an empty or invalid LaTeX response. Please try again." });

    // Strip accidental markdown fences the model may add despite instructions
    const clean = latex
      .replace(/^```(?:latex|tex)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    return res.status(200).json({ latex: clean });
  } catch (err) {
    console.error("Generate LaTeX Error:", err);
    return res.status(500).json({ error: "Failed to generate LaTeX.", details: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// 6. GET SINGLE RESUME
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.get("/:id", verifyToken(), async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate("userId", "firstName lastName email mobile username");
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    if (req.user.role === "student" && resume.userId._id.toString() !== req.user.id)
      return res.status(403).json({ error: "Access denied. You do not own this resume." });
    res.status(200).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resume details" });
  }
});