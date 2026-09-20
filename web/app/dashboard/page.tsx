'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface UbicacionOfuscada {
  zona: string
  lat: number
  lng: number
}

interface NodoIoT {
  id: string
  nombre_nodo: string
  estado: string
  ubicacion_ofuscada: UbicacionOfuscada
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Error desconocido al consultar Supabase'
}

interface Telemetria {
  id: number
  nodo_id: string
  ppm_co2: number
  calidad_aire: number
  temperatura: number
  humedad: number
  bufer_local: boolean
  created_at: string
}

export default function DashboardPage() {
  const [nodos, setNodos] = useState<NodoIoT[]>([])
  const [selectedNodo, setSelectedNodo] = useState<string | null>(null)
  const [telemetriaList, setTelemetriaList] = useState<Telemetria[]>([])
  const [latest, setLatest] = useState<Telemetria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNodos() {
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase.from('nodos_iot').select('*')
        if (error) throw error

        const nodosData = (data ?? []) as NodoIoT[]
        if (nodosData.length > 0) {
          setNodos(nodosData)
          setSelectedNodo(nodosData[0].id)
        } else {
          // Fallback mock node for preview if DB is empty
          const mockNode: NodoIoT = {
            id: 'mock-nodo-1',
            nombre_nodo: 'Biorreactor Q’eqchi’ Alpha-1',
            estado: 'activo',
            ubicacion_ofuscada: { zona: 'Alta Verapaz (Ofuscado)', lat: 15.47, lng: -90.37 }
          }
          setNodos([mockNode])
          setSelectedNodo(mockNode.id)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error('Error fetching nodos:', message)
        setError(message)
        // Fallback mock node on error/auth required
        const mockNode: NodoIoT = {
          id: 'mock-nodo-1',
          nombre_nodo: 'Biorreactor Q’eqchi’ Alpha-1 (Demo)',
          estado: 'activo',
          ubicacion_ofuscada: { zona: 'Alta Verapaz (Ofuscado)', lat: 15.47, lng: -90.37 }
        }
        setNodos([mockNode])
        setSelectedNodo(mockNode.id)
      } finally {
        setLoading(false)
      }
    }

    fetchNodos()
  }, [])

  useEffect(() => {
    if (!selectedNodo) return

    async function fetchTelemetria() {
      if (selectedNodo?.startsWith('mock-')) {
        // Generate mock telemetry data
        const mockData: Telemetria[] = [
          {
            id: 1,
            nodo_id: selectedNodo,
            ppm_co2: 412.50,
            calidad_aire: 94.20,
            temperatura: 26.40,
            humedad: 78.50,
            bufer_local: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            nodo_id: selectedNodo,
            ppm_co2: 415.10,
            calidad_aire: 93.80,
            temperatura: 26.50,
            humedad: 78.10,
            bufer_local: false,
            created_at: new Date(Date.now() - 60000 * 5).toISOString()
          },
          {
            id: 3,
            nodo_id: selectedNodo,
            ppm_co2: 409.80,
            calidad_aire: 95.00,
            temperatura: 26.20,
            humedad: 79.00,
            bufer_local: true,
            created_at: new Date(Date.now() - 60000 * 10).toISOString()
          }
        ]
        setTelemetriaList(mockData)
        setLatest(mockData[0])
        return
      }

      try {
        const { data, error } = await supabase
          .from('telemetria_mq135')
          .select('*')
          .eq('nodo_id', selectedNodo)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const telemetriaData = (data ?? []) as Telemetria[]
        if (telemetriaData.length > 0) {
          setTelemetriaList(telemetriaData)
          setLatest(telemetriaData[0])
        } else {
          setTelemetriaList([])
          setLatest(null)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error('Error fetching telemetry:', message)
        setError(message)
      }
    }

    fetchTelemetria()

    // Realtime subscription
    const channel = supabase
      .channel('public:telemetria_mq135')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetria_mq135',
          filter: `nodo_id=eq.${selectedNodo}`
        },
        (payload) => {
          const nuevaLectura = payload.new as Telemetria
          setTelemetriaList((prev) => [nuevaLectura, ...prev])
          setLatest(nuevaLectura)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedNodo])

  const currentNode = nodos.find((n) => n.id === selectedNodo)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-emerald-900/40 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition">
            🌱
          </Link>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-emerald-400">YU&apos;AM v2.0 • Dashboard IoT</h1>
            <p className="text-xs text-slate-400">Monitoreo de Biorreactores & MQ-135</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-xs font-medium">
            🔒 Privacy-by-Design Activo
          </span>
          <Link href="/" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700">
            ← Inicio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 text-sm text-emerald-300">
            Cargando nodos y telemetría…
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
            Mostrando datos de demostración por error de conexión: {error}
          </div>
        )}
        {/* Top bar: Node Selector & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-emerald-900/40 backdrop-blur shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📡</span>
            <div>
              <label className="text-xs text-slate-400 block font-medium">Nodo ESP32 Seleccionado</label>
              <select
                className="bg-slate-950 border border-emerald-800/60 rounded-xl px-3 py-1.5 text-sm text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 mt-0.5"
                value={selectedNodo || ''}
                onChange={(e) => setSelectedNodo(e.target.value)}
              >
                {nodos.map((nodo) => (
                  <option key={nodo.id} value={nodo.id}>
                    {nodo.nombre_nodo} ({nodo.estado})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${currentNode?.estado === 'activo' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="text-slate-300 font-medium capitalize">Estado: {currentNode?.estado || 'activo'}</span>
            </div>
            <div className="text-slate-400 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              📍 Ubicación: <span className="text-slate-200 font-mono">Alta Verapaz (Protegida)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CO2 PPM */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">☁️</div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">CO₂ (MQ-135)</p>
            <div className="text-3xl font-extrabold text-emerald-400 mb-2">
              {latest ? `${latest.ppm_co2.toFixed(1)}` : '—'} <span className="text-sm font-normal text-slate-400">PPM</span>
            </div>
            <p className="text-xs text-emerald-500/80">Optimal capture range (&lt; 450 PPM)</p>
          </div>

          {/* Calidad de Aire */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">🍃</div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Calidad del Aire</p>
            <div className="text-3xl font-extrabold text-teal-300 mb-2">
              {latest ? `${latest.calidad_aire.toFixed(1)}` : '—'} <span className="text-sm font-normal text-slate-400">% AQI</span>
            </div>
            <p className="text-xs text-teal-400/80">Calibrado para entorno biológico</p>
          </div>

          {/* Temperatura */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">🌡️</div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Temperatura</p>
            <div className="text-3xl font-extrabold text-cyan-400 mb-2">
              {latest ? `${latest.temperatura.toFixed(1)}` : '—'} <span className="text-sm font-normal text-slate-400">°C</span>
            </div>
            <p className="text-xs text-cyan-500/80">Estable en biorreactor</p>
          </div>

          {/* Humedad */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">💧</div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Humedad Relativa</p>
            <div className="text-3xl font-extrabold text-emerald-300 mb-2">
              {latest ? `${latest.humedad.toFixed(1)}` : '—'} <span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <p className="text-xs text-emerald-400/80">Monitoreo de biomasa</p>
          </div>
        </div>

        {/* Detailed Logs & Live Table */}
        <div className="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
              <span>📊</span> Historial de Telemetría en Tiempo Real
            </h3>
            <span className="text-xs text-slate-400">Actualizado vía Supabase Realtime & ESP32</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/40 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">CO₂ (PPM)</th>
                  <th className="py-3 px-4">Calidad Aire</th>
                  <th className="py-3 px-4">Temp (°C)</th>
                  <th className="py-3 px-4">Humedad (%)</th>
                  <th className="py-3 px-4">Búfer Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20 font-mono text-xs">
                {telemetriaList.length > 0 ? (
                  telemetriaList.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(item.created_at).toLocaleTimeString()} ({new Date(item.created_at).toLocaleDateString()})
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{item.ppm_co2.toFixed(2)}</td>
                      <td className="py-3 px-4 text-teal-300">{item.calidad_aire.toFixed(2)}</td>
                      <td className="py-3 px-4 text-cyan-300">{item.temperatura.toFixed(2)}</td>
                      <td className="py-3 px-4 text-emerald-200">{item.humedad.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {item.bufer_local ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-sans">
                            Sincronizado (Búfer)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-sans">
                            Directo Realtime
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-sm">
                      No hay registros de telemetría disponibles para este nodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-500">
        <p>YU&apos;AM v2.0 • Plan K&apos;atun 2032 & ODS 3, 4, 11, 12, 13 • Guatemala</p>
      </footer>
    </div>
  )
}
