import 'server-only'
import { createClient, type SupabaseClient, type WebSocketLikeConstructor } from '@supabase/supabase-js'
import WebSocket from 'ws'
import { createHash, randomBytes } from 'node:crypto'
import type { Database } from './database.types'
import { bearerToken } from './telemetry-validation'

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status)
  // No incluir detalles de PostgreSQL, tokens ni secretos en la respuesta o logs.
  return json({ error: 'No se pudo completar la operación. Comprueba la configuración del servicio.' }, 503)
}

function config(service = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = service ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new ApiError(503, 'Servicio pendiente de configuración.')
  return { url, key }
}

export function serverSupabase(service = false, token?: string): SupabaseClient<Database> {
  const { url, key } = config(service)
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // ws implementa el transporte admitido por Realtime; sus sobrecargas de Node
    // y eventos no coinciden con las firmas DOM del tipo mínimo de Supabase.
    realtime: { transport: WebSocket as unknown as WebSocketLikeConstructor },
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  })
}

export async function authenticated(request: Request) {
  const token = bearerToken(request.headers.get('authorization'))
  if (!token) throw new ApiError(401, 'Inicia sesión para gestionar tus nodos.')
  const client = serverSupabase(false, token)
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user || data.user.is_anonymous) throw new ApiError(401, 'La sesión no es válida. Vuelve a iniciar sesión.')
  return { client, user: data.user }
}

export async function readJson(request: Request, maxBytes = 4096): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new ApiError(415, 'Usa Content-Type: application/json.')
  }
  const reader = request.body?.getReader()
  if (!reader) throw new ApiError(400, 'El cuerpo JSON es obligatorio.')
  let size = 0
  const parts: Uint8Array[] = []
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, `El cuerpo no puede superar ${Math.round(maxBytes / 1024)} KiB.`) }
      parts.push(value)
    }
    return JSON.parse(Buffer.concat(parts).toString('utf8')) as unknown
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, 'El JSON no es válido.')
  } finally { reader.releaseLock() }
}

export function generateIngestToken() {
  const token = `yua_live_${randomBytes(32).toString('hex')}`
  return { token, hash: hashToken(token) }
}
export function hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }

export function databaseFailure(error: { code: string }) {
  if (error.code === '42501') throw new ApiError(403, 'No tienes permiso para gestionar este nodo.')
  if (error.code === 'P0002') throw new ApiError(404, 'Nodo no encontrado.')
  if (error.code === '23514') throw new ApiError(400, 'Datos inválidos o límite de cuatro nodos alcanzado.')
  throw error
}
