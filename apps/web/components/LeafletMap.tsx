'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Coordinates } from '@/lib/locations'

type LeafletMapProps = {
  coordinates: Coordinates
  onCoordinatesChange: (coordinates: Coordinates) => void
}

const nodeIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#047857;border:3px solid #fff;box-shadow:0 3px 10px rgba(6,78,59,.35);transform:rotate(-45deg)"><span style="display:block;width:100%;height:100%;border-radius:50%;background:#34d399;transform:scale(.35)"></span></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

function samePoint(left: Coordinates, right: Coordinates) {
  return Math.abs(left.lat - right.lat) < 0.00001 && Math.abs(left.lng - right.lng) < 0.00001
}

function MapPosition({ coordinates }: { coordinates: Coordinates }) {
  const map = useMap()
  useEffect(() => {
    const center = map.getCenter()
    if (!samePoint(center, coordinates)) map.flyTo([coordinates.lat, coordinates.lng], Math.max(map.getZoom(), 12), { duration: 0.55 })
  }, [coordinates, map])
  return null
}

function MapSelection({ onCoordinatesChange }: Pick<LeafletMapProps, 'onCoordinatesChange'>) {
  const map = useMapEvents({
    click(event) {
      onCoordinatesChange({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
    moveend() {
      const center = map.getCenter()
      onCoordinatesChange({ lat: center.lat, lng: center.lng })
    },
  })
  return null
}

function ResizeMap({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap()
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 250)
    return () => window.clearTimeout(timer)
  }, [fullscreen, map])
  return null
}

export default function LeafletMap({ coordinates, onCoordinatesChange }: LeafletMapProps) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[80] bg-slate-950 p-4 sm:p-6' : 'relative mt-3'}>
      <div className={fullscreen ? 'relative h-full overflow-hidden rounded-2xl border border-emerald-200 bg-slate-100 shadow-2xl' : 'relative h-72 overflow-hidden rounded-2xl border border-emerald-200 bg-slate-100'}>
        <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={12} minZoom={3} maxZoom={19} className="h-full w-full" scrollWheelZoom>
          <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapPosition coordinates={coordinates} />
          <MapSelection onCoordinatesChange={onCoordinatesChange} />
          <ResizeMap fullscreen={fullscreen} />
          <Marker position={[coordinates.lat, coordinates.lng]} icon={nodeIcon} />
        </MapContainer>
        <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm backdrop-blur">Arrastra el mapa o pulsa una calle para mover el nodo</div>
        <button type="button" onClick={() => setFullscreen(current => !current)} className="absolute right-3 top-3 z-[1000] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50" aria-label={fullscreen ? 'Salir de pantalla completa del mapa' : 'Agrandar mapa a pantalla completa'} aria-pressed={fullscreen}>
          {fullscreen ? '× Cerrar' : '⛶ Ampliar'}
        </button>
      </div>
    </div>
  )
}
