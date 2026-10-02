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

// Retire les guillemets, qui casseraient la syntaxe de la requête
function sanitize(text) {
  return text.trim().replace(/"/g, '')
}

// Met un nom de ville sous une forme comparable : "Saint-Étienne" → "saint etienne"
function normalizeCityName(name) {
  return name
    .normalize('NFD') // Sépare les lettres de leurs accents : "é" → "e" + "´"
    .replace(/[̀-ͯ]/g, '') // Supprime les accents
    .replace(/[-']/g, ' ')
    .toLowerCase()
    .trim()
}

// Construit le filtre `where` de l'API selon ce que l'utilisateur a tapé
function buildLocationFilter(query) {
  const value = sanitize(query)

  if (/^\d{5}$/.test(value)) {
    return `cp = "${value}"` // Code postal : 69003
  }
  if (/^(\d{2,3}|2[AB])$/i.test(value)) {
    return `code_departement = "${value.toUpperCase()}"` // Département : 69, 2A, 974
  }
  return `ville like "${value}"` // Nom de ville (insensible à la casse et aux accents)
}

// Appel générique à l'API : construit l'URL, gère le délai maximum et l'annulation.
// `signal` permet à l'appelant d'annuler la requête (AbortController)
async function fetchApi(params, signal) {
  // La requête s'arrête si elle dépasse le délai OU si l'appelant l'annule
  const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS)
  const response = await fetch(`${API_URL}?${new URLSearchParams(params)}`, {
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  })

  // fetch ne lève pas d'erreur sur un code HTTP 4xx/5xx : on le vérifie nous-mêmes
  if (!response.ok) {
    throw new Error(`Erreur API : ${response.status}`)
  }

  const data = await response.json()
  return data.results
}

// Options : `orderBy` (tri côté serveur), `limit` (nombre de résultats), `signal` (annulation)
async function fetchStations(where, { orderBy, limit = MAX_RESULTS, signal } = {}) {
  const params = { where, select: FIELDS.join(','), limit }
  if (orderBy) {
    params.order_by = orderBy
  }

  const results = await fetchApi(params, signal)
  return results.map(formatStation)
}

// `department` (facultatif) : limite la recherche à un département, utile quand plusieurs
// villes portent le même nom (Saint-Denis existe dans le 93 et à La Réunion)
export async function searchStationsByLocation(query, department) {
  let where = buildLocationFilter(query)
  if (department) {
    where += ` and code_departement = "${sanitize(department)}"`
  }
  const stations = await fetchStations(where)

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

// Suggestions de villes pendant la saisie. On interroge l'API des carburants elle-même :
// elle ne propose donc que des villes qui ont des stations (jamais de recherche vide).
// Renvoie [{ city, department, stationCount }], les villes les mieux équipées en premier.
export async function searchCities(text, { limit = 6, signal } = {}) {
  // Sans accents ("béz" → "bez") et avec * : les mots qui COMMENCENT par la saisie
  const prefix = normalizeCityName(sanitize(text))
  const results = await fetchApi(
    {
      where: `ville like "${prefix}*"`,
      select: 'ville, code_departement, count(*) as stations',
      group_by: 'ville, code_departement',
      order_by: 'stations desc',
      limit: 20, // On en demande plus pour pouvoir les reclasser ci-dessous
    },
    signal,
  )

  const cities = results.map((result) => ({
    city: result.ville,
    department: result.code_departement,
    stationCount: result.stations,
  }))

  // L'API trouve les mots qui commencent par la saisie, n'importe où dans le nom :
  // "saint d" trouve aussi Saint-Jean-de-Braye ("de"). On place d'abord les villes dont
  // le NOM COMPLET commence par la saisie, puis celles qui ont le plus de stations
  const startsWithPrefix = (city) => normalizeCityName(city.city).startsWith(prefix)
  return cities
    .sort((a, b) => startsWithPrefix(b) - startsWithPrefix(a) || b.stationCount - a.stationCount)
    .slice(0, limit)
}
