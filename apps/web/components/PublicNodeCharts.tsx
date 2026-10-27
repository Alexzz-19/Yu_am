'use client'

import { useEffect, useState } from 'react'
import TelemetryTrendChart, { type TelemetryChartPoint } from './TelemetryTrendChart'
import { FAIR_NODE } from '@/lib/fair-node'

const trends = [
  { key: 'ppm_value', label: 'CO₂ estimado' },
  { key: 'water_temperature', label: 'Temperatura' },
  { key: 'humidity', label: 'Humedad' },
  { key: 'light_lux', label: 'Luz' },
] as const

export default function PublicNodeCharts({ nodeId, refreshKey }: { nodeId: string; refreshKey: number }) {
  const requestKey = nodeId + ':' + refreshKey
  const [result, setResult] = useState<{ key: string; readings: TelemetryChartPoint[]; error: string; loading: boolean }>({ key: '', readings: [], error: '', loading: true })

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const endpoint = nodeId === FAIR_NODE.id
      ? '/api/nodes/official/readings'
      : '/api/nodes/public/' + encodeURIComponent(nodeId) + '/readings'
    void fetch(endpoint, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const result = await response.json() as { readings?: TelemetryChartPoint[]; error?: string }
        if (!response.ok) throw new Error(result.error ?? 'No se pudieron cargar las tendencias públicas.')
        return result
      })
      .then(response => { if (active) setResult({ key: requestKey, readings: response.readings ?? [], error: '', loading: false }) })
      .catch(reason => { if (active && !controller.signal.aborted) setResult({ key: requestKey, readings: [], error: reason instanceof Error ? reason.message : 'No se pudieron cargar las tendencias públicas.', loading: false }) })
    return () => { active = false; controller.abort() }
  }, [nodeId, refreshKey, requestKey])

  if (result.key !== requestKey || result.loading) return <p role="status" className="py-4 text-sm text-slate-600">Cargando tendencias de telemetría…</p>
  if (result.error) return <p role="alert" className="py-4 text-sm text-rose-800">{result.error}</p>
  return <div className="grid gap-4 lg:grid-cols-2">{trends.map(trend => <TelemetryTrendChart key={trend.key} metric={trend.key} title={trend.label} readings={result.readings} />)}</div>
}
