import { ApiError, apiFailure, json, readJson, serverSupabase } from '@/lib/api-server'
import { bearerToken, parseTelemetry } from '@/lib/telemetry-validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const token = bearerToken(request.headers.get('authorization'))
    if (!token || !/^yua_live_[a-f0-9]{64}$/.test(token)) throw new ApiError(401, 'Token de ingesta inválido.')
    const body = await readJson(request)
    let input
    try { input = parseTelemetry(body) } catch (error) { throw new ApiError(400, (error as Error).message) }
    const { data, error } = await serverSupabase(true).rpc('yuam_ingest_hardware', {
      p_token: token, p_ppm: input.co2_ppm, p_ph: input.ph, p_temperature: input.temperatura, p_lux: input.lux, p_pm25: input.pm25,
    })
    if (error) throw error
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid RPC response')
    if (data.status === 'unauthorized') throw new ApiError(401, 'Token de ingesta inválido.')
    if (data.status === 'rate_limited') {
      const seconds = typeof data.retry_after === 'number' ? Math.max(1, Math.min(1800, Math.ceil(data.retry_after))) : 1800
      return json({ error: 'Frecuencia de envío superada. Máximo 1 lectura cada 30 minutos por nodo.', retry_after: seconds }, 429, { 'Retry-After': String(seconds) })
    }
    if (data.status !== 'accepted') throw new Error('Invalid RPC status')
    return json({ nodo_id: data.nodo_id, estado: 'Activo', created_at: data.created_at }, 201)
  } catch (error) { return apiFailure(error) }
}
