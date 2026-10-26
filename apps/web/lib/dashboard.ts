import type { Database, HardwareReactor } from './database.types'

export type DashboardReading = Database['public']['Tables']['readings']['Row']
export type DashboardReadings = {
  reactor: Pick<HardwareReactor, 'id' | 'node_id' | 'name' | 'board_type' | 'algae_type'> | null
  readings: DashboardReading[]
}
export type DashboardMetadata = {
  name: string; country: string; city: string; algae_type: string
  category?: string | null; university?: string | null
}
export type DashboardFilters = { text: string; algae: string; category: string }

export const DASHBOARD_METRICS = [
  { key: 'ppm_value', label: 'CO₂ estimado', unit: 'ppm', digits: 1 },
  { key: 'ph_value', label: 'pH', unit: '', digits: 2 },
  { key: 'water_temperature', label: 'Temperatura', unit: '°C', digits: 1 },
  { key: 'humidity', label: 'Humedad', unit: '%', digits: 1 },
  { key: 'light_lux', label: 'Luz', unit: 'lux', digits: 0 },
] as const satisfies ReadonlyArray<{ key: keyof DashboardReading; label: string; unit: string; digits: number }>

export function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterDashboards<T extends DashboardMetadata>(nodes: T[], filters: DashboardFilters): T[] {
  const terms = normalized(filters.text).split(/\s+/).filter(Boolean)
  return nodes.filter(node => {
    const text = normalized([node.name, node.city, node.country, node.university ?? ''].join(' '))
    return terms.every(term => text.includes(term))
      && (!filters.algae || normalized(node.algae_type).includes(normalized(filters.algae)))
      && (!filters.category || normalized(node.category ?? '') === normalized(filters.category))
  })
}

export function formatMetric(value: number | null | undefined, digits = 1) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'Sin datos'
}
