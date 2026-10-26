import type { PublicNode, TelemetryMetrics } from '@/lib/database.types'

const METRICS: Array<{ key: keyof TelemetryMetrics; label: string; unit: string; digits: number }> = [
  { key: 'ppm', label: 'Señal de aire', unit: 'ppm', digits: 1 },
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', digits: 1 },
  { key: 'temperature', label: 'Temperatura', unit: '°C', digits: 1 },
  { key: 'ph', label: 'pH', unit: '', digits: 2 },
  { key: 'lux', label: 'Luz', unit: 'lux', digits: 0 },
]

function format(value: number | null | undefined, digits: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'Sin datos'
}

export default function NodeTelemetrySummary({ node }: { node: PublicNode }) {
  return <div className="min-w-[260px] text-slate-800">
    <p className="font-semibold">{node.nombre_nodo}</p><p className="text-xs text-slate-600">{node.ubicacion_ofuscada.zona}</p>
    <p className="mt-2 text-xs">{node.ultimo_envio ? `Última lectura: ${new Date(node.ultimo_envio).toLocaleString('es-GT')}` : 'Esperando la primera lectura'}</p>
    <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-[10px]"><caption className="sr-only">Última telemetría y promedios de los últimos siete y treinta días</caption><thead><tr className="border-b border-slate-200"><th scope="col" className="py-2 pr-2">Indicador</th><th scope="col" className="px-1">Última</th><th scope="col" className="px-1">Prom. semanal</th><th scope="col" className="pl-1">Prom. mensual</th></tr></thead><tbody>{METRICS.map(metric => <tr key={metric.key} className="border-b border-slate-100"><th scope="row" className="py-2 pr-2 font-medium">{metric.label}{metric.unit && <span className="block font-normal text-slate-500">{metric.unit}</span>}</th><td className="px-1">{format(node.telemetry?.last[metric.key], metric.digits)}</td><td className="px-1">{format(node.telemetry?.week[metric.key], metric.digits)}</td><td className="pl-1">{format(node.telemetry?.month[metric.key], metric.digits)}</td></tr>)}</tbody></table></div>
    <p className="mt-2 text-[10px] text-slate-500">Lecturas: {node.telemetry?.weekSamples ?? 0} en 7 días; {node.telemetry?.monthSamples ?? 0} en 30 días.</p>
    <p className="mt-2 text-xs text-emerald-800">Se actualiza cada 30 minutos.</p><p className="text-[10px] text-slate-500">Ubicación aproximada. Promedios de lecturas del nodo.</p>
  </div>
}
