import { ApiError, apiFailure, authenticated, databaseFailure, generateIngestToken, json, readJson, serverSupabase } from '@/lib/api-server'
import { parseNode } from '@/lib/telemetry-validation'
import { NODE_FIELDS, parseHardware } from '@/lib/hardware'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }
async function nodeId(context: Context) {
  const { id } = await context.params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ApiError(400, 'ID de nodo inválido.')
  return id
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { user } = await authenticated(request)
    const id = await nodeId(context)
    const body = await readJson(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Envía una operación válida para el nodo.')
    const action = (body as Record<string, unknown>).action
    if (action === 'relocate') {
      let input
      try { input = parseNode(body) } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Ubicación inválida.') }
      if (!input.country || !input.city) throw new ApiError(400, 'Selecciona país y ciudad o departamento.')
      let hardware = {}
      if ('board_type' in body || 'algae_type' in body || 'sensors' in body) {
        try { hardware = parseHardware(body as Record<string, unknown>) } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Hardware inválido.') }
      }
      const { data: node, error } = await serverSupabase(true).from('nodes')
        .update({ name: input.nombre, country: input.country, city: input.city, lat: input.lat, lng: input.lng, ...hardware })
        .eq('id', id).eq('user_id', user.id).select(NODE_FIELDS).maybeSingle()
      if (error) databaseFailure(error)
      if (!node) throw new ApiError(404, 'Nodo no encontrado.')
      return json({ node })
    }
    if (action !== undefined && action !== 'rotate') throw new ApiError(400, 'Operación de nodo desconocida.')
    const { token } = generateIngestToken()
    const { data, error } = await serverSupabase(true).from('nodes').update({ token }).eq('id', id).eq('user_id', user.id).select('id').maybeSingle()
    if (error) databaseFailure(error)
    if (!data) throw new ApiError(404, 'Nodo no encontrado.')
    return json({ id, token })
  } catch (error) { return apiFailure(error) }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { user } = await authenticated(request)
    const { data, error } = await serverSupabase(true).from('nodes').delete().eq('id', await nodeId(context)).eq('user_id', user.id).select('id').maybeSingle()
    if (error) databaseFailure(error)
    if (!data) throw new ApiError(404, 'Nodo no encontrado.')
    return json({ deleted: true })
  } catch (error) { return apiFailure(error) }
}
