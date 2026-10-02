import { FUELS, getFuelLabel } from '../utils/fuels'
import { formatPrice } from '../utils/format'

function StationCard({ station, selectedFuel }) {
  // Les autres carburants vendus par la station, affichés en plus petit
  const otherFuels = FUELS.filter(
    (fuel) => fuel.id !== selectedFuel && station.prices[fuel.id] != null,
  )

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`

  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold capitalize leading-snug">{station.address}</h3>
          <p className="text-sm text-slate-500">
            {station.postalCode} {station.city}
          </p>
        </div>

        {/* Prix du carburant sélectionné, mis en avant */}
        <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-right">
          <span className="block text-xs font-medium text-emerald-700">
            {getFuelLabel(selectedFuel)}
          </span>
          <span className="text-lg font-bold text-emerald-800">
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
        className="mt-auto self-start pt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
      >
        Itinéraire →
      </a>
    </article>
  )
}

export default StationCard
