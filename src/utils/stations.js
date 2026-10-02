import { getDistanceKm } from './distance'

// Prépare la liste à afficher : ajoute la distance, filtre par carburant puis trie.
// Fonction pure : elle ne modifie pas `stations` et renvoie toujours le même résultat
// pour les mêmes paramètres.
export function getVisibleStations(stations, { fuel, sortBy, userPosition }) {
  const withDistance = stations.map((station) => ({
    ...station,
    distance: userPosition ? getDistanceKm(userPosition, station) : null,
  }))

  const sellingFuel = withDistance.filter((station) => station.prices[fuel] != null)

  // `filter` a créé un nouveau tableau : on peut le trier sans toucher à l'état React
  return sellingFuel.sort((a, b) => {
    if (sortBy === 'distance' && userPosition) {
      return a.distance - b.distance
    }
    return a.prices[fuel] - b.prices[fuel]
  })
}

// Classe un prix par rapport aux autres : 'cheapest', 'cheap', 'average' ou 'expensive'.
// On découpe l'écart entre le prix minimum et le prix maximum en trois tiers.
export function getPriceTier(price, minPrice, maxPrice) {
  if (price === minPrice) return 'cheapest'

  const ratio = (price - minPrice) / (maxPrice - minPrice)
  if (ratio <= 1 / 3) return 'cheap'
  if (ratio >= 2 / 3) return 'expensive'
  return 'average'
}

// Point central d'une liste de stations (moyenne des coordonnées)
export function getCenter(stations) {
  const latitude = stations.reduce((sum, station) => sum + station.latitude, 0) / stations.length
  const longitude = stations.reduce((sum, station) => sum + station.longitude, 0) / stations.length
  return { latitude, longitude }
}
