import { useState } from 'react'
import { searchStationsByLocation } from '../api/fuelApi'

// Regroupe tout ce qui concerne le chargement des stations :
// les données, l'état de chargement et la fonction de recherche.
function useStations() {
  const [stations, setStations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  async function searchByLocation(query) {
    setIsLoading(true)
    const results = await searchStationsByLocation(query)
    setStations(results)
    setIsLoading(false)
  }

  return { stations, isLoading, searchByLocation }
}

export default useStations
