import { ApiError, apiFailure, authenticated, databaseFailure, generateIngestToken, json, serverSupabase } from '@/lib/api-server'

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
