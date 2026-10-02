import StationCard from './StationCard'
import ViewToggle from './ViewToggle'

function StationList({ stations, selectedFuel, onViewChange }) {
  // Prix le plus bas parmi les stations affichées, pour le badge "Le moins cher"
  const cheapestPrice = Math.min(...stations.map((station) => station.prices[selectedFuel]))

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-600">
          {stations.length} station{stations.length > 1 ? 's' : ''} trouvée{stations.length > 1 ? 's' : ''}
        </h2>
        <ViewToggle view="list" onChange={onViewChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            selectedFuel={selectedFuel}
            isCheapest={station.prices[selectedFuel] === cheapestPrice}
          />
        ))}
      </div>
    </section>
  )
}

export default StationList
