import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  uploadAndAnalyze,
  getHistory,
  getSessions,
  getAllResumes,
  tailorResumeAction,
  autoSaveSession,
  generateLatex,
  generatePdf,
  generateCoverLetter,
  enhanceText,
  getSingleResume,
  matchPool,
  inviteCandidate
} from "../controller/resumeController.js";

export const resumeRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1. UPLOAD & ANALYZE
resumeRouter.post("/upload", verifyToken("student"), upload.single("resume"), uploadAndAnalyze);

// 2. GET RESUME HISTORY (Base Resumes)
resumeRouter.get("/history", verifyToken("student"), getHistory);

// 2.1 GET RESUME SESSIONS
resumeRouter.get("/sessions", verifyToken("student"), getSessions);

// 3. GET ALL RESUMES (Recruiters & Admins)
resumeRouter.get("/all", verifyToken("recruiter", "admin"), getAllResumes);

// 4. TAILOR RESUME
resumeRouter.post("/tailor", verifyToken("student"), tailorResumeAction);

// 4.1 AUTO-SAVE SESSION
resumeRouter.put("/session/:id", verifyToken("student"), autoSaveSession);

// 5. GENERATE LATEX
resumeRouter.post("/generate-latex", verifyToken("student"), generateLatex);

// 5.1 GENERATE PDF
resumeRouter.post("/generate-pdf", verifyToken("student"), generatePdf);

// 5.2 GENERATE TAILORED COVER LETTER
resumeRouter.post("/generate-cover-letter", verifyToken("student"), generateCoverLetter);

// 5.3 ENHANCE TEXT INLINE
resumeRouter.post("/enhance", verifyToken("student"), enhanceText);

// 6. GET SINGLE RESUME
resumeRouter.get("/:id", verifyToken(), getSingleResume);

// 7. RECRUITER: SCREEN CANDIDATES WITH AI (MATCH POOL)
resumeRouter.post("/match-pool", verifyToken("recruiter", "admin"), matchPool);

// 8. RECRUITER: INVITE CANDIDATE (SIMULATED VIA EMAIL)
resumeRouter.post("/invite-candidate", verifyToken("recruiter", "admin"), inviteCandidate);