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
      p_humidity: input.humedad,
    })
    if (error) throw error
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid RPC response')
    if (data.status === 'unauthorized') throw new ApiError(401, 'Token de ingesta inválido.')
    // El intervalo procede de la credencial validada en PostgreSQL, nunca del JSON del dispositivo.
    const interval = data.interval_seconds === 10 ? 10 : 1800
    if (data.status === 'rate_limited') {
      const seconds = typeof data.retry_after === 'number' ? Math.max(1, Math.min(interval, Math.ceil(data.retry_after))) : interval
      const error = interval === 10 ? 'Frecuencia de envío superada. Máximo 1 lectura cada 10 segundos para este nodo VIP.' : 'Frecuencia de envío superada. Máximo 1 lectura cada 30 minutos por nodo.'
      return json({ error, retry_after: seconds, interval_seconds: interval }, 429, { 'Retry-After': String(seconds) })
    }
    if (data.status !== 'accepted') throw new Error('Invalid RPC status')
    return json({ nodo_id: data.nodo_id, estado: 'Activo', created_at: data.created_at, interval_seconds: interval }, 201)
  } catch (error) { return apiFailure(error) }
}
