import React, { useState, useRef, useCallback, useEffect } from 'react';
import InteractiveEditor from './InteractiveEditor';
import LiveResumePreview from './LiveResumePreview';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TailoredPDF from './TailoredPDF';

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

// ─── Top Action Bar ─────────────────────────────────────────────────────────────
function TopActionBar({ contextTitle, selectedResume, saveStatus, onBack, onGenerateAI, tailoredData, parsedText, user, userLinks, resumeId }) {
  const [exportOpen, setExportOpen] = useState(false);
  const [modalState, setModalState] = useState({ open: false, title: '', content: '' });
  const [copied, setCopied] = useState(false);

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', fontWeight: 600,
    padding: '6px 13px', borderRadius: '8px', cursor: 'pointer',
    border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569',
    transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
  };

  const handleJsonExport = () => {
    const dataStr = JSON.stringify(tailoredData, null, 2);
    setModalState({ open: true, title: 'JSON Export', content: dataStr });
    setExportOpen(false);
  };

  const handleLatexExport = async () => {
    try {
      const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const apiBase = raw.replace(/\/+$/, '').replace(/\/api$/, '');
      const res = await fetch(`${apiBase}/api/resume/generate-latex`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, tailoredData }),
      });
      if (!res.ok) throw new Error(`Failed to generate LaTeX: ${res.statusText}`);
      const { latex } = await res.json();
      const code = latex.replace(/^```(?:latex|tex)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
      
      setModalState({ open: true, title: 'LaTeX Export', content: code });
    } catch (e) {
      alert("LaTeX Export failed: " + e.message);
    }
    setExportOpen(false);
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '14px', padding: '0 20px', height: '56px',
      background: '#ffffff', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
      flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50
    }}>
      {/* Left: back + context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <button onClick={onBack} style={{ ...btnBase, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Dashboard
        </button>
        <div style={{ width: '1px', height: '22px', background: '#E2E8F0', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contextTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
        <SaveBadge status={saveStatus} />
        
        <button onClick={onGenerateAI} style={{ ...btnBase, background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' }}>
          ✨ Generate AI Resume
        </button>

        <button style={{ ...btnBase }} onClick={() => {
           const previewPanel = document.getElementById('preview-panel-container');
           if (previewPanel) {
             previewPanel.scrollIntoView({ behavior: 'smooth' });
           }
        }}>
          Preview
        </button>

        <div style={{ position: 'relative' }}>
          <button style={{ ...btnBase }} onClick={() => setExportOpen(!exportOpen)}>
            Export ▾
          </button>
          
          {exportOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '4px', minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 60 }}>
              <PDFDownloadLink
                document={<TailoredPDF tailoredData={tailoredData} parsedText={parsedText} user={user} userLinks={userLinks} />}
                fileName={`Tailored_Resume_${user?.firstName || 'Resume'}.pdf`}
                style={{ padding: '6px 12px', textAlign: 'left', textDecoration: 'none', fontSize: '12px', fontWeight: 500, color: '#475569', borderRadius: '4px', display: 'block' }}
                onMouseEnter={e => e.target.style.background = '#F8FAFC'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {({ loading }) => (loading ? 'Building PDF…' : 'PDF')}
              </PDFDownloadLink>
              <button onClick={handleLatexExport} style={{ padding: '6px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#475569', borderRadius: '4px' }} onMouseEnter={e => e.target.style.background = '#F8FAFC'} onMouseLeave={e => e.target.style.background = 'transparent'}>LaTeX</button>
              <button onClick={handleJsonExport} style={{ padding: '6px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#475569', borderRadius: '4px' }} onMouseEnter={e => e.target.style.background = '#F8FAFC'} onMouseLeave={e => e.target.style.background = 'transparent'}>JSON</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal for Text Exports ── */}
      {modalState.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{modalState.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modalState.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ ...btnBase, background: copied ? '#D1FAE5' : '#EEF2FF', borderColor: copied ? '#34D399' : '#C7D2FE', color: copied ? '#065F46' : '#4F46E5', padding: '4px 10px', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={() => setModalState({ open: false, title: '', content: '' })} style={{ background: 'transparent', border: 'none', fontSize: '20px', color: '#64748B', cursor: 'pointer', padding: '0 4px' }}>
                  ×
                </button>
              </div>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {modalState.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </header>
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
    <aside id="preview-panel-container" style={{
      width: '50%', flexShrink: 0,
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

  const handleGenerateAI = () => {
    alert("AI will regenerate missing content only (respecting locked personal info). Not fully implemented in this demo.");
  };

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
      <TopActionBar
        contextTitle={contextTitle}
        selectedResume={selectedResume}
        saveStatus={saveStatus}
        onBack={onBack}
        onGenerateAI={handleGenerateAI}
        tailoredData={previewData}
        parsedText={parsedText}
        user={user}
        userLinks={userLinks}
        resumeId={resumeId}
      />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Editor (50%) */}
        <main
          ref={editorPanelRef}
          style={{ width: '50%', overflowY: 'auto', padding: '24px 28px', minWidth: 0, flexShrink: 0 }}
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
                Hover any text field to reveal Improve, Concise, ATS, Stronger, and Metrics AI actions. Personal Info is locked.
              </p>
            </div>
          </div>

          {/* Editor sections */}
          <InteractiveEditor
            initialData={tailoredData}
            onDataChange={handleEditorChange}
            sectionRefs={sectionRefs}
          />
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
