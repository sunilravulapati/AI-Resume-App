import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS PARSER IS DIFFERENT
//
// pdf2json's getRawTextContent() returns a FLAT string with spaces — NOT newlines.
// "Sunil Ravulapati sunilravulapati028@gmail.com +919550145568 SKILLS ..."
//
// So every parser below works on token/keyword matching against the flat string,
// not on line splitting. Sections are found by locating known uppercase headings
// as word boundaries in the flat text.
// ─────────────────────────────────────────────────────────────────────────────

// Known section headings in order they typically appear.
// Uppercase because pdf2json tends to capitalise section titles.
const SECTION_HEADINGS = [
  'SKILLS', 'TECHNICAL SKILLS',
  'PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'PROFILE',
  'PROJECTS',
  'WORK EXPERIENCE', 'WORK EXPERIENCES', 'EXPERIENCE', 'INTERNSHIP', 'INTERNSHIPS',
  'EDUCATION', 'EDUCATIONS',
  'AWARDS', 'ACHIEVEMENTS', 'AWARDS & ACHIEVEMENTS', 'AWARDS AND ACHIEVEMENTS',
  'CERTIFICATIONS', 'CERTIFICATES',
  'DSA PROFICIENCY', 'DSA',
  'LANGUAGES', 'INTERESTS', 'VOLUNTEER',
  'RELEVANT EXPERIENCE',
];

// Build one big alternation regex from all headings (longest first to avoid prefix matches)
const HEADING_RE = new RegExp(
  `\\b(${[...SECTION_HEADINGS]
    .sort((a, b) => b.length - a.length)
    .map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})\\b`,
  'g'
);

/**
 * Split flat text into { HEADING: "content up to next heading", ... }
 */
function splitSections(text) {
  const sections = {};
  const matches  = [];

  let m;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(text)) !== null) {
    matches.push({ heading: m[1], index: m.index, end: m.index + m[0].length });
  }

  // Everything before the first heading = header block
  sections['HEADER'] = matches.length ? text.slice(0, matches[0].index).trim() : text.trim();

  for (let i = 0; i < matches.length; i++) {
    const start   = matches[i].end;
    const end     = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    // Normalise key: collapse spaces, keep uppercase
    const key = matches[i].heading.toUpperCase().replace(/\s+/g, ' ');
    // Don't overwrite if already found (keeps first occurrence)
    if (!sections[key]) sections[key] = content;
  }

  return sections;
}

// ── Contact extraction ───────────────────────────────────────────────────────
function extractContacts(text) {
  const email     = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0]       || null;
  const phone     = text.match(/\+?\d[\d\s()\-]{7,}\d/)?.[0]?.trim()                      || null;
  const linkedinM = text.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  const githubM   = text.match(/github\.com\/([A-Za-z0-9_-]+)/i);
  // Website: anything that starts with http that is NOT linkedin or github
  const websiteM  = text.match(/https?:\/\/(?!(?:www\.)?linkedin|(?:www\.)?github)[^\s,)>]+/i);
  // Location heuristic: "City, Country" or "City, State, India"
  const locationM = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*(?:India|[A-Z][a-z]+)\b/);

  return {
    email,
    phone,
    linkedin: linkedinM?.[1] || null,
    github:   githubM?.[1]   || null,
    website:  websiteM?.[0]  || null,
    location: locationM?.[0] || null,
  };
}

