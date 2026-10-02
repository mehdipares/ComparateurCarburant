import StationCard from './StationCard'

function StationList({ stations, selectedFuel }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-medium text-slate-600">
        {stations.length} station{stations.length > 1 ? 's' : ''} trouvée{stations.length > 1 ? 's' : ''}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stations.map((station) => (
          <StationCard key={station.id} station={station} selectedFuel={selectedFuel} />
        ))}
      </div>
    </section>
  )
}

export default StationList
