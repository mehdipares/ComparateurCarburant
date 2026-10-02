import { useEffect, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getFuelLabel } from '../utils/fuels'
import { formatPrice } from '../utils/format'
import { getPriceTier } from '../utils/stations'

// Centre de la France, utilisé avant le premier cadrage
const FRANCE_CENTER = [46.6, 2.4]

// En dessous de ce zoom, les étiquettes de prix se chevaucheraient : on affiche des points
const PRICE_LABEL_MIN_ZOOM = 12

// Style des épingles selon le niveau de prix (vert = bon prix, rose = cher).
// Les classes sont écrites en entier pour que Tailwind les détecte.
const PIN_STYLES = {
  cheapest: { box: 'bg-emerald-600 text-white px-2.5 py-1 text-sm', ring: 'ring-emerald-800', tail: 'border-t-emerald-600' },
  cheap: { box: 'bg-emerald-50 text-emerald-800 px-2 py-0.5 text-xs', ring: 'ring-emerald-400', tail: 'border-t-emerald-50' },
  average: { box: 'bg-white text-slate-800 px-2 py-0.5 text-xs', ring: 'ring-slate-300', tail: 'border-t-white' },
  expensive: { box: 'bg-rose-50 text-rose-700 px-2 py-0.5 text-xs', ring: 'ring-rose-300', tail: 'border-t-rose-50' },
}

// Même code couleur pour les points affichés quand on est loin
const DOT_COLORS = {
  cheapest: '#047857',
  cheap: '#10b981',
  average: '#94a3b8',
  expensive: '#fb7185',
}

// Plus le prix est bas, plus l'épingle passe au-dessus des autres
const Z_INDEX = { cheapest: 1000, cheap: 500, average: 0, expensive: 0 }

// Épingle en forme de bulle avec une pointe vers la station.
// L.divIcon permet d'utiliser du HTML à la place de l'image de marqueur par défaut.
function createPriceIcon(price, tier, isFocused) {
  const style = PIN_STYLES[tier]
  const ring = isFocused ? 'ring-4 ring-amber-400 scale-125' : `ring-1 ${style.ring}`
  const star = tier === 'cheapest' ? '★ ' : ''

  return L.divIcon({
    className: '', // Supprime le style par défaut de Leaflet (carré blanc)
    iconSize: null, // La taille s'adapte au contenu
    html: `
      <div class="flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <div class="origin-bottom whitespace-nowrap rounded-lg font-bold shadow-md transition ${style.box} ${ring}">${star}${formatPrice(price)}</div>
        <div class="h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent ${style.tail}"></div>
      </div>`,
  })
}

// Point bleu "Vous êtes ici" : un point avec contour blanc, un halo et une onde animée.
// Créé une seule fois : il ne dépend d'aucune donnée.
const userPositionIcon = L.divIcon({
  className: '',
  iconSize: null,
  html: `
    <div class="relative flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <span class="absolute h-12 w-12 rounded-full bg-blue-500/15"></span>
      <span class="absolute h-full w-full animate-ping rounded-full bg-blue-500/50"></span>
      <span class="relative h-5 w-5 rounded-full border-[3px] border-white bg-blue-600 shadow-lg"></span>
    </div>`,
})

// Recadre la carte sur les stations (et la position de l'utilisateur) à chaque nouvelle liste.
// useMap donne accès à l'objet carte de Leaflet, qui vit en dehors de React.
function FitToStations({ stations, userPosition }) {
  const map = useMap()

  useEffect(() => {
    const points = stations.map((station) => [station.latitude, station.longitude])
    if (userPosition) {
      points.push([userPosition.latitude, userPosition.longitude])
    }
    if (points.length > 0) {
      // Marges plus grandes en haut (carburants) et en bas (panneau "moins chère")
      map.fitBounds(points, { paddingTopLeft: [30, 70], paddingBottomRight: [30, 130], maxZoom: 15 })
    }
  }, [map, stations, userPosition])

  return null // Ce composant n'affiche rien : il agit seulement sur la carte
}

