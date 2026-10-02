import { useState } from 'react'

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
        className="col-span-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 sm:col-span-1"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold sm:px-6 sm:text-base text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? 'Recherche…' : 'Rechercher'}
      </button>
      <button
        type="button"
        onClick={onLocate}
        disabled={isLoading}
        className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 py-3 text-sm font-semibold sm:px-4 sm:text-base text-emerald-700 shadow-sm ring-1 ring-emerald-600 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60"
      >
        {/* Icône "localiser" (Lucide) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <line x1="2" x2="5" y1="12" y2="12" />
          <line x1="19" x2="22" y1="12" y2="12" />
          <line x1="12" x2="12" y1="2" y2="5" />
          <line x1="12" x2="12" y1="19" y2="22" />
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Autour de moi
      </button>
    </form>
  )
}

export default SearchBar
