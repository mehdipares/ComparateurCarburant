import { FUELS } from '../utils/fuels'

function FuelFilter({ selectedFuel, onChange }) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-2 text-sm font-medium text-slate-600">Carburant</legend>

      <div className="flex flex-wrap gap-2">
        {FUELS.map((fuel) => {
          const isSelected = fuel.id === selectedFuel

          return (
            <button
              key={fuel.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(fuel.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100'
              }`}
            >
              {fuel.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default FuelFilter
