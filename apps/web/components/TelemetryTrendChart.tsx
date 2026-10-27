'use client'

import { useReducedMotion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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

function exactDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const datePart = date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })
  const capitalizedDate = datePart.replace(/[a-záéíóúñ]+/i, month => month.charAt(0).toLocaleUpperCase('es-GT') + month.slice(1))
  const timePart = date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true })
  return capitalizedDate + ', ' + timePart
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
    {data.length ? <div className={metric === 'ppm_value' ? 'grid gap-4 xl:grid-cols-2' : ''}>
      <div role="img" aria-label={chart.label + ': gráfico de líneas con ' + data.length + ' lecturas registradas'}>
        <p className="mb-1 text-xs font-medium text-slate-600">Tendencia (líneas)</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 8, right: 10, bottom: 32, left: -14 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="created_at" tickFormatter={exactDateTime} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} minTickGap={20} interval="preserveStartEnd" angle={-32} textAnchor="end" height={54} />
            <YAxis width={58} tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              labelFormatter={value => exactDateTime(String(value))}
              formatter={value => [typeof value === 'number' ? value.toFixed(chart.digits) + ' ' + chart.unit : 'Sin datos', chart.label]}
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1', color: '#0f172a', fontSize: 12 }}
            />
            <Line type="monotone" dataKey={metric} name={chart.label} stroke={chart.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={!reducedMotion} animationDuration={550} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {metric === 'ppm_value' && <div role="img" aria-label="CO₂ estimado: gráfico de barras para comparar las concentraciones registradas">
        <p className="mb-1 text-xs font-medium text-slate-600">Comparación de picos (barras)</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 8, right: 10, bottom: 32, left: -14 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="created_at" tickFormatter={exactDateTime} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} minTickGap={20} interval="preserveStartEnd" angle={-32} textAnchor="end" height={54} />
            <YAxis width={58} tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              labelFormatter={value => exactDateTime(String(value))}
              formatter={value => [typeof value === 'number' ? value.toFixed(chart.digits) + ' ' + chart.unit : 'Sin datos', chart.label]}
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1', color: '#0f172a', fontSize: 12 }}
            />
            <Bar dataKey="ppm_value" name={chart.label} fill="#059669" radius={[4, 4, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={550} />
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </div> : <p className="flex h-[210px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-600">Sin lecturas disponibles para esta tendencia.</p>}
    <p className="mt-2 text-xs text-slate-500">Valores de telemetría recibidos, en orden cronológico.</p>
  </section>
}
