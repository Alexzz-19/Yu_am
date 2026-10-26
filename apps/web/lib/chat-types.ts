export type ChatQuota = { limit: number; used: number; remaining: number; resetsAt: string }
export type ChatSource = { id: string; titulo: string; etiquetas: string[] }
export type ChatReply = { answer: string; sources: ChatSource[]; quota: ChatQuota }

export function isChatQuota(value: unknown): value is ChatQuota {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return data.limit === 5 && typeof data.used === 'number' && data.used >= 0 && data.used <= 5 && typeof data.remaining === 'number' && data.remaining >= 0 && data.remaining <= 5 && typeof data.resetsAt === 'string' && Number.isFinite(Date.parse(data.resetsAt))
}
