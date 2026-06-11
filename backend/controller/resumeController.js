import fs from "fs";
import pdfParse from "../utils/pdfParser.js";
import { Resume } from "../models/Resume.js";
import { ResumeSession } from "../models/ResumeSession.js";
import User from "../models/User.js";
import { calculateProgrammaticScore, calculateFinalScore, structureScore, impactScore, skillAlignmentScore } from "../services/scorer.js";
import { analyzeResume, analyzeResumeTargeted, tailorResume, generateCoverLetterWithAI, rankCandidatesWithAI, enhanceTextWithAI } from "../services/aiAnalyzer.js";
import { generateResumePdf, generateResumeLatex } from "../services/generateResumePdf.js";
import { prepareResumeExport, resolveDisplayName } from "../services/resumeFormat.js";
import { extractJSON } from "../utils/jsonExtractor.js";
import { parseResume } from "../services/resumeParser.js";
import { validateResume } from "../utils/resumeValidator.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";

// 1. UPLOAD & ANALYZE
export const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    let fileUrl;
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      fileUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      return res.status(500).json({ error: "Failed to upload resume to Cloudinary" });
    }

    const analysisMode = req.body.analysisMode || "general";
    const jobDescription = req.body.jobDescription || "";
    const company = req.body.company || "";
    const roleName = req.body.roleName || "";

    if (analysisMode === "targeted" && !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required for Targeted Analysis." });
    }

    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (parseErr) {
      console.error("PDF Parse Error:", parseErr);
      return res.status(500).json({ error: "Failed to parse PDF" });
    }

    try {
      const rawText = pdfData.text;
      const extractedText = rawText.replace(/\s+/g, " ").trim();
      
      const validation = await validateResume(extractedText);
      if (!validation.isResume) {
        return res.status(400).json({ error: "Upload Failed\n\nThis document does not appear to be a resume.\n\nPlease upload a resume containing sections such as:\n• Education\n• Experience\n• Skills\n• Projects\n\nSupported format:\nPDF" });
      }

      parseResume(extractedText);

      const programmaticScore = calculateProgrammaticScore(extractedText);

      let aiResponse;
      if (analysisMode === "targeted") {
        aiResponse = await analyzeResumeTargeted(extractedText, jobDescription, company, roleName);
      } else {
        aiResponse = await analyzeResume(extractedText);
      }

      const analysisData = extractJSON(aiResponse) || {};
      const finalScore = calculateFinalScore(programmaticScore, analysisData.semanticScore || 0);

      const rawStruct = structureScore(extractedText);
      const rawImp = impactScore(extractedText);
      const rawSkills = skillAlignmentScore(extractedText);
      const aiScores = analysisData.scores || {};

      const newResume = await Resume.create({
        userId: req.user.id, parsedText: extractedText, rawText, atsScore: finalScore, fileUrl, analysisMode,
        ...(analysisMode === "targeted" && { jobDescription, company: company || undefined, roleName: roleName || undefined }),
        feedback: {
          strengths: analysisData.strengths || [], improvements: analysisData.improvements || [], summary: analysisData.summary || "",
          ...(analysisMode === "targeted" && { matchScore: analysisData.matchScore ?? undefined, keywordMatchRate: analysisData.keywordMatchRate ?? undefined, missingSkills: analysisData.missingSkills || [], experienceGap: analysisData.experienceGap || undefined }),
          studentFeedback: {
            strengths: (analysisData.studentFeedback && analysisData.studentFeedback.strengths) || analysisData.strengths || [],
            improvements: (analysisData.studentFeedback && analysisData.studentFeedback.improvements) || analysisData.improvements || [],
            summary: (analysisData.studentFeedback && analysisData.studentFeedback.summary) || analysisData.summary || "",
          },
          recruiterFeedback: {
            greenFlags: (analysisData.recruiterFeedback && analysisData.recruiterFeedback.greenFlags) || [],
            redFlags: (analysisData.recruiterFeedback && analysisData.recruiterFeedback.redFlags) || [],
            recruiterSummary: (analysisData.recruiterFeedback && analysisData.recruiterFeedback.recruiterSummary) || "",
          }
        },
        subScores: {
          structure: rawStruct,
          impact: rawImp,
          skillAlignment: rawSkills,
          complexity: aiScores.complexity || 0,
          professionalism: aiScores.professionalism || 0,
          skillProjectFit: aiScores.skillProjectFit || 0
        }
      });

      // push new resume
      await User.findByIdAndUpdate(req.user.id, { $push: { resumes: newResume._id } });

      return res.status(200).json({
        message: "Analyzed successfully",
        analysis: {
          atsScore: finalScore, strengths: analysisData.strengths || [], improvements: analysisData.improvements || [], summary: analysisData.summary || "",
          studentFeedback: newResume.feedback.studentFeedback,
          recruiterFeedback: newResume.feedback.recruiterFeedback,
          subScores: newResume.subScores,
          ...(analysisMode === "targeted" && { matchScore: analysisData.matchScore ?? null, keywordMatchRate: analysisData.keywordMatchRate ?? null, missingSkills: analysisData.missingSkills || [], experienceGap: analysisData.experienceGap || null, roleName: roleName || null }),
        },
      });
    } catch (err) {
      console.error("AI Analysis Error:", err);
      return res.status(500).json({ error: "AI analysis failed" });
    }
  } catch (err) {
    console.error("Upload Route Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2. GET RESUME HISTORY (Base Resumes)
export const getHistory = async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// 2.1 GET RESUME SESSIONS
export const getSessions = async (req, res) => {
  try {
    const sessions = await ResumeSession.find({ userId: req.user.id })
      .populate("baseResumeId", "parsedText title createdAt atsScore")
      .sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// 3. GET ALL RESUMES (Recruiters & Admins)
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ atsScore: -1 }).populate("userId", "firstName lastName email mobile username");
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching all resumes:", error);
    res.status(500).json({ error: "Failed to fetch candidate pool" });
  }
};

