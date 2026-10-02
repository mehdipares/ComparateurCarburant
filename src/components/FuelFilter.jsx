import { FUELS } from '../utils/fuels'

// `floating` : version compacte posée sur la carte (une seule ligne, défilement horizontal)
function FuelFilter({ selectedFuel, onChange, floating = false }) {
  return (
    <fieldset>
      <legend className={floating ? 'sr-only' : 'mb-2 text-sm font-medium text-slate-600'}>
        Carburant
      </legend>

      <div
        className={
          floating
            ? 'flex gap-1.5 overflow-x-auto p-1 [scrollbar-width:none]'
            : 'flex flex-wrap gap-2'
        }
      >
        {FUELS.map((fuel) => {
          const isSelected = fuel.id === selectedFuel

          return (
            <button
              key={fuel.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(fuel.id)}
              className={`shrink-0 rounded-full py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                floating ? 'px-2.5 shadow-md' : 'px-4'
              } ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
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
