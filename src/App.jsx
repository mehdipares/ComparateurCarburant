import Header from './components/Header'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import useStations from './hooks/useStations'

function App() {
  const { stations, status, lastQuery, searchByLocation, retry } = useStations()

  return (
    <div className="min-h-screen font-sans">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <SearchBar onSearch={searchByLocation} isLoading={status === 'loading'} />

        <SearchResults
          status={status}
          stations={stations}
          lastQuery={lastQuery}
          onRetry={retry}
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
