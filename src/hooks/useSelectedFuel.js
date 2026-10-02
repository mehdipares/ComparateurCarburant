import { useEffect, useState } from 'react'
import { DEFAULT_FUEL, FUELS } from '../utils/fuels'

const STORAGE_KEY = 'selectedFuel'

// Lit le carburant enregistré lors d'une visite précédente
function readSavedFuel() {
  try {
    const savedFuel = localStorage.getItem(STORAGE_KEY)
    const isValid = FUELS.some((fuel) => fuel.id === savedFuel)
    return isValid ? savedFuel : DEFAULT_FUEL
  } catch {
    return DEFAULT_FUEL // localStorage peut être bloqué (navigation privée, réglages)
  }
}

// Carburant sélectionné, mémorisé dans le navigateur entre deux visites
function useSelectedFuel() {
  // On passe la fonction (sans parenthèses) : React ne l'appelle qu'au premier rendu
  const [selectedFuel, setSelectedFuel] = useState(readSavedFuel)

  // À chaque changement de carburant, on l'enregistre
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedFuel)
    } catch {
      // Stockage indisponible : l'app fonctionne quand même, sans mémoriser le choix
    }
  }, [selectedFuel])

  return [selectedFuel, setSelectedFuel]
}

export default useSelectedFuel
