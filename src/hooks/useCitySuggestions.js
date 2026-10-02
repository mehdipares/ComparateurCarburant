import { useEffect, useState } from 'react'
import { searchCities } from '../api/fuelApi'

// Délai après la dernière frappe avant d'interroger l'API
const DEBOUNCE_MS = 250

// Nombre minimum de caractères avant de proposer des villes
const MIN_LENGTH = 2

// Suggestions de villes pour le texte saisi.
// Même principe que useCheapestNearby : debounce, annulation, et réponse étiquetée par une clé.
function useCitySuggestions(text) {
  const query = text.trim()

  // Pas de suggestion pour un texte trop court ou un code (postal, département)
  const isSearchable = query.length >= MIN_LENGTH && !/^\d/.test(query)
  const requestKey = isSearchable ? query.toLowerCase() : null

  const [response, setResponse] = useState({ key: null, suggestions: [] })

  useEffect(() => {
    if (requestKey === null) return

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const suggestions = await searchCities(requestKey, { signal: controller.signal })
        setResponse({ key: requestKey, suggestions })
      } catch (error) {
        if (error.name === 'AbortError') return // Frappe suivante : requête annulée
        console.error(error)
        setResponse({ key: requestKey, suggestions: [] }) // En cas d'erreur, on n'affiche rien
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [requestKey])

  if (requestKey === null || response.key === null) return []

  // Réponse à jour, ou saisie qui prolonge la précédente ("ly" → "lyo") : on garde la liste
  // affichée pendant le chargement pour éviter un clignotement. Sinon, rien.
  return requestKey.startsWith(response.key) ? response.suggestions : []
}

export default useCitySuggestions
