import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

//Inline SVG icons
const SparklesIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17.5l.75 2.25L8 20.5l-2.25.75L5 23.5l-.75-2.25L2 20.5l2.25-.75L5 17.5z" opacity=".5"/></svg>;
const ScissorsIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
const BotIcon       = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3a2 2 0 0 1 2 2v4H10V5a2 2 0 0 1 2-2z"/><circle cx="8.5" cy="16" r="1"/><circle cx="15.5" cy="16" r="1"/></svg>;
const ZapIcon       = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const BarChartIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;

const MiniSpinner = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const AI_ACTIONS = [
  { id: 'improve',      Icon: SparklesIcon, label: 'Improve'  },
  { id: 'concise',      Icon: ScissorsIcon, label: 'Concise'  },
  { id: 'ats_optimize', Icon: BotIcon,      label: 'ATS'      },
  { id: 'stronger',     Icon: ZapIcon,      label: 'Stronger' },
  { id: 'metrics',      Icon: BarChartIcon, label: 'Metrics'  },
];

// ─── AITextArea ────────────────────────────────────────────────────────────────
const AITextArea = memo(({ value, onChange, label, context = '', placeholder = '', minRows = 2 }) => {
  const [localValue,      setLocalValue]      = useState(value || '');
  const [enhancingAction, setEnhancingAction] = useState(null);
  const [showToolbar,     setShowToolbar]     = useState(false);
  const isEnhancing = enhancingAction !== null;

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleBlur = (e) => {
    if (localValue !== value) onChange(localValue);
    if (!e.currentTarget.closest('[data-aitextarea]')?.contains(e.relatedTarget)) {
      setShowToolbar(false);
    }
  };

  const handleAIAction = async (actionId) => {
    if (!localValue.trim()) { toast.error('Nothing to enhance.'); return; }
    if (isEnhancing) return;
    setEnhancingAction(actionId);
    try {
      const res = await axios.post(
        '/api/resume/enhance',
        { text: localValue, action: actionId, context },
        { withCredentials: true }
      );
      if (res.data.enhancedText) {
        setLocalValue(res.data.enhancedText);
        onChange(res.data.enhancedText);
        toast.success('Enhanced ✓');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to enhance.');
    } finally {
      setEnhancingAction(null);
    }
  };

  const rows = Math.max(minRows, localValue.split('\n').length);

  return (
    <div
      data-aitextarea
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={(e) => { if (!e.currentTarget.contains(document.activeElement)) setShowToolbar(false); }}
    >
      {label && (
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      {/* AI pills */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '7px',
        opacity: showToolbar ? 1 : 0, pointerEvents: showToolbar ? 'auto' : 'none',
        transition: 'opacity 0.15s',
      }}>
        {AI_ACTIONS.map(({ id, Icon, label: lbl }) => (
          <button key={id} type="button"
            className={`ai-pill${enhancingAction === id ? ' enhancing' : ''}`}
            disabled={isEnhancing}
            onMouseDown={(e) => { e.preventDefault(); handleAIAction(id); }}
          >
            {enhancingAction === id ? <MiniSpinner /> : <Icon />}
            {lbl}
          </button>
        ))}
      </div>

      <textarea
        style={{
          width: '100%', borderRadius: '10px',
          border: '1px solid #E2E8F0', background: '#F8FAFC',
          padding: '10px 14px', fontSize: '13px', color: '#1e293b',
          lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit',
          outline: 'none', transition: 'border 0.15s, background 0.15s, box-shadow 0.15s',
          display: 'block', boxSizing: 'border-box',
        }}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={(e) => {
          setShowToolbar(true);
          e.target.style.border = '1px solid #6366F1';
          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
          e.target.style.background = '#fff';
        }}
        onBlur={(e) => {
          handleBlur(e);
          e.target.style.border = '1px solid #E2E8F0';
          e.target.style.boxShadow = 'none';
          e.target.style.background = '#F8FAFC';
        }}
        placeholder={placeholder}
        rows={rows}
        disabled={isEnhancing}
      />

      {/* Per-field loading overlay */}
      {isEnhancing && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.8)', borderRadius: '10px', backdropFilter: 'blur(2px)',
          zIndex: 5,
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: '#fff', border: '1px solid #E0E7FF',
            padding: '5px 14px', borderRadius: '999px',
            fontSize: '11.5px', fontWeight: 600, color: '#4F46E5',
            boxShadow: '0 2px 8px rgba(79,70,229,0.15)',
          }}>
            <MiniSpinner /> Enhancing…
          </span>
        </div>
      )}
    </div>
  );
});
AITextArea.displayName = 'AITextArea';

