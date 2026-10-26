import 'server-only'
import { ApiError, serverSupabase } from './api-server'
import type { ChatQuota } from './chat-types'

export function quotaStatus(used: number, now = new Date()): ChatQuota {
  const nextDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return { used, remaining: Math.max(0, 5 - used), limit: 5, resetsAt: nextDay.toISOString() }
}

export async function readQuota(userId: string): Promise<ChatQuota> {
  const { data, error } = await serverSupabase(true).from('yuam_chat_usage').select('used').eq('user_id', userId).eq('usage_date', new Date().toISOString().slice(0, 10)).maybeSingle()
  if (error) throw new ApiError(503, 'No se pudo comprobar la cuota de Yum. Inténtalo de nuevo más tarde.')
  return quotaStatus(data?.used ?? 0)
}

export async function consumeQuota(userId: string): Promise<ChatQuota & { allowed: boolean }> {
  const { data, error } = await serverSupabase(true).rpc('yuam_consume_chat_quota', { p_user_id: userId })
  if (error || !data || typeof data !== 'object' || Array.isArray(data) || typeof data.allowed !== 'boolean' || typeof data.used !== 'number') {
    throw new ApiError(503, 'No se pudo comprobar la cuota de Yum. Inténtalo de nuevo más tarde.')
  }
  return { ...quotaStatus(data.used), allowed: data.allowed }
}
