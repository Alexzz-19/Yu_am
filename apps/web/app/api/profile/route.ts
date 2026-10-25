import { ApiError, apiFailure, authenticated, json, readJson, serverSupabase } from '@/lib/api-server'

export const runtime = 'nodejs'

type ProfileInput = {
  username: string
  country: string
  city: string
  timezone: string
}

function profileInput(value: unknown): ProfileInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(400, 'Los datos de perfil no son válidos.')
  const data = value as Record<string, unknown>
  const fields = ['username', 'country', 'city', 'timezone'] as const
  const parsed = Object.fromEntries(fields.map(field => [field, typeof data[field] === 'string' ? data[field].trim() : ''])) as ProfileInput
  if (parsed.username.length < 2 || parsed.username.length > 50 || parsed.country.length < 2 || parsed.country.length > 80 || parsed.city.length < 2 || parsed.city.length > 100 || parsed.timezone.length < 1 || parsed.timezone.length > 100) {
    throw new ApiError(400, 'Completa nombre de usuario, país, ciudad y zona horaria con valores válidos.')
  }
  return parsed
}

function profileHistory(metadata: Record<string, unknown>): string[] {
  const history = metadata.profile_edit_history
  return Array.isArray(history) ? history.filter((entry): entry is string => typeof entry === 'string' && !Number.isNaN(Date.parse(entry))) : []
}

export async function PATCH(request: Request) {
  try {
    const { user } = await authenticated(request)
    const input = profileInput(await readJson(request))
    const service = serverSupabase(true)
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const existing = profileHistory(user.app_metadata)
    const monthEdits = existing.filter(entry => entry.startsWith(currentMonth))
    if (monthEdits.length >= 3) throw new ApiError(429, 'Ya realizaste las tres ediciones de perfil permitidas este mes.')

    const nextMetadata = {
      ...user.app_metadata,
      profile: input,
      profile_edit_history: [...existing.filter(entry => Date.parse(entry) > now.getTime() - 370 * 24 * 60 * 60 * 1000), now.toISOString()],
      profile_last_changed_at: now.toISOString(),
    }
    const { data, error } = await service.auth.admin.updateUserById(user.id, { app_metadata: nextMetadata })
    if (error || !data.user) throw new ApiError(503, 'No se pudo guardar el perfil.')
    return json({ profile: input, editsRemaining: 2 - monthEdits.length })
  } catch (error) {
    return apiFailure(error)
  }
}
