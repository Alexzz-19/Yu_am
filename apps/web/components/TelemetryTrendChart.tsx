'use client'

import { useReducedMotion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type TelemetryChartPoint = {
  created_at: string
  ppm_value: number | null
  water_temperature: number | null
  humidity: number | null
  light_lux: number | null
}

export type TelemetryChartKey = 'ppm_value' | 'water_temperature' | 'humidity' | 'light_lux'

const config: Record<TelemetryChartKey, { label: string; unit: string; color: string; digits: number }> = {
  ppm_value: { label: 'CO₂ estimado', unit: 'ppm', color: '#047857', digits: 1 },
  water_temperature: { label: 'Temperatura', unit: '°C', color: '#c2410c', digits: 1 },
  humidity: { label: 'Humedad', unit: '%', color: '#0369a1', digits: 1 },
  light_lux: { label: 'Luz', unit: 'lux', color: '#a16207', digits: 0 },
}

function shortTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
}

export default function TelemetryTrendChart({ title, metric, readings }: { title?: string; metric: TelemetryChartKey; readings: TelemetryChartPoint[] }) {
  const reducedMotion = useReducedMotion()
  const chart = config[metric]
  const data = readings.filter(reading => typeof reading[metric] === 'number' && Number.isFinite(reading[metric]))
  return <section aria-label={title ?? 'Tendencia de ' + chart.label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="font-semibold text-slate-900">{title ?? 'Tendencia de ' + chart.label}</h3>
      <span className="text-xs text-slate-600">{data.length} {data.length === 1 ? 'lectura' : 'lecturas'} · {chart.unit}</span>
    </div>
    {data.length ? <div role="img" aria-label={chart.label + ': gráfico de ' + data.length + ' lecturas registradas'}>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} margin={{ top: 8, right: 10, bottom: 2, left: -14 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="created_at" tickFormatter={shortTime} tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} minTickGap={28} />
          <YAxis width={58} tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            labelFormatter={value => new Date(String(value)).toLocaleString('es-GT')}
            formatter={value => [typeof value === 'number' ? value.toFixed(chart.digits) + ' ' + chart.unit : 'Sin datos', chart.label]}
            contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1', color: '#0f172a', fontSize: 12 }}
          />
          <Line type="monotone" dataKey={metric} name={chart.label} stroke={chart.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={!reducedMotion} animationDuration={550} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div> : <p className="flex h-[210px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-600">Sin lecturas disponibles para esta tendencia.</p>}
    <p className="mt-2 text-xs text-slate-500">Valores de telemetría recibidos, en orden cronológico.</p>
  </section>
}
