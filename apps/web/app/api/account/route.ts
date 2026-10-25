import { ApiError, apiFailure, authenticated, json, serverSupabase } from '@/lib/api-server'

export const runtime = 'nodejs'

export async function DELETE(request: Request) {
  try {
    const { user } = await authenticated(request)
    const service = serverSupabase(true)
    const { error } = await service.auth.admin.deleteUser(user.id)
    if (error) throw new ApiError(503, 'No se pudo eliminar la cuenta.')
    return json({ deleted: true })
  } catch (error) {
    return apiFailure(error)
  }
}
