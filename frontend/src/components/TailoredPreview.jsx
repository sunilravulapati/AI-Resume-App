/** Full tailored resume preview — shows all sections returned by the API */
import { SectionBlock } from './DashboardShell';

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((text, i) => (
        <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2.5 leading-relaxed font-medium">
          <span className="text-[var(--color-accent)] font-bold shrink-0 mt-0.5">→</span>
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
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <p className="font-bold text-[var(--text)] text-base">{basics.name}</p>
            {basics.tagline && (
              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{basics.tagline}</p>
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
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl p-5 text-sm font-medium text-[var(--text)] leading-relaxed shadow-sm">
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
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-sm"
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
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-accent)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent)]">
                <div className="flex justify-between gap-3 mb-3">
                  <h4 className="font-bold text-base text-[var(--text)]">{exp.title}</h4>
                  {exp.meta && (
                    <span className="text-xs font-bold text-[var(--text-muted)] shrink-0 bg-[var(--bg-muted)] px-2.5 py-1 rounded-md">{exp.meta}</span>
                  )}
                </div>
                {exp.tech && (
                  <p className="text-xs font-bold text-[var(--color-accent)] mb-3">{exp.tech}</p>
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
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 shadow-sm flex justify-between gap-4 hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-base text-[var(--text)]">{edu.institution}</p>
                  {edu.degree && <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{edu.degree}</p>}
                  {edu.gpa && <p className="text-xs font-bold text-[var(--text-muted)] mt-2">CGPA: <span className="text-[var(--text)]">{edu.gpa}</span></p>}
                  {edu.extra?.length > 0 && (
                    <p className="text-xs font-medium text-[var(--text-muted)] mt-1.5 leading-relaxed">{edu.extra.join(' · ')}</p>
                  )}
                </div>
                {edu.dates && (
                  <span className="text-xs font-bold text-[var(--text-muted)] shrink-0 bg-[var(--bg-muted)] px-2.5 py-1 rounded-md h-fit">{edu.dates}</span>
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
              <div key={`a-${i}`} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-[var(--text)]">{a.title}</p>
                  {a.org && <p className="text-xs font-bold text-[var(--color-accent)] mt-1">{a.org}</p>}
                  {a.desc && <p className="text-sm font-medium text-[var(--text-secondary)] mt-1.5 leading-relaxed">{a.desc}</p>}
                </div>
                {a.date && <span className="text-xs font-bold text-[var(--text-muted)] h-fit bg-[var(--bg-muted)] px-2.5 py-1 rounded-md">{a.date}</span>}
              </div>
            ))}
            {data.achievements?.map((ach, i) => (
              <div key={`ach-${i}`} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                {ach.category && (
                  <p className="text-sm font-bold text-[var(--color-accent)] mb-3">{ach.category}</p>
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
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex justify-between gap-3 items-center">
                <div>
                  <p className="text-base font-bold text-[var(--text)]">{cert.title}</p>
                  {cert.org && <p className="text-xs font-bold text-[var(--color-accent)] mt-1">{cert.org}</p>}
                </div>
                {cert.dates && <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-muted)] px-2.5 py-1 rounded-md">{cert.dates}</span>}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.extracurricular?.length > 0 && (
        <SectionBlock title="Extracurricular">
          {data.extracurricular.map((item, i) => (
            <article key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 shadow-sm mb-3">
              {item.title && <p className="text-base font-bold text-[var(--text)] mb-3">{item.title}</p>}
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
