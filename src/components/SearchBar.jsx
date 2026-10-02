import { useState } from 'react'

function SearchBar({ onSearch }) {
  // Texte en cours de saisie : seul ce composant en a besoin
  const [query, setQuery] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // Empêche le rechargement de la page
    if (query.trim() === '') return
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row" role="search">
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Rechercher
      </button>
    </form>
  )
}

export default SearchBar
