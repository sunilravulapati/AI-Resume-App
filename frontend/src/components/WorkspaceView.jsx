import React, { useState, useRef, useCallback, useEffect } from 'react';
import InteractiveEditor from './InteractiveEditor';
import LiveResumePreview from './LiveResumePreview';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TailoredPDF from './TailoredPDF';
import { fetchLatexExport } from '../utils/latexExport';
import {
  UserIcon, PenLineIcon, CodeIcon, BuildingIcon, LayersIcon, GraduationCapIcon,
  SparklesIcon, ZapIcon,
} from './icons';

const NAV_ITEMS = [
  { id: 'basics',     Icon: UserIcon,          label: 'Personal Info' },
  { id: 'summary',    Icon: PenLineIcon,       label: 'Summary'       },
  { id: 'skills',     Icon: CodeIcon,          label: 'Skills'        },
  { id: 'experience', Icon: BuildingIcon,      label: 'Experience'    },
  { id: 'projects',   Icon: LayersIcon,        label: 'Projects'      },
  { id: 'education',  Icon: GraduationCapIcon, label: 'Education'     },
];

// Helper to determine completion status of each section
function getSectionStatus(sectionId, data) {
  if (!data) return 'empty';
  switch (sectionId) {
    case 'basics': {
      const b = data.basics;
      if (!b) return 'empty';
      const fields = [b.name, b.email, b.phone, b.location];
      const count = fields.filter(Boolean).length;
      if (count === 4) return 'complete';
      if (count > 0) return 'partial';
      return 'empty';
    }
    case 'summary': {
      const s = data.summary;
      if (!s || !s.trim()) return 'empty';
      if (s.trim().split(/\s+/).length >= 15) return 'complete';
      return 'partial';
    }
    case 'skills': {
      const sk = data.skills;
      if (!sk || sk.length === 0) return 'empty';
      const count = sk.filter(s => s.value && s.value.trim()).length;
      if (count === sk.length) return 'complete';
      if (count > 0) return 'partial';
      return 'empty';
    }
    case 'experience': {
      const ex = data.experience;
      if (!ex || ex.length === 0) return 'empty';
      const count = ex.filter(e => e.title && e.bullets && e.bullets.length > 0).length;
      if (count === ex.length) return 'complete';
      if (count > 0) return 'partial';
      return 'empty';
    }
    case 'projects': {
      const pr = data.projects;
      if (!pr || pr.length === 0) return 'empty';
      const count = pr.filter(p => p.title && p.bullets && p.bullets.length > 0).length;
      if (count === pr.length) return 'complete';
      if (count > 0) return 'partial';
      return 'empty';
    }
    case 'education': {
      const ed = data.education;
      if (!ed || ed.length === 0) return 'empty';
      const count = ed.filter(e => e.institution).length;
      if (count === ed.length) return 'complete';
      if (count > 0) return 'partial';
      return 'empty';
    }
    default:
      return 'empty';
  }
}

// Circular progress indicator for ATS Readiness Card
function CircularProgress({ percentage }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width="54" height="54" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle
        cx="27"
        cy="27"
        r={radius}
        fill="transparent"
        stroke="#E2E8F0"
        strokeWidth="4"
      />
      <circle
        cx="27"
        cy="27"
        r={radius}
        fill="transparent"
        stroke={percentage >= 80 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444'}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.35s' }}
      />
      <text
        x="27"
        y="-24"
        transform="rotate(90)"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '11px', fontWeight: '700', fill: '#0F172A', fontFamily: 'inherit' }}
      >
        {percentage}%
      </text>
    </svg>
  );
}

