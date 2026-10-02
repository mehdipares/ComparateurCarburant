// Cartes grises animées affichées pendant le chargement.
// Elles reprennent la forme des vraies cartes pour éviter que la page "saute".
function StationListSkeleton() {
  return (
    <section className="mt-6" aria-busy="true">
      <p className="sr-only" role="status">
        Chargement des stations…
      </p>
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-11 rounded-lg bg-slate-100" />
                <div className="h-11 rounded-lg bg-slate-100" />
                <div className="h-11 rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StationListSkeleton
