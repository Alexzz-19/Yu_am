import { ApiError, apiFailure, authenticated, databaseFailure, json, serverSupabase } from '@/lib/api-server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await authenticated(request)
    const { id } = await context.params
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, 'ID de nodo inválido.')
    const { data, error } = await serverSupabase(true).from('nodes').select('id,token').eq('id', id).eq('user_id', user.id).maybeSingle()
    if (error) databaseFailure(error)
    if (!data) throw new ApiError(404, 'Nodo no encontrado.')
    return json(data)
  } catch (error) { return apiFailure(error) }
}