// Save status indicator
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
function TopActionBar({ contextTitle, selectedResume, saveStatus, onBack, onGenerateAI, tailoredData, parsedText, user, userLinks, resumeId, sidebarCollapsed, toggleSidebar, onExport }) {
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
    onExport?.();
  };

  const handleLatexExport = async () => {
    try {
      const code = await fetchLatexExport({ resumeId, tailoredData: previewData });
      setModalState({ open: true, title: 'LaTeX Export', content: code });
      onExport?.();
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
      {/* Left: back + collapse toggle + context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <button onClick={onBack} style={{ ...btnBase, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Dashboard
        </button>
        <button onClick={toggleSidebar} style={{ ...btnBase, padding: '6px 8px', flexShrink: 0 }} title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
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
        
        <button 
          onClick={onGenerateAI} 
          style={{ ...btnBase, background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' }}
          title="AI will enhance missing content (Ctrl + Enter)"
        >
          <SparklesIcon size={13} /> Generate AI Resume
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
                onClick={() => onExport?.()}
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

// ─── Main WorkspaceView ───────────────────────────────────────────────────────
export default function WorkspaceView({
  tailoredData,
  onDataChange,
  user,
  selectedResume,
  resumeId,
  parsedText,
  userLinks,
  onBack,
  saveStatus,
  onGenerateAI,
  onExport,
  activeSessionId,
}) {
  const [previewData,      setPreviewData]      = useState(tailoredData || {});
  const lastSessionRef = useRef(null);

  // Sync preview when a new session is opened, not on every autosave/parent update
  useEffect(() => {
    if (activeSessionId === lastSessionRef.current) return;
    lastSessionRef.current = activeSessionId;
    setPreviewData(tailoredData || {});
  }, [activeSessionId, tailoredData]);
  const [selectedTemplate, setSelectedTemplate] = useState('jake-ryan');
  const [activeSection,    setActiveSection]    = useState('basics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fitZoom,          setFitZoom]          = useState(0.72);
  const [userZoom,         setUserZoom]         = useState(null);
  const [isFullscreen,     setIsFullscreen]     = useState(false);

  const editorPanelRef = useRef(null);
  const sectionRefs    = useRef({});
  const previewPanelRef = useRef(null);

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

  // Track active section via scroll
  useEffect(() => {
    const panel = editorPanelRef.current;
    if (!panel) return;
    const onScroll = () => {
      const panelTop = panel.scrollTop;
      let current = 'basics';
      for (const [key, el] of Object.entries(sectionRefs.current)) {
        if (el && el.offsetTop - 80 <= panelTop) current = key;
      }
      setActiveSection(current);
    };
    panel.addEventListener('scroll', onScroll, { passive: true });
    return () => panel.removeEventListener('scroll', onScroll);
  }, [previewData]);

  // Dynamically calculate fit zoom
  useEffect(() => {
    const el = previewPanelRef.current;
    if (!el) return;
    const updateZoom = () => {
      const w = el.clientWidth - 32; // minus padding
      setFitZoom(Math.min(1, w / 560));
    };
    updateZoom();
    const ro = new ResizeObserver(updateZoom);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const contextTitle = selectedResume?.company && selectedResume?.roleName
    ? `${selectedResume.company} · ${selectedResume.roleName}`
    : selectedResume?.roleName || selectedResume?.company || 'Tailored Resume';

  const handleGenerateAI = onGenerateAI || (() => {
    // Parent should always provide onGenerateAI when workspace is mounted
  });

  // Keyboard shortcut Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateAI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewData]);

  // Health Card completion states
  const sections = ['basics', 'summary', 'skills', 'experience', 'projects', 'education'];
  const statuses = sections.map(sec => getSectionStatus(sec, previewData));
  const completeCount = statuses.filter(s => s === 'complete').length;
  const partialCount = statuses.filter(s => s === 'partial').length;
  const completionPercentage = Math.round(((completeCount * 100) + (partialCount * 50)) / sections.length);
  const atsReadiness = completionPercentage >= 80 ? 'Good' : 'Needs Work';

  const currentZoom = userZoom !== null ? userZoom : fitZoom;

  const zoomBtnStyle = {
    padding: '2px 8px', borderRadius: '6px', border: '1px solid #E2E8F0',
    background: '#fff', color: '#475569', fontSize: '11px', cursor: 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: '24px', transition: 'all 0.15s'
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
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onExport={onExport}
      />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left: Collapsible Sidebar */}
        <aside className={`ws-sidebar ${sidebarCollapsed ? 'ws-sidebar-collapsed' : ''}`}>
          <div style={{ padding: '16px 8px', flex: 1, overflowY: 'auto' }}>
            <p style={{ 
              margin: '0 16px 12px', fontSize: '10px', fontWeight: 700, 
              letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94A3B8',
              display: sidebarCollapsed ? 'none' : 'block'
            }}>
              Resume Sections
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {NAV_ITEMS.map((item) => {
                const status = getSectionStatus(item.id, previewData);
                const isActive = activeSection === item.id;
                const NavIcon = item.Icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navTo(item.id)}
                    className={`ws-sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <NavIcon size={15} style={{ color: isActive ? '#4F46E5' : '#94A3B8' }} />
                    <span className="ws-sidebar-nav-label">{item.label}</span>
                    {!sidebarCollapsed && (
                      <span className={`ws-completion-dot ${status}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Health Card */}
          {!sidebarCollapsed && (
            <div className="ws-health-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CircularProgress percentage={completionPercentage} />
                <div>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATS Readiness</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700, color: atsReadiness === 'Good' ? '#059669' : '#D97706' }}>
                    {atsReadiness}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#64748B' }}>
                    {completeCount} of {sections.length} complete
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Autosave Status Footer */}
          <div className="ws-autosave-badge">
            <span style={{ fontSize: '12px' }}>
              {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✓' : '●'}
            </span>
            <span className="ws-sidebar-nav-label" style={{ fontSize: '11px', color: '#64748B' }}>
              {saveStatus === 'saving' ? 'Saving changes...' : saveStatus === 'saved' ? 'All changes saved' : 'Unsaved changes'}
            </span>
          </div>
        </aside>

        {/* Center: Main Editor */}
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
            <ZapIcon size={18} style={{ color: '#4338CA', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#4338CA' }}>AI-Powered Workspace</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6366F1', lineHeight: 1.5 }}>
                Hover any text field to reveal Improve, Concise, ATS, Stronger, and Metrics AI actions. Personal Info is locked.
              </p>
            </div>
          </div>

          {/* Editor sections */}
          <InteractiveEditor
            initialData={previewData}
            onDataChange={handleEditorChange}
            sectionRefs={sectionRefs}
            resetKey={activeSessionId}
          />
        </main>

        {/* Right: Live Preview Panel */}
        <aside id="preview-panel-container" className="ws-preview-panel">
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
              <button 
                onClick={() => setUserZoom(prev => Math.max(0.3, (prev !== null ? prev : fitZoom) - 0.1))}
                style={zoomBtnStyle}
                title="Zoom Out"
              >
                －
              </button>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', minWidth: '36px', textAlign: 'center' }}>
                {Math.round(currentZoom * 100)}%
              </span>
              <button 
                onClick={() => setUserZoom(prev => Math.min(1.5, (prev !== null ? prev : fitZoom) + 0.1))}
                style={zoomBtnStyle}
                title="Zoom In"
              >
                ＋
              </button>
              <button 
                onClick={() => setUserZoom(1.0)}
                style={zoomBtnStyle}
                title="Reset to 100%"
              >
                100%
              </button>
              <button 
                onClick={() => setUserZoom(null)}
                style={{
                  ...zoomBtnStyle,
                  background: userZoom === null ? '#EEF2FF' : 'transparent',
                  color: userZoom === null ? '#4F46E5' : '#475569',
                  borderColor: userZoom === null ? '#C7D2FE' : '#E2E8F0',
                  fontWeight: 600
                }}
                title="Fit to Screen"
              >
                Fit
              </button>
              <button 
                onClick={() => setIsFullscreen(true)}
                style={zoomBtnStyle}
                title="Fullscreen Preview"
              >
                ⛶
              </button>
            </div>
          </div>

          {/* Scaled preview */}
          <div ref={previewPanelRef} style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            <div style={{
              width: '560px',
              transform: `scale(${currentZoom})`,
              transformOrigin: 'top left',
              // Collapse the extra whitespace created by scale
              marginBottom: `calc((${currentZoom} - 1) * 100%)`,
              marginRight: `calc((${currentZoom} - 1) * 100%)`,
              // Premium paper shadow
              boxShadow: '0 24px 64px -8px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: '2px',
            }}>
              <LiveResumePreview formData={previewData} user={user} template={selectedTemplate} />
            </div>
          </div>
        </aside>

      </div>

      {/* ── Fullscreen Overlay Preview ── */}
      {isFullscreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex', flexDirection: 'column', padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Fullscreen Preview</h3>
            <button 
              onClick={() => setIsFullscreen(false)} 
              style={{
                padding: '6px 16px', borderRadius: '8px', border: '1px solid #334155',
                background: '#1E293B', color: '#fff', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close Preview
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
            <div style={{ width: '800px', background: '#fff', padding: '24px', borderRadius: '4px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', height: 'fit-content', marginBottom: '40px' }}>
              <LiveResumePreview formData={previewData} user={user} template={selectedTemplate} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile fallback message ── */}
      <div style={{
        display: 'none',
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '32px',
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

    </div>
  );
}
