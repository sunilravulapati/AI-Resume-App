import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Inline SVG icons
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
  const [isFocused,       setIsFocused]       = useState(false);
  const isEnhancing = enhancingAction !== null;

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleBlur = (e) => {
    setIsFocused(false);
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
          border: isFocused ? '1px solid #6366F1' : '1px solid #E2E8F0',
          background: isFocused ? '#fff' : '#F8FAFC',
          padding: '10px 14px', fontSize: '13px', color: '#1e293b',
          lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit',
          outline: 'none', transition: 'all 0.2s',
          display: 'block', boxSizing: 'border-box',
          boxShadow: isFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
        }}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={(e) => {
          setShowToolbar(true);
          setIsFocused(true);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={isEnhancing}
      />

      {isFocused && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
          {localValue.length} characters
        </div>
      )}

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
    <div className="ws-section-card">
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #4F46E5 0%, #818CF8 100%)' }} />
      {noPad ? children : <div style={{ padding: '24px' }}>{children}</div>}
    </div>
  );
}

function SectionHeading({ title, subtitle, icon, rightElement }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A', lineHeight: '1.3' }}>{title}</h3>
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}

const lockedInputStyle = {
  width: '100%', fontSize: '13px', fontWeight: 500, color: '#64748B', background: '#F1F5F9',
  border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', cursor: 'not-allowed'
};

// ─── Memoized section components ──────────────────────────────────────────────

export const PersonalInformationSection = memo(({ basics }) => (
  <EditorCard>
    <SectionHeading 
      title="Personal Information" 
      subtitle="Sourced from your profile" 
      icon={null}
      rightElement={
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
          Locked
        </span>
      }
    />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <input type="text" style={lockedInputStyle} value={basics?.name || ''} readOnly placeholder="Full Name" />
      <input type="text" style={lockedInputStyle} value={basics?.email || ''} readOnly placeholder="Email" />
      <input type="text" style={lockedInputStyle} value={basics?.phone || ''} readOnly placeholder="Phone" />
      <input type="text" style={lockedInputStyle} value={basics?.location || ''} readOnly placeholder="Location (City, State)" />
      <input type="text" style={lockedInputStyle} value={basics?.linkedin || ''} readOnly placeholder="LinkedIn URL" />
      <input type="text" style={lockedInputStyle} value={basics?.github || ''} readOnly placeholder="GitHub URL" />
      <input type="text" style={lockedInputStyle} value={basics?.portfolio || ''} readOnly placeholder="Portfolio URL" />
      <input type="text" style={lockedInputStyle} value={basics?.leetcode || ''} readOnly placeholder="LeetCode Profile" />
      <input type="text" style={lockedInputStyle} value={basics?.hackerrank || ''} readOnly placeholder="HackerRank Profile" />
      <input type="text" style={lockedInputStyle} value={basics?.codeforces || ''} readOnly placeholder="Codeforces Profile" />
    </div>
  </EditorCard>
));
PersonalInformationSection.displayName = 'PersonalInformationSection';

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

