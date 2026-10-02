const VIEWS = [
  { id: 'list', label: 'Liste' },
  { id: 'map', label: 'Carte' },
]

// Bascule entre la vue liste et la vue carte
function ViewToggle({ view, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-200/70 p-1">
      {VIEWS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={view === option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-full px-4 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
            view === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ViewToggle
