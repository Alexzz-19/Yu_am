import { ApiError, apiFailure, authenticated, databaseFailure, generateIngestToken, json } from '@/lib/api-server'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }
async function nodeId(context: Context) {
  const { id } = await context.params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ApiError(400, 'ID de nodo inválido.')
  return id
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { client } = await authenticated(request)
    const id = await nodeId(context)
    const { token, hash } = generateIngestToken()
    const { error } = await client.rpc('yuam_rotate_node_token', { p_node_id: id, p_token_hash: hash })
    if (error) databaseFailure(error)
    return json({ id, token })
  } catch (error) { return apiFailure(error) }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { client } = await authenticated(request)
    const { error } = await client.rpc('yuam_delete_node', { p_node_id: await nodeId(context) })
    if (error) databaseFailure(error)
    return json({ deleted: true })
  } catch (error) { return apiFailure(error) }
}
