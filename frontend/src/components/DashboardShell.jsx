/** Shared dashboard chrome: welcome strip, stat pills, tab navigation */

export function WelcomeStrip({ firstName, subtitle, children }) {
  return (
    <div className="card p-6 sm:p-8 mb-6 bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-elevated)] to-[var(--color-brand-50)] border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1.5">Your workspace</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight">
            {firstName ? `Hello, ${firstName}` : 'Welcome back'}
          </h2>
          {subtitle && (
            <p className="text-sm font-medium text-[var(--text-secondary)] mt-2 max-w-lg leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex flex-wrap gap-3 shrink-0 mt-2 sm:mt-0">{children}</div>}
      </div>
    </div>
  );
}

export function StatPill({ label, value, accent }) {
  return (
    <div className="px-5 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] min-w-[110px] shadow-sm">
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black tracking-tight" style={{ color: accent || 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

export function TabNav({ tabs, active, onChange }) {
  return (
    <nav className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)] w-full sm:w-fit scroll-smooth snap-x">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              'flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 snap-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              isActive
                ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]',
            ].join(' ')}
          >
            <span className="text-lg leading-none" aria-hidden>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-up">
      <div className="w-16 h-16 rounded-3xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] flex items-center justify-center text-3xl mb-5 shadow-sm">
        {icon}
      </div>
      <p className="text-lg font-bold text-[var(--text)] mb-2">{title}</p>
      <p className="text-sm font-medium text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

export function SectionBlock({ title, children }) {
  return (
    <div className="animate-fade-up">
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}
