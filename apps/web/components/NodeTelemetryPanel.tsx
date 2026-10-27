'use client'

import { useEffect, useState } from 'react'
import type { NodeSummary } from '@/lib/database.types'
import { DASHBOARD_METRICS, formatMetric, type DashboardReadings } from '@/lib/dashboard'
import { nodeRequest } from '@/lib/node-api'
import { supabase } from '@/lib/supabaseClient'
import Sparkline from './Sparkline'
import { telemetryInterval } from '@/lib/fair-node'

const panelClass = 'rounded-2xl border border-slate-200 bg-white'
function time(value: string) { return new Date(value).toLocaleString('es-GT') }

export default function NodeTelemetryPanel({ node, userId }: { node: NodeSummary; userId: string }) {
  const [data, setData] = useState<DashboardReadings | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [connection, setConnection] = useState<'connecting' | 'live' | 'polling'>('connecting')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let current = true
    let revision = 0
    let channel: ReturnType<typeof supabase.channel> | null = null
    const controller = new AbortController()
    async function refresh() {
      const request = ++revision
      try {
        const result = await nodeRequest<DashboardReadings>(`/api/nodes/${node.id}/readings`, 'GET', undefined, controller.signal)
        if (!current || request !== revision) return
        setData(result)
        setError('')
        if (!channel && result.reactor) {
          channel = supabase.channel(`dashboard:${userId}:${result.reactor.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'readings', filter: `reactor_id=eq.${result.reactor.id}` }, () => { void refresh() })
            .subscribe(status => {
              if (!current) return
              if (status === 'SUBSCRIBED') { setConnection('live'); void refresh() }
              else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) setConnection('polling')
            })
        } else if (!result.reactor) setConnection('polling')
      } catch (error) {
        if (current && request === revision) setError(error instanceof Error ? error.message : 'No se pudieron cargar las lecturas.')
      } finally {
        if (current && request === revision) setLoading(false)
      }
    }
    void refresh()
    // Recupera lecturas si Realtime se interrumpe o el navegador estuvo suspendido.
    const timer = window.setInterval(() => { void refresh() }, node.is_demo_vip ? 10000 : 60000)
    const focus = () => { void refresh() }
    window.addEventListener('focus', focus)
    return () => {
      current = false
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', focus)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [node.id, node.is_demo_vip, userId, retry])

  const readings = data?.readings ?? []
  const latest = readings[0]
  return <section aria-label={`Telemetría de ${node.name}`} className="space-y-5">
    <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4 p-5`}>
      <div><h2 className="text-xl font-bold text-slate-900">{node.name}</h2><p className="mt-1 text-sm text-slate-600">{node.city}, {node.country} · {node.algae_type}</p>{node.university && <p className="mt-1 text-sm text-slate-600">{node.university}</p>}<p className="mt-2 text-xs text-slate-600">{latest ? `Última lectura recibida: ${time(latest.created_at)}` : 'Esperando la primera lectura del nodo.'}</p></div>
      <div className="flex flex-wrap items-center gap-3"><span role="status" className="text-xs text-emerald-700">{connection === 'live' ? 'Realtime conectado' : connection === 'connecting' ? 'Conectando telemetría…' : node.is_demo_vip ? 'Consulta automática cada 10 segundos' : 'Consulta automática cada minuto'}</span><button type="button" onClick={() => setRetry(value => value + 1)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">Actualizar</button></div>
    </div>
    {loading && <p role="status" className="text-sm text-emerald-700">Cargando lecturas de este nodo…</p>}
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No se pudo actualizar la telemetría. {error} Usa «Actualizar» para reintentar.</p>}
    {!loading && !error && !data?.reactor && <p role="status" className="rounded-xl border border-amber-200 p-4 text-sm text-amber-900">Este nodo aún no tiene un reactor vinculado. Guarda su configuración desde tu perfil para sincronizarlo.</p>}
    <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
      {DASHBOARD_METRICS.map(metric => {
        const reading = readings.find(row => row[metric.key] !== null && Number.isFinite(row[metric.key]))
        const value = reading?.[metric.key]
        return <article key={metric.key} className="bg-white p-5"><h3 className="text-sm font-medium text-slate-600">{metric.label}</h3><p className="mt-3 break-words font-mono text-2xl font-semibold tabular-nums text-emerald-700">{formatMetric(value, metric.digits)}{value != null && <span className="ml-2 font-sans text-xs text-slate-600">{metric.unit}</span>}</p><p className="mt-3 text-xs leading-5 text-slate-600">{reading ? time(reading.created_at) : 'Aún no hay una medición de este sensor.'}</p></article>
      })}
    </div>
    <p className="text-xs leading-5 text-slate-600">Cada indicador muestra su última medición disponible entre las 96 lecturas más recientes. La señal de CO₂ del MQ-135 requiere calibración. El nodo admite un envío cada {telemetryInterval(node.is_demo_vip) === 10 ? '10 segundos (VIP de feria)' : '30 minutos'}.</p>
    <div className="grid gap-5 lg:grid-cols-2">{DASHBOARD_METRICS.filter(metric => metric.key === 'ppm_value' || metric.key === 'ph_value').map(metric => {
      const values = readings.map(row => row[metric.key]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value)).reverse()
      return <article key={metric.key} className={`${panelClass} p-5`}><div className="mb-5 flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Tendencia de {metric.label}</h3><span className="text-xs text-slate-600">{values.length} mediciones</span></div><Sparkline data={values} /><p className="mt-3 text-xs text-slate-600">Valores recibidos, en orden cronológico.</p></article>
    })}</div>
    <div className={`${panelClass} overflow-hidden`}>
      <h3 className="px-5 py-4 text-lg font-semibold text-slate-900">Historial del nodo</h3>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Últimas 96 lecturas del nodo {node.name}</caption><thead className="border-y border-slate-200 bg-slate-50 text-slate-600"><tr><th scope="col" className="whitespace-nowrap px-5 py-3">Fecha y hora</th>{DASHBOARD_METRICS.map(metric => <th key={metric.key} scope="col" className="whitespace-nowrap px-4 py-3">{metric.label}{metric.unit && ` (${metric.unit})`}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 text-slate-900">{readings.map(row => <tr key={row.id}><th scope="row" className="whitespace-nowrap px-5 py-3 font-normal">{time(row.created_at)}</th>{DASHBOARD_METRICS.map(metric => <td key={metric.key} className="whitespace-nowrap px-4 py-3 font-mono tabular-nums">{formatMetric(row[metric.key], metric.digits)}</td>)}</tr>)}{!loading && readings.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-600">Todavía no hay lecturas. Configura el envío de telemetría con la clave de este nodo desde tu perfil.</td></tr>}</tbody></table></div>
    </div>
  </section>
}
