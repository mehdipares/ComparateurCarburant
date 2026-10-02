import { useState } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import { searchStationsByLocation } from './api/fuelApi'

function App() {
  const [stations, setStations] = useState([])

  async function handleSearch(query) {
    const results = await searchStationsByLocation(query)
    setStations(results)
  }

  return (
    <div className="min-h-screen font-sans">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <SearchBar onSearch={handleSearch} />

        {/* Affichage provisoire : les cartes de stations arrivent à l'étape 3 */}
        <ul className="mt-6 space-y-1 text-sm text-slate-700">
          {stations.map((station) => (
            <li key={station.id}>
              {station.address}, {station.postalCode} {station.city} : gazole{' '}
              {station.prices.gazole ?? '—'} €
            </li>
          ))}
        </ul>
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
