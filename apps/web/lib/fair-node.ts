// Identidad pública del nodo de la feria. La clave de ingesta se guarda solo en Supabase.
export const FAIR_NODE = {
  id: '18e57a0c-6a18-4f18-9e18-1ed0018a2026',
  name: 'Fotobiorreactor INED La Estancia - Zona 18',
  breadcrumb: 'INED La Estancia',
  country: 'Guatemala',
  city: 'Ciudad de Guatemala',
  algae_type: 'Chlorella vulgaris',
  board_type: 'Arduino + Script Puente Python',
  university: 'INED La Estancia',
  category: 'Investigación',
} as const

export const VIP_INTERVAL_SECONDS = 10
export const STANDARD_INTERVAL_SECONDS = 30 * 60

export function telemetryInterval(isDemoVip?: boolean) {
  return isDemoVip === true ? VIP_INTERVAL_SECONDS : STANDARD_INTERVAL_SECONDS
}
