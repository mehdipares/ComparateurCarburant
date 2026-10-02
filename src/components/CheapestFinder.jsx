import { formatDistance, formatPrice } from '../utils/format'

const RADIUS_PRESETS_KM = [2, 5, 10]
const MIN_RADIUS_KM = 1
const MAX_RADIUS_KM = 50
const DEFAULT_RADIUS_KM = 5

// Panneau posé sur la carte : on règle un rayon (curseur ou raccourcis), on obtient
// les stations les moins chères de ce rayon. Un clic sur une station la montre sur la carte.
function CheapestFinder({
  radiusKm,
  onRadiusChange,
  results,
  status,
  focusedStationId,
  onStationSelect,
  selectedFuel,
  hasUserPosition,
  onClose,
}) {
  const isActive = radiusKm !== null

  return (
    <div
      className="flex max-h-full flex-col rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          <span className="text-accent-500" aria-hidden="true">★ </span>
          Les moins chères à
        </p>
        <div className="flex items-center gap-2">
          <p className={`text-lg font-bold ${isActive ? 'text-brand-700' : 'text-slate-400'}`}>
            {isActive ? `${radiusKm} km` : '— km'}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-lg leading-none text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            ×
          </button>
        </div>
      </div>

      {/* Curseur : un input "range" natif, accessible au clavier et au doigt */}
      <input
        type="range"
        min={MIN_RADIUS_KM}
        max={MAX_RADIUS_KM}
        step={1}
        value={radiusKm ?? DEFAULT_RADIUS_KM}
        onChange={(event) => onRadiusChange(Number(event.target.value))}
        aria-label="Rayon de recherche en kilomètres"
        className={`mt-2 w-full cursor-pointer accent-brand-600 ${isActive ? '' : 'opacity-50'}`}
      />
      <div className="flex justify-between text-[10px] text-slate-400" aria-hidden="true">
        <span>{MIN_RADIUS_KM} km</span>
        <span>{MAX_RADIUS_KM} km</span>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {RADIUS_PRESETS_KM.map((radius) => {
            const isSelected = radius === radiusKm
            return (
              <button
                key={radius}
                type="button"
                aria-pressed={isSelected}
                // Un second clic sur le rayon actif referme la liste
                onClick={() => onRadiusChange(isSelected ? null : radius)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {radius}&nbsp;km
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500">
          {hasUserPosition ? 'Autour de vous' : 'Autour du centre'}
        </p>
      </div>

      {isActive && status === 'error' && (
        <p className="mt-2 border-t border-slate-200 pt-2 text-sm text-red-600">
          Impossible de charger les stations. Réessayez dans un instant.
        </p>
      )}

      {isActive && status === 'success' && results.length === 0 && (
        <p className="mt-2 border-t border-slate-200 pt-2 text-sm text-slate-500">
          Aucune station dans ce rayon. Essayez un rayon plus grand.
        </p>
      )}

      {isActive && status === 'loading' && results.length === 0 && (
        <p role="status" className="mt-2 border-t border-slate-200 pt-2 text-sm text-slate-500">
          Recherche des stations…
        </p>
      )}

      {isActive && results.length > 0 && (
        // La liste défile à l'intérieur du panneau pour ne pas cacher toute la carte.
        // Pendant un nouveau chargement, on garde l'ancienne liste en transparence
        <ol
          aria-busy={status === 'loading'}
          className={`-mx-1 mt-2 max-h-44 overflow-y-auto border-t border-slate-200 pt-1 transition-opacity sm:max-h-64 ${
            status === 'loading' ? 'opacity-50' : ''
          }`}
        >
          {results.map(({ station, distance }, index) => {
            const isFocused = station.id === focusedStationId

            return (
              <li
                key={station.id}
                className={`flex items-center gap-2 rounded-lg px-1 ${isFocused ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onStationSelect(station.id)}
                  aria-current={isFocused ? 'true' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-accent-400 text-slate-900' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium capitalize">{station.address}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {station.city} · à {formatDistance(distance)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-sm font-bold ${index === 0 ? 'text-slate-900' : 'text-slate-800'}`}
                  >
                    {formatPrice(station.prices[selectedFuel])}
                  </span>
                </button>

                {isFocused && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Itinéraire vers cette station"
                    className="shrink-0 rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Y aller
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default CheapestFinder
