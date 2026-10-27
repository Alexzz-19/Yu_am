import 'server-only'
import { serverSupabase } from './api-server'
import type { PublicNode } from './database.types'

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
  return stats.map(node => {
    const info = byId.get(node.id)
    // Proyección pública explícita: excluye claves, propietario y coordenadas precisas.
    return {
      id: node.id, nombre_nodo: node.nombre_nodo,
      estado: info?.is_demo_vip ? (node.ultimo_envio && Date.now() - Date.parse(node.ultimo_envio) <= 30000 ? 'activo' : 'inactivo') : node.estado,
      ubicacion_ofuscada: node.ubicacion_ofuscada, ultimo_envio: node.ultimo_envio,
      telemetry: node.telemetry, country: info?.country, city: info?.city,
      algae_type: info?.algae_type, board_type: info?.board_type,
      category: info?.category ?? null, university: info?.university ?? null,
      is_demo_vip: info?.is_demo_vip === true,
    }
  })
}
