export function parseResume(text) {
  const lowerText = text.toLowerCase();
  return {
    sections:   detectSections(lowerText),
    contacts:   extractContacts(text),
    bullets:    extractBulletPoints(text),
    skills:     extractSkills(lowerText),
    metrics:    extractMetrics(text),
    wordCount:  countWords(text),
    actionVerbs: extractActionVerbs(lowerText),
    hasObjective: /objective|summary|profile/i.test(lowerText),
  };
}

//detect the sections
function detectSections(text) {
  const sectionKeywords = [
    "education", "skills", "technical skills", "projects",
    "experience", "work experience", "certifications",
    "achievements", "publications", "summary", "objective",
    "awards", "volunteer", "languages", "interests"
  ];
  return sectionKeywords.filter(s => text.includes(s));
}

//detect the contacts
function extractContacts(text) {
  return {
    email:    text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || null,
    phone:    text.match(/\+?\d[\d\s\-]{8,}\d/)?.[0] || null,
    linkedin: text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0] || null,
    github:   text.match(/github\.com\/[a-zA-Z0-9_-]+/i)?.[0] || null,
    portfolio: text.match(/https?:\/\/[^\s]+/i)?.[0] || null,
  };
}

//detect bullet points
function extractBulletPoints(text) {
  // Catches: •, -, –, *, >, numbered lists (1. 2.), and indented lines
  const bulletRegex = /(?:^|\n)\s*(?:[•\-–\*>]|\d+\.)\s+(.+)/g;
  const bullets = [];
  let match;
  while ((match = bulletRegex.exec(text)) !== null) {
    const trimmed = match[1].trim();
    if (trimmed.length > 10) bullets.push(trimmed); // skip noise
  }
  return bullets;
}

//extract skills
function extractSkills(text) {
  const skills = [
    // Languages
    "python", "java", "c++", "c#", "c", "javascript", "typescript",
    "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "r",
    // Frontend
    "react", "nextjs", "vue", "angular", "svelte", "tailwindcss",
    "html", "css", "redux", "webpack",
    // Backend
    "node", "express", "fastapi", "flask", "django", "spring",
    "nestjs", "graphql", "rest", "grpc",
    // Databases
    "mongodb", "mysql", "postgresql", "redis", "sqlite",
    "elasticsearch", "cassandra", "dynamodb", "firebase",
    // Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "github actions", "ci/cd", "linux",
    // Data & ML
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "spark", "kafka",
    // Tools
    "git", "jira", "figma", "postman",
  ];

  return skills.filter(skill => {
    const regex = new RegExp(
      `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"
    );
    return regex.test(text);
  });
}

//extract metrics
function extractMetrics(text) {
  const metricRegex =
    /\b\d+(\.\d+)?[KkMmBb]?\+?\s*(%|users?|customers?|clients?|requests?|ms|seconds?|hours?|days?|latency|accuracy|reduction|increase|growth|improvement|transactions?|downloads?|deployments?|repos?)\b/gi;

  const matches = text.match(metricRegex);
  return matches ? [...new Set(matches)] : [];
}

//extract action verbs
function extractActionVerbs(text) {
  const strongVerbs = [
    "built", "designed", "developed", "implemented", "optimized",
    "reduced", "increased", "led", "architected", "deployed",
    "automated", "migrated", "refactored", "scaled", "integrated",
    "launched", "delivered", "improved", "created", "engineered",
    "researched", "published", "mentored", "collaborated"
  ];
  return strongVerbs.filter(v => new RegExp(`\\b${v}\\b`, "i").test(text));
}

//count words
function countWords(text) {
  return text.trim().split(/\s+/).length;
}