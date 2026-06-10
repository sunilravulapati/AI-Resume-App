import { verifyResumeWithAI } from "../services/aiAnalyzer.js";

export async function validateResume(text) {
  const t = text.toLowerCase();
  let score = 0;
  const matchedSections = [];
  const missingSections = [];

  const indicators = {
    Education: ["education", "academic background", "academic history", "university", "college", "degree", "bachelor", "master"],
    Experience: ["experience", "work experience", "professional experience", "employment history", "work history"],
    Skills: ["skills", "technical skills", "core competencies", "technologies"],
    Projects: ["projects", "personal projects", "academic projects", "open source"],
    Summary: ["summary", "professional summary", "objective", "about me"],
  };

  const signals = {
    Email: [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i],
    Phone: [/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/],
    Links: [/linkedin\.com\/in\//i, /github\.com\//i, /portfolio/i, /website/i],
  };

  // Check sections
  for (const [section, keywords] of Object.entries(indicators)) {
    if (keywords.some((k) => t.includes(k))) {
      score += (section === 'Summary' ? 1 : 2);
      matchedSections.push(section);
    } else {
      missingSections.push(section);
    }
  }

  // Check signals
  if (signals.Email[0].test(t)) {
    score += 1;
    matchedSections.push("Email");
  } else {
    missingSections.push("Email");
  }

  if (signals.Phone[0].test(t)) {
    score += 1;
    matchedSections.push("Phone");
  } else {
    missingSections.push("Phone");
  }

  let hasLink = false;
  for (const regex of signals.Links) {
    if (regex.test(t)) {
      hasLink = true;
      break;
    }
  }
  
  if (hasLink) {
    score += 1;
    matchedSections.push("Links (LinkedIn/GitHub/Portfolio)");
  } else {
    missingSections.push("Links (LinkedIn/GitHub/Portfolio)");
  }

  // If score < 4 -> Fail immediately
  if (score < 4) {
    return {
      isResume: false,
      score,
      confidence: "low",
      matchedSections,
      missingSections,
      reason: "Missing essential resume sections"
    };
  } else if (score >= 4 && score < 6) {
    // Uncertain range -> AI Verification
    try {
      const aiResult = await verifyResumeWithAI(text);
      return {
        isResume: aiResult.isResume,
        score,
        confidence: aiResult.confidence >= 80 ? "high" : "medium",
        matchedSections,
        missingSections,
        reason: aiResult.reason || "AI verification applied"
      };
    } catch (err) {
      console.error("AI Validation Error:", err);
      // Fallback
      if (score >= 5) {
        return { isResume: true, score, confidence: "medium", matchedSections, missingSections, reason: "Fallback passed" };
      } else {
        return { isResume: false, score, confidence: "low", matchedSections, missingSections, reason: "Missing essential resume sections" };
      }
    }
  } else {
    // Score >= 6 -> Pass immediately
    return {
      isResume: true,
      score,
      confidence: "high",
      matchedSections,
      missingSections,
      reason: "Valid resume"
    };
  }
}
