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