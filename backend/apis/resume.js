import express from "express";
import multer from "multer";
import PDFParser from "pdf2json";
import { Resume } from "../models/Resume.js";
import User from "../models/User.js";
import { calculateProgrammaticScore } from "../services/scorer.js";
import { analyzeResume, tailorResume } from "../services/aiAnalyzer.js";
import { extractJSON } from "../utils/jsonExtractor.js";
import { verifyToken } from "../middleware/auth.js";
import fs from "fs";

export const resumeRouter = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the folder exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Make the filename unique to avoid overwriting
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// 1. UPLOAD & ANALYZE ROUTE (Protected: Students Only)
// 1. UPLOAD & ANALYZE ROUTE (Protected: Students Only)
resumeRouter.post("/upload", verifyToken("student"), upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    // 👇 ADD THIS LINE RIGHT HERE! 👇
    const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;

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
          userId: req.user.id,
          parsedText: extractedText,
          atsScore: finalScore,
          fileUrl: fileUrl, // <--- Now this knows what to save!
          feedback: {
            strengths: analysisData.strengths,
            improvements: analysisData.improvements,
            summary: analysisData.summary
          }
        });

        // Link resume to User
        await User.findByIdAndUpdate(req.user.id, {
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
        console.error("AI Analysis Error:", err); // <-- Pro-tip: Log this so you can see errors in your terminal
        return res.status(500).json({ error: "AI analysis failed" });
      }
    });

    pdfParser.loadPDF(req.file.path);
  } catch (err) {
    console.error("Upload Route Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 2. GET RESUME HISTORY ROUTE (Protected: Students Only)
resumeRouter.get("/history", verifyToken("student"), async (req, res) => {
  try {
    // Notice we use req.user.id now!
    const history = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// 3. GET ALL RESUMES ROUTE (Protected: Recruiters & Admins Only)
resumeRouter.get("/all", verifyToken("recruiter", "admin"), async (req, res) => {
  try {
    // Fetch all resumes, sort by highest ATS score first
    // Populate the userId field to get the student's contact details
    const resumes = await Resume.find()
      .sort({ atsScore: -1 })
      .populate("userId", "firstName lastName email mobile username");

    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching all resumes:", error);
    res.status(500).json({ error: "Failed to fetch candidate pool" });
  }
});

// 4. TAILOR RESUME ROUTE (Protected: Students Only)
resumeRouter.post("/tailor", verifyToken("student"), async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "Missing resume ID or job description" });
    }

    // 1. Fetch the base resume (Ensure it belongs to this specific user!)
    const baseResume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.id
    });

    if (!baseResume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // 2. Send the raw text to Llama 3 for tailoring
    const aiResponse = await tailorResume(baseResume.parsedText, jobDescription);

    // 3. Safely extract the JSON
    const tailoredData = extractJSON(aiResponse);

    // 4. Send it back to the frontend
    return res.status(200).json({
      message: "Resume tailored successfully",
      tailoredResume: tailoredData
    });

  } catch (err) {
    console.error("Tailoring Error:", err);
    return res.status(500).json({ error: "Failed to tailor resume", details: err.message });
  }
});

// GET SINGLE RESUME (Protected: Owner or Recruiter)
resumeRouter.get("/:id", verifyToken(), async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate("userId", "firstName lastName email mobile username");

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Security Check: If the user is a student, they must own this resume
    if (req.user.role === "student" && resume.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You do not own this resume." });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resume details" });
  }
});