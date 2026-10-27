import { apiFailure, json, serverSupabase } from '@/lib/api-server'
import type { PublicNode, TelemetryMetrics } from '@/lib/database.types'
import { FAIR_NODE, telemetryInterval } from '@/lib/fair-node'
import { publicNodeReadings } from '@/lib/public-node-readings'

export const runtime = 'nodejs'

const noMetrics = (): TelemetryMetrics => ({ ppm: null, pm25: null, temperature: null, ph: null, lux: null, humidity: null })

export async function GET() {
  try {
    // This public read uses the service-role key only on the server. It does not
    // consume a visitor session or expose the key in the browser response.
    const client = serverSupabase(true)
    const { data: node, error } = await client.from('nodes')
      .select('id,name,country,city,lat,lng,algae_type,board_type,category,university,is_demo_vip')
      .eq('id', FAIR_NODE.id).maybeSingle()
    if (error) throw error
    if (!node) return json({ node: null })

    const { readings } = await publicNodeReadings(node.id)
    const latest = readings[0]
    const last = {
      ...noMetrics(),
      ...(latest ? {
        ppm: latest.ppm_value,
        pm25: latest.pm25,
        temperature: latest.water_temperature,
        ph: latest.ph_value,
        lux: latest.light_lux,
        humidity: latest.humidity,
      } : {}),
    }
    const timestamp = latest?.created_at ?? null
    const recent = timestamp !== null && Date.now() - Date.parse(timestamp) <= telemetryInterval(node.is_demo_vip) * 1000
    const publicNode: PublicNode = {
      id: node.id,
      nombre_nodo: node.name,
      ubicacion_ofuscada: {
        zona: node.city + ', ' + node.country,
        lat: Math.round(node.lat * 100) / 100,
        lng: Math.round(node.lng * 100) / 100,
      },
      estado: recent ? 'activo' : 'inactivo',
      ultimo_envio: timestamp,
      telemetry: {
        last,
        week: noMetrics(),
        month: noMetrics(),
        weekSamples: 0,
        monthSamples: 0,
      },
      country: node.country,
      city: node.city,
      algae_type: node.algae_type,
      board_type: node.board_type,
      category: node.category,
      university: node.university,
      is_demo_vip: node.is_demo_vip,
    }
    return json({ node: publicNode })
  } catch (error) {
    return apiFailure(error)
  }
}
