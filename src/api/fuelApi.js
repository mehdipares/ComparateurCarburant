import { FUELS } from '../utils/fuels'

const API_URL =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records'

// Maximum autorisé par l'API en une seule requête
const MAX_RESULTS = 100

// Au-delà de 10 secondes sans réponse, on abandonne la requête
const TIMEOUT_MS = 10000

// On ne demande que les colonnes utiles pour alléger la réponse
const FIELDS = ['id', 'adresse', 'ville', 'cp', 'geom', ...FUELS.map((fuel) => `${fuel.id}_prix`)]

// Transforme une station brute de l'API en objet simple pour nos composants
function formatStation(record) {
  const prices = {}
  for (const fuel of FUELS) {
    prices[fuel.id] = record[`${fuel.id}_prix`] // null si la station ne vend pas ce carburant
  }

  return {
    id: record.id,
    address: record.adresse?.toLowerCase(), // Souvent en majuscules dans l'API
    city: record.ville,
    postalCode: record.cp,
    latitude: record.geom?.lat,
    longitude: record.geom?.lon,
    prices,
  }
}

// Construit le filtre `where` de l'API selon ce que l'utilisateur a tapé
function buildLocationFilter(query) {
  // On retire les guillemets pour ne pas casser la syntaxe de la requête
  const value = query.trim().replace(/"/g, '')

  if (/^\d{5}$/.test(value)) {
    return `cp = "${value}"` // Code postal : 69003
  }
  if (/^(\d{2,3}|2[AB])$/i.test(value)) {
    return `code_departement = "${value.toUpperCase()}"` // Département : 69, 2A, 974
  }
  return `ville like "${value}"` // Nom de ville (insensible à la casse et aux accents)
}

// Options : `orderBy` (tri côté serveur), `limit` (nombre de résultats),
// `signal` (pour pouvoir annuler la requête depuis l'extérieur)
async function fetchStations(where, { orderBy, limit = MAX_RESULTS, signal } = {}) {
  const params = new URLSearchParams({
    where,
    select: FIELDS.join(','),
    limit,
  })
  if (orderBy) {
    params.set('order_by', orderBy)
  }

  // La requête s'arrête si elle dépasse le délai OU si l'appelant l'annule
  const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS)
  const response = await fetch(`${API_URL}?${params}`, {
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  })

  // fetch ne lève pas d'erreur sur un code HTTP 4xx/5xx : on le vérifie nous-mêmes
  if (!response.ok) {
    throw new Error(`Erreur API : ${response.status}`)
  }

  const data = await response.json()
  return data.results.map(formatStation)
}

// Met un nom de ville sous une forme comparable : "Saint-Étienne" → "saint etienne"
function normalizeCityName(name) {
  return name
    .normalize('NFD') // Sépare les lettres de leurs accents : "é" → "e" + "´"
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[-']/g, ' ')
    .toLowerCase()
    .trim()
}

export async function searchStationsByLocation(query) {
  const stations = await fetchStations(buildLocationFilter(query))

  // `like "Lyon"` renvoie aussi "Chazelles-sur-Lyon". Si des stations correspondent
  // exactement à la ville tapée, on ne garde qu'elles ; sinon on garde tout.
  const exactMatches = stations.filter(
    (station) => normalizeCityName(station.city ?? '') === normalizeCityName(query),
  )
  return exactMatches.length > 0 ? exactMatches : stations
}

// Stations dans un rayon autour d'un point, les plus proches en premier.
// Attention : l'API attend la longitude AVANT la latitude.
export function searchStationsAround({ latitude, longitude }, radiusKm) {
  const point = `geom'POINT(${longitude} ${latitude})'`
  return fetchStations(`within_distance(geom, ${point}, ${radiusKm}km)`, {
    orderBy: `distance(geom, ${point})`,
  })
}

// Les stations les moins chères pour un carburant dans un rayon (même au-delà des
// stations déjà chargées). Tri côté serveur : prix croissant, puis distance.
export function searchCheapestAround({ latitude, longitude }, radiusKm, fuel, { limit = 20, signal } = {}) {
  const point = `geom'POINT(${longitude} ${latitude})'`
  return fetchStations(`within_distance(geom, ${point}, ${radiusKm}km) and ${fuel}_prix is not null`, {
    orderBy: `${fuel}_prix, distance(geom, ${point})`,
    limit,
    signal,
  })
}
