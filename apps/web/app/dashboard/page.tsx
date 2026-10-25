'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import Sparkline from '@/components/Sparkline'
import type { NodoIoT, TelemetriaMq135, Reactor, Reading, UbicacionOfuscada } from '@/lib/database.types'

// ─────────────────────────────────────────────────────────────────────────────
// Auth (Supabase): el acceso se centraliza en /login.
// ─────────────────────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Error desconocido al consultar Supabase'
}

function fmt(value: number | null | undefined, digits = 1): string {
  return value !== null && value !== undefined ? value.toFixed(digits) : '—'
}

// ── Datos de demostración (fallback si la base está vacía o sin acceso) ──

const MOCK_UBICACION: UbicacionOfuscada = {
  zona: 'Alta Verapaz (Ofuscado)',
  lat: 15.47,
  lng: -90.37,
}

function mockNode(nombre: string): NodoIoT {
  return {
    id: 'mock-nodo-1',
    usuario_id: null,
    nombre_nodo: nombre,
    avatar_id: null,
    ubicacion_ofuscada: MOCK_UBICACION,
    estado: 'activo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function mockTelemetria(nodoId: string): TelemetriaMq135[] {
  const ahora = Date.now()
  const lectura = (
    id: number,
    ppm_co2: number,
    calidad_aire: number,
    temperatura: number,
    humedad: number,
    bufer_local: boolean,
    minutosAtras: number,
  ): TelemetriaMq135 => ({
    id,
    nodo_id: nodoId,
    ppm_co2,
    ph: null,
    calidad_aire,
    temperatura,
    humedad,
    bufer_local,
    created_at: new Date(ahora - 60000 * minutosAtras).toISOString(),
    updated_at: new Date(ahora - 60000 * minutosAtras).toISOString(),
  })

  return [
    lectura(1, 412.5, 94.2, 26.4, 78.5, false, 0),
    lectura(2, 415.1, 93.8, 26.5, 78.1, false, 5),
    lectura(3, 409.8, 95.0, 26.2, 79.0, true, 10),
    lectura(4, 417.3, 92.6, 26.7, 77.6, false, 15),
    lectura(5, 411.9, 94.0, 26.3, 78.3, false, 20),
  ]
}

function mockReactor(): Reactor {
  return {
    id: 'mock-reactor-1',
    usuario_id: null,
    nombre: 'Biorreactor Q’eqchi’ Alpha-1',
    tipo_cultivo: 'Spirulina platensis',
    estado: 'activo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function mockReadings(reactorId: string): Reading[] {
  const ahora = Date.now()
  const lectura = (id: number, ph: number, oxigeno: number, temp: number, minutosAtras: number): Reading => ({
    id,
    reactor_id: reactorId,
    temperatura: temp,
    ph,
    oxigeno_disuelto: oxigeno,
    created_at: new Date(ahora - 60000 * minutosAtras).toISOString(),
    updated_at: new Date(ahora - 60000 * minutosAtras).toISOString(),
  })

  return [
    lectura(1, 7.2, 6.8, 26.4, 0),
    lectura(2, 7.2, 6.9, 26.5, 5),
    lectura(3, 7.1, 6.7, 26.2, 10),
    lectura(4, 7.3, 7.0, 26.6, 15),
  ]
}

export default function DashboardPage() {
  // Auth
  const [session, setSession] = useState<Session | null>(null)

  // Nodos + telemetría MQ-135
  const [nodos, setNodos] = useState<NodoIoT[]>([])
  const [selectedNodo, setSelectedNodo] = useState<string | null>(null)
  const [telemetriaList, setTelemetriaList] = useState<TelemetriaMq135[]>([])

  // Reactores + lecturas del cultivo
  const [reactores, setReactores] = useState<Reactor[]>([])
  const [selectedReactor, setSelectedReactor] = useState<string | null>(null)
  const [readingsList, setReadingsList] = useState<Reading[]>([])

  // UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Auth: sesión y listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
  }

  // ── Nodos IoT ──
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
          const nodo = mockNode('Biorreactor Q’eqchi’ Alpha-1')
          setNodos([nodo])
          setSelectedNodo(nodo.id)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error('Error fetching nodos:', message)
        setError(message)
        const nodo = mockNode('Biorreactor Q’eqchi’ Alpha-1 (Demo)')
        setNodos([nodo])
        setSelectedNodo(nodo.id)
      } finally {
        setLoading(false)
      }
    }

    fetchNodos()
  }, [])

  // ── Telemetría MQ-135 + Realtime ──
  useEffect(() => {
    if (!selectedNodo) return
    const nodoId = selectedNodo

    async function fetchTelemetria() {
      if (selectedNodo?.startsWith('mock-')) {
        setTelemetriaList(mockTelemetria(selectedNodo))
        return
      }

      try {
        const { data, error } = await supabase
          .from('telemetria_mq135')
          .select('*')
          .eq('nodo_id', nodoId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setTelemetriaList((data ?? []) as TelemetriaMq135[])
      } catch (err: unknown) {
        console.error('Error fetching telemetry:', getErrorMessage(err))
        setTelemetriaList([])
      }
    }

    fetchTelemetria()

    const channel = supabase
      .channel('public:telemetria_mq135')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetria_mq135',
          filter: `nodo_id=eq.${selectedNodo}`,
        },
        (payload) => {
          const nuevaLectura = payload.new as TelemetriaMq135
          setTelemetriaList((prev) => [nuevaLectura, ...prev].slice(0, 50))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedNodo])

  // ── Reactores ──
  useEffect(() => {
    async function fetchReactores() {
      try {
        const { data, error } = await supabase.from('reactors').select('*').limit(10)
        if (error) throw error

        const reactoresData = (data ?? []) as Reactor[]
        if (reactoresData.length > 0) {
          setReactores(reactoresData)
          setSelectedReactor(reactoresData[0].id)
        } else {
          const reactor = mockReactor()
          setReactores([reactor])
          setSelectedReactor(reactor.id)
        }
      } catch (err: unknown) {
        console.error('Error fetching reactors:', getErrorMessage(err))
        const reactor = mockReactor()
        setReactores([reactor])
        setSelectedReactor(reactor.id)
      }
    }

    fetchReactores()
  }, [])

  // ── Lecturas del reactor (pH, O₂, temperatura) + Realtime ──
  useEffect(() => {
    if (!selectedReactor) return
    const reactorId = selectedReactor

    async function fetchReadings() {
      if (selectedReactor?.startsWith('mock-')) {
        setReadingsList(mockReadings(selectedReactor))
        return
      }

      try {
        const { data, error } = await supabase
          .from('readings')
          .select('*')
          .eq('reactor_id', reactorId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setReadingsList((data ?? []) as Reading[])
      } catch (err: unknown) {
        console.error('Error fetching readings:', getErrorMessage(err))
        setReadingsList([])
      }
    }

    fetchReadings()

    const channel = supabase
      .channel('public:readings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'readings',
          filter: `reactor_id=eq.${selectedReactor}`,
        },
        (payload) => {
          const nuevaLectura = payload.new as Reading
          setReadingsList((prev) => [nuevaLectura, ...prev].slice(0, 50))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedReactor])

  const latest = telemetriaList[0] ?? null
  const latestReading = readingsList[0] ?? null
  const currentNode = nodos.find((n) => n.id === selectedNodo)
  const currentReactor = reactores.find((r) => r.id === selectedReactor)

  const co2Series = telemetriaList
    .map((t) => t.ppm_co2)
    .filter((v): v is number => v !== null)
    .reverse()
  const phSeries = readingsList
    .map((r) => r.ph)
    .filter((v): v is number => v !== null)
    .reverse()

  return (
    <div className="min-h-screen bg-[#03110D] text-[#E8F5F0] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-emerald-900/40 bg-[#03110D]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition"
          >
            🌱
          </Link>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-emerald-400">YU&apos;AM • Dashboard IoT</h1>
            <p className="text-xs text-[#7FA79A]">Monitoreo de biorreactores & MQ-135</p>
          </div>
          <Image src="/images/yum/yum-working.webp?v=20261025-alpha" alt="Yum analiza las métricas de los sensores del reactor" width={181} height={216} className="h-10 w-auto object-contain sm:h-12" />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-xs font-medium">
            🔒 Privacy-by-Design Activo
          </span>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-[#9CC3B6] sm:block">{session.user.email}</span>
              <button
                type="button"
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/30"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading && (
          <div className="p-4 rounded-2xl bg-emerald-900/20 border border-emerald-900/40 text-sm text-emerald-300">
            Cargando nodos y telemetría…
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
            Mostrando datos de demostración por error de conexión: {error}
          </div>
        )}

        {/* Selector de nodo + estado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#061A14]/70 p-4 rounded-2xl border border-emerald-900/40 backdrop-blur shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📡</span>
            <div>
              <label className="text-xs text-[#7FA79A] block font-medium">Nodo ESP32 seleccionado</label>
              <select
                className="bg-[#03110D] border border-emerald-800/60 rounded-xl px-3 py-1.5 text-sm text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 mt-0.5"
                value={selectedNodo ?? ''}
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
              <span
                className={`h-3 w-3 rounded-full ${
                  currentNode?.estado === 'activo' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              <span className="text-slate-300 font-medium capitalize">Estado: {currentNode?.estado ?? 'activo'}</span>
            </div>
            <div className="text-[#7FA79A] text-xs bg-[#03110D]/80 px-3 py-1.5 rounded-xl border border-slate-800">
              📍 Ubicación: <span className="text-slate-200 font-mono">Alta Verapaz (Protegida)</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de telemetría MQ-135 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#061A14]/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">☁️</div>
            <p className="text-xs uppercase tracking-wider text-[#7FA79A] font-semibold mb-1">CO₂ (MQ-135)</p>
            <div className="text-3xl font-extrabold text-emerald-400 mb-2">
              {fmt(latest?.ppm_co2)} <span className="text-sm font-normal text-[#7FA79A]">PPM</span>
            </div>
            <p className="text-xs text-emerald-500/80">Rango óptimo de captura (&lt; 450 PPM)</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#061A14]/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">🍃</div>
            <p className="text-xs uppercase tracking-wider text-[#7FA79A] font-semibold mb-1">Calidad del aire</p>
            <div className="text-3xl font-extrabold text-teal-300 mb-2">
              {fmt(latest?.calidad_aire)} <span className="text-sm font-normal text-[#7FA79A]">% AQI</span>
            </div>
            <p className="text-xs text-teal-400/80">Calibrado para entorno biológico</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#061A14]/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">🌡️</div>
            <p className="text-xs uppercase tracking-wider text-[#7FA79A] font-semibold mb-1">Temperatura</p>
            <div className="text-3xl font-extrabold text-cyan-400 mb-2">
              {fmt(latest?.temperatura)} <span className="text-sm font-normal text-[#7FA79A]">°C</span>
            </div>
            <p className="text-xs text-cyan-500/80">Estable en biorreactor</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#061A14]/80 border border-emerald-900/40 shadow-xl backdrop-blur relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition">💧</div>
            <p className="text-xs uppercase tracking-wider text-[#7FA79A] font-semibold mb-1">Humedad relativa</p>
            <div className="text-3xl font-extrabold text-emerald-300 mb-2">
              {fmt(latest?.humedad)} <span className="text-sm font-normal text-[#7FA79A]">%</span>
            </div>
            <p className="text-xs text-emerald-400/80">Monitoreo de biomasa</p>
          </div>
        </div>

        {/* Gráficos de tendencia + estado del reactor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia CO₂ */}
          <div className="bg-[#061A14]/80 border border-emerald-900/40 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                <span>📈</span> Tendencia CO₂
              </h3>
              <span className="text-xs text-[#7FA79A] font-mono">{co2Series.length} lecturas</span>
            </div>
            <Sparkline data={co2Series} stroke="#34d399" />
          </div>

          {/* Estado del fotobiorreactor */}
          <div className="bg-[#061A14]/80 border border-emerald-900/40 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                <span>🧪</span> Estado del fotobiorreactor
              </h3>
              {currentReactor && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentReactor.estado === 'activo'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                  }`}
                >
                  {currentReactor.estado}
                </span>
              )}
            </div>

            {currentReactor && (
              <p className="text-xs text-[#7FA79A] mb-4">
                {currentReactor.nombre}
                {currentReactor.tipo_cultivo ? ` · ${currentReactor.tipo_cultivo}` : ''}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7FA79A] block mb-1">pH</span>
                <span className="text-2xl font-extrabold text-emerald-400">{fmt(latestReading?.ph, 2)}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7FA79A] block mb-1">O₂ disuelto</span>
                <span className="text-2xl font-extrabold text-teal-300">
                  {fmt(latestReading?.oxigeno_disuelto)} <span className="text-xs font-normal text-[#7FA79A]">mg/L</span>
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#7FA79A] block mb-1">Temperatura</span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {fmt(latestReading?.temperatura)} <span className="text-xs font-normal text-[#7FA79A]">°C</span>
                </span>
              </div>
            </div>

            <Sparkline data={phSeries} stroke="#2dd4bf" />
          </div>
        </div>

        {/* Historial en vivo */}
        <div className="bg-[#061A14]/80 border border-emerald-900/40 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
              <span>📊</span> Historial de telemetría en tiempo real
            </h3>
            <span className="text-xs text-[#7FA79A]">Actualizado vía Supabase Realtime & ESP32</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/40 text-[#7FA79A] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">CO₂ (PPM)</th>
                  <th className="py-3 px-4">Calidad aire</th>
                  <th className="py-3 px-4">Temp (°C)</th>
                  <th className="py-3 px-4">Humedad (%)</th>
                  <th className="py-3 px-4">Búfer local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20 font-mono text-xs">
                {telemetriaList.length > 0 ? (
                  telemetriaList.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(item.created_at).toLocaleTimeString()} ({new Date(item.created_at).toLocaleDateString()})
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{fmt(item.ppm_co2, 2)}</td>
                      <td className="py-3 px-4 text-teal-300">{fmt(item.calidad_aire, 2)}</td>
                      <td className="py-3 px-4 text-cyan-300">{fmt(item.temperatura, 2)}</td>
                      <td className="py-3 px-4 text-emerald-200">{fmt(item.humedad, 2)}</td>
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
                    <td colSpan={6} className="py-8 text-center text-[#7FA79A] font-sans text-sm">
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
      <footer className="border-t border-emerald-900/40 px-6 py-6 text-center text-xs text-[#4E7568]">
        <p>YU&apos;AM v2.0 • Plan K&apos;atun 2032 & ODS 3, 4, 11, 12, 13 • Guatemala</p>
      </footer>
    </div>
  )
}
