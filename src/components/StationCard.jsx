import { FUELS, getFuelLabel } from '../utils/fuels'
import { formatDistance, formatPrice } from '../utils/format'

function StationCard({ station, selectedFuel, isCheapest }) {
  // Les autres carburants vendus par la station, affichés en plus petit
  const otherFuels = FUELS.filter(
    (fuel) => fuel.id !== selectedFuel && station.prices[fuel.id] != null,
  )

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`

  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isCheapest && (
            <span className="mb-1.5 inline-block rounded-full bg-accent-400 px-2 py-0.5 text-xs font-semibold text-slate-900">
              Le moins cher
            </span>
          )}
          <h3 className="font-semibold capitalize leading-snug">{station.address}</h3>
          <p className="text-sm text-slate-500">
            {station.postalCode} {station.city}
            {station.distance != null && (
              <span className="whitespace-nowrap font-medium text-slate-700"> · à {formatDistance(station.distance)}</span>
            )}
          </p>
        </div>

        {/* Prix du carburant sélectionné, mis en avant */}
        <div className="shrink-0 rounded-xl bg-accent-100 px-3 py-2 text-right ring-1 ring-accent-300">
          <span className="block text-xs font-medium text-accent-900">
            {getFuelLabel(selectedFuel)}
          </span>
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(station.prices[selectedFuel])}
          </span>
        </div>
      </div>

      {otherFuels.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {otherFuels.map((fuel) => (
            <li key={fuel.id}>
              {fuel.label}{' '}
              <span className="font-medium text-slate-700">{formatPrice(station.prices[fuel.id])}</span>
            </li>
          ))}
        </ul>
      )}

      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-auto self-start pt-4 text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline"
      >
        Itinéraire →
      </a>
    </article>
  )
}

export default StationCard
