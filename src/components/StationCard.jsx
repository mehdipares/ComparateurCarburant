import { FUELS } from '../utils/fuels'
import { formatPrice } from '../utils/format'

function StationCard({ station }) {
  // On n'affiche que les carburants vendus par la station
  const availableFuels = FUELS.filter((fuel) => station.prices[fuel.id] != null)

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`

  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <h3 className="font-semibold capitalize leading-snug">{station.address}</h3>
      <p className="text-sm text-slate-500">
        {station.postalCode} {station.city}
      </p>

      {availableFuels.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {availableFuels.map((fuel) => (
            <li key={fuel.id} className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
              <span className="block text-xs font-medium text-slate-500">{fuel.label}</span>
              <span className="text-sm font-semibold">{formatPrice(station.prices[fuel.id])}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Aucun prix disponible.</p>
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
