import { Schema, model, Types } from "mongoose";

const resumeSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },

  title: { type: String, default: "My Resume" },

  parsedText: String,

  atsScore: { type: Number, min: 0, max: 100 },

  feedback: {
    strengths: [String],
    improvements: [String],
    summary: String
  }

}, { timestamps: true,strict:"throw", versionKey:false });

export const Resume = model("Resume", resumeSchema);