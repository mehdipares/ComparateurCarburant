import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getFuelLabel } from '../utils/fuels'
import { formatPrice } from '../utils/format'

// Centre de la France, utilisé avant le premier cadrage
const FRANCE_CENTER = [46.6, 2.4]

// En dessous de ce zoom, les étiquettes de prix se chevaucheraient : on affiche des points
const PRICE_LABEL_MIN_ZOOM = 12

// Marqueur en forme d'étiquette affichant le prix.
// L.divIcon permet d'utiliser du HTML à la place de l'image de marqueur par défaut.
function createPriceIcon(price, isCheapest) {
  const colors = isCheapest
    ? 'bg-amber-400 text-amber-950 ring-amber-600'
    : 'bg-white text-slate-900 ring-slate-300'

  return L.divIcon({
    className: '', // Supprime le style par défaut de Leaflet (carré blanc)
    iconSize: null, // La taille s'adapte au contenu
    html: `<div class="-translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow-md ring-1 ${colors}">${formatPrice(price)}</div>`,
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
      map.fitBounds(points, { padding: [40, 40], maxZoom: 15 })
    }
  }, [map, stations, userPosition])

  return null // Ce composant n'affiche rien : il agit seulement sur la carte
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

// Les marqueurs des stations : des points quand on est loin, des prix quand on est proche
function StationMarkers({ stations, selectedFuel, cheapestPrice }) {
  const zoom = useZoomLevel()
  const showPrices = zoom >= PRICE_LABEL_MIN_ZOOM

  return stations.map((station) => {
    const isCheapest = station.prices[selectedFuel] === cheapestPrice
    const position = [station.latitude, station.longitude]

    if (showPrices) {
      return (
        <Marker
          key={station.id}
          position={position}
          icon={createPriceIcon(station.prices[selectedFuel], isCheapest)}
          zIndexOffset={isCheapest ? 1000 : 0} // Le moins cher reste au-dessus des autres
        >
          <StationPopup station={station} selectedFuel={selectedFuel} />
        </Marker>
      )
    }

    return (
      <CircleMarker
        key={station.id}
        center={position}
        radius={isCheapest ? 8 : 6}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: isCheapest ? '#f59e0b' : '#059669',
          fillOpacity: 1,
        }}
      >
        <StationPopup station={station} selectedFuel={selectedFuel} />
      </CircleMarker>
    )
  })
}

function StationMap({ stations, selectedFuel, cheapestPrice, userPosition }) {
  // Quelques stations n'ont pas de coordonnées : on ne peut pas les placer
  const locatedStations = stations.filter((station) => station.latitude && station.longitude)

  return (
    <MapContainer center={FRANCE_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
      {/* Tuiles OpenStreetMap passées en niveaux de gris avec un filtre CSS :
          un fond sobre sur lequel les marqueurs colorés ressortent */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="brightness-105 contrast-90 grayscale"
      />

      <FitToStations stations={locatedStations} userPosition={userPosition} />

      <StationMarkers
        stations={locatedStations}
        selectedFuel={selectedFuel}
        cheapestPrice={cheapestPrice}
      />

      {userPosition && (
        <Marker
          position={[userPosition.latitude, userPosition.longitude]}
          icon={userPositionIcon}
          zIndexOffset={2000} // Toujours au-dessus des stations
        >
          <Popup>Vous êtes ici</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default StationMap
