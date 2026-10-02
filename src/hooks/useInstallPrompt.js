import { useEffect, useState } from 'react'

// L'app est-elle déjà ouverte depuis l'écran d'accueil (donc installée) ?
function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
}

// Gère l'installation de l'app sur l'écran d'accueil (PWA).
// - Android / Chrome / Edge : le navigateur déclenche "beforeinstallprompt" quand l'app est
//   installable. On garde cet événement pour afficher la fenêtre d'installation au clic.
// - iPhone / iPad : Safari ne propose pas d'installation par code, il faut passer par
//   le bouton Partager. On le détecte pour afficher la marche à suivre.
function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [isInstalled, setIsInstalled] = useState(isRunningStandalone)

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault() // On empêche la bannière automatique : on affichera notre bouton
      setInstallEvent(event)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function install() {
    if (!installEvent) return
    installEvent.prompt() // Ouvre la fenêtre d'installation du navigateur
    await installEvent.userChoice // Attend que l'utilisateur accepte ou refuse
    setInstallEvent(null) // L'événement ne peut servir qu'une fois
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return {
    canInstall: installEvent !== null && !isInstalled,
    showIosInstructions: isIos && !isInstalled,
    install,
  }
}

export default useInstallPrompt
