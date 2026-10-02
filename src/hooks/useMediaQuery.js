import { useEffect, useState } from 'react'

// Renvoie true si la media query CSS correspond à l'écran, et se met à jour
// quand la fenêtre est redimensionnée. Ex. : useMediaQuery('(min-width: 1024px)')
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    function handleChange(event) {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    // Nettoyage : on retire l'écouteur quand le composant disparaît
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export default useMediaQuery
