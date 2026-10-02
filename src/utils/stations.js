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
