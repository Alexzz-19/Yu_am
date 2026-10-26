export const BOARD_TYPES = ['ESP32', 'Arduino', 'Raspberry Pi'] as const
export const ALGAE_TYPES = ['Spirulina', 'Chlorella vulgaris', 'Otra / Por definir'] as const
export const SENSOR_OPTIONS = [
  { value: 'ph', label: 'pH' }, { value: 'temperature', label: 'Temperatura' },
  { value: 'lux', label: 'Luxes' }, { value: 'pm25', label: 'PM2.5' },
] as const
export type SensorType = typeof SENSOR_OPTIONS[number]['value']
export type HardwareConfig = { board_type: string; algae_type: string; sensors: SensorType[] }
export const NODE_FIELDS = 'id,user_id,name,country,city,lat,lng,created_at,board_type,algae_type,sensors' as const

export function parseHardware(value: Record<string, unknown>): HardwareConfig {
  const board = typeof value.board_type === 'string' ? value.board_type.trim() : ''
  const algae = typeof value.algae_type === 'string' ? value.algae_type.trim() : ''
  if (board.length < 2 || board.length > 80 || algae.length < 2 || algae.length > 100) throw new Error('Selecciona la placa y la cepa de alga.')
  if (!Array.isArray(value.sensors) || value.sensors.some(sensor => !SENSOR_OPTIONS.some(item => item.value === sensor))) throw new Error('La selección de sensores no es válida.')
  return { board_type: board, algae_type: algae, sensors: [...new Set(value.sensors)] as SensorType[] }
}
