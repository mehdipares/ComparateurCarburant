import { useState } from 'react'
import useInstallPrompt from '../hooks/useInstallPrompt'

// Bouton "Installer" du header : ajoute Radar Carbu à l'écran d'accueil du téléphone.
// N'apparaît que si l'installation est possible et que l'app n'est pas déjà installée.
function InstallButton() {
  const { canInstall, showIosInstructions, install } = useInstallPrompt()
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  if (!canInstall && !showIosInstructions) return null

  // Android / Chrome : la fenêtre d'installation du navigateur s'ouvre directement.
  // iPhone : on affiche la marche à suivre.
  function handleClick() {
    if (canInstall) {
      install()
    } else {
      setIsHelpOpen((isOpen) => !isOpen)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={canInstall ? undefined : isHelpOpen}
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {/* Icône "télécharger" (Lucide) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
        Installer
      </button>

      {isHelpOpen && (
        <div
          role="dialog"
          aria-label="Installer Radar Carbu"
          className="absolute right-0 top-full z-[2000] mt-2 w-64 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-xl ring-1 ring-slate-200"
        >
          <p className="font-semibold text-slate-900">Ajouter à l'écran d'accueil</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Touchez le bouton <strong>Partager</strong> de Safari (le carré avec une flèche vers le
              haut).
            </li>
            <li>
              Choisissez <strong>« Sur l'écran d'accueil »</strong>.
            </li>
            <li>
              Touchez <strong>Ajouter</strong>.
            </li>
          </ol>
          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="mt-3 w-full rounded-xl bg-slate-100 py-2 font-semibold text-slate-700 hover:bg-slate-200"
          >
            Compris
          </button>
        </div>
      )}
    </div>
  )
}

export default InstallButton
