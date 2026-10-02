const EARTH_RADIUS_KM = 6371

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// Distance "à vol d'oiseau" entre deux points GPS, en kilomètres (formule de Haversine).
// Elle tient compte de la courbure de la Terre, contrairement à un simple Pythagore.
export function getDistanceKm(from, to) {
  const deltaLat = toRadians(to.latitude - from.latitude)
  const deltaLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}