// ── Name extraction ──────────────────────────────────────────────────────────
// In the flat header block the name is usually the first run of words before
// the first contact detail (email / phone / url).
function extractName(headerBlock, userFirstName = '') {
  if (!headerBlock) return userFirstName;
  // Strip everything from the first digit run or @ onwards
  const beforeContact = headerBlock.split(/\+?\d{5,}|@|https?:\/\//)[0].trim();
  // Keep only letters, spaces, dots, hyphens — drop stray symbols
  const cleaned = beforeContact.replace(/[^A-Za-z\s.'"-]/g, ' ').replace(/\s+/g, ' ').trim();
  // Take max first 5 words (names are rarely longer)
  return cleaned.split(' ').slice(0, 5).join(' ') || userFirstName;
}

// ── Tagline extraction ───────────────────────────────────────────────────────
// The tagline, if present, usually follows the name in the header block,
// before the contact details. It looks like: "Full-Stack Developer | Top 1.3% ..."
function extractTagline(headerBlock) {
  if (!headerBlock) return '';
  const beforeContact = headerBlock.split(/\+?\d{5,}|@|https?:\/\//)[0].trim();
  // Anything after the first proper name-length chunk that contains | or – is a tagline
  const taglineMatch = beforeContact.match(/([A-Z][a-zA-Z\s|&.,'%-]{20,120})/);
  const candidate = taglineMatch?.[1]?.trim() || '';
  // Reject if it looks like it's just the name again
  if (candidate.split(' ').length > 8 || candidate.includes('|') || candidate.includes('–')) {
    return candidate;
  }
  return '';
}

// ── Skills parser ────────────────────────────────────────────────────────────
// Handles "• Category: val1, val2" and plain comma lists in flat text
function parseSkills(block) {
  if (!block) return [];
  const rows = [];

  // Try to find "Label: value" pairs (works when pdf2json preserves the colon)
  const colonRe = /([A-Za-z &]{3,35}):\s*([^:•]+?)(?=\s+[A-Za-z &]{3,35}:|$)/g;
  let m;
  while ((m = colonRe.exec(block)) !== null) {
    const label = m[1].trim();
    const value = m[2].replace(/•/g, '').replace(/\s+/g, ' ').trim();
    if (value.length > 3) rows.push({ label, value });
  }

  // Fallback: dump the whole block
  if (rows.length === 0 && block.trim()) {
    rows.push({ label: '', value: block.replace(/•/g, '').replace(/\s+/g, ' ').trim() });
  }

  return rows;
}

// ── Entry parser ─────────────────────────────────────────────────────────────
// Works on flat text. Splits on bullet character • or on sentences that start
// a new project/role (capital word followed by parenthetical tech stack).
function parseEntries(block) {
  if (!block) return [];

  // ── Step 1: split on bullet markers ──────────────────────────────────────
  const rawChunks = block.split(/•/).map(c => c.trim()).filter(c => c.length > 5);
  if (rawChunks.length === 0) return [];

  // ── Step 2: detect embedded titles at the TAIL of bullet chunks ──────────
  // pdf2json glues the next project title to the end of the previous bullet:
  //   "Ensured data consistency across users Expense Analytics System (MERN Stack)"
  // We find Title-Case word runs (+ optional parens) after a lowercase word.
  const EMBEDDED_TITLE_RE = /(?<=[a-z])\s+([A-Z][A-Za-z-]+(?:\s+[A-Z][A-Za-z-]+){1,8}(?:\s*\([^)]{2,40}\))?)\s*$/;

  const chunks = [];
  for (let ci = 0; ci < rawChunks.length; ci++) {
    const chunk = rawChunks[ci];
    // Only look for embedded titles in bullet chunks (not the first chunk,
    // which is always the first entry title and has no preceding sentence).
    // Also only search if the chunk is long enough to contain a title at the end.
    if (ci > 0 && chunk.length > 30) {
      const m = EMBEDDED_TITLE_RE.exec(chunk);
      if (m) {
        const bulletPart = chunk.slice(0, m.index).trim();
        const titlePart  = m[1].trim();
        if (bulletPart.length > 5) chunks.push(bulletPart);
        chunks.push(titlePart);
        continue;
      }
    }
    chunks.push(chunk);
  }

  // ── Step 3: classify each chunk as title or bullet ────────────────────────
  const ACTION_VERBS = /^(Engineered|Built|Developed|Implemented|Designed|Achieved|Integrated|Optimized|Created|Led|Launched|Managed|Processed|Architected|Awarded|Winner|Ranked|Completed|Ensured|Delivered)/i;

  const isTitle = (s) =>
    s.length < 100 &&
    /^[A-Z]/.test(s) &&
    !ACTION_VERBS.test(s) &&
    !/^[^,]{0,30},\s*[a-z]/.test(s);

  // ── Step 4: group into entry objects ─────────────────────────────────────
  const entries = [];
  let current   = null;

  const makeEntry = (titleChunk) => {
    const parenMatch = titleChunk.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    const dashMatch  = !parenMatch && titleChunk.match(/^(.+?)\s*[–|]\s*(.+)$/);
    const match      = parenMatch || dashMatch;
    return {
      title:   match ? match[1].trim() : titleChunk,
      meta:    match ? match[2].trim() : '',
      bullets: [],
      tech:    '',
    };
  };

  for (const chunk of chunks) {
    if (isTitle(chunk)) {
      if (current) entries.push(current);
      current = makeEntry(chunk);
    } else if (current) {
      if (/^(Technologies|Tech Stack|Tools Used|Stack)\b/i.test(chunk)) {
        current.tech = chunk.replace(/^(Technologies|Tech Stack|Tools Used|Stack)[^:]*:\s*/i, '').trim();
      } else if (chunk.length > 8) {
        current.bullets.push(chunk);
      }
    }
  }
  if (current) entries.push(current);

  return entries.filter(e => e.bullets.length > 0 || e.meta.length > 3);
}

// ── Education parser ─────────────────────────────────────────────────────────
function parseEducation(block) {
  if (!block) return [];

  // Common pattern: "University Name Expected/Aug YYYY B.Tech ... CGPA X.XX"
  // Split on year-like boundaries
  const yearRe    = /\b(Expected\s+)?\d{4}\b/g;
  const sentences = block.split(/(?=\b(?:Expected\s+)?\d{4}\b|B\.?Tech|B\.?E\b|Bachelor|Master|MBA|MCA|BCA|PhD)/i)
                         .map(s => s.trim()).filter(Boolean);

  const entries = [];
  let current   = null;

  for (const s of sentences) {
    if (/^[A-Z][a-zA-Z\s]+(?:University|College|Institute|School|Academy)/i.test(s)) {
      if (current) entries.push(current);
      current = { institution: s.trim(), degree: '', dates: '', gpa: '', extra: [] };
    } else if (current) {
      if (/B\.?Tech|B\.?E\b|Bachelor|Master|MBA|MCA|BCA|PhD/i.test(s) && !current.degree)  current.degree = s.trim();
      else if (/\b\d{4}\b/.test(s) && !current.dates)  current.dates = s.trim();
      else if (/CGPA|GPA|%|Grade/i.test(s))            current.gpa   = s.trim();
      else if (s.length > 3)                            current.extra.push(s.trim());
    }
  }
  if (current) entries.push(current);

  // Fallback: if no university found, just show raw block
  if (entries.length === 0 && block.trim()) {
    entries.push({ institution: block.trim(), degree: '', dates: '', gpa: '', extra: [] });
  }

  return entries;
}

// ── Awards parser ────────────────────────────────────────────────────────────
function parseAwards(block) {
  if (!block) return [];

  // Split on • bullets
  const items = block.split(/•/).map(s => s.trim()).filter(s => s.length > 5);
  return items.map(item => {
    const dateM = item.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i);
    const title = item.replace(dateM?.[0] || '', '').replace(/^[-–]\s*/, '').trim();
    return { title, date: dateM?.[0] || '', org: '', desc: '' };
  }).filter(a => a.title.length > 3);
}

// ── AI bullet matcher ────────────────────────────────────────────────────────
function getAIBullets(title, tailoredExperience) {
  if (!tailoredExperience?.length) return null;
  const t = title.toLowerCase();
  const match = tailoredExperience.find(e =>
    e.title && (
      e.title.toLowerCase().includes(t) ||
      t.includes(e.title.toLowerCase()) ||
      // word overlap >= 2 words
      e.title.toLowerCase().split(/\s+/).filter(w => w.length > 3 && t.includes(w)).length >= 2
    )
  );
  return match?.bullets?.length ? match.bullets : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 36, paddingBottom: 36, paddingHorizontal: 44,
    fontFamily: 'Helvetica', fontSize: 9.5, color: '#111', lineHeight: 1.4,
  },
  header:     { marginBottom: 10, textAlign: 'center' },
  name:       { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  tagline:    { fontSize: 9, color: '#444', marginBottom: 4 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, fontSize: 8.5, color: '#333' },
  link:       { color: '#0066cc', textDecoration: 'none' },
  sep:        { color: '#bbb' },

  section:      { marginBottom: 9 },
  sectionTitle: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase',
    letterSpacing: 0.8, borderBottomWidth: 0.75, borderBottomColor: '#111',
    paddingBottom: 2, marginBottom: 5,
  },

  skillRow:   { flexDirection: 'row', marginBottom: 2.5 },
  skillLabel: { width: 140, fontFamily: 'Helvetica-Bold', fontSize: 9 },
  skillValue: { flex: 1, fontSize: 9, color: '#222' },

  entryWrap:   { marginBottom: 7 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  entryTitle:  { fontSize: 9.5, fontFamily: 'Helvetica-Bold', flex: 1 },
  entryMeta:   { fontSize: 8.5, color: '#555', fontStyle: 'italic' },
  bullet:      { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 8 },
  bulletDot:   { width: 10, fontSize: 9 },
  bulletText:  { flex: 1, fontSize: 9, color: '#222', lineHeight: 1.45 },
  techLine:    { fontSize: 8.5, color: '#555', marginTop: 2, paddingLeft: 8 },
  techBold:    { fontFamily: 'Helvetica-Bold' },

  eduRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  eduLeft: { flex: 1 },
  eduInst: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  eduDeg:  { fontSize: 9, color: '#333' },
  eduDet:  { fontSize: 8.5, color: '#555' },
  eduDate: { fontSize: 8.5, color: '#555', textAlign: 'right', minWidth: 70 },

  awardRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  awardLeft:  { flex: 1 },
  awardTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  awardMeta:  { fontSize: 8.5, color: '#444' },
  awardDesc:  { fontSize: 8.5, color: '#333', marginTop: 1 },
  awardDate:  { fontSize: 8.5, color: '#555', minWidth: 60, textAlign: 'right' },

  plain: { fontSize: 9, color: '#222', lineHeight: 1.5 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const ST = ({ children }) => <Text style={s.sectionTitle}>{children}</Text>;

const Bul = ({ text }) => (
  <View style={s.bullet}>
    <Text style={s.bulletDot}>•</Text>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

const TechLine = ({ tech }) =>
  tech ? (
    <Text style={s.techLine}>
      <Text style={s.techBold}>Technologies: </Text>
      <Text>{tech}</Text>
    </Text>
  ) : null;

const Sep = () => <Text style={s.sep}> | </Text>;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// Props:
//   tailoredData — { tailoredSummary, tailoredSkills[], tailoredExperience[] }
//   parsedText   — flat string from pdf2json getRawTextContent()
//   user         — { firstName, lastName, email } from Zustand store
// ─────────────────────────────────────────────────────────────────────────────
export default function TailoredPDF({ tailoredData, parsedText = '', user }) {

  // 1. Split into sections
  const sec = splitSections(parsedText);

  // 2. Extract structured data from each section
  const headerBlock = sec['HEADER'] || '';
  const name        = extractName(headerBlock, `${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const tagline     = extractTagline(headerBlock);
  const contacts    = extractContacts(parsedText); // search full text for contact details

  const skillsRaw  = sec['SKILLS'] || sec['TECHNICAL SKILLS'] || '';
  const projRaw    = sec['PROJECTS'] || '';
  const workRaw    = sec['WORK EXPERIENCE'] || sec['WORK EXPERIENCES'] || sec['EXPERIENCE'] || sec['INTERNSHIPS'] || sec['INTERNSHIP'] || sec['RELEVANT EXPERIENCE'] || '';
  const eduRaw     = sec['EDUCATION'] || sec['EDUCATIONS'] || '';
  const awardsRaw  = sec['AWARDS'] || sec['ACHIEVEMENTS'] || sec['AWARDS & ACHIEVEMENTS'] || sec['AWARDS AND ACHIEVEMENTS'] || '';
  const dsaRaw     = sec['DSA PROFICIENCY'] || sec['DSA'] || '';
  const summaryRaw = sec['PROFESSIONAL SUMMARY'] || sec['SUMMARY'] || sec['OBJECTIVE'] || sec['PROFILE'] || '';

  const skillRows = parseSkills(skillsRaw);
  const projects  = parseEntries(projRaw);
  const workExps  = parseEntries(workRaw);
  const education = parseEducation(eduRaw);
  const awards    = parseAwards(awardsRaw);

  // 3. Apply AI overrides
  //    tailoredSkills → prepend as first row
  const finalSkillRows = tailoredData?.tailoredSkills?.length
    ? [{ label: 'Targeted Skills', value: tailoredData.tailoredSkills.join(', ') }, ...skillRows]
    : skillRows;

  //    tailoredSummary → replace raw summary
  const finalSummary = tailoredData?.tailoredSummary || summaryRaw;

  //    tailoredExperience → merge bullets by fuzzy title match
  const te = tailoredData?.tailoredExperience;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.name}>{name}</Text>
          {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}
          <View style={s.contactRow}>
            {contacts.phone && <Text>{contacts.phone}</Text>}
            {contacts.phone && contacts.email && <Sep />}
            {contacts.email && (
              <Link src={`mailto:${contacts.email}`} style={s.link}>{contacts.email}</Link>
            )}
            {contacts.linkedin && <Sep />}
            {contacts.linkedin && (
              <Link src={`https://linkedin.com/in/${contacts.linkedin}`} style={s.link}>
                {contacts.linkedin}
              </Link>
            )}
            {contacts.github && <Sep />}
            {contacts.github && (
              <Link src={`https://github.com/${contacts.github}`} style={s.link}>
                {contacts.github}
              </Link>
            )}
            {contacts.website && <Sep />}
            {contacts.website && (
              <Link src={contacts.website} style={s.link}>Portfolio</Link>
            )}
            {contacts.location && <Sep />}
            {contacts.location && <Text>{contacts.location}</Text>}
          </View>
        </View>

        {/* SKILLS */}
        {finalSkillRows.length > 0 && (
          <View style={s.section}>
            <ST>Skills</ST>
            {finalSkillRows.map((row, i) => (
              <View key={i} style={s.skillRow}>
                {row.label
                  ? <Text style={s.skillLabel}>{row.label}</Text>
                  : null}
                <Text style={[s.skillValue, !row.label && { flex: 1 }]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* PROFESSIONAL SUMMARY */}
        {finalSummary ? (
          <View style={s.section}>
            <ST>Professional Summary</ST>
            <Text style={s.plain}>{finalSummary}</Text>
          </View>
        ) : null}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <View style={s.section}>
            <ST>Projects</ST>
            {projects.map((proj, i) => {
              const bullets = getAIBullets(proj.title, te) || proj.bullets;
              return (
                <View key={i} style={s.entryWrap}>
                  <View style={s.entryHeader}>
                    <Text style={s.entryTitle}>{proj.title}</Text>
                    {proj.meta ? <Text style={s.entryMeta}>{proj.meta}</Text> : null}
                  </View>
                  {bullets.map((b, j) => <Bul key={j} text={b} />)}
                  <TechLine tech={proj.tech} />
                </View>
              );
            })}
          </View>
        )}

        {/* WORK EXPERIENCE */}
        {workExps.length > 0 && (
          <View style={s.section}>
            <ST>Work Experience</ST>
            {workExps.map((job, i) => {
              const bullets = getAIBullets(job.title, te) || getAIBullets(job.meta, te) || job.bullets;
              return (
                <View key={i} style={s.entryWrap}>
                  <View style={s.entryHeader}>
                    <Text style={s.entryTitle}>{job.title}</Text>
                    {job.meta ? <Text style={s.entryMeta}>{job.meta}</Text> : null}
                  </View>
                  {bullets.map((b, j) => <Bul key={j} text={b} />)}
                  <TechLine tech={job.tech} />
                </View>
              );
            })}
          </View>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View style={s.section}>
            <ST>Education</ST>
            {education.map((edu, i) => (
              <View key={i} style={s.eduRow}>
                <View style={s.eduLeft}>
                  <Text style={s.eduInst}>{edu.institution}</Text>
                  {edu.degree && <Text style={s.eduDeg}>{edu.degree}</Text>}
                  {(edu.gpa || edu.extra.length > 0) && (
                    <Text style={s.eduDet}>
                      {[edu.gpa, ...edu.extra].filter(Boolean).join('  ·  ')}
                    </Text>
                  )}
                </View>
                {edu.dates && <Text style={s.eduDate}>{edu.dates}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* AWARDS & ACHIEVEMENTS */}
        {awards.length > 0 && (
          <View style={s.section}>
            <ST>Awards & Achievements</ST>
            {awards.map((award, i) => (
              <View key={i} style={s.awardRow}>
                <View style={s.awardLeft}>
                  <Text style={s.awardTitle}>{award.title}</Text>
                  {award.org  && <Text style={s.awardMeta}>{award.org}</Text>}
                  {award.desc && <Text style={s.awardDesc}>{award.desc}</Text>}
                </View>
                {award.date && <Text style={s.awardDate}>{award.date}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* DSA PROFICIENCY */}
        {dsaRaw ? (
          <View style={s.section}>
            <ST>DSA Proficiency</ST>
            <Text style={s.plain}>{dsaRaw}</Text>
          </View>
        ) : null}

      </Page>
    </Document>
  );
}