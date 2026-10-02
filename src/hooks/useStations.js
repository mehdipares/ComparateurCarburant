import { useState } from 'react'
import { searchStationsAround, searchStationsByLocation } from '../api/fuelApi'
import { GeolocationError, getCurrentPosition } from '../utils/geolocation'

export const SEARCH_RADIUS_KM = 10

// Regroupe tout ce qui concerne le chargement des stations.
// `status` décrit où en est la recherche :
//   'idle'    → aucune recherche lancée
//   'loading' → requête en cours
//   'success' → résultats reçus (la liste peut être vide)
//   'error'   → la recherche a échoué ; `errorType` précise pourquoi
function useStations() {
  const [stations, setStations] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorType, setErrorType] = useState(null) // 'api' | 'denied' | 'unavailable'
  const [lastSearch, setLastSearch] = useState(null) // { type: 'location', query } ou { type: 'around' }

  // Logique commune aux deux types de recherche : chargement, succès ou erreur.
  // `fetchResults` est une fonction asynchrone qui renvoie la liste des stations.
  async function runSearch(fetchResults) {
    setStatus('loading')
    setErrorType(null)

    try {
      const results = await fetchResults()
      setStations(results)
      setStatus('success')
    } catch (error) {
      console.error(error) // Utile pour le débogage, invisible pour l'utilisateur
      setStations([])
      setErrorType(error instanceof GeolocationError ? error.reason : 'api')
      setStatus('error')
    }
  }

  function searchByLocation(query) {
    setLastSearch({ type: 'location', query })
    runSearch(() => searchStationsByLocation(query))
  }

  function searchAroundMe() {
    setLastSearch({ type: 'around' })
    runSearch(async () => {
      const position = await getCurrentPosition()
      return searchStationsAround(position, SEARCH_RADIUS_KM)
    })
  }

  function retry() {
    if (lastSearch?.type === 'around') {
      searchAroundMe()
    } else {
      searchByLocation(lastSearch.query)
    }
  }

  return { stations, status, errorType, lastSearch, searchByLocation, searchAroundMe, retry }
}

export default useStations
