import React, { memo } from 'react';

const PAGE = {
  fontFamily: '"Helvetica", "Arial", sans-serif',
  fontSize: '9px',
  lineHeight: 1.32,
  padding: '36px 44px',
  color: '#1e1e1e',
};

const SECTION_GAP = '14px';
const ENTRY_GAP = '10px';
const BULLET_GAP = '3px';

const LiveResumePreview = memo(({ formData, user, template = 'jake-ryan' }) => {
  if (!formData || Object.keys(formData).length === 0) {
    return (
      <div className="preview-page flex items-center justify-center" style={{ padding: '40px' }}>
        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          Start editing to see your live resume preview
        </p>
      </div>
    );
  }

  const basics = formData.basics || {};
  const summary    = formData.summary ?? '';
  const skills     = formData.skills  ?? [];
  const experience = formData.experience ?? [];
  const projects   = formData.projects ?? [];
  const education  = formData.education ?? [];
  const awards     = formData.awards ?? [];
  const achievements = formData.achievements ?? [];
  const dsaLines   = formData.dsa ?? formData.dsaProficiency ?? formData.dsaLines ?? [];
  const certs      = formData.certifications ?? formData.certs ?? [];
  const extracurricular = formData.extracurriculars ?? formData.extracurricular ?? [];

  const name = basics.name || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'Your Name';
  const email = basics.email || user?.email || '';
  const phone = basics.phone || user?.mobile || '';
  const tagline = basics.tagline || '';
  const contactParts = [phone, email, basics.location].filter(Boolean);

  return (
    <div className="preview-page" style={PAGE}>
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h1 style={{
          fontSize: '17px',
          fontWeight: '700',
          margin: '0 0 6px',
          letterSpacing: '0.04em',
          color: '#0f0f0f',
        }}>
          {name}
        </h1>
        {tagline && (
          <p style={{ fontSize: '8.5px', color: '#444', margin: '0 0 6px', lineHeight: 1.35 }}>{tagline}</p>
        )}
        {contactParts.length > 0 && (
          <p style={{ fontSize: '8.2px', color: '#555', margin: 0, lineHeight: 1.4 }}>
            {contactParts.join('  |  ')}
          </p>
        )}
      </div>

      {/* ── Summary ── */}
      {summary && (
        <PreviewSection title="Professional Summary">
          <p style={{ margin: 0, fontSize: '8.4px', lineHeight: 1.32, color: '#1e1e1e' }}>{summary}</p>
        </PreviewSection>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <PreviewSection title="Skills">
          {skills.map((row, i) => (
            row.label || row.value ? (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', padding: '2px 0' }}>
                {row.label && (
                  <span style={{ fontWeight: '700', fontSize: '8.2px', minWidth: '88px', flexShrink: 0 }}>
                    {row.label}:
                  </span>
                )}
                <span style={{ fontSize: '8.2px', color: '#1e1e1e', lineHeight: 1.32 }}>{row.value}</span>
              </div>
            ) : null
          ))}
        </PreviewSection>
      )}

      {/* ── Experience ── */}
      {experience.length > 0 && (
        <PreviewSection title="Experience">
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: ENTRY_GAP }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '700', fontSize: '8.7px', color: '#0f0f0f', flex: 1 }}>
                  {exp.company || exp.title || 'Role'}
                </span>
                <span style={{ fontSize: '7.8px', fontStyle: 'italic', color: '#444', flexShrink: 0 }}>
                  {exp.dates || exp.meta || ''}
                </span>
              </div>
              {(exp.title && exp.company) || exp.tech ? (
                <p style={{ fontSize: '8px', fontStyle: 'italic', color: '#555', margin: '0 0 4px' }}>
                  {[exp.title && exp.company ? exp.title : '', exp.tech].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              {(exp.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: BULLET_GAP, paddingLeft: '4px' }}>
                    <span style={{ flexShrink: 0, color: '#444' }}>–</span>
                    <span style={{ fontSize: '8.4px', lineHeight: 1.32, color: '#1e1e1e' }}>{bullet}</span>
                  </div>
                ) : null
              ))}
            </div>
          ))}
        </PreviewSection>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <PreviewSection title="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: ENTRY_GAP }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '700', fontSize: '8.7px', color: '#0f0f0f', flex: 1 }}>
                  {proj.title || 'Project'}
                </span>
                <span style={{ fontSize: '7.8px', fontStyle: 'italic', color: '#444', flexShrink: 0 }}>
                  {proj.dates || proj.meta || ''}
                </span>
              </div>
              {proj.tech && (
                <p style={{ fontSize: '8px', fontStyle: 'italic', color: '#555', margin: '0 0 4px' }}>{proj.tech}</p>
              )}
              {(proj.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: BULLET_GAP, paddingLeft: '4px' }}>
                    <span style={{ flexShrink: 0, color: '#444' }}>–</span>
                    <span style={{ fontSize: '8.4px', lineHeight: 1.32, color: '#1e1e1e' }}>{bullet}</span>
                  </div>
                ) : null
              ))}
            </div>
          ))}
        </PreviewSection>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <PreviewSection title="Education">
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: '700', fontSize: '8.7px', color: '#0f0f0f' }}>{edu.institution}</span>
                {edu.degree && <span style={{ fontSize: '8.2px', fontStyle: 'italic', color: '#555' }}> — {edu.degree}</span>}
              </div>
              <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#444', flexShrink: 0 }}>{edu.dates || ''}</span>
            </div>
          ))}
        </PreviewSection>
      )}

      {/* ── Awards & Achievements ── */}
      {(awards.length > 0 || achievements.length > 0) && (
        <PreviewSection title="Awards & Achievements">
          {awards.map((award, i) => (
            <div key={`award-${i}`} style={{ marginBottom: ENTRY_GAP }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '8.7px' }}>{award.title}</span>
                {award.date && <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#444' }}>{award.date}</span>}
              </div>
              {award.org && <p style={{ fontSize: '8px', color: '#555', margin: '2px 0 0' }}>{award.org}</p>}
            </div>
          ))}
          {achievements.map((ach, i) => (
            <div key={`ach-${i}`} style={{ marginBottom: ENTRY_GAP }}>
              {ach.category && <div style={{ fontWeight: '700', fontSize: '8.7px', marginBottom: '3px' }}>{ach.category}</div>}
              {(ach.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: BULLET_GAP, paddingLeft: '4px' }}>
                    <span style={{ flexShrink: 0, color: '#444' }}>–</span>
                    <span style={{ fontSize: '8.4px', lineHeight: 1.32 }}>{bullet}</span>
                  </div>
                ) : null
              ))}
            </div>
          ))}
        </PreviewSection>
      )}

      {dsaLines.length > 0 && (
        <PreviewSection title="DSA Proficiency">
          {dsaLines.map((line, i) => line ? (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: BULLET_GAP, paddingLeft: '4px' }}>
              <span style={{ flexShrink: 0, color: '#444' }}>–</span>
              <span style={{ fontSize: '8.4px', lineHeight: 1.32 }}>{line}</span>
            </div>
          ) : null)}
        </PreviewSection>
      )}

      {certs.length > 0 && (
        <PreviewSection title="Certifications">
          {certs.map((cert, i) => (
            <div key={i} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <span style={{ fontWeight: '700', fontSize: '8.7px' }}>{cert.title}</span>
                {cert.org && <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#555' }}> — {cert.org}</span>}
              </div>
              {cert.dates && <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#444' }}>{cert.dates}</span>}
            </div>
          ))}
        </PreviewSection>
      )}

      {extracurricular.length > 0 && (
        <PreviewSection title="Extracurricular Activities">
          {extracurricular.map((item, i) => (
            <div key={i} style={{ marginBottom: ENTRY_GAP }}>
              {item.title && <div style={{ fontWeight: '700', fontSize: '8.7px', marginBottom: '3px' }}>{item.title}</div>}
              {(item.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: BULLET_GAP, paddingLeft: '4px' }}>
                    <span style={{ flexShrink: 0, color: '#444' }}>–</span>
                    <span style={{ fontSize: '8.4px', lineHeight: 1.32 }}>{bullet}</span>
                  </div>
                ) : null
              ))}
            </div>
          ))}
        </PreviewSection>
      )}
    </div>
  );
});

LiveResumePreview.displayName = 'LiveResumePreview';

function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: SECTION_GAP }}>
      <div style={{
        fontSize: '9px',
        fontWeight: '700',
        letterSpacing: '0.03em',
        borderBottom: '0.5px solid #1a1a1a',
        paddingBottom: '3px',
        marginBottom: '6px',
        color: '#0f0f0f',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default LiveResumePreview;
