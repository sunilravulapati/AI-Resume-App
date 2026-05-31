// import { resolveDisplayName } from "../services/resumeFormat.js";

function parseMeta(meta = "") {
    if (!meta) return { company: "", location: "", dates: "" };

    if (meta.includes("|")) {
        const parts = meta.split("|").map((p) => p.trim());
        if (parts.length >= 3) {
            return { company: parts[0], location: parts[1], dates: parts[2] };
        }
        if (parts.length === 2) {
            return { company: parts[0], location: "", dates: parts[1] };
        }
    }

    if (meta.includes("/")) {
        const parts = meta.split("/").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
            return { company: parts[0], location: parts.slice(1, -1).join(", "), dates: parts[parts.length - 1] };
        }
        if (parts.length === 2) {
            const datePattern = /\d{4}|present/i;
            if (datePattern.test(parts[1])) {
                return { company: parts[0], location: "", dates: parts[1] };
            }
            return { company: parts[0], location: parts[1], dates: "" };
        }
    }

    const dateMatch = meta.match(
        /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[–\-]\s*(?:Present|\w+ \d{4}|\d{4}))\s*$/i
    );
    if (dateMatch) {
        const dates = dateMatch[1].trim();
        const company = meta.slice(0, dateMatch.index).replace(/[,|·/]+$/, "").trim();
        return { company, location: "", dates };
    }

    return { company: meta, location: "", dates: "" };
}

