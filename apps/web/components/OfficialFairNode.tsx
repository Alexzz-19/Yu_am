'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { PublicNode } from '@/lib/database.types'
import { FAIR_NODE } from '@/lib/fair-node'
import Image from 'next/image'
import AnimatedMetric from './AnimatedMetric'
import PublicNodeCharts from './PublicNodeCharts'

const metrics = [
  { key: 'ppm', label: 'CO₂ estimado', unit: 'ppm', digits: 1 },
  { key: 'ph', label: 'pH', unit: '', digits: 2 },
  { key: 'temperature', label: 'Temperatura', unit: '°C', digits: 1 },
  { key: 'humidity', label: 'Humedad', unit: '%', digits: 1 },
  { key: 'lux', label: 'Luz', unit: 'lux', digits: 0 },
] as const

export default function OfficialFairNode({ refreshKey = 0 }: { refreshKey?: number }) {
  const [node, setNode] = useState<PublicNode | null>(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    let pending = false
    async function refresh() {
      if (pending) return
      pending = true
      try {
        const response = await fetch('/api/nodes/official', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('No se pudo actualizar el nodo oficial.')
        const result: { node: PublicNode | null } = await response.json()
        if (current) { setNode(result.node); setError('') }
      } catch (error) {
        if (current) setError(error instanceof Error ? error.message : 'No se pudo actualizar el nodo oficial.')
      } finally {
        pending = false
        if (current) setLoaded(true)
      }
    }
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 60000)
    const focus = () => { void refresh() }
    window.addEventListener('focus', focus)
    return () => { current = false; controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', focus) }
  }, [retry, refreshKey])

  return <section aria-labelledby="fair-node-title" className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
      <div className="min-w-0"><p className="text-sm font-semibold text-emerald-700">Nodo oficial de la feria</p><h2 id="fair-node-title" className="mt-1 break-words text-xl font-bold text-slate-900">{node?.nombre_nodo ?? FAIR_NODE.name}</h2><p className="mt-2 text-sm text-slate-600">{node?.algae_type ?? FAIR_NODE.algae_type} · {node?.city ?? FAIR_NODE.city}, {node?.country ?? FAIR_NODE.country}</p><p className="mt-1 text-sm text-slate-600">{node?.board_type ?? FAIR_NODE.board_type}</p></div>
      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">{node ? node.is_demo_vip ? 'VIP · 1 lectura cada 10 segundos' : 'Nodo estándar · 1 lectura cada 30 minutos' : loaded ? 'Pendiente de conexión' : 'Preparando nodo oficial'}</span>
    </div>
    <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-5">{metrics.map(metric => <div key={metric.key}><dt className="text-sm text-slate-600">{metric.label}{metric.unit && ` (${metric.unit})`}</dt><dd className="mt-2 min-h-8 font-mono text-2xl font-semibold tabular-nums text-emerald-700"><AnimatedMetric value={node?.telemetry?.last[metric.key]} digits={metric.digits} unit="" loading={!loaded} /></dd></div>)}</dl>
    {node && <div className="border-t border-slate-100 p-5 sm:p-6"><PublicNodeCharts nodeId={node.id} refreshKey={refreshKey} /></div>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-2 text-xs leading-5 text-slate-600">{!loaded && <Image src="/images/yum/yum-working.webp?v=20261025-alpha" alt="Yum carga las métricas del nodo oficial" width={34} height={42} className="animate-float h-9 w-auto object-contain" />}{node?.ultimo_envio ? `Última lectura: ${new Date(node.ultimo_envio).toLocaleString('es-GT')}.` : loaded ? 'Esperando la primera lectura del fotobiorreactor.' : 'Yum está consultando el nodo.'} Escucha cambios de Supabase Realtime con consulta de respaldo cada minuto.</div><Link href="/perfil" className="text-sm font-semibold text-emerald-700 underline underline-offset-4">Configurar mi hardware</Link></div>
    {error && <p role="alert" className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">{error} <button type="button" className="font-semibold underline" onClick={() => setRetry(value => value + 1)}>Reintentar</button></p>}
  </section>
}
