import StationList from './StationList'
import StationListSkeleton from './StationListSkeleton'
import StatusMessage from './StatusMessage'

// Choisit quoi afficher selon l'état de la recherche.
// Chaque `if` traite un cas puis sort de la fonction (early return).
function SearchResults({ status, stations, lastQuery, onRetry }) {
  if (status === 'idle') {
    return (
      <StatusMessage
        title="Où faites-vous le plein ?"
        description="Entrez une ville, un code postal ou un numéro de département pour comparer les prix."
      />
    )
  }

  if (status === 'loading') {
    return <StationListSkeleton />
  }

  if (status === 'error') {
    return (
      <StatusMessage
        variant="error"
        title="Impossible de récupérer les prix"
        description="Le service de données est peut-être indisponible ou votre connexion est interrompue. Réessayez dans quelques instants."
        actionLabel="Réessayer"
        onAction={onRetry}
      />
    )
  }

  if (stations.length === 0) {
    return (
      <StatusMessage
        title="Aucune station trouvée"
        description={`Aucune station ne correspond à « ${lastQuery} ». Vérifiez l'orthographe ou essayez avec un code postal.`}
      />
    )
  }

  return <StationList stations={stations} />
}

export default SearchResults
