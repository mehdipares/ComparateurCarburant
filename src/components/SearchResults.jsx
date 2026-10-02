import StationList from './StationList'
import StationListSkeleton from './StationListSkeleton'
import StatusMessage from './StatusMessage'
import { getFuelLabel } from '../utils/fuels'
import { SEARCH_RADIUS_KM } from '../hooks/useStations'

// Un message par type d'erreur. `canRetry` : est-ce que réessayer a un sens ?
const ERROR_MESSAGES = {
  api: {
    title: 'Impossible de récupérer les prix',
    description:
      'Le service de données est peut-être indisponible ou votre connexion est interrompue. Réessayez dans quelques instants.',
    canRetry: true,
  },
  denied: {
    title: 'Géolocalisation refusée',
    description:
      "Autorisez l'accès à votre position dans les réglages de votre navigateur, ou recherchez par ville.",
    canRetry: false, // Le navigateur mémorise le refus : réessayer ne changerait rien
  },
  unavailable: {
    title: 'Position introuvable',
    description:
      'Impossible de déterminer votre position. Vérifiez que la localisation est activée, ou recherchez par ville.',
    canRetry: true,
  },
}

// Choisit quoi afficher selon l'état de la recherche.
// Chaque `if` traite un cas puis sort de la fonction (early return).
function SearchResults({
  status,
  errorType,
  stations,
  visibleStations,
  selectedFuel,
  lastSearch,
  userPosition,
  onRetry,
}) {
  if (status === 'idle') {
    return (
      <StatusMessage
        title="Où faites-vous le plein ?"
        description="Entrez une ville, un code postal ou un numéro de département, ou utilisez votre position pour comparer les prix."
      />
    )
  }

  if (status === 'loading') {
    return <StationListSkeleton />
  }

  if (status === 'error') {
    const message = ERROR_MESSAGES[errorType] ?? ERROR_MESSAGES.api
    return (
      <StatusMessage
        variant="error"
        title={message.title}
        description={message.description}
        actionLabel="Réessayer"
        onAction={message.canRetry ? onRetry : undefined}
      />
    )
  }

  // Texte décrivant la recherche, réutilisé dans les messages ci-dessous
  const searchLabel =
    lastSearch.type === 'around'
      ? `dans un rayon de ${SEARCH_RADIUS_KM} km autour de vous`
      : `pour « ${lastSearch.query} »`

  if (stations.length === 0) {
    const hint =
      lastSearch.type === 'around'
        ? 'Essayez une recherche par ville.'
        : 'Vérifiez votre saisie ou essayez avec un code postal.'
    return (
      <StatusMessage
        title="Aucune station trouvée"
        description={`Aucune station trouvée ${searchLabel}. ${hint}`}
      />
    )
  }

  // Des stations existent, mais aucune ne vend le carburant choisi
  if (visibleStations.length === 0) {
    return (
      <StatusMessage
        title={`${getFuelLabel(selectedFuel)} indisponible`}
        description={`Aucune des stations trouvées ${searchLabel} ne propose ce carburant. Essayez-en un autre.`}
      />
    )
  }

  return (
    <StationList stations={visibleStations} selectedFuel={selectedFuel} userPosition={userPosition} />
  )
}

export default SearchResults
