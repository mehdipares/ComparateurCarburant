import { lazy, Suspense, useState } from 'react'
import StationCard from './StationCard'
import useMediaQuery from '../hooks/useMediaQuery'

// La carte (et la bibliothèque Leaflet) n'est téléchargée que lorsqu'elle s'affiche
const StationMap = lazy(() => import('./StationMap'))

const VIEWS = [
  { id: 'list', label: 'Liste' },
  { id: 'map', label: 'Carte' },
]

function StationList({ stations, selectedFuel, userPosition }) {
  const [view, setView] = useState('list') // Sur mobile : 'list' ou 'map'
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Sur grand écran, liste et carte sont côte à côte ; sur mobile, l'une ou l'autre
  const showList = isDesktop || view === 'list'
  const showMap = isDesktop || view === 'map'

  // Prix le plus bas parmi les stations affichées, pour le badge "Le moins cher"
  const cheapestPrice = Math.min(...stations.map((station) => station.prices[selectedFuel]))

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-600">
          {stations.length} station{stations.length > 1 ? 's' : ''} trouvée{stations.length > 1 ? 's' : ''}
        </h2>

        {/* Bascule Liste / Carte, inutile sur grand écran */}
        <div className="inline-flex rounded-full bg-slate-200/70 p-1 lg:hidden">
          {VIEWS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                view === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        {showList && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                selectedFuel={selectedFuel}
                isCheapest={station.prices[selectedFuel] === cheapestPrice}
              />
            ))}
          </div>
        )}

        {showMap && (
          // Sur grand écran, la carte reste visible pendant qu'on fait défiler la liste
          <div className="relative z-0 h-[70vh] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                  Chargement de la carte…
                </div>
              }
            >
              <StationMap
                stations={stations}
                selectedFuel={selectedFuel}
                cheapestPrice={cheapestPrice}
                userPosition={userPosition}
              />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  )
}

export default StationList
