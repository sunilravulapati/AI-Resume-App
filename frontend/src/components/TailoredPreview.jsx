/** Full tailored resume preview — shows all sections returned by the API */
import { SectionBlock } from './DashboardShell';

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((text, i) => (
        <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2 leading-relaxed">
          <span className="text-[var(--accent)] font-bold shrink-0">→</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TailoredPreview({ data }) {
  if (!data) return null;

  const basics = data.basics || {};

  return (
    <div className="space-y-6">
      {basics.name && (
        <SectionBlock title="Candidate">
          <div className="card p-4 bg-[var(--bg-muted)]/50 border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">{basics.name}</p>
            {basics.tagline && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">{basics.tagline}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[var(--text-muted)]">
              {basics.email && <span>{basics.email}</span>}
              {basics.phone && <span>{basics.phone}</span>}
              {basics.location && <span>{basics.location}</span>}
            </div>
          </div>
        </SectionBlock>
      )}

      {data.tailoredSummary && (
        <SectionBlock title="Professional Summary">
          <div className="card p-4 text-sm text-[var(--text)] leading-relaxed bg-[var(--bg-muted)]/30">
            {data.tailoredSummary}
          </div>
        </SectionBlock>
      )}

      {data.tailoredSkills?.length > 0 && (
        <SectionBlock title="Targeted Skills">
          <div className="space-y-3">
            {data.tailoredSkills.map((row, i) => (
              <div key={i} className="flex flex-wrap items-start gap-2">
                {row.label && (
                  <span className="text-xs font-bold text-[var(--text)] w-28 shrink-0">{row.label}</span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {row.value?.split(',').map((s) => s.trim()).filter(Boolean).map((skill, j) => (
                    <span
                      key={j}
                      className="text-[0.7rem] font-medium px-2.5 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[#bfdbfe]/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.tailoredExperience?.length > 0 && (
        <SectionBlock title="Experience & Projects">
          <div className="space-y-3">
            {data.tailoredExperience.map((exp, i) => (
              <div key={i} className="card p-4 card-hover">
                <div className="flex justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-[var(--text)]">{exp.title}</h4>
                  {exp.meta && (
                    <span className="text-[0.65rem] text-[var(--text-muted)] shrink-0">{exp.meta}</span>
                  )}
                </div>
                {exp.tech && (
                  <p className="text-xs text-[var(--text-muted)] mb-2 italic">{exp.tech}</p>
                )}
                <BulletList items={exp.bullets} />
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.education?.length > 0 && (
        <SectionBlock title="Education">
          <div className="space-y-2">
            {data.education.map((edu, i) => (
              <div key={i} className="card p-4 flex justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{edu.institution}</p>
                  {edu.degree && <p className="text-xs text-[var(--text-secondary)]">{edu.degree}</p>}
                  {edu.gpa && <p className="text-xs text-[var(--text-muted)] mt-1">CGPA: {edu.gpa}</p>}
                  {edu.extra?.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{edu.extra.join(' · ')}</p>
                  )}
                </div>
                {edu.dates && (
                  <span className="text-xs text-[var(--text-muted)] shrink-0">{edu.dates}</span>
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {(data.awards?.length > 0 || data.achievements?.length > 0) && (
        <SectionBlock title="Awards & Achievements">
          <div className="space-y-2">
            {data.awards?.map((a, i) => (
              <div key={`a-${i}`} className="card p-3 flex justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{a.title}</p>
                  {a.org && <p className="text-xs text-[var(--text-muted)]">{a.org}</p>}
                  {a.desc && <p className="text-xs mt-1">{a.desc}</p>}
                </div>
                {a.date && <span className="text-xs text-[var(--text-muted)]">{a.date}</span>}
              </div>
            ))}
            {data.achievements?.map((ach, i) => (
              <div key={`ach-${i}`} className="card p-3">
                {ach.category && (
                  <p className="text-xs font-bold text-[var(--text)] mb-2">{ach.category}</p>
                )}
                <BulletList items={ach.bullets} />
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.dsaProficiency?.length > 0 && (
        <SectionBlock title="DSA Proficiency">
          <BulletList items={data.dsaProficiency} />
        </SectionBlock>
      )}

      {data.certifications?.length > 0 && (
        <SectionBlock title="Certifications">
          <div className="space-y-2">
            {data.certifications.map((cert, i) => (
              <div key={i} className="card p-3 flex justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{cert.title}</p>
                  {cert.org && <p className="text-xs text-[var(--text-muted)]">{cert.org}</p>}
                </div>
                {cert.dates && <span className="text-xs text-[var(--text-muted)]">{cert.dates}</span>}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.extracurricular?.length > 0 && (
        <SectionBlock title="Extracurricular">
          {data.extracurricular.map((item, i) => (
            <article key={i} className="card p-3 mb-2">
              {item.title && <p className="text-sm font-bold mb-1">{item.title}</p>}
              <BulletList items={item.bullets} />
            </article>
          ))}
        </SectionBlock>
      )}

      {data.languages && (
        <SectionBlock title="Languages">
          <p className="text-sm text-[var(--text-secondary)]">{data.languages}</p>
        </SectionBlock>
      )}
    </div>
  );
}
