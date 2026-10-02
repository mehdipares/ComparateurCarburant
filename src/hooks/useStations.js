import { useState } from 'react'
import { searchStationsByLocation } from '../api/fuelApi'

// Regroupe tout ce qui concerne le chargement des stations.
// `status` décrit où en est la recherche :
//   'idle'    → aucune recherche lancée
//   'loading' → requête en cours
//   'success' → résultats reçus (la liste peut être vide)
//   'error'   → la requête a échoué
function useStations() {
  const [stations, setStations] = useState([])
  const [status, setStatus] = useState('idle')
  const [lastQuery, setLastQuery] = useState('')

  async function searchByLocation(query) {
    setLastQuery(query)
    setStatus('loading')

    try {
      const results = await searchStationsByLocation(query)
      setStations(results)
      setStatus('success')
    } catch (error) {
      console.error(error) // Utile pour le débogage, invisible pour l'utilisateur
      setStations([])
      setStatus('error')
    }
  }

  function retry() {
    searchByLocation(lastQuery)
  }

  return { stations, status, lastQuery, searchByLocation, retry }
}

export default useStations
