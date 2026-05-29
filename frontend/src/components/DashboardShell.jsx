/** Shared dashboard chrome: SectionBlock, WelcomeStrip, StatPill, TabNav, EmptyState */

export function WelcomeStrip({ firstName, subtitle, children }) {
  return (
    <div className="card p-6 sm:p-8 mb-6 border-t-4 border-t-[var(--color-accent)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-1.5">
            Your workspace
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight">
            {firstName ? `Hello, ${firstName}` : 'Welcome back'}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap gap-3 shrink-0 mt-2 sm:mt-0">{children}</div>
        )}
      </div>
    </div>
  );
}

export function StatPill({ label, value, accent }) {
  return (
    <div className="px-5 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] min-w-[110px] shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className="text-xl font-bold tracking-tight"
        style={{ color: accent || 'var(--text)', fontFamily: 'var(--font-sans)' }}
      >
        {value}
      </p>
    </div>
  );
}

export function TabNav({ tabs, active, onChange }) {
  return (
    <nav className="flex overflow-x-auto gap-1 p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] w-full sm:w-fit scroll-smooth snap-x">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 snap-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              isActive
                ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]/60',
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
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-up">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] flex items-center justify-center text-2xl mb-5 shadow-sm">
        {icon}
      </div>
      <p className="text-base font-semibold text-[var(--text)] mb-2">{title}</p>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

export function SectionBlock({ title, children, action }) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title-accent">
          <span>{title}</span>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}