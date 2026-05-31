// scores bullet points based on recruitment value metrics
export function scoreBullet(bullet = "", role = "general") {
  if (!bullet || typeof bullet !== "string") return 0;

  let score = 0;
  const lower = bullet.toLowerCase();

  // Length-based heuristic
  if (lower.length < 25) {
    score -= 8;
  } else if (lower.length > 25 && lower.length < 160) {
    score += 4;
  }

  // Metrics & Numbers (Quantified Impact)
  if (/\b\d+(?:\.\d+)?%/.test(lower)) {
    score += 10;
  }
  if (/\$\d+/.test(lower) || /\b\d+\s*(?:million|thousand|billion|k|m)\b/i.test(lower)) {
    score += 8;
  }
  if (/\b\d+\s*(?:users?|requests?|clients?|customers?|ms|seconds?|latency|reduction|increase|growth|improvement|transactions?|downloads?|deployments?|repos?)\b/i.test(lower)) {
    score += 8;
  }
  if (/\b\d+\s*\+\b/.test(lower)) {
    score += 4;
  }

  // Technical Complexity & Architecture keywords
  const techKeywords = [
    "architect", "design", "scalable", "scalability", "microservice", "distributed", 
    "concurrency", "multithread", "query optimization", "indexing", "auth", "jwt", 
    "oauth", "redis", "kafka", "rabbitmq", "aws", "gcp", "azure", "docker", 
    "kubernetes", "pipeline", "ci/cd", "caching", "database", "schema", "api", "grpc",
    "graphql", "load balancing", "serverless", "event-driven", "migration", "async"
  ];
  techKeywords.forEach(word => {
    if (lower.includes(word)) score += 3;
  });

  // Strong past-tense action verbs at start of bullet
  const strongVerbs = [
    "built", "designed", "developed", "implemented", "optimized", "architected",
    "reduced", "increased", "spearheaded", "automated", "migrated", "refactored",
    "scaled", "integrated", "launched", "created", "engineered", "streamlined",
    "delivered", "orchestrated", "modernized"
  ];
  const firstWord = lower.trim().split(/\s+/)[0];
  if (strongVerbs.includes(firstWord)) {
    score += 5;
  }

  // Weak/filler phrases penalties
  const weakPhrases = [
    "worked on", "helped with", "responsible for", "assisted in", "handled", 
    "participated in", "contributed to", "involved in", "learned about",
    "looked after", "duties included"
  ];
  weakPhrases.forEach(phrase => {
    if (lower.includes(phrase)) score -= 8;
  });

  // Role-Aware Boost
  if (role === "frontend") {
    const feKeywords = [
      "react", "vue", "angular", "tailwind", "css", "html", "ui", "ux", "responsive", 
      "typescript", "frontend", "client", "browser", "accessibility", "wcag", "redux", 
      "component", "dom", "webpack", "vite", "lighthouse", "nextjs", "sass"
    ];
    feKeywords.forEach(word => {
      if (lower.includes(word)) score += 5;
    });
  } else if (role === "backend") {
    const beKeywords = [
      "api", "rest", "graphql", "grpc", "auth", "jwt", "oauth", "sql", "postgresql", 
      "mysql", "mongodb", "redis", "kafka", "backend", "server", "docker", "kubernetes", 
      "microservice", "queue", "scaling", "latency", "node", "express", "go", "java", "spring"
    ];
    beKeywords.forEach(word => {
      if (lower.includes(word)) score += 5;
    });
  } else if (role === "ai" || role === "ml") {
    const aiKeywords = [
      "ml", "machine learning", "deep learning", "nlp", "computer vision", "pytorch", 
      "tensorflow", "data engineering", "model", "training", "pipeline", "analytics", 
      "spark", "pandas", "numpy", "dataset", "scikit-learn", "scikit", "llm", "bert", 
      "gpt", "cnn", "rnn", "huggingface", "fine-tuning", "inference"
    ];
    aiKeywords.forEach(word => {
      if (lower.includes(word)) score += 5;
    });
  }

  return score;
}
