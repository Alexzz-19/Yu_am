import { ApiError, apiFailure, authenticated, json, readJson } from '@/lib/api-server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { client, user } = await authenticated(request)
    const { data, error } = await client
      .from('yum_chat_history')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60)
    if (error) throw error
    return json({ messages: (data ?? []).reverse() })
  } catch (error) { return apiFailure(error) }
}

export async function POST(request: Request) {
  try {
    const { client, user } = await authenticated(request)
    const body = await readJson(request, 8192)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'El mensaje no es válido.')
    const value = body as Record<string, unknown>
    if ((value.role !== 'user' && value.role !== 'assistant') || typeof value.content !== 'string' || !value.content.trim() || value.content.length > 4000) {
      throw new ApiError(400, 'El mensaje debe tener un rol válido y entre 1 y 4000 caracteres.')
    }
    const { data, error } = await client.from('yum_chat_history').insert({
      user_id: user.id,
      role: value.role,
      content: value.content.trim(),
    }).select('id, role, content, created_at').single()
    if (error) throw error
    return json({ message: data }, 201)
  } catch (error) { return apiFailure(error) }
}
