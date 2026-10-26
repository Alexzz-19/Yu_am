export const BOARD_TYPES = ['ESP32', 'Arduino', 'Raspberry Pi'] as const
export const ALGAE_TYPES = ['Spirulina', 'Chlorella vulgaris', 'Scenedesmus obliquus', 'Otra / Por definir'] as const
export const NODE_CATEGORIES = ['Captura de Carbono', 'Tratamiento de Agua', 'Biomasa', 'Investigación'] as const
export const SENSOR_OPTIONS = [
  { value: 'ph', label: 'pH' }, { value: 'temperature', label: 'Temperatura' },
  { value: 'lux', label: 'Luxes' }, { value: 'pm25', label: 'PM2.5' },
  { value: 'humidity', label: 'Humedad' },
] as const
export type SensorType = typeof SENSOR_OPTIONS[number]['value']
export type HardwareConfig = { board_type: string; algae_type: string; sensors: SensorType[]; category?: string | null; university?: string | null }
export const NODE_FIELDS = 'id,user_id,name,country,city,lat,lng,created_at,board_type,algae_type,sensors,category,university' as const

export function parseHardware(value: Record<string, unknown>): HardwareConfig {
  const board = typeof value.board_type === 'string' ? value.board_type.trim() : ''
  const algae = typeof value.algae_type === 'string' ? value.algae_type.trim() : ''
  if (board.length < 2 || board.length > 80 || algae.length < 2 || algae.length > 100) throw new Error('Selecciona la placa y la cepa de alga.')
  if (!Array.isArray(value.sensors) || value.sensors.some(sensor => !SENSOR_OPTIONS.some(item => item.value === sensor))) throw new Error('La selección de sensores no es válida.')
  const metadata: Pick<HardwareConfig, 'category' | 'university'> = {}
  if ('category' in value) {
    if (value.category !== null && value.category !== '' && !NODE_CATEGORIES.some(category => category === value.category)) throw new Error('Selecciona una categoría válida.')
    metadata.category = typeof value.category === 'string' && value.category ? value.category : null
  }
  if ('university' in value) {
    if (value.university !== null && (typeof value.university !== 'string' || value.university.trim().length > 160)) throw new Error('La institución debe tener como máximo 160 caracteres.')
    metadata.university = typeof value.university === 'string' && value.university.trim() ? value.university.trim() : null
  }
  return { board_type: board, algae_type: algae, sensors: [...new Set(value.sensors)] as SensorType[], ...metadata }
}
