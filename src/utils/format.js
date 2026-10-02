// Intl.NumberFormat gère le format français : virgule décimale et symbole €
const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 3,
})

const kilometerFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export function formatPrice(price) {
  return priceFormatter.format(price) // 2.437 → "2,437 €"
}

export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m` // 0.4523 → "452 m"
  }
  return `${kilometerFormatter.format(distanceKm)} km` // 3.27 → "3,3 km"
}
