import { ApiError, apiFailure, authenticated, json } from '@/lib/api-server'

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
    const { data: reactor, error: reactorError } = await client.from('reactors')
      .select('id,node_id,name,board_type,algae_type').eq('node_id', id).eq('user_id', user.id).maybeSingle()
    if (reactorError) throw reactorError
    if (!reactor) return json({ reactor: null, readings: [] })
    const { data: readings, error: readingsError } = await client.from('readings')
      .select('id,reactor_id,ppm_value,water_temperature,ph_value,humidity,light_lux,pm25,air_pump_status,status_quality,created_at')
      .eq('reactor_id', reactor.id).order('created_at', { ascending: false }).limit(96)
    if (readingsError) throw readingsError
    return json({ reactor, readings: readings ?? [] })
  } catch (error) { return apiFailure(error) }
}
