'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  // Simulated live metrics for initial preview dashboard
  const [metrics, setMetrics] = useState({
    temperature: 26.4,
    ph: 7.2,
    dissolvedOxygen: 6.8,
    co2: 412.5,
    status: 'Óptimo'
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        temperature: +(prev.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
        ph: +(prev.ph + (Math.random() * 0.1 - 0.05)).toFixed(2),
        dissolvedOxygen: +(prev.dissolvedOxygen + (Math.random() * 0.2 - 0.1)).toFixed(1),
        co2: +(prev.co2 + (Math.random() * 2 - 1)).toFixed(1),
        status: 'Óptimo (Activo)'
      }))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Nav */}
      <header className="border-b border-emerald-900/40 backdrop-blur-md bg-slate-900/80 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-900/50">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-emerald-400">YU&apos;AM v2.0</h1>
            <p className="text-xs text-slate-400">Biotecnología & Plataforma IoT Q&apos;eqchi&apos;</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg shadow-emerald-600/30 text-xs">
            🚀 Ir al Dashboard IoT
          </Link>
        </nav>
      </header>

      {/* Hero & Live Metrics Preview */}
      <main className="flex-1 flex flex-col items-center px-6 py-12 max-w-6xl mx-auto w-full space-y-12">
        {/* Intro */}
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6 animate-pulse">
            ✨ MILAB Guatemala • Plan K&apos;atun 2032 & ODS 3, 4, 11, 12, 13
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
            Monitoreo Inteligente de Fotobiorreactores
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Democratizando la investigación biológica y la captura de CO₂ mediante nodos IoT con ESP32, sensores MQ-135 y arquitectura segura en Supabase con Privacy-by-Design.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30 transition">
              Ver Telemetría en Tiempo Real →
            </Link>
          </div>
        </div>

        {/* Live Photobioreactor Metrics Grid */}
        <div className="w-full bg-slate-900/80 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-emerald-900/40 gap-4">
            <div>
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <span>🧪</span> Fotobiorreactor Q&apos;eqchi&apos; Alpha-1 (Vista Previa en Vivo)
              </h3>
              <p className="text-xs text-slate-400">Simulación y telemetría de prueba activa para Vercel</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              Estado: {metrics.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temperatura */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">Temperatura</span>
              <div className="text-3xl font-extrabold text-cyan-400 mb-1">
                {metrics.temperature} <span className="text-sm font-normal text-slate-400">°C</span>
              </div>
              <p className="text-[11px] text-cyan-500/80">Rango óptimo: 25-28 °C</p>
            </div>

            {/* pH */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">pH del Medio</span>
              <div className="text-3xl font-extrabold text-emerald-400 mb-1">
                {metrics.ph} <span className="text-sm font-normal text-slate-400">pH</span>
              </div>
              <p className="text-[11px] text-emerald-500/80">Estable (Buffer biológico)</p>
            </div>

            {/* Oxígeno Disuelto */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">Oxígeno Disuelto</span>
              <div className="text-3xl font-extrabold text-teal-300 mb-1">
                {metrics.dissolvedOxygen} <span className="text-sm font-normal text-slate-400">mg/L</span>
              </div>
              <p className="text-[11px] text-teal-400/80">Alta tasa de aireación</p>
            </div>

            {/* CO2 MQ-135 */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">CO₂ (MQ-135)</span>
              <div className="text-3xl font-extrabold text-emerald-300 mb-1">
                {metrics.co2} <span className="text-sm font-normal text-slate-400">PPM</span>
              </div>
              <p className="text-[11px] text-emerald-400/80">Captura activa de carbono</p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Hardware IoT ESP32</h3>
            <p className="text-sm text-slate-400">
              Captura continua de calidad del aire (MQ-135), temperatura y humedad con búfer local ante fallas de red.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Privacy-by-Design</h3>
            <p className="text-sm text-slate-400">
              Ofuscación automatizada de coordenadas geográficas en mapas públicos para proteger la ubicación de nodos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Supabase Realtime</h3>
            <p className="text-sm text-slate-400">
              Base de datos relacional robusta con Row Level Security (RLS) y sincronización de eventos en tiempo real.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 YU&apos;AM v2.0 • MILAB • Plan K&apos;atun 2032 • ODS 3, 4, 11, 12, 13</p>
      </footer>
    </div>
  )
}
