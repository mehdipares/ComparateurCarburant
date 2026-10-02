import InstallButton from './InstallButton'

// `compact` : version réduite en mode carte, pour laisser un maximum de place à la carte
function Header({ compact = false }) {
  return (
    <header className="border-b-4 border-accent-400 bg-brand-600 text-white">
      <div className={`mx-auto max-w-7xl px-4 ${compact ? 'py-3' : 'py-6 sm:py-8'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt=""
              className={`rounded-lg shadow-md ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}
            />
            <h1 className={`font-bold ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
              Radar Carbu
            </h1>
          </div>
          <InstallButton />
        </div>
        {!compact && (
          <p className="mt-2 text-sm text-brand-50 sm:text-base">
            Trouvez la station la moins chère près de chez vous, en temps réel.
          </p>
        )}
      </div>
    </header>
  )
}

export default Header