// 4. TAILOR RESUME
export const tailorResumeAction = async (req, res) => {
  try {
    const { resumeId, jobDescription, userLinks } = req.body;

    if (!resumeId || !jobDescription)
      return res.status(400).json({ error: "Missing resume ID or job description" });

    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!baseResume) return res.status(404).json({ error: "Resume not found" });

    const [aiResponse, targetedAnalysisRaw] = await Promise.all([
      tailorResume(baseResume.parsedText, jobDescription),
      analyzeResumeTargeted(baseResume.parsedText, jobDescription, "Target Company", "Target Role")
    ]);

    let tailoredData = extractJSON(aiResponse);
    let targetedAnalysis = extractJSON(targetedAnalysisRaw) || {};

    if (!tailoredData)
      return res.status(500).json({ error: "AI returned invalid data. Please try again." });

    const programmaticScore = calculateProgrammaticScore(baseResume.parsedText);
    const finalScore = calculateFinalScore(programmaticScore, targetedAnalysis.semanticScore || 0);

    tailoredData.atsScore = finalScore;
    tailoredData.matchScore = targetedAnalysis.matchScore || null;
    tailoredData.keywordMatchRate = targetedAnalysis.keywordMatchRate || null;
    tailoredData.missingSkills = targetedAnalysis.missingSkills || [];
    tailoredData.matchedSkills = targetedAnalysis.matchedSkills || [];
    tailoredData.experienceGap = targetedAnalysis.experienceGap || null;
    tailoredData.strengths = targetedAnalysis.strengths || [];
    tailoredData.improvements = targetedAnalysis.improvements || [];
    tailoredData.analysisSummary = targetedAnalysis.summary || "";

    const dbUser = await User.findById(req.user.id).select("firstName lastName email mobile");
    const resumeText = baseResume.rawText || baseResume.parsedText;
    tailoredData = prepareResumeExport(tailoredData, {
      jobDescription,
      user: dbUser,
      resumeText,
    });

    // Seed explicit basics as the sole source of truth
    tailoredData.basics = {
      name: `${dbUser.firstName} ${dbUser.lastName}`.trim(),
      email: dbUser.email || "",
      phone: dbUser.mobile || "",
      location: "",
      linkedin: userLinks?.linkedin || "",
      github: userLinks?.github || "",
      portfolio: userLinks?.portfolio || "",
      leetcode: userLinks?.leetcode || "",
      hackerrank: userLinks?.hackerrank || "",
      codeforces: userLinks?.codeforces || "",
      tagline: "",
    };

    // Create the session in the DB
    const session = await ResumeSession.create({
      baseResumeId: baseResume._id,
      userId: req.user.id,
      jobDescription,
      company: tailoredData?.basics?.company || "Target Company",
      roleName: tailoredData?.basics?.roleName || "Target Role",
      atsScore: tailoredData.atsScore,
      roleMatchScore: tailoredData.matchScore,
      tailoredData: tailoredData,
      strengths: tailoredData.strengths,
      weaknesses: tailoredData.improvements,
    });

    return res.status(200).json({
      message: "Resume tailored successfully",
      sessionId: session._id,
      tailoredResume: tailoredData,
      parsedText: baseResume.rawText || baseResume.parsedText,
      analysis: {
        atsScore: tailoredData.atsScore,
        matchScore: tailoredData.matchScore,
        keywordMatchRate: tailoredData.keywordMatchRate,
        missingSkills: tailoredData.missingSkills,
        matchedSkills: tailoredData.matchedSkills,
        experienceGap: tailoredData.experienceGap,
        strengths: tailoredData.strengths,
        improvements: tailoredData.improvements,
        summary: tailoredData.analysisSummary
      }
    });
  } catch (err) {
    console.error("Tailoring Error:", err);
    return res.status(500).json({ error: "Failed to tailor resume", details: err.message });
  }
};