// ─── Section card wrapper ──────────────────────────────────────────────────────
function EditorCard({ children, noPad = false }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      {noPad ? children : <div style={{ padding: '20px 22px' }}>{children}</div>}
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
      <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: '#4F46E5', flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A', lineHeight: '1.3' }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Memoized section components ──────────────────────────────────────────────

export const PersonalInformationSection = memo(({ basics, updateBasics }) => (
  <EditorCard>
    <SectionHeading title="Personal Information" subtitle="Used as the header for your resume" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <input type="text" style={basicInputStyle} value={basics?.name || ''} onChange={(e) => updateBasics('name', e.target.value)} placeholder="Full Name" />
      <input type="text" style={basicInputStyle} value={basics?.email || ''} onChange={(e) => updateBasics('email', e.target.value)} placeholder="Email" />
      <input type="text" style={basicInputStyle} value={basics?.phone || ''} onChange={(e) => updateBasics('phone', e.target.value)} placeholder="Phone" />
      <input type="text" style={basicInputStyle} value={basics?.location || ''} onChange={(e) => updateBasics('location', e.target.value)} placeholder="Location (City, State)" />
      <input type="text" style={basicInputStyle} value={basics?.linkedin || ''} onChange={(e) => updateBasics('linkedin', e.target.value)} placeholder="LinkedIn URL" />
      <input type="text" style={basicInputStyle} value={basics?.github || ''} onChange={(e) => updateBasics('github', e.target.value)} placeholder="GitHub URL" />
      <input type="text" style={basicInputStyle} value={basics?.portfolio || ''} onChange={(e) => updateBasics('portfolio', e.target.value)} placeholder="Portfolio URL" />
      <input type="text" style={basicInputStyle} value={basics?.leetcode || ''} onChange={(e) => updateBasics('leetcode', e.target.value)} placeholder="LeetCode Profile" />
      <input type="text" style={basicInputStyle} value={basics?.hackerrank || ''} onChange={(e) => updateBasics('hackerrank', e.target.value)} placeholder="HackerRank Profile" />
      <input type="text" style={basicInputStyle} value={basics?.codeforces || ''} onChange={(e) => updateBasics('codeforces', e.target.value)} placeholder="Codeforces Profile" />
    </div>
  </EditorCard>
));
PersonalInformationSection.displayName = 'PersonalInformationSection';

const basicInputStyle = {
  width: '100%', fontSize: '13px', fontWeight: 500, color: '#334155', background: '#F8FAFC',
  border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s'
};
export const SummarySection = memo(({ summary, updateSummary }) => (
  <EditorCard>
    <SectionHeading title="Professional Summary" subtitle="2–4 sentences tailored to the role" />
    <AITextArea
      value={summary}
      onChange={updateSummary}
      context="Professional summary for a tech resume"
      placeholder="Write a concise summary that highlights your fit for this specific role…"
      minRows={4}
    />
  </EditorCard>
));
SummarySection.displayName = 'SummarySection';

export const SkillsSection = memo(({ skills, updateSkill }) => (
  <EditorCard>
    <SectionHeading title="Technical Skills" subtitle="Keyword-matched to the job description" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {skills.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <input
            type="text"
            style={{
              width: '120px', flexShrink: 0,
              fontSize: '11px', fontWeight: 600, color: '#475569',
              background: 'transparent', border: 'none',
              borderBottom: '1px solid #E2E8F0', padding: '4px 0',
              outline: 'none', fontFamily: 'inherit',
            }}
            value={row.label || ''}
            onChange={(e) => updateSkill(i, 'label', e.target.value)}
            onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
            onBlur={(e) => (e.target.style.borderBottomColor = '#E2E8F0')}
            placeholder="Category"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <AITextArea
              value={row.value || ''}
              onChange={(val) => updateSkill(i, 'value', val)}
              context={`Skills for category: ${row.label}`}
              placeholder="Comma-separated skills…"
              minRows={1}
            />
          </div>
        </div>
      ))}
    </div>
  </EditorCard>
));
SkillsSection.displayName = 'SkillsSection';

