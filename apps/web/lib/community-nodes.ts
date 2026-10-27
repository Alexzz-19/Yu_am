import 'server-only'
import { serverSupabase } from './api-server'
import type { PublicNode } from './database.types'
import { FAIR_NODE } from './fair-node'
import { publicNodeReadings } from './public-node-readings'

export async function communityNodes(): Promise<PublicNode[]> {
  const client = serverSupabase(true)
  const { data: stats, error } = await client.rpc('yuam_public_node_stats')
  if (error) throw error
  if (!stats?.length) return []
  const { data: metadata, error: metadataError } = await client.from('nodes')
    .select('id,country,city,algae_type,board_type,category,university,is_demo_vip')
    .in('id', stats.map(node => node.id))
  if (metadataError) throw metadataError
  const byId = new Map(metadata?.map(node => [node.id, node]))
  const officialReadings = stats.some(node => node.id === FAIR_NODE.id)
    ? await publicNodeReadings(FAIR_NODE.id)
    : null
  return stats.map(node => {
    const info = byId.get(node.id)
    const legacyLatest = node.id === FAIR_NODE.id ? officialReadings?.readings[0] : undefined
    const telemetry = legacyLatest ? {
      last: {
        ...(node.telemetry?.last ?? { ppm: null, pm25: null, temperature: null, ph: null, lux: null, humidity: null }),
        ppm: legacyLatest.ppm_value,
        pm25: legacyLatest.pm25,
        temperature: legacyLatest.water_temperature,
        ph: legacyLatest.ph_value,
        lux: legacyLatest.light_lux,
        humidity: legacyLatest.humidity,
      },
      week: node.telemetry?.week ?? { ppm: null, pm25: null, temperature: null, ph: null, lux: null, humidity: null },
      month: node.telemetry?.month ?? { ppm: null, pm25: null, temperature: null, ph: null, lux: null, humidity: null },
      weekSamples: node.telemetry?.weekSamples ?? 0,
      monthSamples: node.telemetry?.monthSamples ?? 0,
    } : node.telemetry
    const lastSent = legacyLatest?.created_at ?? node.ultimo_envio
    // Proyección pública explícita: excluye claves, propietario y coordenadas precisas.
    return {
      id: node.id, nombre_nodo: node.nombre_nodo,
      estado: info?.is_demo_vip ? (lastSent && Date.now() - Date.parse(lastSent) <= 30000 ? 'activo' : 'inactivo') : node.estado,
      ubicacion_ofuscada: node.ubicacion_ofuscada, ultimo_envio: lastSent,
      telemetry, country: info?.country, city: info?.city,
      algae_type: info?.algae_type, board_type: info?.board_type,
      category: info?.category ?? null, university: info?.university ?? null,
      is_demo_vip: info?.is_demo_vip === true,
    }
  })
}