// Fait "voler" la carte jusqu'à la station mise en avant
function FlyToStation({ station }) {
  const map = useMap()

  useEffect(() => {
    if (!station) return

    const zoom = 15
    let target = L.latLng(station.latitude, station.longitude)

    // Sur petit écran, le panneau couvre le bas de la carte : on vise un point plus bas
    // que la station pour qu'elle apparaisse dans la partie haute, bien visible
    const { x: width, y: height } = map.getSize()
    if (width < 640) {
      const point = map.project(target, zoom).add([0, height * 0.22])
      target = map.unproject(point, zoom)
    }

    map.flyTo(target, zoom, { duration: 0.8 })
  }, [map, station])

  return null
}

// Suit le niveau de zoom de la carte dans un état React
function useZoomLevel() {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  // useMapEvents branche des écouteurs d'événements Leaflet (et les retire tout seul)
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  return zoom
}

function StationPopup({ station, selectedFuel }) {
  return (
    <Popup>
      <p className="m-0! font-semibold capitalize">{station.address}</p>
      <p className="m-0! text-slate-500">
        {station.postalCode} {station.city}
      </p>
      <p className="mt-2! mb-0!">
        {getFuelLabel(selectedFuel)} : <strong>{formatPrice(station.prices[selectedFuel])}</strong>
      </p>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block font-medium"
      >
        Itinéraire →
      </a>
    </Popup>
  )
}

// Les marqueurs des stations : des points quand on est loin, des épingles de prix quand on est proche
function StationMarkers({ stations, selectedFuel, focusedStationId }) {
  const zoom = useZoomLevel()
  const showPrices = zoom >= PRICE_LABEL_MIN_ZOOM

  const prices = stations.map((station) => station.prices[selectedFuel])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // Les plus chères d'abord : les moins chères sont dessinées par-dessus
  const sortedStations = [...stations].sort(
    (a, b) => b.prices[selectedFuel] - a.prices[selectedFuel],
  )

  return sortedStations.map((station) => {
    const price = station.prices[selectedFuel]
    const tier = getPriceTier(price, minPrice, maxPrice)
    const isFocused = station.id === focusedStationId
    const position = [station.latitude, station.longitude]

    if (showPrices || isFocused) {
      return (
        <Marker
          key={station.id}
          position={position}
          icon={createPriceIcon(price, tier, isFocused)}
          zIndexOffset={isFocused ? 3000 : Z_INDEX[tier]}
        >
          <StationPopup station={station} selectedFuel={selectedFuel} />
        </Marker>
      )
    }

    return (
      <CircleMarker
        key={station.id}
        center={position}
        radius={tier === 'cheapest' ? 9 : 6}
        pathOptions={{ color: '#ffffff', weight: 2, fillColor: DOT_COLORS[tier], fillOpacity: 1 }}
      >
        <StationPopup station={station} selectedFuel={selectedFuel} />
      </CircleMarker>
    )
  })
}

// `stations` : marqueurs à afficher ; `fitStations` : celles sur lesquelles cadrer la carte.
// Les deux ne contiennent que des stations avec coordonnées (filtrées par MapView)
function StationMap({ stations, fitStations, selectedFuel, userPosition, focusedStation }) {
  return (
    <MapContainer
      center={FRANCE_CENTER}
      zoom={6}
      zoomControl={false} // On le replace en bas à droite, les carburants occupent le haut
      scrollWheelZoom
      className="h-full w-full"
    >
      {/* Tuiles OpenStreetMap passées en niveaux de gris avec un filtre CSS :
          un fond sobre sur lequel les marqueurs colorés ressortent */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Prix : <a href="https://data.economie.gouv.fr">data.economie.gouv.fr</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="brightness-105 contrast-90 grayscale"
      />
      <ZoomControl position="bottomright" />

      <FitToStations stations={fitStations} userPosition={userPosition} />
      <FlyToStation station={focusedStation} />

      <StationMarkers
        stations={stations}
        selectedFuel={selectedFuel}
        focusedStationId={focusedStation?.id}
      />

      {userPosition && (
        <Marker
          position={[userPosition.latitude, userPosition.longitude]}
          icon={userPositionIcon}
          zIndexOffset={4000} // Toujours au-dessus des stations
        >
          <Popup>Vous êtes ici</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default StationMap
