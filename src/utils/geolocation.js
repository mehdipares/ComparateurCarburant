// Erreur dédiée à la géolocalisation, pour la distinguer d'une erreur d'API.
// `reason` vaut 'denied' (refusée par l'utilisateur) ou 'unavailable' (position introuvable).
export class GeolocationError extends Error {
  constructor(reason) {
    super(`Géolocalisation impossible : ${reason}`)
    this.name = 'GeolocationError'
    this.reason = reason
  }
}

// navigator.geolocation fonctionne avec des callbacks : on l'enveloppe dans une Promise
// pour pouvoir l'utiliser avec async/await.
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('unavailable'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        const reason = error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'
        reject(new GeolocationError(reason))
      },
      {
        timeout: 10000, // 10 s maximum pour obtenir la position
        maximumAge: 60000, // Une position de moins d'une minute peut être réutilisée
      },
    )
  })
}
