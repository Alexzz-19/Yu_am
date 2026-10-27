'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { PublicNode } from '@/lib/database.types'
import NodeTelemetrySummary from './NodeTelemetrySummary'

type CalidadAire = {
  pm10: number | null
  pm2_5: number | null
  carbon_monoxide: number | null
  time: string
}

type PuntoAire = {
  lat: number
  lng: number
  calidad: CalidadAire
}

type ObjetivoVuelo = {
  lat: number
  lng: number
  zoom: number
}

type EstadoAire = {
  estado: string
  etiqueta: string
  emoji: string
  color: string
  descripcion: string
}

// Centro de la vista, sin representar un nodo registrado.
const CENTRO: [number, number] = [14.6349, -90.5069]

const LIMITES_MUNDO: [[number, number], [number, number]] = [
  [-90, -180],
  [90, 180],
]

const iconoConsulta = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#0ea5e9;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const iconoComunitario = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#059669;border:3px solid #fff;box-shadow:0 0 0 4px rgba(5,150,105,0.24),0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const iconoUsuario = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 5px rgba(37,99,235,0.25),0 2px 8px rgba(0,0,0,0.35)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function fmt(value: number | null): string {
  return value !== null ? value.toFixed(1) : '—'
}

function getAirQualityStatus(pm2_5: number | null): EstadoAire {
  return {
    estado: pm2_5 === null ? 'Sin datos de PM2.5' : 'Concentración modelada de PM2.5',
    etiqueta: pm2_5 === null ? 'Sin datos' : 'Estimación ambiental',
    emoji: '',
    color: 'bg-sky-700',
    descripcion: 'Datos del modelo de Open-Meteo para el punto consultado. No corresponden a una lectura de un nodo YU’AM ni constituyen una clasificación sanitaria.',
  }
}

async function fetchCalidad(lat: number, lng: number): Promise<CalidadAire | null> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    return (json.current ?? null) as CalidadAire | null
  } catch {
    return null
  }
}

function MapEvents({ onClic }: { onClic: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(evento) {
      onClic(evento.latlng.lat, evento.latlng.lng)
    },
  })
  return null
}

function FlyTo({ objetivo }: { objetivo: ObjetivoVuelo | null }) {
  const map = useMap()
  useEffect(() => {
    if (objetivo) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) map.setView([objetivo.lat, objetivo.lng], objetivo.zoom, { animate: false })
      else map.flyTo([objetivo.lat, objetivo.lng], objetivo.zoom, { duration: 1.4 })
    }
  }, [objetivo, map])
  return null
}

function TarjetaMedicion({ etiqueta, valor }: { etiqueta: string; valor: number | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{fmt(valor)}</p>
    </div>
  )
}

function PopupCalidad({
  titulo,
  subtitulo,
  calidad,
}: {
  titulo: string
  subtitulo?: string
  calidad: CalidadAire
}) {
  const estado = getAirQualityStatus(calidad.pm2_5)
  return (
    <div className="min-w-[250px]">
      <p className="text-sm font-semibold text-slate-800">{titulo}</p>
      {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}

      <div className={`mt-3 rounded-lg px-3 py-2 text-white ${estado.color}`}>
        <p className="text-sm font-bold">
          {estado.etiqueta}
        </p>
        <p className="text-[11px] opacity-90">{estado.estado}</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <TarjetaMedicion etiqueta="PM2.5" valor={calidad.pm2_5} />
        <TarjetaMedicion etiqueta="PM10" valor={calidad.pm10} />
        <TarjetaMedicion etiqueta="CO" valor={calidad.carbon_monoxide} />
      </div>
      <p className="mt-1.5 text-[10px] text-slate-400">Valores en µg/m³</p>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">{estado.descripcion}</p>
      <p className="mt-1 text-[10px] text-slate-400">
        Open-Meteo · estimación modelada · {calidad.time ? new Date(calidad.time).toLocaleString() : '—'}
      </p>
    </div>
  )
}

