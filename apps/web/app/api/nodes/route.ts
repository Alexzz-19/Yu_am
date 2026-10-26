import { apiFailure, authenticated, databaseFailure, generateIngestToken, json, readJson, ApiError, serverSupabase } from '@/lib/api-server'
import { parseNode } from '@/lib/telemetry-validation'
import { DELETE as deleteById } from './[id]/route'
import { NODE_FIELDS, parseHardware } from '@/lib/hardware'
import { communityNodes } from '@/lib/community-nodes'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    if (new URL(request.url).searchParams.get('scope') === 'community') {
      return json({ nodes: await communityNodes() })
    }
    const { user } = await authenticated(request)
    const { data, error } = await serverSupabase(true).from('nodes').select(NODE_FIELDS).eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) databaseFailure(error)
    return json({ nodes: data })
  } catch (error) { return apiFailure(error) }
}

export async function POST(request: Request) {
  try {
    const { user } = await authenticated(request)
    const body = await readJson(request)
    let input
    try { input = parseNode(body) } catch (error) { throw new ApiError(400, (error as Error).message) }
    if (!input.country || !input.city) throw new ApiError(400, 'Selecciona país y ciudad o departamento.')
    let hardware
    try { hardware = parseHardware(body as Record<string, unknown>) } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Hardware inválido.') }
    const { token } = generateIngestToken()
    // El propietario se toma exclusivamente del JWT verificado por Supabase.
    const { data: node, error } = await serverSupabase(true).from('nodes').insert({ user_id: user.id, name: input.nombre, country: input.country, city: input.city, lat: input.lat, lng: input.lng, token, ...hardware }).select(NODE_FIELDS).single()
    if (error) databaseFailure(error)
    if (!node) throw new ApiError(503, 'No se recibió la confirmación del nodo registrado.')
    return json({ id: node.id, user_id: user.id, token, node }, 201)
  } catch (error) { return apiFailure(error) }
}

export async function DELETE(request: Request) {
  try {
    const body = await readJson(request)
    const id = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>).id : null
    if (typeof id !== 'string') throw new ApiError(400, 'Indica el nodo que deseas eliminar.')
    return await deleteById(request, { params: Promise.resolve({ id }) })
  } catch (error) { return apiFailure(error) }
}
