import { useMemo, useState } from 'react'
import FuelFilter from './components/FuelFilter'
import Header from './components/Header'
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

  // Quand l'utilisateur cherche autour de lui, on trie par distance et on ouvre la carte
  function handleLocate() {
    setSortBy('distance')
    setView('map')
    searchAroundMe()
  }

  return (
    <div className="min-h-screen font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <SearchBar
          onSearch={searchByLocation}
          onLocate={handleLocate}
          isLoading={status === 'loading'}
        />

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
          userPosition={userPosition}
          onRetry={retry}
          onLocate={handleLocate}
          view={view}
          onViewChange={setView}
        />
      </main>

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
    </div>
  )
}

export default App
