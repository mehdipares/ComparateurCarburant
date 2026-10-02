import { useMemo, useState } from 'react'
import FuelFilter from './components/FuelFilter'
import Header from './components/Header'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import SortSelect from './components/SortSelect'
import useSelectedFuel from './hooks/useSelectedFuel'
import useStations from './hooks/useStations'
import { getVisibleStations } from './utils/stations'

function App() {
  const {
    stations,
    status,
    errorType,
    lastSearch,
    userPosition,
    searchByLocation,
    searchAroundMe,
    retry,
  } = useStations()
  const [selectedFuel, setSelectedFuel] = useSelectedFuel()
  const [sortBy, setSortBy] = useState('price') // 'price' | 'distance'
  const [view, setView] = useState('list') // 'list' | 'map'

  // Donnée dérivée : filtrée et triée sans nouvel appel à l'API.
  // useMemo ne refait le calcul que si l'une des dépendances change.
  const visibleStations = useMemo(
    () => getVisibleStations(stations, { fuel: selectedFuel, sortBy, userPosition }),
    [stations, selectedFuel, sortBy, userPosition],
  )

  // Mode carte : l'utilisateur a choisi la carte et il y a des résultats (ou ils arrivent).
  // En cas d'erreur ou d'absence de résultat, on revient à l'affichage normal avec son message.
  const hasResults = status === 'success' && stations.length > 0
  const isMapMode = view === 'map' && (status === 'loading' || hasResults)

  // Quand l'utilisateur cherche autour de lui, on trie par distance et on ouvre la carte
  function handleLocate() {
    setSortBy('distance')
    setView('map')
    searchAroundMe()
  }

  return (
    // En mode carte, la page fait exactement la hauteur de l'écran (h-dvh) et ne défile pas :
    // la carte occupe tout l'espace restant (flex-1)
    <div className={`font-sans ${isMapMode ? 'flex h-dvh flex-col overflow-hidden' : 'min-h-dvh'}`}>
      <Header compact={isMapMode} />

      <main
        className={`mx-auto w-full max-w-7xl px-4 ${
          isMapMode ? 'flex min-h-0 flex-1 flex-col pt-3 pb-3' : 'py-6'
        }`}
      >
        <SearchBar
          onSearch={searchByLocation}
          onLocate={handleLocate}
          isLoading={status === 'loading'}
        />

        {isMapMode ? (
          <MapView
            stations={visibleStations}
            selectedFuel={selectedFuel}
            onFuelChange={setSelectedFuel}
            userPosition={userPosition}
            isLoading={status === 'loading'}
            onViewChange={setView}
          />
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <FuelFilter selectedFuel={selectedFuel} onChange={setSelectedFuel} />
              <SortSelect
                sortBy={sortBy}
                onChange={setSortBy}
                canSortByDistance={userPosition !== null}
              />
            </div>

            <SearchResults
              status={status}
              errorType={errorType}
              stations={stations}
              visibleStations={visibleStations}
              selectedFuel={selectedFuel}
              lastSearch={lastSearch}
              onRetry={retry}
              onLocate={handleLocate}
              onViewChange={setView}
            />
          </>
        )}
      </main>

      {/* En mode carte, la source des données est citée dans l'attribution de la carte */}
      {!isMapMode && (
        <footer className="py-6 text-center text-xs text-slate-500">
          Données :{' '}
          <a
            href="https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-700"
          >
            prix des carburants en France (flux instantané), data.economie.gouv.fr
          </a>
        </footer>
      )}
    </div>
  )
}

export default App
