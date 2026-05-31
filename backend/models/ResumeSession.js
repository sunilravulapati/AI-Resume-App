import { Schema, model, Types } from "mongoose";

const resumeSessionSchema = new Schema({
  baseResumeId: { type: Types.ObjectId, ref: "Resume", required: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
  
  jobDescription: { type: String, required: true },
  company: { type: String },
  roleName: { type: String },
  
  atsScore: { type: Number, min: 0, max: 100 },
  roleMatchScore: { type: Number, min: 0, max: 100 },
  
  tailoredData: { type: Schema.Types.Mixed },
  
  strengths: [String],
  weaknesses: [String],
  
  templateUsed: { type: String, default: "jake-ryan" }
}, { timestamps: true, strict: "throw", versionKey: false });

export const ResumeSession = model("ResumeSession", resumeSessionSchema);
