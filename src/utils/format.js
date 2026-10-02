// Intl.NumberFormat gère le format français : virgule décimale et symbole €
const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 3,
})

export function formatPrice(price) {
  return priceFormatter.format(price) // 2.437 → "2,437 €"
}
