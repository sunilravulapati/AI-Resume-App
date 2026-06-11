import { Schema, model, Types } from "mongoose";

const resumeSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "My Resume" },
  parsedText: String,
  rawText: String,
  atsScore: { type: Number, min: 0, max: 100 },
  fileUrl: { type: String },
  analysisMode: {
    type:    String,
    enum:    ["general", "targeted"],
    default: "general",
  },
  jobDescription: { type: String },
  company:        { type: String },
  roleName:       { type: String },
  feedback: {
    strengths:    [String],
    improvements: [String],
    summary:      String,
    matchScore:       { type: Number, min: 0, max: 100 },
    keywordMatchRate: { type: Number, min: 0, max: 100 },
    missingSkills:    [String],
    experienceGap:    String,
    studentFeedback: {
      strengths:    [String],
      improvements: [String],
      summary:      String,
    },
    recruiterFeedback: {
      greenFlags:       [String],
      redFlags:         [String],
      recruiterSummary: String,
    }
  },
  subScores: {
    structure:       { type: Number, default: 0 },
    impact:          { type: Number, default: 0 },
    skillAlignment:  { type: Number, default: 0 },
    complexity:      { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    skillProjectFit: { type: Number, default: 0 }
  }
}, { timestamps: true, strict: "throw", versionKey: false });

export const Resume = model("Resume", resumeSchema);