export const ExperienceSection = memo(({ experience, updateExpField, updateExpBullet }) => (
  <EditorCard>
    <SectionHeading title="Work Experience" subtitle="Hover any bullet for AI enhancement" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {experience.map((exp, i) => (
        <div key={i} style={{
          padding: '16px', borderRadius: '12px',
          background: '#FAFBFF', border: '1px solid #E8EEFF',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C7D2FE')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E8EEFF')}
        >
          {/* Title + dates */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
            <input type="text"
              style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#0F172A', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '1px 0' }}
              value={exp.title || ''}
              onChange={(e) => updateExpField(i, 'title', e.target.value)}
              onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
              placeholder="Job Title / Project Name"
            />
            <input type="text"
              style={{ width: '130px', flexShrink: 0, fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }}
              value={exp.dates || exp.meta || ''}
              onChange={(e) => updateExpField(i, 'dates', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              placeholder="Dates"
            />
          </div>

          {/* Tech */}
          <input type="text"
            style={{ width: '100%', fontSize: '11.5px', fontWeight: 500, color: '#4F46E5', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '1px 0', marginBottom: '10px' }}
            value={exp.tech || ''}
            onChange={(e) => updateExpField(i, 'tech', e.target.value)}
            onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
            placeholder="Technologies (e.g. React, Node.js, PostgreSQL)"
          />

          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(exp.bullets || []).map((bullet, j) => (
              <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818CF8', flexShrink: 0, marginTop: '13px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AITextArea
                    value={bullet}
                    onChange={(val) => updateExpBullet(i, j, val)}
                    context={`Resume bullet: ${exp.title}, technologies: ${exp.tech}`}
                    placeholder="Impact-first bullet point…"
                    minRows={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </EditorCard>
));
ExperienceSection.displayName = 'ExperienceSection';

export const ProjectsSection = memo(({ projects, updateProjField, updateProjBullet }) => (
  <EditorCard>
    <SectionHeading title="Projects" subtitle="Hover any bullet for AI enhancement" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {projects.map((proj, i) => (
        <div key={i} style={{
          padding: '16px', borderRadius: '12px',
          background: '#FAFBFF', border: '1px solid #E8EEFF',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C7D2FE')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E8EEFF')}
        >
          {/* Title + dates */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
            <input type="text"
              style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#0F172A', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '1px 0' }}
              value={proj.title || ''}
              onChange={(e) => updateProjField(i, 'title', e.target.value)}
              onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
              placeholder="Project Name"
            />
            <input type="text"
              style={{ width: '130px', flexShrink: 0, fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }}
              value={proj.dates || proj.meta || ''}
              onChange={(e) => updateProjField(i, 'dates', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              placeholder="Dates"
            />
          </div>

          {/* Tech */}
          <input type="text"
            style={{ width: '100%', fontSize: '11.5px', fontWeight: 500, color: '#4F46E5', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '1px 0', marginBottom: '6px' }}
            value={proj.tech || ''}
            onChange={(e) => updateProjField(i, 'tech', e.target.value)}
            onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
            placeholder="Technologies Used (e.g. React, Node.js)"
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
             <input type="text"
              style={{ flex: 1, fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }}
              value={proj.githubUrl || ''}
              onChange={(e) => updateProjField(i, 'githubUrl', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              placeholder="GitHub URL"
            />
             <input type="text"
              style={{ flex: 1, fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }}
              value={proj.liveDemoUrl || ''}
              onChange={(e) => updateProjField(i, 'liveDemoUrl', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              placeholder="Live Demo URL"
            />
          </div>

          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(proj.bullets || []).map((bullet, j) => (
               <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818CF8', flexShrink: 0, marginTop: '13px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AITextArea
                    value={bullet}
                    onChange={(val) => updateProjBullet(i, j, val)}
                    context={`Project bullet: ${proj.title}, technologies: ${proj.tech}`}
                    placeholder="Impact-first bullet point…"
                    minRows={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </EditorCard>
));
ProjectsSection.displayName = 'ProjectsSection';

export const EducationSection = memo(({ education }) => (
  <EditorCard>
    <SectionHeading title="Education" subtitle="Sourced from your uploaded resume" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {education.map((edu, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
          padding: '10px 0',
          borderBottom: i < education.length - 1 ? '1px solid #F1F5F9' : 'none',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{edu.institution}</p>
            {edu.degree && <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748B' }}>{edu.degree}</p>}
          </div>
          {edu.dates && (
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: '7px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {edu.dates}
            </span>
          )}
        </div>
      ))}
    </div>
  </EditorCard>
));
EducationSection.displayName = 'EducationSection';

// ─── Main Editor (pure editor, no split layout) ────────────────────────────────
/**
 * InteractiveEditor — renders editable resume sections only.
 * Layout is controlled entirely by the parent (WorkspaceView).
 * Props:
 *   initialData   — tailoredResume object
 *   onDataChange  — called whenever any field changes
 *   sectionRefs   — optional ref map {summary, skills, experience, education}
 *                   for external scroll navigation
 */
export default function InteractiveEditor({ initialData, onDataChange, sectionRefs }) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => { setFormData(initialData || {}); }, [initialData]);

  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => { onDataChangeRef.current = onDataChange; }, [onDataChange]);
  useEffect(() => { onDataChangeRef.current?.(formData); }, [formData]);

  // ── Update helpers ──────────────────────────────────────────────────────────
  const updateBasics = useCallback((field, value) => {
    setFormData((p) => {
      const basics = { ...(p.basics || {}) };
      basics[field] = value;
      return { ...p, basics };
    });
  }, []);

  const updateSummary = useCallback((v) => {
    setFormData((p) => ({ ...p, summary: v }));
  }, []);

  const updateSkill = useCallback((index, field, value) => {
    setFormData((p) => {
      const skills = [...(p.skills ?? [])];
      if (skills[index]) skills[index] = { ...skills[index], [field]: value };
      return { ...p, skills };
    });
  }, []);

  const updateExpField = useCallback((expIndex, field, value) => {
    setFormData((p) => {
      const exps = [...(p.experience ?? [])];
      if (exps[expIndex]) exps[expIndex] = { ...exps[expIndex], [field]: value };
      return { ...p, experience: exps };
    });
  }, []);

  const updateExpBullet = useCallback((expIndex, bulletIndex, value) => {
    setFormData((p) => {
      const exps = [...(p.experience ?? [])];
      if (exps[expIndex]) {
        const bullets = [...(exps[expIndex].bullets ?? [])];
        bullets[bulletIndex] = value;
        exps[expIndex] = { ...exps[expIndex], bullets };
      }
      return { ...p, experience: exps };
    });
  }, []);

  const updateProjField = useCallback((projIndex, field, value) => {
    setFormData((p) => {
      const projs = [...(p.projects ?? [])];
      if (projs[projIndex]) projs[projIndex] = { ...projs[projIndex], [field]: value };
      return { ...p, projects: projs };
    });
  }, []);

  const updateProjBullet = useCallback((projIndex, bulletIndex, value) => {
    setFormData((p) => {
      const projs = [...(p.projects ?? [])];
      if (projs[projIndex]) {
        const bullets = [...(projs[projIndex].bullets ?? [])];
        bullets[bulletIndex] = value;
        projs[projIndex] = { ...projs[projIndex], bullets };
      }
      return { ...p, projects: projs };
    });
  }, []);

  if (!formData || Object.keys(formData).length === 0) return null;

  const summary    = formData.summary  ?? '';
  const skills     = formData.skills   ?? [];
  const experience = formData.experience ?? [];
  const projects   = formData.projects ?? [];

  // Helper to attach a ref into sectionRefs map
  const attachRef = (key) => (el) => { if (sectionRefs?.current) sectionRefs.current[key] = el; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div ref={attachRef('basics')}>
        <PersonalInformationSection basics={formData.basics || {}} updateBasics={updateBasics} />
      </div>

      <div ref={attachRef('summary')}>
        <SummarySection summary={summary} updateSummary={updateSummary} />
      </div>

      {skills.length > 0 && (
        <div ref={attachRef('skills')}>
          <SkillsSection skills={skills} updateSkill={updateSkill} />
        </div>
      )}

      {experience.length > 0 && (
        <div ref={attachRef('experience')}>
          <ExperienceSection experience={experience} updateExpField={updateExpField} updateExpBullet={updateExpBullet} />
        </div>
      )}

      {projects.length > 0 && (
        <div ref={attachRef('projects')}>
          <ProjectsSection projects={projects} updateProjField={updateProjField} updateProjBullet={updateProjBullet} />
        </div>
      )}

      {formData.education?.length > 0 && (
        <div ref={attachRef('education')}>
          <EducationSection education={formData.education} />
        </div>
      )}
    </div>
  );
}