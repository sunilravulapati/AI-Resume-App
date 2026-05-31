import React from 'react';

const TEMPLATES = [
  { id: 'jake-ryan',    name: 'Jake Ryan',    available: true  },
  { id: 'modern',       name: 'Modern',       available: false },
  { id: 'compact',      name: 'Compact',      available: false },
  { id: 'professional', name: 'Professional', available: false },
];

// template picker, for now only jake's resume
export default function TemplatePicker({ selected, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-slate-400 flex-shrink-0 select-none">
        Template:
      </span>
      {TEMPLATES.map((t) => {
        const isActive = selected === t.id && t.available;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => t.available && onChange(t.id)}
            title={t.available ? t.name : `${t.name} — Coming Soon`}
            className={[
              'relative flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150',
              isActive
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100 shadow-sm'
                : t.available
                ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60',
            ].join(' ')}
          >
            {isActive && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--color-accent)' }}
              />
            )}
            {t.name}
            {!t.available && (
              <span
                className="text-[8px] font-bold tracking-wider uppercase leading-none flex-shrink-0"
                style={{ color: '#94A3B8' }}
              >
                SOON
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