export const SkillsSection = memo(({ skills, updateSkill, addSkill, deleteSkill }) => (
  <EditorCard>
    <SectionHeading 
      title="Technical Skills" 
      subtitle="Keyword-matched to the job description" 
      icon={null}
      rightElement={
        <button 
          onClick={addSkill}
          style={{
            padding: '6px 12px', borderRadius: '8px', border: '1px solid #C7D2FE',
            background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          ＋ Add Category
        </button>
      }
    />
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
          <button 
            onClick={() => deleteSkill(i)}
            style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
            title="Delete Category"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </EditorCard>
));
SkillsSection.displayName = 'SkillsSection';

export const ExperienceSection = memo(({ experience, updateExpField, updateExpBullet, addExpBullet, deleteExpBullet, addExp, deleteExp }) => {
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (i) => {
    setCollapsed(p => ({ ...p, [i]: !p[i] }));
  };

  return (
    <EditorCard>
      <SectionHeading 
        title="Work Experience" 
        subtitle="Hover any bullet for AI enhancement" 
        icon={null}
        rightElement={
          <button 
            onClick={addExp}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid #C7D2FE',
              background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            ＋ Add Role
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {experience.map((exp, i) => {
          const isCollapsed = collapsed[i];
          return (
            <div key={i} style={{
              padding: '16px', borderRadius: '12px',
              background: '#FAFBFF', border: '1px solid #E8EEFF',
              transition: 'border-color 0.2s',
              position: 'relative'
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C7D2FE')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E8EEFF')}
            >
              {/* Top Row: drag handle, title, dates, collapse, delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ cursor: 'grab', color: '#94A3B8', fontSize: '16px', userSelect: 'none' }}>⋮⋮</span>
                
                <input type="text"
                  style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#0F172A', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '1px 0' }}
                  value={exp.title || ''}
                  onChange={(e) => updateExpField(i, 'title', e.target.value)}
                  onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
                  onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                  placeholder="Job Title"
                />

                <input type="text"
                  style={{ width: '130px', flexShrink: 0, fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }}
                  value={exp.dates || exp.meta || ''}
                  onChange={(e) => updateExpField(i, 'dates', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                  placeholder="Dates"
                />

                <button 
                  onClick={() => toggleCollapse(i)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>

                <button 
                  onClick={() => deleteExp(i)}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                  title="Delete"
                >
                  ×
                </button>
              </div>

              {!isCollapsed && (
                <>
                  {/* Company info */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input type="text"
                      style={{ flex: 1, fontSize: '12px', color: '#475569', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none', fontFamily: 'inherit', padding: '2px 0' }}
                      value={exp.company || ''}
                      onChange={(e) => updateExpField(i, 'company', e.target.value)}
                      onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
                      onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                      placeholder="Company"
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                    {(exp.bullets || []).map((bullet, j) => (
                      <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818CF8', flexShrink: 0, marginTop: '13px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <AITextArea
                            value={bullet}
                            onChange={(val) => updateExpBullet(i, j, val)}
                            context={`Resume bullet: ${exp.title}, company: ${exp.company}, tech: ${exp.tech}`}
                            placeholder="Impact-first bullet point…"
                            minRows={1}
                          />
                        </div>
                        <button 
                          onClick={() => deleteExpBullet(i, j)}
                          style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                          title="Delete bullet"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addExpBullet(i)}
                      style={{
                        alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#4F46E5',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginTop: '4px'
                      }}
                    >
                      ＋ Add Bullet
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </EditorCard>
  );
});
ExperienceSection.displayName = 'ExperienceSection';

export const ProjectsSection = memo(({ projects, updateProjField, updateProjBullet, addProjBullet, deleteProjBullet, addProj, deleteProj }) => {
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (i) => {
    setCollapsed(p => ({ ...p, [i]: !p[i] }));
  };

  return (
    <EditorCard>
      <SectionHeading 
        title="Projects" 
        subtitle="Hover any bullet for AI enhancement" 
        icon={null}
        rightElement={
          <button 
            onClick={addProj}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid #C7D2FE',
              background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            ＋ Add Project
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {projects.map((proj, i) => {
          const isCollapsed = collapsed[i];
          return (
            <div key={i} style={{
              padding: '16px', borderRadius: '12px',
              background: '#FAFBFF', border: '1px solid #E8EEFF',
              transition: 'border-color 0.2s',
              position: 'relative'
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C7D2FE')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E8EEFF')}
            >
              {/* Top Row: drag handle, title, dates, collapse, delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ cursor: 'grab', color: '#94A3B8', fontSize: '16px', userSelect: 'none' }}>⋮⋮</span>
                
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

                <button 
                  onClick={() => toggleCollapse(i)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>

                <button 
                  onClick={() => deleteProj(i)}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                  title="Delete"
                >
                  ×
                </button>
              </div>

              {!isCollapsed && (
                <>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                    {(proj.bullets || []).map((bullet, j) => (
                      <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818CF8', flexShrink: 0, marginTop: '13px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <AITextArea
                            value={bullet}
                            onChange={(val) => updateProjBullet(i, j, val)}
                            context={`Project bullet: ${proj.title}, tech: ${proj.tech}`}
                            placeholder="Impact-first bullet point…"
                            minRows={1}
                          />
                        </div>
                        <button 
                          onClick={() => deleteProjBullet(i, j)}
                          style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                          title="Delete bullet"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addProjBullet(i)}
                      style={{
                        alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#4F46E5',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginTop: '4px'
                      }}
                    >
                      ＋ Add Bullet
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </EditorCard>
  );
});
ProjectsSection.displayName = 'ProjectsSection';

export const EducationSection = memo(({ education, updateEduField, addEdu, deleteEdu }) => (
  <EditorCard>
    <SectionHeading 
      title="Education" 
      subtitle="Sourced from your profile/resume" 
      icon={null}
      rightElement={
        <button 
          onClick={addEdu}
          style={{
            padding: '6px 12px', borderRadius: '8px', border: '1px solid #C7D2FE',
            background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          ＋ Add Education
        </button>
      }
    />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {education.map((edu, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          padding: '12px 16px', borderRadius: '12px', background: '#FAFBFF', border: '1px solid #E8EEFF',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <input 
              type="text" 
              style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0F172A', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none' }}
              value={edu.institution || ''}
              onChange={(e) => updateEduField(i, 'institution', e.target.value)}
              onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
              placeholder="Institution"
            />
            <input 
              type="text" 
              style={{ width: '130px', fontSize: '11px', fontWeight: 500, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '4px 10px', outline: 'none' }}
              value={edu.dates || ''}
              onChange={(e) => updateEduField(i, 'dates', e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              placeholder="Dates"
            />
            <button 
              onClick={() => deleteEdu(i)}
              style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
              title="Delete"
            >
              ×
            </button>
          </div>
          <input 
            type="text" 
            style={{ width: '100%', fontSize: '11.5px', color: '#64748B', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none' }}
            value={edu.degree || ''}
            onChange={(e) => updateEduField(i, 'degree', e.target.value)}
            onFocus={(e) => (e.target.style.borderBottomColor = '#4F46E5')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
            placeholder="Degree / Major"
          />
        </div>
      ))}
    </div>
  </EditorCard>
));
EducationSection.displayName = 'EducationSection';

const addSectionBtnStyle = {
  padding: '8px 14px', borderRadius: '8px', border: '1px solid #C7D2FE',
  background: '#fff', color: '#4F46E5', fontSize: '12px', fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

// ─── Main Editor (pure editor, no split layout) ────────────────────────────────
export default function InteractiveEditor({ initialData, onDataChange, sectionRefs, resetKey }) {
  const [formData, setFormData] = useState(initialData || {});
  const lastResetKeyRef = useRef(null);

  // Only reset editor state when opening a different session — not on every parent re-render
  useEffect(() => {
    if (resetKey === lastResetKeyRef.current) return;
    lastResetKeyRef.current = resetKey;
    setFormData(initialData || {});
  }, [resetKey, initialData]);

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

  const updateEduField = useCallback((eduIndex, field, value) => {
    setFormData((p) => {
      const edus = [...(p.education ?? [])];
      if (edus[eduIndex]) edus[eduIndex] = { ...edus[eduIndex], [field]: value };
      return { ...p, education: edus };
    });
  }, []);

  // ── Addition/Deletion helpers ────────────────────────────────────────────────
  const addExperience = useCallback(() => {
    setFormData((p) => {
      const experience = [...(p.experience ?? [])];
      experience.push({
        title: '',
        company: '',
        dates: '',
        location: '',
        tech: '',
        bullets: ['']
      });
      return { ...p, experience };
    });
  }, []);

  const deleteExperience = useCallback((index) => {
    setFormData((p) => {
      const experience = [...(p.experience ?? [])];
      experience.splice(index, 1);
      return { ...p, experience };
    });
  }, []);

  const addProject = useCallback(() => {
    setFormData((p) => {
      const projects = [...(p.projects ?? [])];
      projects.push({
        title: '',
        dates: '',
        tech: '',
        githubUrl: '',
        liveDemoUrl: '',
        bullets: ['']
      });
      return { ...p, projects };
    });
  }, []);

  const deleteProject = useCallback((index) => {
    setFormData((p) => {
      const projects = [...(p.projects ?? [])];
      projects.splice(index, 1);
      return { ...p, projects };
    });
  }, []);

  const addSkill = useCallback(() => {
    setFormData((p) => {
      const skills = [...(p.skills ?? [])];
      skills.push({ label: '', value: '' });
      return { ...p, skills };
    });
  }, []);

  const deleteSkill = useCallback((index) => {
    setFormData((p) => {
      const skills = [...(p.skills ?? [])];
      skills.splice(index, 1);
      return { ...p, skills };
    });
  }, []);

  const addEducation = useCallback(() => {
    setFormData((p) => {
      const education = [...(p.education ?? [])];
      education.push({ institution: '', degree: '', dates: '', location: '' });
      return { ...p, education };
    });
  }, []);

  const deleteEducation = useCallback((index) => {
    setFormData((p) => {
      const education = [...(p.education ?? [])];
      education.splice(index, 1);
      return { ...p, education };
    });
  }, []);

  const addExpBullet = useCallback((expIndex) => {
    setFormData((p) => {
      const exps = [...(p.experience ?? [])];
      if (exps[expIndex]) {
        const bullets = [...(exps[expIndex].bullets ?? [])];
        bullets.push('');
        exps[expIndex] = { ...exps[expIndex], bullets };
      }
      return { ...p, experience: exps };
    });
  }, []);

  const deleteExpBullet = useCallback((expIndex, bulletIndex) => {
    setFormData((p) => {
      const exps = [...(p.experience ?? [])];
      if (exps[expIndex]) {
        const bullets = [...(exps[expIndex].bullets ?? [])];
        bullets.splice(bulletIndex, 1);
        exps[expIndex] = { ...exps[expIndex], bullets };
      }
      return { ...p, experience: exps };
    });
  }, []);

  const addProjBullet = useCallback((projIndex) => {
    setFormData((p) => {
      const projs = [...(p.projects ?? [])];
      if (projs[projIndex]) {
        const bullets = [...(projs[projIndex].bullets ?? [])];
        bullets.push('');
        projs[projIndex] = { ...projs[projIndex], bullets };
      }
      return { ...p, projects: projs };
    });
  }, []);

  const deleteProjBullet = useCallback((projIndex, bulletIndex) => {
    setFormData((p) => {
      const projs = [...(p.projects ?? [])];
      if (projs[projIndex]) {
        const bullets = [...(projs[projIndex].bullets ?? [])];
        bullets.splice(bulletIndex, 1);
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
  const education  = formData.education ?? [];

  // Helper to attach a ref into sectionRefs map
  const attachRef = (key) => (el) => { if (sectionRefs?.current) sectionRefs.current[key] = el; };

  const hasSkills = skills && skills.length > 0;
  const hasExperience = experience && experience.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasEducation = education && education.length > 0;
  const showAddSections = !hasSkills || !hasExperience || !hasProjects || !hasEducation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div ref={attachRef('basics')}>
        <PersonalInformationSection basics={formData.basics || {}} />
      </div>

      <div ref={attachRef('summary')}>
        <SummarySection summary={summary} updateSummary={updateSummary} />
      </div>

      {hasSkills && (
        <div ref={attachRef('skills')}>
          <SkillsSection 
            skills={skills} 
            updateSkill={updateSkill} 
            addSkill={addSkill} 
            deleteSkill={deleteSkill} 
          />
        </div>
      )}

      {hasExperience && (
        <div ref={attachRef('experience')}>
          <ExperienceSection 
            experience={experience} 
            updateExpField={updateExpField} 
            updateExpBullet={updateExpBullet}
            addExpBullet={addExpBullet}
            deleteExpBullet={deleteExpBullet}
            addExp={addExperience}
            deleteExp={deleteExperience}
          />
        </div>
      )}

      {hasProjects && (
        <div ref={attachRef('projects')}>
          <ProjectsSection 
            projects={projects} 
            updateProjField={updateProjField} 
            updateProjBullet={updateProjBullet}
            addProjBullet={addProjBullet}
            deleteProjBullet={deleteProjBullet}
            addProj={addProject}
            deleteProj={deleteProject}
          />
        </div>
      )}

      {hasEducation && (
        <div ref={attachRef('education')}>
          <EducationSection 
            education={education} 
            updateEduField={updateEduField}
            addEdu={addEducation}
            deleteEdu={deleteEducation}
          />
        </div>
      )}

      {showAddSections && (
        <div style={{
          marginTop: '12px', padding: '24px', borderRadius: '20px',
          border: '1px dashed #C7D2FE', background: '#FAFBFF',
          display: 'flex', flexDirection: 'column', gap: '14px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4F46E5' }}>Add Additional Resume Sections</h4>
            <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748B' }}>Add missing optional details to improve your ATS match score.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {!hasSkills && (
              <button onClick={addSkill} style={addSectionBtnStyle}>💻 Skills Section</button>
            )}
            {!hasExperience && (
              <button onClick={addExperience} style={addSectionBtnStyle}>+ Experience Section</button>
            )}
            {!hasProjects && (
              <button onClick={addProject} style={addSectionBtnStyle}>+ Projects Section</button>
            )}
            {!hasEducation && (
              <button onClick={addEducation} style={addSectionBtnStyle}>🎓 Education Section</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}