import { useState } from 'react'
import LocateIcon from './LocateIcon'
import useCitySuggestions from '../hooks/useCitySuggestions'

function SearchBar({ onSearch, onLocate, isLoading }) {
  // Texte en cours de saisie : seul ce composant en a besoin
  const [query, setQuery] = useState('')
  const [isListOpen, setIsListOpen] = useState(false) // Liste de suggestions visible ?
  const [activeIndex, setActiveIndex] = useState(-1) // Suggestion surlignée au clavier

  const suggestions = useCitySuggestions(query)
  const showSuggestions = isListOpen && suggestions.length > 0

  function handleChange(event) {
    setQuery(event.target.value)
    setIsListOpen(true)
    setActiveIndex(-1)
  }

  function selectSuggestion(suggestion) {
    setQuery(suggestion.city)
    setIsListOpen(false)
    onSearch(suggestion.city, suggestion.department) // Le département évite les homonymes
  }

  function handleSubmit(event) {
    event.preventDefault() // Empêche le rechargement de la page
    if (query.trim() === '') return
    setIsListOpen(false)
    onSearch(query)
  }

  // Navigation au clavier dans la liste : flèches, Entrée, Échap
  function handleKeyDown(event) {
    if (!showSuggestions) return

    if (event.key === 'ArrowDown') {
      event.preventDefault() // Empêche le curseur de sauter en fin de texte
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault() // On choisit la suggestion au lieu d'envoyer le formulaire
      selectSuggestion(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      setIsListOpen(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]"
    >
      {/* `relative` : la liste de suggestions se place juste sous le champ */}
      <div className="relative col-span-2 sm:col-span-1">
        <label htmlFor="location" className="sr-only">
          Ville, code postal ou département
        </label>
        <input
          id="location"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsListOpen(true)}
          onBlur={() => setIsListOpen(false)}
          placeholder="Ville, code postal ou département"
          autoComplete="off" // On désactive les suggestions du navigateur au profit des nôtres
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="city-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `city-suggestion-${activeIndex}` : undefined}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />

        {showSuggestions && (
          <ul
            id="city-suggestions"
            role="listbox"
            aria-label="Villes suggérées"
            className="absolute inset-x-0 top-full z-[2000] mt-1 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-200"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.city}-${suggestion.department}`}
                id={`city-suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // onMouseDown plutôt que onClick : il se déclenche AVANT le blur du champ,
                // qui fermerait la liste et annulerait le clic
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectSuggestion(suggestion)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 ${
                  index === activeIndex ? 'bg-brand-50' : ''
                }`}
              >
                <span className="truncate font-medium">
                  {suggestion.city}{' '}
                  <span className="font-normal text-slate-500">({suggestion.department})</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                  {suggestion.stationCount} station{suggestion.stationCount > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="whitespace-nowrap rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold sm:px-6 sm:text-base text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? 'Recherche…' : 'Rechercher'}
      </button>
      <button
        type="button"
        onClick={onLocate}
        disabled={isLoading}
        className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 py-3 text-sm font-semibold sm:px-4 sm:text-base text-brand-700 shadow-sm ring-1 ring-brand-600 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-60"
      >
        <LocateIcon className="h-5 w-5" />
        Autour de moi
      </button>
    </form>
  )
}

export default SearchBar
