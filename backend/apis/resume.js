import express from "express";
import multer from "multer";
import PDFParser from "pdf2json";
import { Resume } from "../models/Resume.js"; // Ensure you have this model created
import User from "../models/User.js";
import { calculateProgrammaticScore } from "../services/scorer.js";
import { analyzeResume } from "../services/aiAnalyzer.js";
import { extractJSON } from "../utils/jsonExtractor.js";
import jwt from "jsonwebtoken";

export const resumeRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Temporary inline middleware until we implement your mentor's authService
const authenticate = (req, res, next) => {
  const token = req.cookies.token; 
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

// 1. UPLOAD & ANALYZE ROUTE
resumeRouter.post("/upload", authenticate, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData) => {
      return res.status(500).json({ error: "Failed to parse PDF" });
    });

    pdfParser.on("pdfParser_dataReady", async () => {
      try {
        let extractedText = pdfParser.getRawTextContent().replace(/\s+/g, " ").trim();

        const programmaticScore = calculateProgrammaticScore(extractedText);
        const aiResponse = await analyzeResume(extractedText);
        const analysisData = extractJSON(aiResponse);
        const finalScore = programmaticScore + (analysisData.semanticScore || 0);

        // SAVE TO MONGODB
        const newResume = await Resume.create({
          userId: req.userId, // From the authenticate middleware
          parsedText: extractedText,
          atsScore: finalScore,
          feedback: {
            strengths: analysisData.strengths,
            improvements: analysisData.improvements,
            summary: analysisData.summary
          }
        });

        // Link resume to User
        await User.findByIdAndUpdate(req.userId, {
          $push: { resumes: newResume._id }
        });

        return res.status(200).json({
          message: "Analyzed successfully",
          analysis: {
            atsScore: finalScore,
            strengths: analysisData.strengths,
            improvements: analysisData.improvements,
            summary: analysisData.summary
          }
        });
      } catch (err) {
        return res.status(500).json({ error: "AI analysis failed" });
      }
    });

    pdfParser.parseBuffer(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// 2. GET RESUME HISTORY ROUTE
resumeRouter.get("/history", authenticate, async (req, res) => {
  try {
    // Find all resumes belonging to this user, newest first
    const history = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});