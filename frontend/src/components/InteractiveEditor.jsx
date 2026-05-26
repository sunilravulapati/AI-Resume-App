import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SectionBlock } from './DashboardShell';

/**
 * A highly optimized text area with an inline AI action toolbar.
 *
 * Fixes applied:
 * 1. AI toolbar: moved `group` to the inner wrapper so hovering the toolbar
 *    itself doesn't cause it to disappear (previously the group was on the outer
 *    div, so mouseout-from-textarea → toolbar fired a blur/hover-leave).
 * 2. Toolbar is now always rendered but toggled via opacity/pointer-events so
 *    it stays mounted while the user clicks a button (no flicker).
 */
const AITextArea = memo(({ value, onChange, label, context = '', placeholder = '' }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Sync if parent resets the value (e.g. new tailored resume loaded)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = (e) => {
    // Don't call onChange on every keystroke — only commit on blur
    if (localValue !== value) {
      onChange(localValue);
    }
    // Hide toolbar only if focus left the whole group (not moved to a toolbar btn)
    if (!e.currentTarget.closest('[data-aitextarea]')?.contains(e.relatedTarget)) {
      setShowToolbar(false);
    }
  };

  const handleFocus = () => setShowToolbar(true);

  const handleMouseEnter = () => setShowToolbar(true);
  const handleMouseLeave = (e) => {
    // Keep toolbar visible if focus is still inside
    if (!e.currentTarget.contains(document.activeElement)) {
      setShowToolbar(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!localValue.trim()) {
      toast.error('Nothing to enhance.');
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await axios.post(
        '/api/resume/enhance',
        { text: localValue, action, context },
        { withCredentials: true }
      );
      if (res.data.enhancedText) {
        setLocalValue(res.data.enhancedText);
        onChange(res.data.enhancedText);
        toast.success(`Text enhanced (${action})`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to enhance text.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const AI_ACTIONS = [
    { id: 'improve',      icon: '✨', title: 'Improve'      },
    { id: 'concise',      icon: '✂️', title: 'Concise'      },
    { id: 'ats_optimize', icon: '🤖', title: 'ATS Optimize' },
    { id: 'stronger',     icon: '💪', title: 'Stronger'     },
    { id: 'metrics',      icon: '📈', title: 'Add Metrics'  },
  ];

  return (
    <div
      className="relative mb-3"
      data-aitextarea
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && (
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Toolbar — always rendered, visibility toggled to avoid flicker on click */}
      <div
        className={`absolute right-2 top-2 flex bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden z-10 transition-opacity duration-150 ${
          showToolbar && !isEnhancing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {AI_ACTIONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onMouseDown={(e) => {
              // Prevent textarea blur before the click fires
              e.preventDefault();
              handleAIAction(btn.id);
            }}
            disabled={isEnhancing}
            title={btn.title}
            className="p-1.5 hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50 text-xs"
          >
            {btn.icon}
          </button>
        ))}
      </div>

      <textarea
        className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-medium text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-y leading-relaxed"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={Math.max(2, localValue.split('\n').length)}
        disabled={isEnhancing}
      />

      {isEnhancing && (
        <div className="absolute inset-0 bg-[var(--bg)]/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
          <span className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});
AITextArea.displayName = 'AITextArea';


// ─── Memoized section components ──────────────────────────────────────────────

const SummarySection = memo(({ summary, updateSummary }) => (
  <SectionBlock title="Professional Summary">
    <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <AITextArea
        value={summary}
        onChange={updateSummary}
        context="Professional summary for a tech resume"
        placeholder="Write a concise professional summary…"
      />
    </div>
  </SectionBlock>
));
SummarySection.displayName = 'SummarySection';

const SkillsSection = memo(({ skills, updateSkill }) => (
  <SectionBlock title="Targeted Skills">
    <div className="space-y-4">
      {skills.map((row, i) => (
        // FIX: was `flex gap-4 items-start` with hard w-1/4 / w-3/4 — breaks on mobile.
        // Now stacks vertically on mobile and goes side-by-side from sm up.
        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
          <div className="w-full sm:w-1/4 shrink-0">
            <input
              type="text"
              className="w-full text-xs font-bold bg-transparent border-b border-[var(--border)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--text)] py-1 placeholder-[var(--text-muted)]"
              value={row.label || ''}
              onChange={(e) => updateSkill(i, 'label', e.target.value)}
              placeholder="Category"
            />
          </div>
          <div className="w-full sm:w-3/4">
            <AITextArea
              value={row.value || ''}
              onChange={(val) => updateSkill(i, 'value', val)}
              context={`Technical skills for category: ${row.label}`}
              placeholder="Comma-separated skills…"
            />
          </div>
        </div>
      ))}
    </div>
  </SectionBlock>
));
SkillsSection.displayName = 'SkillsSection';

const ExperienceSection = memo(({ experience, updateExpField, updateExpBullet }) => (
  <SectionBlock title="Experience & Projects">
    <div className="space-y-6">
      {experience.map((exp, i) => (
        <div
          key={i}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-accent)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent)]"
        >
          {/* FIX: title + dates used to overflow on mobile. Now stacks on mobile. */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
            <input
              type="text"
              className="font-bold text-base text-[var(--text)] bg-transparent border-b border-transparent focus:border-[var(--color-accent)] focus:outline-none flex-1 min-w-0"
              value={exp.title || ''}
              onChange={(e) => updateExpField(i, 'title', e.target.value)}
              placeholder="Job Title / Project Name"
            />
            <input
              type="text"
              // FIX: was `exp.meta !== undefined ? "meta" : "dates"` which always
              // resolves to "meta" after the first edit since meta gets set to "".
              // Always write to "dates" for the date field; keep meta for other data.
              className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-muted)] px-2.5 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] sm:w-36 shrink-0"
              value={exp.dates || exp.meta || ''}
              onChange={(e) => updateExpField(i, 'dates', e.target.value)}
              placeholder="Dates"
            />
          </div>

          <input
            type="text"
            className="text-xs font-bold text-[var(--color-accent)] mb-3 bg-transparent border-b border-transparent focus:border-[var(--color-accent)] focus:outline-none w-full placeholder-[var(--text-muted)]"
            value={exp.tech || ''}
            onChange={(e) => updateExpField(i, 'tech', e.target.value)}
            placeholder="Technologies used"
          />

          <div className="space-y-2 mt-4">
            {(exp.bullets || []).map((bullet, j) => (
              <div key={j} className="flex gap-2">
                <span className="text-[var(--color-accent)] font-bold shrink-0 mt-2.5">→</span>
                <div className="flex-1 min-w-0">
                  <AITextArea
                    value={bullet}
                    onChange={(val) => updateExpBullet(i, j, val)}
                    context={`Resume bullet for role: ${exp.title} using ${exp.tech || 'various technologies'}`}
                    placeholder="Describe what you did and the impact…"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SectionBlock>
));
ExperienceSection.displayName = 'ExperienceSection';


// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function InteractiveEditor({ initialData, onDataChange }) {
  const [formData, setFormData] = useState(initialData || {});

  // Sync when a brand-new tailored resume arrives
  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  // FIX: onDataChange was in the dependency array, so if the parent passed an
  // inline arrow function the effect fired on every render → infinite loop.
  // Use a ref to always hold the latest callback without adding it as a dep.
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => { onDataChangeRef.current = onDataChange; }, [onDataChange]);

  useEffect(() => {
    onDataChangeRef.current(formData);
  }, [formData]);

  // ── Immutable update helpers ──────────────────────────────────────────────

  const updateSummary = useCallback((newSummary) => {
    setFormData((prev) => ({ ...prev, tailoredSummary: newSummary }));
  }, []);

  const updateSkill = useCallback((index, field, value) => {
    setFormData((prev) => {
      const skills = [...(prev.tailoredSkills ?? prev.skills ?? [])];
      if (skills[index]) skills[index] = { ...skills[index], [field]: value };
      return { ...prev, tailoredSkills: skills };
    });
  }, []);

  const updateExpField = useCallback((expIndex, field, value) => {
    setFormData((prev) => {
      const exps = [...(prev.tailoredExperience ?? prev.experience ?? [])];
      if (exps[expIndex]) exps[expIndex] = { ...exps[expIndex], [field]: value };
      return { ...prev, tailoredExperience: exps };
    });
  }, []);

  const updateExpBullet = useCallback((expIndex, bulletIndex, value) => {
    setFormData((prev) => {
      const exps = [...(prev.tailoredExperience ?? prev.experience ?? [])];
      if (exps[expIndex]) {
        const bullets = [...(exps[expIndex].bullets ?? [])];
        bullets[bulletIndex] = value;
        exps[expIndex] = { ...exps[expIndex], bullets };
      }
      return { ...prev, tailoredExperience: exps };
    });
  }, []);

  if (!formData || Object.keys(formData).length === 0) return null;

  const summary    = formData.tailoredSummary  ?? formData.summary  ?? '';
  const skills     = formData.tailoredSkills   ?? formData.skills   ?? [];
  const experience = formData.tailoredExperience
    ?? [
        ...(formData.experience ?? []),
        // Only merge raw projects when tailoredExperience is absent
        ...(formData.projects ?? []).map((proj) => ({
          ...proj,
          company: proj.title,
          title:   'Personal Project',
          dates:   proj.dates ?? proj.meta,
        })),
      ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Intro banner */}
      <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl shrink-0">✨</span>
        <p className="text-sm font-medium text-[var(--text)] leading-relaxed">
          Welcome to the{' '}
          <strong className="text-[var(--color-accent)]">Interactive AI Workspace</strong>.
          Edit any field directly, or hover over a text area to reveal the AI toolbar.
        </p>
      </div>

      <SummarySection summary={summary} updateSummary={updateSummary} />

      {skills.length > 0 && (
        <SkillsSection skills={skills} updateSkill={updateSkill} />
      )}

      {experience.length > 0 && (
        <ExperienceSection
          experience={experience}
          updateExpField={updateExpField}
          updateExpBullet={updateExpBullet}
        />
      )}

      {/* Education — clearly labelled as view-only, no confusing opacity */}
      {formData.education?.length > 0 && (
        <SectionBlock title="Education">
          <div className="space-y-2">
            {formData.education.map((edu, i) => (
              <div
                key={i}
                className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-base text-[var(--text)] truncate">{edu.institution}</p>
                  {edu.degree && (
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">{edu.degree}</p>
                  )}
                </div>
                {edu.dates && (
                  <span className="text-xs font-bold text-[var(--text-muted)] shrink-0 bg-[var(--bg-muted)] px-2.5 py-1 rounded-md self-start sm:self-center">
                    {edu.dates}
                  </span>
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}
    </div>
  );
}