// 4.1 AUTO-SAVE SESSION
export const autoSaveSession = async (req, res) => {
  try {
    const { tailoredData } = req.body;
    if (!tailoredData || typeof tailoredData !== 'object') {
      return res.status(400).json({ error: "Invalid tailoredData" });
    }

    // Basic validation / sanitization
    // We expect arrays for certain fields. If they are not arrays, force them to be empty arrays.
    if (tailoredData.experience && !Array.isArray(tailoredData.experience)) tailoredData.experience = [];
    if (tailoredData.projects && !Array.isArray(tailoredData.projects)) tailoredData.projects = [];
    if (tailoredData.education && !Array.isArray(tailoredData.education)) tailoredData.education = [];
    if (tailoredData.skills && !Array.isArray(tailoredData.skills)) tailoredData.skills = [];

    const session = await ResumeSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { tailoredData } },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: "Session not found" });

    return res.status(200).json({ message: "Saved" });
  } catch (err) {
    console.error("Auto-save Error:", err);
    return res.status(500).json({ error: "Failed to save session", details: err.message });
  }
};

// 5. GENERATE LATEX
export const generateLatex = async (req, res) => {
  try {
    const { resumeId, tailoredData, template = "classic" } = req.body;

    if (!resumeId || !tailoredData)
      return res.status(400).json({ error: "Missing resumeId or tailoredData." });

    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!baseResume) return res.status(404).json({ error: "Resume not found." });

    const resumeText = baseResume.rawText || baseResume.parsedText;
    const dbUser = await User.findById(req.user.id).select("firstName lastName email mobile");

    // Clone to avoid mutating
    const protectedTailoredData = JSON.parse(JSON.stringify(tailoredData));
    const userName = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();

    // Use explicit DB user name, and frontend explicit data for the rest.
    protectedTailoredData.basics = {
      name: userName,
      email: tailoredData?.basics?.email || dbUser?.email || "",
      phone: tailoredData?.basics?.phone || dbUser?.mobile || "",
      location: tailoredData?.basics?.location || "",
      linkedin: tailoredData?.basics?.linkedin || "",
      github: tailoredData?.basics?.github || "",
      portfolio: tailoredData?.basics?.portfolio || "",
      leetcode: tailoredData?.basics?.leetcode || "",
      hackerrank: tailoredData?.basics?.hackerrank || "",
      codeforces: tailoredData?.basics?.codeforces || "",
      tagline: tailoredData?.basics?.tagline || "",
    };

    // Prepare + normalize via resumeFormat (merges DB profile if basics blank)
    const prepared = prepareResumeExport(protectedTailoredData, { resumeText, user: dbUser });

    const compiledLatex = await generateResumeLatex(prepared, template);

    return res.status(200).json({ latex: compiledLatex.trim() });
  } catch (err) {
    console.error("Generate LaTeX Error:", err);
    return res.status(500).json({ error: "Failed to generate LaTeX.", details: err.message });
  }
};

