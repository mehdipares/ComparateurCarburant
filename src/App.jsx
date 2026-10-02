import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen font-sans">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="text-slate-600">La recherche de stations arrive à l'étape suivante.</p>
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
