import React from 'react';

/* ── SVG Icons ── */
const FileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V3"/>
    <path d="M7 11l5 5 5-5"/>
    <rect x="3" y="17" width="18" height="4" rx="1.5"/>
  </svg>
);
const TexIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);
const MailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

/** SaveStatusBadge — purely visual, no API calls */
function SaveStatusBadge({ status = 'saved' }) {
  const configs = {
    saved:   { cls: 'save-indicator saved',   symbol: '●', text: 'Saved'   },
    saving:  { cls: 'save-indicator saving',   symbol: '○', text: 'Saving…' },
    unsaved: { cls: 'save-indicator unsaved',  symbol: '·', text: 'Unsaved' },
  };
  const cfg = configs[status] || configs.saved;
  return (
    <span className={cfg.cls}>
      <span aria-hidden="true">{cfg.symbol}</span>
      {cfg.text}
    </span>
  );
}

/**
 * WorkspaceContextBar — Sticky context + quick-export bar shown above the editor.
 * Props:
 *   tailoredData  — the tailored resume object
 *   atsScore      — numeric ATS score (optional)
 *   jdScore       — numeric JD match score (optional)
 *   saveStatus    — 'saved' | 'saving' | 'unsaved'
 *   company       — job company name (optional)
 *   roleName      — job role name (optional)
 *   onExportAction(type) — callback: 'pdf' | 'latex' | 'cover-letter'
 */
export default function WorkspaceContextBar({
  atsScore,
  jdScore,
  saveStatus = 'saved',
  company,
  roleName,
  onExportAction,
}) {
  const contextTitle =
    company && roleName
      ? `${company} · ${roleName}`
      : roleName || company || 'Tailored Resume';

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap mb-5"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* ── Left: Context identity ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)', color: 'var(--color-accent)' }}
        >
          <FileIcon />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
            {contextTitle}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {atsScore != null && (
              <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                ATS {atsScore}%
              </span>
            )}
            {jdScore != null && (
              <>
                <span className="text-slate-300 text-xs select-none">·</span>
                <span className="text-xs text-slate-500">JD Match {jdScore}%</span>
              </>
            )}
            <span className="text-slate-300 text-xs select-none">·</span>
            <SaveStatusBadge status={saveStatus} />
          </div>
        </div>
      </div>

      {/* ── Right: Export quick actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ActionBtn icon={<DownloadIcon />} label="PDF"   onClick={() => onExportAction?.('pdf')} />
        <ActionBtn icon={<TexIcon />}      label="LaTeX" onClick={() => onExportAction?.('latex')} mono />
        <ActionBtn icon={<MailIcon />}     label="Cover" onClick={() => onExportAction?.('cover-letter')} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, mono = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      style={mono ? { fontFamily: 'var(--font-mono)' } : {}}
    >
      {icon}
      {label}
    </button>
  );
}
