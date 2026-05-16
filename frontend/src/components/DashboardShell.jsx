/** Shared dashboard chrome: welcome strip, stat pills, tab navigation */

export function WelcomeStrip({ firstName, subtitle, children }) {
  return (
    <div className="card p-6 sm:p-7 mb-6 bg-gradient-to-br from-white via-white to-[#eff6ff]/40 border-[#dbeafe]/60">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="section-label mb-1">Your workspace</p>
          <h2 className="font-display text-2xl sm:text-3xl text-[var(--text)] leading-tight">
            {firstName ? `Hello, ${firstName}` : 'Welcome back'}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-lg">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex flex-wrap gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}

export function StatPill({ label, value, accent }) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-white/80 border border-[var(--border)] min-w-[100px]">
      <p className="section-label mb-0.5">{label}</p>
      <p className="text-lg font-bold tracking-tight" style={{ color: accent || 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

export function TabNav({ tabs, active, onChange }) {
  return (
    <nav className="flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] w-fit">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-white text-[var(--accent)] shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/50',
            ].join(' ')}
          >
            <span className="text-base leading-none" aria-hidden>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <p className="font-semibold text-[var(--text)] mb-1">{title}</p>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function SectionBlock({ title, children }) {
  return (
    <div className="animate-fade-up">
      <p className="section-label mb-2">{title}</p>
      {children}
    </div>
  );
}
