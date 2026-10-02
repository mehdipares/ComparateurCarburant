import { lazy, Suspense, useMemo, useState } from 'react'
import CheapestFinder from './CheapestFinder'
import FuelFilter from './FuelFilter'
import ViewToggle from './ViewToggle'
import useCheapestNearby from '../hooks/useCheapestNearby'
import { getFuelLabel } from '../utils/fuels'
import { getCenter } from '../utils/stations'

// La carte (et la bibliothèque Leaflet) n'est téléchargée que lorsqu'elle s'affiche
const StationMap = lazy(() => import('./StationMap'))

// Mode carte : la carte occupe tout l'espace disponible, les commandes flottent dessus
function MapView({ stations, selectedFuel, onFuelChange, userPosition, isLoading, onViewChange }) {
  const [radiusKm, setRadiusKm] = useState(null) // Rayon choisi dans le panneau
  const [selectedStationId, setSelectedStationId] = useState(null) // Station cliquée dans la liste
  const [isFinderOpen, setIsFinderOpen] = useState(false) // Panneau ouvert ou réduit en bulle

  // On ne garde que les stations placées sur la carte (avec des coordonnées).
  // useMemo garde le même tableau d'un rendu à l'autre : la carte ne se recadre
  // que si la liste change vraiment, pas à chaque clic dans le panneau
  const locatedStations = useMemo(
    () => stations.filter((station) => station.latitude && station.longitude),
    [stations],
  )

  // Point de référence : la position de l'utilisateur, sinon le centre des résultats
  const center = useMemo(
    () => userPosition ?? (locatedStations.length > 0 ? getCenter(locatedStations) : null),
    [userPosition, locatedStations],
  )

  // Les moins chères du rayon, chargées depuis l'API (le rayon peut dépasser la zone chargée)
  const { results: nearbyResults, status: nearbyStatus } = useCheapestNearby({
    center,
    radiusKm,
    fuel: selectedFuel,
  })

  // Station mise en avant : celle cliquée si elle est encore dans la liste, sinon la moins chère
  const focusedStation =
    nearbyResults.find(({ station }) => station.id === selectedStationId)?.station ??
    nearbyResults[0]?.station ??
    null

  // Marqueurs : les stations chargées + celles trouvées plus loin par le panneau
  const markerStations = useMemo(() => {
    const knownIds = new Set(locatedStations.map((station) => station.id))
    const extraStations = nearbyResults
      .map(({ station }) => station)
      .filter((station) => !knownIds.has(station.id))
    return [...locatedStations, ...extraStations]
  }, [locatedStations, nearbyResults])

  // Nouveau rayon : on repart de la station la moins chère
  function handleRadiusChange(radius) {
    setRadiusKm(radius)
    setSelectedStationId(null)
  }

  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-600">
          {isLoading
            ? 'Recherche…'
            : `${stations.length} station${stations.length > 1 ? 's' : ''} · ${getFuelLabel(selectedFuel)}`}
        </h2>
        <ViewToggle view="map" onChange={onViewChange} />
      </div>

      {/* `relative` : les commandes flottantes se positionnent par rapport à ce bloc */}
      <div className="relative z-0 min-h-0 flex-1 overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
              Chargement de la carte…
            </div>
          }
        >
          <StationMap
            stations={markerStations}
            fitStations={locatedStations}
            selectedFuel={selectedFuel}
            userPosition={userPosition}
            focusedStation={focusedStation}
          />
        </Suspense>

        {/* Message si aucune station chargée ne vend ce carburant. pointer-events-none :
            il ne bloque ni la carte ni le panneau du bas */}
        {!isLoading && stations.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center p-6">
            <p role="status" className="max-w-xs rounded-2xl bg-white p-4 text-center text-sm shadow-lg">
              <strong>{getFuelLabel(selectedFuel)} indisponible ici</strong>
              <br />
              Essayez un autre carburant
              {center ? ', ou élargissez le rayon ci-dessous.' : '.'}
            </p>
          </div>
        )}

        {/* Carburants en haut de la carte. pointer-events-none laisse passer les gestes
            vers la carte entre les boutons ; les boutons eux-mêmes restent cliquables */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-2">
          <div className="pointer-events-auto w-fit max-w-full">
            <FuelFilter selectedFuel={selectedFuel} onChange={onFuelChange} floating />
          </div>
        </div>

        {/* Panneau "les moins chères", en bas (on laisse la place au zoom à droite).
            top-16 : il ne remonte jamais au-dessus des carburants */}
        {center && !isLoading && (
          <div className="pointer-events-none absolute bottom-6 left-2 right-14 top-16 z-[1000] flex flex-col justify-end sm:right-auto sm:w-96">
            <div className="pointer-events-auto min-h-0">
              {isFinderOpen ? (
                <CheapestFinder
                  radiusKm={radiusKm}
                  onRadiusChange={handleRadiusChange}
                  results={nearbyResults}
                  status={nearbyStatus}
                  focusedStationId={focusedStation?.id}
                  onStationSelect={setSelectedStationId}
                  selectedFuel={selectedFuel}
                  hasUserPosition={userPosition !== null}
                  onClose={() => setIsFinderOpen(false)}
                />
              ) : (
                // Panneau réduit : une bulle qui rappelle le rayon choisi
                <button
                  type="button"
                  onClick={() => setIsFinderOpen(true)}
                  aria-expanded={false}
                  // Tant que le panneau n'a jamais servi, la bulle rebondit pour attirer l'œil
                  // (motion-safe : désactivé si l'utilisateur a demandé de réduire les animations)
                  className={`flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                    radiusKm === null ? 'motion-safe:animate-nudge' : ''
                  }`}
                >
                  <span aria-hidden="true">★</span>
                  Les moins chères
                  {radiusKm !== null && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{radiusKm}&nbsp;km</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50">
            <p role="status" className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
              Recherche des stations…
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default MapView
