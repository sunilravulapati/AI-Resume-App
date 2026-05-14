import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

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

export default function TailoredPDF({ tailoredData, parsedText = '', user, userLinks }) {
  
  // The new AI prompt returns a fully structured JSON object in tailoredData.
  const basics = tailoredData?.basics || {};
  
  // Prefer userLinks (from UI overrides) over AI extracted basics
  const contacts = {
    email: user?.email || basics.email || '',
    phone: user?.mobile || basics.phone || '',
    linkedin: userLinks?.linkedin || basics.linkedin || '',
    github: userLinks?.github || basics.github || '',
    portfolio: userLinks?.portfolio || basics.portfolio || '',
    location: basics.location || ''
  };

  const name = basics.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate Name';
  const tagline = basics.tagline || '';

  const finalSummary = tailoredData?.tailoredSummary || '';
  const finalSkillRows = tailoredData?.tailoredSkills || [];
  const workExps = tailoredData?.tailoredExperience || [];
  const education = tailoredData?.education || [];
  const awards = tailoredData?.awards || [];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.name}>{name}</Text>
          {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}
          <View style={s.contactRow}>
            {contacts.phone ? <Text>{contacts.phone}</Text> : null}
            {contacts.phone && contacts.email ? <Sep /> : null}
            {contacts.email ? (
              <Link src={`mailto:${contacts.email}`} style={s.link}>{contacts.email}</Link>
            ) : null}
            {(contacts.phone || contacts.email) && contacts.linkedin ? <Sep /> : null}
            {contacts.linkedin ? (
              <Link src={contacts.linkedin.startsWith('http') ? contacts.linkedin : `https://linkedin.com/in/${contacts.linkedin}`} style={s.link}>
                {contacts.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}
              </Link>
            ) : null}
            {(contacts.phone || contacts.email || contacts.linkedin) && contacts.github ? <Sep /> : null}
            {contacts.github ? (
              <Link src={contacts.github.startsWith('http') ? contacts.github : `https://github.com/${contacts.github}`} style={s.link}>
                {contacts.github.replace(/https?:\/\/(www\.)?github\.com\//i, '')}
              </Link>
            ) : null}
            {(contacts.phone || contacts.email || contacts.linkedin || contacts.github) && contacts.portfolio ? <Sep /> : null}
            {contacts.portfolio ? (
              <Link src={contacts.portfolio.startsWith('http') ? contacts.portfolio : `https://${contacts.portfolio.replace(/^https?:\/\//i, '')}`} style={s.link}>Portfolio</Link>
            ) : null}
            {(contacts.phone || contacts.email || contacts.linkedin || contacts.github || contacts.portfolio) && contacts.location ? <Sep /> : null}
            {contacts.location ? <Text>{contacts.location}</Text> : null}
          </View>
        </View>

        {/* PROFESSIONAL SUMMARY */}
        {finalSummary ? (
          <View style={s.section}>
            <ST>Professional Summary</ST>
            <Text style={s.plain}>{finalSummary}</Text>
          </View>
        ) : null}

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

        {/* EXPERIENCE & PROJECTS */}
        {workExps.length > 0 && (
          <View style={s.section}>
            <ST>Experience & Projects</ST>
            {workExps.map((job, i) => (
              <View key={i} style={s.entryWrap}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>{job.title}</Text>
                  {job.meta ? <Text style={s.entryMeta}>{job.meta}</Text> : null}
                </View>
                {(job.bullets || []).map((b, j) => <Bul key={j} text={b} />)}
                <TechLine tech={job.tech} />
              </View>
            ))}
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
                  {(edu.gpa || (edu.extra && edu.extra.length > 0)) && (
                    <Text style={s.eduDet}>
                      {[edu.gpa, ...(edu.extra || [])].filter(Boolean).join('  ·  ')}
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

      </Page>
    </Document>
  );
}