// 5.1 GENERATE PDF
export const generatePdf = async (req, res) => {
  try {
    const { resumeId, tailoredData, template = "classic" } = req.body;

    if (!resumeId || !tailoredData) {
      return res.status(400).json({ error: "Missing resumeId or tailoredData." });
    }

    const dbUser = await User.findById(req.user.id).select("firstName lastName email mobile");
    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });

    if (!baseResume) {
      return res.status(404).json({ error: "Target resume record not found." });
    }

    // Clone the tailored data structure to avoid mutating the caller's object
    const protectedTailoredData = JSON.parse(JSON.stringify(tailoredData));

    const resumeText = baseResume.rawText || baseResume.parsedText;

    const userName = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();

    // Force the candidate name to always be the user's First + Last name from the DB.
    protectedTailoredData.basics = {
      name: userName,
      email: tailoredData?.basics?.email || dbUser?.email || "",
      phone: tailoredData?.basics?.phone || dbUser?.mobile || "",
      location: tailoredData?.basics?.location || "",
      linkedin: tailoredData?.basics?.linkedin || "",
      github: tailoredData?.basics?.github || "",
      portfolio: tailoredData?.basics?.portfolio || "",
      leetcode: tailoredData?.basics?.leetcode || "",
      hackerrank: tailoredData?.basics?.hackerrank || "",
      codeforces: tailoredData?.basics?.codeforces || "",
      tagline: tailoredData?.basics?.tagline || "",
    };

    protectedTailoredData.name = protectedTailoredData.basics.name;
    protectedTailoredData.email = protectedTailoredData.basics.email;
    protectedTailoredData.phone = protectedTailoredData.basics.phone;

    const prepared = prepareResumeExport(protectedTailoredData, { resumeText, user: dbUser });

    const { outputPath } = await generateResumePdf(prepared, template);

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: "PDF compilation failed — binary target missing." });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

  } catch (err) {
    console.error("Critical PDF Generation Pipeline Crash:", err);
    return res.status(500).json({ error: "Failed to generate document.", details: err.message });
  }
};

// 5.2 GENERATE TAILORED COVER LETTER
export const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, tailoredData, company, roleName } = req.body;

    if (!resumeId || !tailoredData)
      return res.status(400).json({ error: "Missing resumeId or tailoredData." });

    const baseResume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!baseResume) return res.status(404).json({ error: "Resume not found." });

    const resumeText = baseResume.rawText || baseResume.parsedText;
    const jdText = baseResume.jobDescription || "";
    const targetComp = company || baseResume.company || "Target Company";
    const targetRole = roleName || baseResume.roleName || "Target Position";

    const coverLetter = await generateCoverLetterWithAI(resumeText, tailoredData, targetComp, targetRole, jdText);

    if (!coverLetter || coverLetter.trim().length < 50)
      return res.status(500).json({ error: "AI returned an empty or invalid cover letter response. Please try again." });

    return res.status(200).json({ coverLetter });
  } catch (err) {
    console.error("Generate Cover Letter Error:", err);
    return res.status(500).json({ error: "Failed to generate Cover Letter.", details: err.message });
  }
};

// 5.3 ENHANCE TEXT INLINE
export const enhanceText = async (req, res) => {
  try {
    const { text, action, context } = req.body;
    if (!text || !action) {
      return res.status(400).json({ error: "Missing required fields: text, action." });
    }

    const enhancedText = await enhanceTextWithAI(text, action, context);

    if (!enhancedText) {
      return res.status(500).json({ error: "AI returned an empty response." });
    }

    return res.status(200).json({ enhancedText });
  } catch (err) {
    console.error("Enhance Text Error:", err);
    return res.status(500).json({ error: "Failed to enhance text.", details: err.message });
  }
};

// 6. GET SINGLE RESUME
export const getSingleResume = async (req, res) => {
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
};

// 7. RECRUITER: SCREEN CANDIDATES WITH AI (MATCH POOL)
export const matchPool = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const resumes = await Resume.find().populate("userId", "firstName lastName email mobile username");
    const aiRankings = await rankCandidatesWithAI(resumes, jobDescription);
    return res.status(200).json(aiRankings);
  } catch (err) {
    console.error("Match Pool Error:", err);
    return res.status(500).json({ error: "Failed to screen candidate pool", details: err.message });
  }
};

// 8. RECRUITER: INVITE CANDIDATE (SIMULATED VIA EMAIL)
export const inviteCandidate = async (req, res) => {
  try {
    const { resumeId, emailSubject, emailBody } = req.body;
    if (!resumeId || !emailSubject || !emailBody) {
      return res.status(400).json({ error: "resumeId, emailSubject, and emailBody are required" });
    }

    const resume = await Resume.findById(resumeId).populate("userId", "firstName lastName email");
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    console.log("================ SIMULATED INTERVIEW INVITATION ================");
    console.log(`TO: ${resume.userId?.firstName} ${resume.userId?.lastName} <${resume.userId?.email}>`);
    console.log(`SUBJECT: ${emailSubject}`);
    console.log("------------------ EMAIL BODY ------------------");
    console.log(emailBody);
    console.log("================================================================");

    return res.status(200).json({
      success: true,
      message: `Simulated invitation successfully sent to ${resume.userId?.email}`
    });
  } catch (err) {
    console.error("Invite Candidate Error:", err);
    return res.status(500).json({ error: "Failed to send interview invitation", details: err.message });
  }
};
