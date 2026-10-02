import { useState } from 'react'
import LocateIcon from './LocateIcon'

function SearchBar({ onSearch, onLocate, isLoading }) {
  // Texte en cours de saisie : seul ce composant en a besoin
  const [query, setQuery] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // Empêche le rechargement de la page
    if (query.trim() === '') return
    onSearch(query)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]"
    >
      <label htmlFor="location" className="sr-only">
        Ville, code postal ou département
      </label>
      <input
        id="location"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ville, code postal ou département"
        autoComplete="address-level2"
        className="col-span-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 sm:col-span-1"
      />
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
