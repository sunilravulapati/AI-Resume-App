export const calculateProgrammaticScore = (text) => {
    let score = 0;
    const lowercaseText = text.toLowerCase();

    /*
    1. Essential Sections (20 pts)
    */
    const sections = ["education", "experience", "projects", "skills"];

    sections.forEach((section) => {
        if (lowercaseText.includes(section)) {
            score += 5;
        }
    });

    /*
    2. Contact Info & Links (15 pts)
    */
    const hasEmail = /\S+@\S+\.\S+/.test(text);
    const hasGithub = /github\.com\/[a-zA-Z0-9_-]+/.test(lowercaseText);
    const hasLinkedin = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/.test(lowercaseText);

    if (hasEmail) score += 5;
    if (hasGithub) score += 5;
    if (hasLinkedin) score += 5;

    /*
    3. Quantifiable Metrics (15 pts)
    */
    const metricsRegex =
        /(\d+(?:\.\d+)?%|\$\d+|\d+\+?\s*(users|customers|clients|requests|ms|seconds))/g;

    const metricsMatch = text.match(metricsRegex);

    if (metricsMatch) {
        score += Math.min(metricsMatch.length * 3, 15);
    }

    /*
    4. Strong Action Verbs (10 pts)
    */
    const strongVerbs = [
        "developed",
        "architected",
        "optimized",
        "scaled",
        "implemented",
        "designed",
        "engineered",
        "built",
        "automated",
        "orchestrated",
    ];

    let verbCount = 0;

    strongVerbs.forEach((verb) => {
        if (lowercaseText.includes(verb)) {
            verbCount++;
        }
    });

    score += Math.min(verbCount * 2, 10);

    return score; // Max = 60
};