// Icônes SVG (tracés issus de la bibliothèque libre Lucide)
const ICONS = {
  info: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  error: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
}

const STYLES = {
  info: 'bg-accent-100 text-accent-900',
  error: 'bg-red-50 text-red-600',
}

// Message centré avec icône, titre, description et bouton d'action facultatif
function StatusMessage({ variant = 'info', title, description, actionLabel, onAction }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="mt-10 flex flex-col items-center px-4 text-center"
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${STYLES[variant]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
          aria-hidden="true"
        >
          {ICONS[variant]}
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default StatusMessage
