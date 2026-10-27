import { apiFailure, ApiError, json, serverSupabase } from '@/lib/api-server'
import { FAIR_NODE } from '@/lib/fair-node'
import { publicNodeReadings } from '@/lib/public-node-readings'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const client = serverSupabase(true)
    const { data: node, error } = await client.from('nodes').select('id').eq('id', FAIR_NODE.id).maybeSingle()
    if (error) throw error
    if (!node) throw new ApiError(404, 'Nodo oficial no encontrado.')
    const { readings } = await publicNodeReadings(FAIR_NODE.id)
    return json({
      readings: readings.map(({ created_at, ppm_value, water_temperature, humidity, light_lux }) => ({
        created_at, ppm_value, water_temperature, humidity, light_lux,
      })).reverse(),
    })
  } catch (error) {
    return apiFailure(error)
  }
}
