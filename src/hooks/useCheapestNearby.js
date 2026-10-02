import { useEffect, useState } from 'react'
import { searchCheapestAround } from '../api/fuelApi'
import { getDistanceKm } from '../utils/distance'

// Délai d'attente après le dernier mouvement du curseur avant d'interroger l'API
const DEBOUNCE_MS = 400

// Stations les moins chères dans un rayon autour d'un point, chargées depuis l'API.
// Renvoie { results: [{ station, distance }], status: 'idle' | 'loading' | 'success' | 'error' }
function useCheapestNearby({ center, radiusKm, fuel }) {
  const latitude = center?.latitude
  const longitude = center?.longitude

  // Clé qui décrit la recherche demandée (null : aucune recherche)
  const requestKey =
    radiusKm === null || latitude == null ? null : `${latitude},${longitude},${radiusKm},${fuel}`

  // Dernière réponse reçue, étiquetée avec la clé de la recherche qui l'a produite
  const [response, setResponse] = useState({ key: null, results: [], status: 'idle' })

  useEffect(() => {
    if (requestKey === null) return

    const controller = new AbortController()

    // Debounce : on n'appelle l'API que si rien n'a changé pendant DEBOUNCE_MS
    const timer = setTimeout(async () => {
      try {
        const origin = { latitude, longitude }
        const stations = await searchCheapestAround(origin, radiusKm, fuel, {
          signal: controller.signal,
        })
        const results = stations.map((station) => ({
          station,
          distance: getDistanceKm(origin, station),
        }))
        setResponse({ key: requestKey, results, status: 'success' })
      } catch (error) {
        if (error.name === 'AbortError') return // Requête annulée volontairement : rien à faire
        console.error(error)
        setResponse({ key: requestKey, results: [], status: 'error' })
      }
    }, DEBOUNCE_MS)

    // Nettoyage, appelé avant chaque nouvelle exécution de l'effet (le curseur a bougé)
    // et quand le composant disparaît : on annule l'attente et la requête en cours
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [requestKey, latitude, longitude, radiusKm, fuel])

  // L'état de chargement est déduit, pas stocké : si la dernière réponse ne correspond
  // pas à la recherche actuelle, c'est qu'on attend la nouvelle (on garde l'ancienne liste)
  if (requestKey === null) {
    return { results: [], status: 'idle' }
  }
  if (response.key !== requestKey) {
    return { results: response.results, status: 'loading' }
  }
  return response
}

export default useCheapestNearby
