'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

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

const CENTRO: [number, number] = [14.6349, -90.5069]

const iconoCentral = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 0 0 4px rgba(16,185,129,0.3),0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

const iconoConsulta = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#0ea5e9;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function fmt(value: number | null): string {
  return value !== null ? value.toFixed(1) : '—'
}

function getAirQualityStatus(pm2_5: number | null): EstadoAire {
  if (pm2_5 === null) {
    return {
      estado: 'Sin datos',
      etiqueta: 'Sin datos',
      emoji: '⚪',
      color: 'bg-slate-400',
      descripcion: 'Lectura no disponible para este punto.',
    }
  }
  if (pm2_5 <= 12.0) {
    return {
      estado: 'Excelente / Aire Limpio',
      etiqueta: 'Bueno',
      emoji: '🟢',
      color: 'bg-emerald-500',
      descripcion: 'Calidad de aire óptima según la OMS.',
    }
  }
  if (pm2_5 <= 35.4) {
    return {
      estado: 'Aceptable / Moderado',
      etiqueta: 'Moderado',
      emoji: '🟡',
      color: 'bg-yellow-500',
      descripcion: 'Calidad de aire aceptable.',
    }
  }
  if (pm2_5 <= 55.4) {
    return {
      estado: 'Dañino a Grupos Sensibles',
      etiqueta: 'Sensible',
      emoji: '🟠',
      color: 'bg-orange-500',
      descripcion: 'Precaución para personas con asma o alergias.',
    }
  }
  return {
    estado: 'No Saludable / Alerta',
    etiqueta: 'Dañino',
    emoji: '🔴',
    color: 'bg-red-500',
    descripcion: 'Niveles altos de contaminación detectados.',
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
      map.flyTo([objetivo.lat, objetivo.lng], objetivo.zoom, { duration: 1.4 })
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
      {subtitulo && <p className="mt-0.5 font-mono text-xs text-slate-500">{subtitulo}</p>}

      <div className={`mt-3 rounded-lg px-3 py-2 text-white ${estado.color}`}>
        <p className="text-sm font-bold">
          {estado.emoji} {estado.etiqueta.toUpperCase()}
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
        Open-Meteo · {calidad.time ? new Date(calidad.time).toLocaleString() : '—'}
      </p>
    </div>
  )
}

export default function GlobalMap() {
  const [calidadCentral, setCalidadCentral] = useState<CalidadAire | null>(null)
  const [puntoConsulta, setPuntoConsulta] = useState<PuntoAire | null>(null)
  const [objetivo, setObjetivo] = useState<ObjetivoVuelo | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCalidad(CENTRO[0], CENTRO[1]).then(setCalidadCentral)
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
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setObjetivo({ lat: latitude, lng: longitude, zoom: 13 })
        await consultar(latitude, longitude)
      },
      () => setError('No se pudo obtener tu ubicación. Revisa los permisos del navegador.'),
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
        <MapContainer center={CENTRO} zoom={13} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution="© Esri — World Topo Map"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
          <MapEvents onClic={consultar} />
          <FlyTo objetivo={objetivo} />

          <Marker position={CENTRO} icon={iconoCentral}>
            <Popup>
              {calidadCentral ? (
                <PopupCalidad
                  titulo="Nodo Central YU'AM v2.0"
                  subtitulo="MILAB · Ciudad de Guatemala"
                  calidad={calidadCentral}
                />
              ) : (
                <div className="min-w-[220px] p-1">
                  <p className="text-sm font-semibold text-slate-800">Nodo Central YU&apos;AM v2.0</p>
                  <p className="mt-1 text-xs text-slate-400">Consultando calidad del aire…</p>
                </div>
              )}
            </Popup>
          </Marker>

          {puntoConsulta && (
            <Marker
              position={[puntoConsulta.lat, puntoConsulta.lng]}
              icon={iconoConsulta}
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
        </MapContainer>

        {/* Leyenda de calidad del aire */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Calidad del aire (PM2.5)
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Bueno
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Moderado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Sensible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Dañino
            </span>
          </div>
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
