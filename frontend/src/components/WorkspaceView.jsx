import React, { useState, useRef, useCallback, useEffect } from 'react';
import InteractiveEditor from './InteractiveEditor';
import LiveResumePreview from './LiveResumePreview';
import ExportPanel from './ExportPanel';

// ─── Shared style helpers ─────────────────────────────────────────────────────
const F = Object.freeze; // freeze style objects for clarity

const NAV_ITEMS = [
  { id: 'summary',    icon: '📝', label: 'Summary'    },
  { id: 'skills',     icon: '💻', label: 'Skills'     },
  { id: 'experience', icon: '🏗',  label: 'Experience' },
  { id: 'education',  icon: '🎓', label: 'Education'  },
  { id: 'export',     icon: '↓',  label: 'Export'     },
];

const TEMPLATES = [
  { id: 'jake-ryan',    name: 'Jake Ryan',    available: true  },
  { id: 'modern',       name: 'Modern',       available: false },
  { id: 'compact',      name: 'Compact',      available: false },
  { id: 'professional', name: 'Professional', available: false },
];

// ─── Small atomic UI pieces ───────────────────────────────────────────────────
function ScoreChip({ score }) {
  if (score == null) return null;
  const [color, bg] =
    score >= 75 ? ['#059669', '#D1FAE5'] :
    score >= 50 ? ['#D97706', '#FEF3C7'] :
                  ['#DC2626', '#FEE2E2'];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: bg, color, letterSpacing: '0.01em' }}>
      ATS {score}%
    </span>
  );
}

function SaveBadge({ status = 'saved' }) {
  const cfg = {
    saved:   { dot: '●', text: 'Saved',   color: '#059669', bg: '#D1FAE5' },
    saving:  { dot: '○', text: 'Saving…', color: '#94A3B8', bg: '#F1F5F9' },
    unsaved: { dot: '·', text: 'Unsaved', color: '#D97706', bg: '#FEF3C7' },
  }[status] || { dot: '●', text: 'Saved', color: '#059669', bg: '#D1FAE5' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', background: cfg.bg, color: cfg.color }}>
      {cfg.dot} {cfg.text}
    </span>
  );
}

