//this function is used to deduplicate the resume content
export function deduplicateResumeContent(resume) {
  if (!resume || typeof resume !== "object") return resume;

  const deduped = { ...resume };

  if (Array.isArray(deduped.skills)) {
    const seenSkills = new Set();
    deduped.skills = deduped.skills.map(cat => {
      if (!cat || typeof cat !== "object") return cat;
      const label = cat.label || "";
      const value = cat.value || "";
      
      const skillsList = value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
      
      const uniqueSkills = [];
      skillsList.forEach(s => {
        const lower = s.toLowerCase();
        if (!seenSkills.has(lower)) {
          seenSkills.add(lower);
          uniqueSkills.push(s);
        }
      });

      return {
        label,
        value: uniqueSkills.join(", ")
      };
    }).filter(cat => cat && cat.value && cat.value.trim().length > 0);
  }

  const dsaStatLines = [
    ...(Array.isArray(deduped.dsaProfiles) ? deduped.dsaProfiles : []),
    ...(Array.isArray(deduped.dsaProficiency) ? deduped.dsaProficiency : [])
  ].map(p => (p || "").toLowerCase().trim()).filter(Boolean);

  const hasDSASignals = dsaStatLines.length > 0;

  if (hasDSASignals) {
    // Check achievements
    if (Array.isArray(deduped.achievements)) {
      deduped.achievements = deduped.achievements.map(ach => {
        if (!ach || !Array.isArray(ach.bullets)) return ach;
        ach.bullets = ach.bullets.filter(bullet => {
          const lower = (bullet || "").toLowerCase();
          
          // Check if bullet mentions LeetCode/Hackerrank stats and overlaps with DSA section
          const isDSAMention = /leetcode|codechef|codeforces|hackerrank|gfg/i.test(lower);
          if (isDSAMention) {
            const hasDuplicateMetric = dsaStatLines.some(statLine => {
              // Extract numeric score or rank to check overlapping stats
              const numbers = lower.match(/\b\d+\b/g);
              if (numbers && numbers.length > 0) {
                return numbers.some(n => statLine.includes(n));
              }
              return false;
            });
            if (hasDuplicateMetric) return false;
          }
          return true;
        });
        return ach;
      }).filter(ach => ach && Array.isArray(ach.bullets) && ach.bullets.length > 0);
    }

    // Check awards
    if (Array.isArray(deduped.awards)) {
      deduped.awards = deduped.awards.filter(award => {
        const lowerTitle = (award.title || "").toLowerCase();
        const lowerDesc = (award.desc || "").toLowerCase();
        
        const isDSAMention = /leetcode|codechef|codeforces|hackerrank|gfg/i.test(lowerTitle + " " + lowerDesc);
        if (isDSAMention) {
          const hasDuplicateMetric = dsaStatLines.some(statLine => {
            const numbers = (lowerTitle + " " + lowerDesc).match(/\b\d+\b/g);
            if (numbers && numbers.length > 0) {
              return numbers.some(n => statLine.includes(n));
            }
            return false;
          });
          if (hasDuplicateMetric) return false;
        }
        return true;
      });
    }
  }

  // Deduplicate duplicate bullet points between Work Experience and Projects
  if (Array.isArray(deduped.experience) && Array.isArray(deduped.projects)) {
    const seenBullets = new Set();
    deduped.experience.forEach(exp => {
      if (exp && Array.isArray(exp.bullets)) {
        exp.bullets.forEach(b => {
          const normalized = (b || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          if (normalized) seenBullets.add(normalized);
        });
      }
    });

    deduped.projects = deduped.projects.map(proj => {
      if (proj && Array.isArray(proj.bullets)) {
        proj.bullets = proj.bullets.filter(b => {
          const normalized = (b || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          return !seenBullets.has(normalized);
        });
      }
      return proj;
    }).filter(proj => proj && Array.isArray(proj.bullets) && proj.bullets.length > 0);
  }

  return deduped;
}
