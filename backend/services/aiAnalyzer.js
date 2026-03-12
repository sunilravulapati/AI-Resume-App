import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function analyzeResume(text) {

  const prompt = `
You are an expert technical recruiter performing SEMANTIC resume analysis.

The resume structure has already been validated by an ATS system.

Evaluate only the QUALITY of the resume.

Score based on:

1. Project Complexity (0–15)
2. Professional Writing Quality (0–10)
3. Alignment between skills and projects (0–15)

Return ONLY JSON:

{
  "semanticScore": number,
  "strengths": ["point1","point2","point3"],
  "improvements": ["point1","point2","point3"],
  "summary": "1 sentence evaluation"
}

Resume Text:
${text}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return completion.choices?.[0]?.message?.content;
}
//let ai do the tailor part of the resume
export async function tailorResume(resumeText, jobDescription) {
  const prompt = `
You are an expert Executive Resume Writer. 
Your task is to rewrite the provided BASE RESUME to perfectly align with the TARGET JOB DESCRIPTION.

RULES:
1. DO NOT invent new jobs, degrees, or fake metrics. Only enhance what already exists.
2. Rewrite the Professional Summary to highlight keywords from the Job Description.
3. Rewrite project and experience bullet points using the STAR method (Situation, Task, Action, Result) to emphasize skills mentioned in the JD.
4. Optimize the skills section to prioritize tools required by the JD.

Return ONLY valid JSON in this exact structure:
{
  "tailoredSummary": "A 2-3 sentence optimized professional summary.",
  "tailoredSkills": ["Skill1", "Skill2", "Skill3"],
  "tailoredExperience": [
    { 
      "title": "Project/Role Name", 
      "bullets": ["Optimized bullet 1", "Optimized bullet 2"] 
    }
  ]
}

TARGET JOB DESCRIPTION:
${jobDescription}

BASE RESUME:
${resumeText}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3, // Slightly higher than grading (0.2) to allow creative rewriting, but low enough to stop hallucinations
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices?.[0]?.message?.content;
}