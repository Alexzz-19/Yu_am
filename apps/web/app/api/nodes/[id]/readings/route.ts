import { ApiError, apiFailure, authenticated, json, serverSupabase } from '@/lib/api-server'
import { FAIR_NODE } from '@/lib/fair-node'
import { FAIR_REACTOR_ID } from '@/lib/public-node-readings'

export const runtime = 'nodejs'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { client, user } = await authenticated(request)
    const { id } = await context.params
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ApiError(400, 'ID de nodo inválido.')
    const { data: node, error: nodeError } = await client.from('nodes').select('id')
      .eq('id', id).eq('user_id', user.id).maybeSingle()
    if (nodeError) throw nodeError
    if (!node) throw new ApiError(404, 'Nodo no encontrado.')
    const { data: ownedReactor, error: reactorError } = await client.from('reactors')
      .select('id,node_id,name,board_type,algae_type').eq('node_id', id).eq('user_id', user.id).maybeSingle()
    if (reactorError) throw reactorError
    const privileged = serverSupabase(true)
    let reactor = ownedReactor
    if (!reactor && id === FAIR_NODE.id) {
      const result = await privileged.from('reactors').select('id,node_id,name,board_type,algae_type,user_id')
        .eq('id', FAIR_REACTOR_ID).eq('user_id', user.id).maybeSingle()
      if (result.error) throw result.error
      reactor = result.data
    }
    if (!reactor) return json({ reactor: null, readings: [] })
    const { data: linkedReadings, error: readingsError } = await privileged.from('readings')
      .select('id,reactor_id,ppm_value,water_temperature,ph_value,humidity,light_lux,pm25,air_pump_status,status_quality,created_at')
      .eq('reactor_id', reactor.id).order('created_at', { ascending: false }).limit(96)
    if (readingsError) throw readingsError
    let readings = linkedReadings ?? []
    if (!readings.length && id === FAIR_NODE.id) {
      // Legacy INED readings have NULL reactor_id. Return them to the verified
      // owner without rewriting or reassigning rows in Supabase.
      const legacy = await privileged.from('readings')
        .select('id,reactor_id,ppm_value,water_temperature,ph_value,humidity,light_lux,pm25,air_pump_status,status_quality,created_at')
        .is('reactor_id', null).order('created_at', { ascending: false }).limit(96)
      if (legacy.error) throw legacy.error
      readings = legacy.data ?? []
    }
    return json({ reactor, readings })
  } catch (error) { return apiFailure(error) }
}
