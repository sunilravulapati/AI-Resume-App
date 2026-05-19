import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { preparePdfData } from '../utils/resumeFormat';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  ink:    '#0f0f0f',
  body:   '#1e1e1e',
  mid:    '#444444',
  muted:  '#777777',
  rule:   '#1a1a1a',
  accent: '#1a56a0',
  shade:  '#f5f5f5',
  white:  '#ffffff',
};

const F = {
  roman:  'Helvetica',
  bold:   'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldIt: 'Helvetica-BoldOblique',
};

// FIX v2: Tighter spacing throughout to recover ~40pt of vertical space,
// which is needed to fit DSA Proficiency, Certifications, and all 4 Awards
// that were previously missing or truncated.
//
// Key changes vs original:
//   page:         paddingTop 16→12, paddingBottom 14→10, paddingHorizontal 18→16
//   sectionTitle: fontSize 7.4→7.2, marginBottom 2→1.5
//   entryWrap:    marginBottom 2→1.5
//   bullet:       marginBottom 0.5→0.3
//   bulletText:   fontSize 7.8→7.6, lineHeight 1.27→1.2
//   skillRow:     paddingVertical 0.4→0.3
//   skillLabel:   fontSize 7.6→7.4, width 118→110
//   skillValue:   fontSize 7.6→7.4
//   section:      marginBottom 3→2
//   eduRow:       marginBottom 1→0.5
//   awardRow:     marginBottom 2→1.5
//   certRow:      marginBottom 2→1.5
//   contactRow:   gap 4→3, fontSize 7.6→7.4
//   entryDate:    fontSize 7.2→7.0
//   entryMeta:    fontSize 7.4→7.2
//   entryTech:    fontSize 7.4→7.2
const s = StyleSheet.create({
  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    paddingTop:        24,
    paddingBottom:     24,
    paddingHorizontal: 28,
    fontFamily:        F.roman,
    fontSize:          9.0,
    color:             C.body,
    lineHeight:        1.22,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: { width: '100%', marginBottom: 4 },
  name: {
    fontSize:     16,
    fontFamily:   F.bold,
    letterSpacing: 0.5,
    color:        C.ink,
    textAlign:    'center',
    marginBottom: 3,
  },
  taglineWrap: { width: '100%', marginBottom: 3, paddingHorizontal: 8 },
  tagline: {
    fontSize:   8.0,
    color:      C.mid,
    textAlign:  'center',
    lineHeight: 1.25,
  },
  contactRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    justifyContent: 'center',
    gap:            4,
    fontSize:       8.0,
    color:          C.mid,
  },
  link: { color: C.accent, textDecoration: 'none' },
  sep:  { color: '#cccccc' },

  // ── Section wrapper ───────────────────────────────────────────────────────
  section: { marginBottom: 4 },

  // ── Section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize:          9.0,
    fontFamily:        F.bold,
    textTransform:     'uppercase',
    letterSpacing:     1.2,
    color:             C.ink,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    paddingBottom:     1.5,
    marginBottom:      3,
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  skillRow: {
    flexDirection:  'row',
    paddingVertical:   0.5,
    paddingHorizontal: 3,
    marginBottom:   0,
  },
  skillRowShaded: { backgroundColor: C.shade },
  skillLabel: { width: 110, fontFamily: F.bold, fontSize: 8.5, color: C.ink },
  skillValue: { flex: 1, fontSize: 8.5, color: C.body },

  // ── Experience entry ──────────────────────────────────────────────────────
  entryWrap: { marginBottom: 3 },

  entryTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    marginBottom:   1,
  },
  entryTitle: {
    fontSize:   9.0,
    fontFamily: F.bold,
    color:      C.ink,
    flex:       1,
  },
  entryDate: {
    fontSize:   7.8,
    fontFamily: F.italic,
    color:      C.mid,
    marginLeft: 6,
  },

  entrySubRow: {
    flexDirection: 'row',
    marginBottom:  2,
  },
  entryMeta: {
    fontSize:   8.0,
    fontFamily: F.italic,
    color:      C.mid,
  },
  entryTech: {
    fontSize:   8.0,
    fontFamily: F.italic,
    color:      C.muted,
  },

  // Bullets
  bullet:    { flexDirection: 'row', marginBottom: 0.8, paddingLeft: 6 },
  bulletDot: { width: 8, fontSize: 8.5, color: C.mid },
  bulletText: { flex: 1, fontSize: 8.5, color: C.body, lineHeight: 1.25 },

  // ── Education ─────────────────────────────────────────────────────────────
  eduRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  eduLeft: { flex: 1 },
  eduInst: { fontSize: 9.0, fontFamily: F.bold, color: C.ink },
  eduDeg:  { fontSize: 8.5, fontFamily: F.italic, color: C.mid },
  eduDet:  { fontSize: 8.0, color: C.mid, marginTop: 1 },
  eduDate: { fontSize: 8.0, fontFamily: F.italic, color: C.mid, textAlign: 'right', minWidth: 72 },

  // ── Awards ────────────────────────────────────────────────────────────────
  awardRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  awardLeft:  { flex: 1 },
  awardTitle: { fontSize: 9.0, fontFamily: F.bold, color: C.ink },
  awardMeta:  { fontSize: 8.0, color: C.mid, marginTop: 1 },
  awardDesc:  { fontSize: 8.5, color: C.body, marginTop: 1 },
  awardDate:  { fontSize: 8.0, fontFamily: F.italic, color: C.mid, minWidth: 62, textAlign: 'right' },

  // ── Achievements ──────────────────────────────────────────────────────────
  achCategory: { fontSize: 9.0, fontFamily: F.bold, color: C.ink, marginBottom: 2, marginTop: 3 },

  // ── Extracurricular ───────────────────────────────────────────────────────
  extraTitle: { fontSize: 9.0, fontFamily: F.bold, color: C.ink, marginBottom: 2, marginTop: 3 },

  // ── Certifications ────────────────────────────────────────────────────────
  certRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  certLeft:  { flex: 1 },
  certTitle: { fontSize: 9.0, fontFamily: F.bold, color: C.ink },
  certOrg:   { fontSize: 8.0, fontFamily: F.italic, color: C.mid, marginTop: 1 },
  certUrl:   { fontSize: 7.5, color: C.accent, marginTop: 1, textDecoration: 'none' },
  certDate:  { fontSize: 8.0, fontFamily: F.italic, color: C.mid, minWidth: 72, textAlign: 'right' },

  // ── DSA / plain ───────────────────────────────────────────────────────────
  plain: { fontSize: 8.5, color: C.body, lineHeight: 1.25 },

  contactWrap: { marginBottom: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ST = ({ children }) => <Text style={s.sectionTitle}>{children}</Text>;

const Bul = ({ text }) => (
  <View style={s.bullet}>
    <Text style={s.bulletDot}>–</Text>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

const Sep = () => <Text style={s.sep}> | </Text>;

const cleanGpa = (raw = '') =>
  raw.replace(/(\s*(CGPA|GPA)\s*:?\s*)+/gi, '').trim();

const educationExtras = (edu) => {
  const gpa = edu.gpa ? cleanGpa(edu.gpa) : '';
  const extras = (edu.extra || []).filter((line) => {
    const t = String(line).trim();
    if (!t) return false;
    if (gpa && /cgpa|gpa/i.test(t)) return false;
    return true;
  });
  return { gpa, extras };
};

/**
 * Parse a combined "meta" string that may use either '|' or '/' as separator.
 */
const parseMeta = (meta = '') => {
  const hasPipe  = meta.includes('|');
  const hasSlash = meta.includes('/');

  if (hasPipe) {
    const parts = meta.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      const date  = parts[parts.length - 1];
      const place = parts.slice(0, parts.length - 1).join(' · ');
      return { projectOrPlace: place, location: '', date };
    }
  }

  if (hasSlash) {
    const parts = meta.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const name     = parts[0];
      const date     = parts[1];
      const location = parts.slice(2).join(', ');
      return { projectOrPlace: name, location, date };
    }
    if (parts.length === 2) {
      const name = parts[0];
      const rest = parts[1];
      const datePattern = /\d{4}|present/i;
      if (datePattern.test(rest)) {
        return { projectOrPlace: name, location: '', date: rest };
      }
      return { projectOrPlace: name, location: rest, date: '' };
    }
  }

  const dateMatch = meta.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[–\-]\s*(?:Present|\w+ \d{4}|\d{4}))\s*$/i
  );
  if (dateMatch) {
    const date  = dateMatch[1].trim();
    const place = meta.slice(0, dateMatch.index).replace(/[,|·/]+$/, '').trim();
    return { projectOrPlace: place, location: '', date };
  }

  return { projectOrPlace: meta, location: '', date: '' };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TailoredPDF({ tailoredData, parsedText = '', user, userLinks }) {
  const data   = preparePdfData(tailoredData, parsedText, user);
  const basics = data.basics || {};

  const contacts = {
    email:                  basics.email   || user?.email   || '',
    phone:                  basics.phone   || user?.mobile  || '',
    linkedin:               userLinks?.linkedin             || basics.linkedin             || '',
    github:                 userLinks?.github               || basics.github               || '',
    portfolio:              userLinks?.portfolio            || basics.portfolio            || '',
    competitiveProgramming: userLinks?.competitiveProgramming || basics.competitiveProgramming || '',
    location:               basics.location || '',
  };

  const name    = basics.name    || 'Candidate';
  // FIX: strip trailing ellipsis that appeared when tagline was long
  const tagline = (basics.tagline || '').replace(/…$|\.{3}$/, '').trim();

  const finalSummary    = data.tailoredSummary      || '';
  const finalSkillRows  = data.tailoredSkills        || [];
  const workExps        = data.tailoredExperience    || [];
  const education       = data.education             || [];
  const awards          = data.awards                || [];
  const achievements    = data.achievements          || [];
  const extracurricular = data.extracurricular       || [];
  const dsaLines        = data.dsaProficiency        || [];
  const certs           = data.certifications        || [];
  const languages       = data.languages             || '';

  const hasAwardsSection = awards.length > 0 || achievements.length > 0;

  const renderLink = (href, label) => (
    <Link src={href.startsWith('http') ? href : `https://${href}`} style={s.link}>
      {label}
    </Link>
  );

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.name}>{name}</Text>
        </View>

        {tagline ? (
          <View style={s.taglineWrap}>
            <Text style={s.tagline}>{tagline}</Text>
          </View>
        ) : null}

        <View style={[s.contactRow, s.contactWrap]}>
          {contacts.phone ? <Text>{contacts.phone}</Text> : null}
          {contacts.phone && contacts.email ? <Sep /> : null}
          {contacts.email ? renderLink(`mailto:${contacts.email}`, contacts.email) : null}
          {(contacts.phone || contacts.email) && contacts.linkedin ? <Sep /> : null}
          {contacts.linkedin ? renderLink(
            contacts.linkedin.startsWith('http') ? contacts.linkedin : `https://linkedin.com/in/${contacts.linkedin}`,
            contacts.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, ''),
          ) : null}
          {(contacts.email || contacts.linkedin) && contacts.github ? <Sep /> : null}
          {contacts.github ? renderLink(
            contacts.github.startsWith('http') ? contacts.github : `https://github.com/${contacts.github}`,
            contacts.github.replace(/https?:\/\/(www\.)?github\.com\//i, ''),
          ) : null}
          {contacts.github && contacts.portfolio ? <Sep /> : null}
          {contacts.portfolio ? renderLink(
            contacts.portfolio.startsWith('http') ? contacts.portfolio : `https://${contacts.portfolio}`,
            'Portfolio',
          ) : null}
          {(contacts.portfolio || contacts.github) && contacts.competitiveProgramming ? <Sep /> : null}
          {contacts.competitiveProgramming ? renderLink(
            contacts.competitiveProgramming.startsWith('http') ? contacts.competitiveProgramming : `https://${contacts.competitiveProgramming}`,
            'LeetCode',
          ) : null}
          {(contacts.competitiveProgramming || contacts.portfolio || contacts.github) && contacts.location ? <Sep /> : null}
          {contacts.location ? <Text>{contacts.location}</Text> : null}
        </View>

        {/* ── PROFESSIONAL SUMMARY ────────────────────────────────────── */}
        {finalSummary ? (
          <View style={s.section}>
            <ST>Professional Summary</ST>
            <Text style={s.plain}>{finalSummary}</Text>
          </View>
        ) : null}

        {/* ── SKILLS ──────────────────────────────────────────────────── */}
        {(finalSkillRows.length > 0 || languages) && (
          <View style={s.section}>
            <ST>Skills</ST>
            {finalSkillRows.map((row, i) => (
              <View key={i} style={[s.skillRow, i % 2 === 0 ? s.skillRowShaded : null]}>
                {row.label ? <Text style={s.skillLabel}>{row.label}</Text> : null}
                <Text style={[s.skillValue, !row.label && { flex: 1 }]}>{row.value}</Text>
              </View>
            ))}
            {languages ? (
              <View style={[s.skillRow, finalSkillRows.length % 2 === 0 ? s.skillRowShaded : null]}>
                <Text style={s.skillLabel}>Languages</Text>
                <Text style={s.skillValue}>{languages}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── EXPERIENCE & PROJECTS ────────────────────────────────────── */}
        {workExps.length > 0 && (
          <View style={s.section}>
            <ST>Experience &amp; Projects</ST>
            {workExps.map((job, i) => {
              let company = job.company || '';
              let location = job.location || '';
              let date = job.dates || job.date || '';

              if (job.meta) {
                const parsed = parseMeta(job.meta);
                if (parsed.projectOrPlace) company = parsed.projectOrPlace;
                if (parsed.location) location = parsed.location;
                if (parsed.date) date = parsed.date;
              }

              const displayTitle = company || job.title || '';
              const roleLabel = (company && job.title) ? job.title : '';
              const subParts = [roleLabel, location].filter(Boolean);
              const subLine  = subParts.join(' · ');

              return (
                <View key={i} style={s.entryWrap}>
                  {/* Row 1: Project/Company name  ←→  Date */}
                  <View style={s.entryTopRow}>
                    <Text style={s.entryTitle}>
                      {displayTitle}
                      {job.tech ? ` | ${job.tech}` : ''}
                    </Text>
                    {date ? <Text style={s.entryDate}>{date}</Text> : null}
                  </View>

                  {/* Row 2: Role · Location */}
                  {subLine ? (
                    <View style={s.entrySubRow}>
                      <Text style={s.entryMeta}>{subLine}</Text>
                    </View>
                  ) : null}

                  {(job.bullets || []).map((b, j) => <Bul key={j} text={b} />)}
                </View>
              );
            })}
          </View>
        )}

        {/* ── EDUCATION ───────────────────────────────────────────────── */}
        {education.length > 0 && (
          <View style={s.section}>
            <ST>Education</ST>
            {education.map((edu, i) => {
              const { gpa, extras } = educationExtras(edu);
              return (
                <View key={i} style={s.eduRow}>
                  <View style={s.eduLeft}>
                    <Text style={s.eduInst}>{edu.institution}</Text>
                    {edu.degree ? <Text style={s.eduDeg}>{edu.degree}</Text> : null}
                    {gpa ? <Text style={s.eduDet}>CGPA: {gpa}</Text> : null}
                    {extras.length > 0 ? (
                      <Text style={s.eduDet}>{extras.join('  ·  ')}</Text>
                    ) : null}
                  </View>
                  {edu.dates ? <Text style={s.eduDate}>{edu.dates}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* ── AWARDS & ACHIEVEMENTS ────────────────────────────────────── */}
        {hasAwardsSection && (
          <View style={s.section}>
            <ST>Awards &amp; Achievements</ST>

            {awards.map((award, i) => (
              <View key={`award-${i}`} style={s.awardRow}>
                <View style={s.awardLeft}>
                  <Text style={s.awardTitle}>{award.title}</Text>
                  {award.org  ? <Text style={s.awardMeta}>{award.org}</Text>  : null}
                  {award.desc ? <Text style={s.awardDesc}>{award.desc}</Text> : null}
                </View>
                {award.date ? <Text style={s.awardDate}>{award.date}</Text> : null}
              </View>
            ))}

            {achievements.map((ach, i) => (
              <View key={`ach-${i}`}>
                {ach.category ? <Text style={s.achCategory}>{ach.category}</Text> : null}
                {(ach.bullets || []).map((b, j) => <Bul key={j} text={b} />)}
              </View>
            ))}
          </View>
        )}

        {/* ── DSA PROFICIENCY ─────────────────────────────────────────── */}
        {dsaLines.length > 0 && (
          <View style={s.section}>
            <ST>DSA Proficiency</ST>
            {dsaLines.map((line, i) => <Bul key={i} text={line} />)}
          </View>
        )}

        {/* ── CERTIFICATIONS ──────────────────────────────────────────── */}
        {certs.length > 0 && (
          <View style={s.section}>
            <ST>Certifications</ST>
            {certs.map((cert, i) => (
              <View key={i} style={s.certRow}>
                <View style={s.certLeft}>
                  <Text style={s.certTitle}>{cert.title}</Text>
                  {cert.org ? <Text style={s.certOrg}>{cert.org}</Text> : null}
                  {cert.url ? (
                    <Link src={cert.url} style={s.certUrl}>{cert.url}</Link>
                  ) : null}
                </View>
                {cert.dates ? <Text style={s.certDate}>{cert.dates}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* ── EXTRACURRICULAR ACTIVITIES ───────────────────────────────── */}
        {extracurricular.length > 0 && (
          <View style={s.section}>
            <ST>Extracurricular Activities</ST>
            {extracurricular.map((item, i) => (
              <View key={i}>
                {item.title ? <Text style={s.extraTitle}>{item.title}</Text> : null}
                {(item.bullets || []).map((b, j) => <Bul key={j} text={b} />)}
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}