export default function GlobalMap() {
  const [nodes, setNodes] = useState<PublicNode[]>([])
  const [puntoConsulta, setPuntoConsulta] = useState<PuntoAire | null>(null)
  const [ubicacionUsuario, setUbicacionUsuario] = useState<PuntoAire | null>(null)
  const [objetivo, setObjetivo] = useState<ObjetivoVuelo | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    async function refreshNodes() {
      try {
        const response = await fetch('/api/nodes?scope=community', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('No se pudieron cargar los nodos de la comunidad.')
        const data: { nodes: PublicNode[] } = await response.json()
        if (current) setNodes(data.nodes)
      } catch {
        if (current) setNodes([])
      }
    }
    void refreshNodes()
    const timer = setInterval(refreshNodes, 30 * 60 * 1000)
    return () => { current = false; clearInterval(timer); controller.abort() }
  }, [])

  async function consultar(lat: number, lng: number) {
    setCargando(true)
    setError(null)
    const calidad = await fetchCalidad(lat, lng)
    setCargando(false)
    if (calidad) {
      setPuntoConsulta({ lat, lng, calidad })
    } else {
      setError('No se pudo consultar la calidad del aire en ese punto.')
    }
  }

  function onMiUbicacion() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setError(null)
    setCargando(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setObjetivo({ lat: latitude, lng: longitude, zoom: 16 })
        const calidad = await fetchCalidad(latitude, longitude)
        setCargando(false)
        if (calidad) {
          setUbicacionUsuario({ lat: latitude, lng: longitude, calidad })
        } else {
          setError('Se obtuvo tu ubicación, pero no se pudo consultar la calidad del aire.')
        }
      },
      () => {
        setCargando(false)
        setError('No se pudo obtener tu GPS. Verifica que el permiso de ubicación esté habilitado en el navegador.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">🌿 YU&apos;AM — Red Global de Fotobiorreactores</h2>
        <button
          type="button"
          onClick={onMiUbicacion}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          🎯 Mi Ubicación
        </button>
      </div>

      <div className="relative h-[62vh] min-h-[420px] w-full bg-slate-100">
        <MapContainer
          center={CENTRO}
          zoom={13}
          minZoom={3}
          maxZoom={18}
          worldCopyJump={false}
          maxBounds={LIMITES_MUNDO}
          maxBoundsViscosity={1.0}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution="© Esri — World Topo Map"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            noWrap
          />
          <MapEvents onClic={consultar} />
          <FlyTo objetivo={objetivo} />

          {nodes.filter(node => Number.isFinite(node.ubicacion_ofuscada.lat) && Number.isFinite(node.ubicacion_ofuscada.lng)).map(node => (
            <Marker key={node.id} position={[node.ubicacion_ofuscada.lat!, node.ubicacion_ofuscada.lng!]} icon={iconoComunitario} title={`Nodo comunitario: ${node.nombre_nodo}`} alt={`Ubicación aproximada de ${node.nombre_nodo}`}>
              <Popup maxWidth={420}><NodeTelemetrySummary node={node} /></Popup>
            </Marker>
          ))}


          {puntoConsulta && (
            <Marker
              position={[puntoConsulta.lat, puntoConsulta.lng]}
              icon={iconoConsulta}
              title="Punto de consulta del modelo ambiental"
              alt="Punto de consulta de Open-Meteo"
              eventHandlers={{ add: (evento) => evento.target.openPopup() }}
            >
              <Popup>
                <PopupCalidad
                  titulo="Calidad del aire"
                  subtitulo={`${puntoConsulta.lat.toFixed(4)}, ${puntoConsulta.lng.toFixed(4)}`}
                  calidad={puntoConsulta.calidad}
                />
              </Popup>
            </Marker>
          )}

          {ubicacionUsuario && (
            <Marker
              position={[ubicacionUsuario.lat, ubicacionUsuario.lng]}
              icon={iconoUsuario}
              title="Tu ubicación aproximada para la consulta ambiental"
              alt="Tu ubicación para la consulta de Open-Meteo"
              eventHandlers={{ add: (evento) => evento.target.openPopup() }}
            >
              <Popup>
                <PopupCalidad
                  titulo="Tu ubicación"
                  subtitulo={`${ubicacionUsuario.lat.toFixed(4)}, ${ubicacionUsuario.lng.toFixed(4)}`}
                  calidad={ubicacionUsuario.calidad}
                />
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
          <p className="font-semibold">Fuentes del mapa</p>
          <p className="mt-1">Verde: nodos registrados · Azul: consulta ambiental modelada</p>
        </div>

        {cargando && (
          <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            Consultando calidad del aire…
          </div>
        )}
        {error && (
          <div className="absolute left-1/2 top-12 z-[1000] -translate-x-1/2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 shadow-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
