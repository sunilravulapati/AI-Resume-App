import React, { memo } from 'react';

// a live careerzenith-style resume preview component for the editing resumes
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

  const summary    = formData.summary ?? '';
  const skills     = formData.skills  ?? [];
  const experience = formData.experience ?? [];
  const projects   = formData.projects ?? [];
  const education  = formData.education ?? [];

  const name    = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const email   = user?.email   ?? '';
  const mobile  = user?.mobile  ?? '';
  const contact = [mobile, email].filter(Boolean).join('  ·  ');

  return (
    <div
      className="preview-page"
      style={{
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontSize: '10.5px',
        lineHeight: 1.45,
        padding: '32px 36px',
        color: '#111',
      }}
    >
      {/* ── Contact Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 3px',
          fontFamily: '"Arial", "Helvetica", sans-serif',
          letterSpacing: '0.03em',
          color: '#0F172A',
        }}>
          {name || 'Your Name'}
        </h1>
        {contact && (
          <p style={{ fontSize: '9.5px', color: '#555', margin: 0, letterSpacing: '0.01em' }}>
            {contact}
          </p>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1.5px solid #0F172A', margin: '8px 0' }} />

      {/* ── Summary ── */}
      {summary && (
        <PreviewSection title="Summary">
          <p style={{ margin: 0, fontSize: '10px', lineHeight: 1.55, color: '#1e293b' }}>{summary}</p>
        </PreviewSection>
      )}

      {/* ── Technical Skills ── */}
      {skills.length > 0 && (
        <PreviewSection title="Technical Skills">
          {skills.map((row, i) => (
            row.label || row.value ? (
              <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '700', fontSize: '10px', minWidth: '90px', flexShrink: 0, fontFamily: '"Arial", sans-serif' }}>
                  {row.label}{row.label ? ':' : ''}
                </span>
                <span style={{ fontSize: '10px', color: '#334155' }}>{row.value}</span>
              </div>
            ) : null
          ))}
        </PreviewSection>
      )}

      {/* ── Experience ── */}
      {experience.length > 0 && (
        <PreviewSection title="Experience">
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: '700', fontSize: '11px', fontFamily: '"Arial", sans-serif', color: '#0F172A' }}>
                    {exp.title || 'Role'}
                  </span>
                  {exp.company && exp.company !== exp.title && (
                    <span style={{ fontSize: '10px', color: '#64748B' }}>— {exp.company}</span>
                  )}
                </div>
                <span style={{ fontSize: '9.5px', color: '#64748B', flexShrink: 0, fontFamily: '"Arial", sans-serif' }}>
                  {exp.dates || exp.meta || ''}
                </span>
              </div>
              {exp.tech && (
                <p style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#64748B', margin: '1px 0 3px' }}>
                  {exp.tech}
                </p>
              )}
              {(exp.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ flexShrink: 0, marginTop: '1px', color: '#475569' }}>•</span>
                    <span style={{ fontSize: '10px', lineHeight: 1.5, color: '#1e293b' }}>{bullet}</span>
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
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: '700', fontSize: '11px', fontFamily: '"Arial", sans-serif', color: '#0F172A' }}>
                    {proj.title || 'Project'}
                  </span>
                </div>
                <span style={{ fontSize: '9.5px', color: '#64748B', flexShrink: 0, fontFamily: '"Arial", sans-serif' }}>
                  {proj.dates || proj.meta || ''}
                </span>
              </div>
              {proj.tech && (
                <p style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#64748B', margin: '1px 0 3px' }}>
                  {proj.tech}
                </p>
              )}
              {(proj.bullets || []).map((bullet, j) => (
                bullet ? (
                  <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ flexShrink: 0, marginTop: '1px', color: '#475569' }}>•</span>
                    <span style={{ fontSize: '10px', lineHeight: 1.5, color: '#1e293b' }}>{bullet}</span>
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
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: '700', fontSize: '11px', fontFamily: '"Arial", sans-serif', color: '#0F172A' }}>
                  {edu.institution}
                </span>
                {edu.degree && (
                  <span style={{ fontSize: '10px', color: '#64748B' }}> — {edu.degree}</span>
                )}
              </div>
              <span style={{ fontSize: '9.5px', color: '#64748B', flexShrink: 0, fontFamily: '"Arial", sans-serif' }}>
                {edu.dates || ''}
              </span>
            </div>
          ))}
        </PreviewSection>
      )}

      {/* ── Empty state ── */}
      {!summary && skills.length === 0 && experience.length === 0 && projects.length === 0 && education.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            Your edited content will appear here in real time
          </p>
        </div>
      )}
    </div>
  );
});

LiveResumePreview.displayName = 'LiveResumePreview';

/** Section wrapper — Jake Ryan style heading */
function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        borderBottom: '1.5px solid #0F172A',
        paddingBottom: '1px',
        marginBottom: '5px',
        fontFamily: '"Arial", "Helvetica", sans-serif',
        color: '#0F172A',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default LiveResumePreview;
