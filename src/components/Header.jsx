function Header() {
  return (
    <header className="bg-emerald-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-lg ring-2 ring-white/30" />
          <h1 className="text-2xl font-bold sm:text-3xl">Comparateur Carburant</h1>
        </div>
        <p className="mt-2 text-sm text-emerald-50 sm:text-base">
          Trouvez la station la moins chère près de chez vous, en temps réel.
        </p>
      </div>
    </header>
  )
}

export default Header
