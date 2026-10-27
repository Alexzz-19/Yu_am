import { apiFailure, ApiError, json, serverSupabase } from '@/lib/api-server'
import { publicNodeReadings } from '@/lib/public-node-readings'

export const runtime = 'nodejs'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new ApiError(400, 'ID de nodo inválido.')
    }
    // The server verifies the public node using service role. No visitor JWT
    // or RLS grant on raw readings is needed.
    const client = serverSupabase(true)
    const { data: visibleNode, error } = await client.from('nodes').select('id').eq('id', id).maybeSingle()
    if (error) throw error
    if (!visibleNode) throw new ApiError(404, 'Nodo público no encontrado.')
    const { readings } = await publicNodeReadings(id)
    return json({
      readings: readings.map(({ created_at, ppm_value, water_temperature, humidity, light_lux }) => ({
        created_at, ppm_value, water_temperature, humidity, light_lux,
      })).reverse(),
    })
  } catch (error) {
    return apiFailure(error)
  }
}
