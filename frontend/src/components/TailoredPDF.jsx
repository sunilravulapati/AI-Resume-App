import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create ATS-friendly styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#000' },
  header: { marginBottom: 15, textAlign: 'center' },
  name: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  contact: { fontSize: 10, color: '#333' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 3, marginBottom: 8 },
  summary: { fontSize: 10, lineHeight: 1.5 },
  skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  skillItem: { fontSize: 10, backgroundColor: '#f0f0f0', padding: '3px 6px' },
  experienceItem: { marginBottom: 10 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  jobTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  bulletList: { paddingLeft: 12 },
  bulletPoint: { fontSize: 10, marginBottom: 4, lineHeight: 1.4 },
});

export default function TailoredPDF({ tailoredData, user }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.contact}>
            {user?.email} • {user?.mobile}
          </Text>
        </View>

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{tailoredData.tailoredSummary}</Text>
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Targeted Skills</Text>
          <View style={styles.skillsWrapper}>
            {tailoredData.tailoredSkills?.map((skill, index) => (
              <Text key={index} style={styles.skillItem}>{skill}</Text>
            ))}
          </View>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relevant Experience</Text>
          {tailoredData.tailoredExperience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{exp.title}</Text>
              </View>
              <View style={styles.bulletList}>
                {exp.bullets.map((bullet, bIndex) => (
                  <Text key={bIndex} style={styles.bulletPoint}>• {bullet}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
}