// ─── Workspace Header ─────────────────────────────────────────────────────────
function WorkspaceHeader({ contextTitle, atsScore, jdScore, saveStatus, onBack, onScrollToExport }) {
  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', fontWeight: 600,
    padding: '6px 13px', borderRadius: '8px', cursor: 'pointer',
    border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569',
    transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
  };
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '14px', padding: '0 20px', height: '56px',
      background: '#ffffff', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
      flexWrap: 'wrap',
    }}>
      {/* Left: back + context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <button
          onClick={onBack}
          style={{ ...btnBase, flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = '#EEF2FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#F8FAFC'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Dashboard
        </button>

        <div style={{ width: '1px', height: '22px', background: '#E2E8F0', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
          {/* File icon */}
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EEF2FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contextTitle}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px', flexWrap: 'wrap' }}>
              <ScoreChip score={atsScore} />
              {jdScore != null && (
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>JD {jdScore}%</span>
              )}
              <span style={{ color: '#E2E8F0', fontSize: '11px' }}>·</span>
              <SaveBadge status={saveStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Right: export shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {[
          { label: '↓ PDF',  mono: false },
          { label: 'LaTeX',  mono: true  },
          { label: '✉ Cover', mono: false },
        ].map(({ label, mono }) => (
          <button key={label} onClick={onScrollToExport}
            style={{ ...btnBase, fontFamily: mono ? 'monospace' : 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#4F46E5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function WorkspaceSidebar({ activeSection, onNav, selectedTemplate, onTemplateChange, onScrollToExport }) {
  return (
    <nav style={{
      width: '220px', flexShrink: 0,
      borderRight: '1px solid #E2E8F0', background: '#FFFFFF',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Section navigation */}
      <div style={{ padding: '16px 10px 8px' }}>
        <p style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CBD5E1', margin: '0 0 8px 8px' }}>
          Sections
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.id === 'export' ? onScrollToExport() : onNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                width: '100%', padding: '8px 10px', borderRadius: '9px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '12.5px', fontWeight: isActive ? 600 : 500,
                background: isActive ? '#EEF2FF' : 'transparent',
                color: isActive ? '#4F46E5' : '#64748B',
                transition: 'all 0.12s', marginBottom: '1px',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }
              }}
            >
              <span style={{ fontSize: '13px', lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '3px', background: '#4F46E5' }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 0' }} />

      {/* Template picker */}
      <div style={{ padding: '10px 10px 8px' }}>
        <p style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CBD5E1', margin: '0 0 8px 8px' }}>
          Template
        </p>
        {TEMPLATES.map((t) => {
          const isSelected = selectedTemplate === t.id && t.available;
          return (
            <button
              key={t.id}
              onClick={() => t.available && onTemplateChange(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '7px 10px', borderRadius: '9px',
                border: 'none', cursor: t.available ? 'pointer' : 'not-allowed',
                textAlign: 'left', fontSize: '12px', fontWeight: isSelected ? 600 : 400,
                background: isSelected ? '#EEF2FF' : 'transparent',
                color: isSelected ? '#4F46E5' : t.available ? '#64748B' : '#CBD5E1',
                fontFamily: 'inherit', marginBottom: '1px',
              }}
            >
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: `1.5px solid ${isSelected ? '#4F46E5' : '#E2E8F0'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: '#4F46E5' }} />}
              </div>
              {t.name}
              {!t.available && <span style={{ fontSize: '9px', fontWeight: 700, color: '#CBD5E1', marginLeft: 'auto' }}>SOON</span>}
            </button>
          );
        })}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 0' }} />

      {/* Export shortcuts */}
      <div style={{ padding: '10px' }}>
        <p style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CBD5E1', margin: '0 0 8px 8px' }}>
          Export
        </p>
        {[
          { label: '↓ Download PDF',  bg: '#EEF2FF', color: '#4F46E5' },
          { label: '⌗ LaTeX / Overleaf', bg: '#F0FDF4', color: '#059669' },
          { label: '✉ Cover Letter',   bg: '#FFF7ED', color: '#D97706' },
        ].map(({ label, bg, color }) => (
          <button key={label} onClick={onScrollToExport}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 10px', borderRadius: '9px', marginBottom: '4px',
              border: 'none', cursor: 'pointer',
              fontSize: '11.5px', fontWeight: 600, color,
              background: bg, fontFamily: 'inherit',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.95)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Push to bottom */}
      <div style={{ flex: 1 }} />

      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid #F1F5F9' }}>
        <p style={{ margin: 0, fontSize: '10.5px', color: '#CBD5E1', lineHeight: 1.5 }}>
          Hover any text field to reveal AI action pills.
        </p>
      </div>
    </nav>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────
function PreviewPanel({ previewData, user, template }) {
  const panelRef = useRef(null);
  const [zoom, setZoom] = useState(0.72);

  // Dynamically calculate zoom to fit the panel
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const updateZoom = () => {
      const w = el.clientWidth - 32; // minus padding
      setZoom(Math.min(1, w / 560));
    };
    updateZoom();
    const ro = new ResizeObserver(updateZoom);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <aside style={{
      width: '460px', flexShrink: 0,
      borderLeft: '1px solid #E2E8F0', background: '#F1F5F9',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF', flexShrink: 0,
      }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94A3B8' }}>
          Live Preview
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', background: '#EEF2FF', color: '#4F46E5' }}>
            Jake Ryan
          </span>
          <span style={{ fontSize: '10px', color: '#CBD5E1' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Scaled preview */}
      <div ref={panelRef} style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <div style={{
          width: '560px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          // Collapse the extra whitespace created by scale
          marginBottom: `calc((${zoom} - 1) * 100%)`,
        }}>
          <LiveResumePreview formData={previewData} user={user} template={template} />
        </div>
      </div>
    </aside>
  );
}

// ─── Main WorkspaceView ───────────────────────────────────────────────────────
/**
 * WorkspaceView — full-screen premium editing workspace.
 * Replaces the dashboard tab content entirely when tailoredData is available.
 * Uses position:fixed (below the 68px site header) for maximum space.
 *
 * Layout:
 *   [Workspace Header 56px]
 *   [Sidebar 220px] | [Editor flex-1] | [Preview 460px]
 */
export default function WorkspaceView({
  tailoredData,
  onDataChange,   // propagates to parent for save-status tracking
  user,
  selectedResume, // history item — for company/role/atsScore display
  resumeId,
  parsedText,
  userLinks,
  onBack,
  saveStatus,
}) {
  const [previewData,      setPreviewData]      = useState(tailoredData || {});
  const [selectedTemplate, setSelectedTemplate] = useState('jake-ryan');
  const [activeSection,    setActiveSection]    = useState('summary');

  const editorPanelRef = useRef(null);
  const sectionRefs    = useRef({});
  const exportRef      = useRef(null);

  // When editor changes → update preview + notify parent
  const handleEditorChange = useCallback((data) => {
    setPreviewData(data);
    onDataChange?.(data);
  }, [onDataChange]);

  // Scroll editor panel to a section
  const navTo = useCallback((id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el && editorPanelRef.current) {
      const top = el.offsetTop - 24;
      editorPanelRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const scrollToExport = useCallback(() => {
    setActiveSection('export');
    if (exportRef.current && editorPanelRef.current) {
      const top = exportRef.current.offsetTop - 24;
      editorPanelRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Track active section via scroll
  useEffect(() => {
    const panel = editorPanelRef.current;
    if (!panel) return;
    const onScroll = () => {
      const panelTop = panel.scrollTop;
      let current = 'summary';
      for (const [key, el] of Object.entries(sectionRefs.current)) {
        if (el && el.offsetTop - 40 <= panelTop) current = key;
      }
      setActiveSection(current);
    };
    panel.addEventListener('scroll', onScroll, { passive: true });
    return () => panel.removeEventListener('scroll', onScroll);
  }, [tailoredData]);

  const contextTitle = selectedResume?.company && selectedResume?.roleName
    ? `${selectedResume.company} · ${selectedResume.roleName}`
    : selectedResume?.roleName || selectedResume?.company || 'Tailored Resume';

  return (
    <div style={{
      position: 'fixed',
      top: '68px', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: '#F8FAFC',
      zIndex: 40,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* ── Header ── */}
      <WorkspaceHeader
        contextTitle={contextTitle}
        atsScore={selectedResume?.atsScore}
        jdScore={selectedResume?.matchScore}
        saveStatus={saveStatus}
        onBack={onBack}
        onScrollToExport={scrollToExport}
      />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar */}
        <WorkspaceSidebar
          activeSection={activeSection}
          onNav={navTo}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onScrollToExport={scrollToExport}
        />

        {/* Center: Editor */}
        <main
          ref={editorPanelRef}
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minWidth: 0 }}
        >
          {/* AI hint banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#EEF2FF', border: '1px solid #E0E7FF',
            borderRadius: '14px', padding: '12px 16px', marginBottom: '20px',
          }}>
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>⚡</span>
            <div>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#4338CA' }}>AI-Powered Workspace</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6366F1', lineHeight: 1.5 }}>
                Hover any text field to reveal Improve, Concise, ATS, Stronger, and Metrics AI actions — each field enhances independently.
              </p>
            </div>
          </div>

          {/* Editor sections — sectionRefs attached for scroll tracking */}
          <InteractiveEditor
            initialData={tailoredData}
            onDataChange={handleEditorChange}
            sectionRefs={sectionRefs}
          />

          {/* Export section at bottom */}
          <div ref={exportRef} style={{ marginTop: '32px', paddingTop: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '16px',
            }}>
              <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: '#4F46E5', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Export</p>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>— choose your format</span>
            </div>
            <ExportPanel
              tailoredData={previewData}
              parsedText={parsedText}
              user={user}
              resumeId={resumeId}
              userLinks={userLinks}
            />
          </div>
        </main>

        {/* Right: Live Preview */}
        <PreviewPanel
          previewData={previewData}
          user={user}
          template={selectedTemplate}
        />
      </div>

      {/* ── Mobile fallback message ── */}
      <div style={{
        display: 'none',
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '32px',
        // shown via CSS @media below — but inline media queries need JS
      }} id="workspace-mobile-fallback">
        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
            Open on desktop for the full workspace
          </p>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            The workspace editor works best on screens wider than 900px.
          </p>
          <button onClick={onBack} style={{
            marginTop: '20px', padding: '10px 20px', borderRadius: '10px',
            background: '#4F46E5', color: '#fff', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ← Back to dashboard
          </button>
        </div>
      </div>

      {/* Inline style for mobile */}
      <style>{`
        @media (max-width: 900px) {
          #workspace-mobile-fallback { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
