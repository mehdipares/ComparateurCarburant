const SORT_OPTIONS = [
  { id: 'price', label: 'Prix' },
  { id: 'distance', label: 'Distance' },
]

function SortSelect({ sortBy, onChange, canSortByDistance }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-600">Trier par</legend>

      <div className="inline-flex rounded-full bg-slate-200/70 p-1">
        {SORT_OPTIONS.map((option) => {
          const isSelected = option.id === sortBy
          const isDisabled = option.id === 'distance' && !canSortByDistance

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              title={isDisabled ? 'Utilisez « Autour de moi » pour trier par distance' : undefined}
              onClick={() => onChange(option.id)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:text-slate-400 ${
                isSelected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {!canSortByDistance && (
        <p className="mt-1 text-xs text-slate-500">Distance : utilisez « Autour de moi »</p>
      )}
    </fieldset>
  )
}

export default SortSelect