export function normalizeResume(data) {
    if (!data || typeof data !== "object") return {};

    const basics = data.basics || {};

    let rawName = (basics.name || data.name || "").trim();
    if (/professional\s+summary|resume|curriculum\s+vitae|cv/i.test(rawName) || !rawName) {
        rawName = "";
    }
    const cleanName = rawName.replace(/^[^a-zA-Z\s]+/g, "").trim();

    const normalized = {
        basics: {
            name: cleanName,
            email: (basics.email || data.email || "").trim(),
            phone: (basics.phone || data.phone || "").trim(),
            linkedin: (basics.linkedin || data.linkedin || "").trim(),
            github: (basics.github || data.github || "").trim(),
            portfolio: (basics.portfolio || data.portfolio || "").trim(),
            location: (basics.location || data.location || "").trim(),
            tagline: (basics.tagline || data.tagline || "").trim(),
        },
        name: cleanName,
        email: (basics.email || data.email || "").trim(),
        phone: (basics.phone || data.phone || "").trim(),
        linkedin: (basics.linkedin || data.linkedin || "").trim(),
        github: (basics.github || data.github || "").trim(),
        portfolio: (basics.portfolio || data.portfolio || "").trim(),
        location: (basics.location || data.location || "").trim(),
        tagline: (basics.tagline || data.tagline || "").trim(),
    };

    normalized.summary = (data.summary || data.tailoredSummary || "").trim();

    const rawSkills = data.skills || data.tailoredSkills || [];
    if (Array.isArray(rawSkills)) {
        normalized.skills = rawSkills.map((s) => ({
            label: (s.label || s.category || "").trim(),
            value: (s.value || (Array.isArray(s.items) ? s.items.join(", ") : s.items) || "").trim(),
        })).filter((s) => s.label && s.value);
    } else if (rawSkills && typeof rawSkills === "object") {
        normalized.skills = Object.entries(rawSkills).map(([k, v]) => ({
            label: k.trim(),
            value: Array.isArray(v) ? v.join(", ") : String(v).trim(),
        }));
    } else {
        normalized.skills = [];
    }

    const rawExp = data.experience || data.tailoredExperience || [];
    const personalProjectMarkers = /^(personal project|side project|academic project|self project|open[- ]?source|hobby project)$/i;
    
    normalized.experience = rawExp
        .filter((exp) => !personalProjectMarkers.test((exp.company || "").trim()))
        .map((exp) => {
            if (exp.company && exp.dates) {
                return {
                    title: (exp.title || "").trim(),
                    company: (exp.company || "").trim(),
                    location: (exp.location || "").trim(),
                    dates: (exp.dates || "").trim(),
                    tech: (exp.tech || "").trim(),
                    bullets: (exp.bullets || []).map((b) => String(b).trim()).filter(Boolean),
                };
            }
            const parsed = parseMeta(exp.meta || "");
            return {
                title: (exp.title || "").trim(),
                company: parsed.company || (exp.company || "").trim(),
                location: parsed.location || (exp.location || "").trim(),
                dates: parsed.dates || (exp.dates || "").trim(),
                tech: (exp.tech || "").trim(),
                bullets: (exp.bullets || []).map((b) => String(b).trim()).filter(Boolean),
            };
        });

    const rescuedProjects = rawExp
        .filter((exp) => personalProjectMarkers.test((exp.company || "").trim()))
        .map((exp) => ({
            title: (exp.title || "").trim(),
            tech: (exp.tech || "").trim(),
            meta: (exp.meta || exp.dates || "").trim(),
            bullets: (exp.bullets || []).map((b) => String(b).trim()).filter(Boolean),
        }));

    const rawProjects = data.projects || [];
    const canonicalProjects = rawProjects.map((p) => ({
        title: (p.title || "").trim(),
        tech: (p.tech || "").trim(),
        meta: (p.meta || "").trim(),
        bullets: (p.bullets || []).map((b) => String(b).trim()).filter(Boolean),
    }));

    const existingTitles = new Set(canonicalProjects.map(p => p.title.toLowerCase()));
    rescuedProjects.forEach(rp => {
        if (rp.title && !existingTitles.has(rp.title.toLowerCase())) {
            canonicalProjects.push(rp);
            existingTitles.add(rp.title.toLowerCase());
        }
    });
    normalized.projects = canonicalProjects;

    normalized.education = (data.education || []).map((edu) => {
        const gpa = edu.gpa ? String(edu.gpa).replace(/(CGPA|GPA)\s*:?\s*/gi, "").trim() : "";
        const extras = (edu.extra || []).filter(Boolean).join(" · ");
        return {
            institution: (edu.institution || "").trim(),
            degree: (edu.degree || "").trim(),
            dates: (edu.dates || "").trim(),
            gpa,
            extras,
        };
    });

    normalized.awards = (data.awards || []).map((a) => ({
        title: (a.title || "").trim(),
        org: (a.org || a.organization || a.issuer || "").trim(),
        desc: (a.desc || a.description || "").trim(),
        date: (a.date || a.dates || "").trim(),
    })).filter(a => a.title);

    if (Array.isArray(data.achievements)) {
        data.achievements.forEach((ach) => {
            (ach.bullets || []).forEach((b) => {
                normalized.awards.push({ title: String(b).trim(), desc: "", date: "" });
            });
        });
    }

    const rawCert = data.certifications || [];
    normalized.certifications = rawCert.map((c) => ({
        title: (c.title || "").trim(),
        org: (c.org || c.issuer || "").trim(),
        dates: (c.dates || c.date || "").trim(),
        url: (c.url || c.link || "").trim(),
    })).filter(c => c.title);

    const rawDSA = data.dsaProfiles || data.dsaProficiency || [];
    normalized.dsaProfiles = rawDSA.map((item) => String(item).trim()).filter(Boolean);
    normalized.dsaProficiency = normalized.dsaProfiles;

    normalized.extracurricular = (data.extracurricular || []).map((item) => ({
        title: (item.title || item.role || "").trim(),
        bullets: (item.bullets || []).map((b) => String(b).trim()).filter(Boolean),
    }));

    if (Array.isArray(data.languages)) {
        normalized.languages = data.languages.join(", ").trim();
    } else {
        normalized.languages = (data.languages || "").trim();
    }

    return normalized;
}