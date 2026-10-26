import { ApiError, apiFailure, authenticated, json, readJson } from '@/lib/api-server'
import { groundedInstruction } from '@/lib/chat-grounding'
import type { ChatNote } from '@/lib/chat-grounding'
import { retrieveNotes } from '@/lib/chat-retrieval'
import { withinBudget } from '@/lib/async-budget'
import { consumeQuota, readQuota } from '@/lib/chat-quota'

export const runtime = 'nodejs'

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export async function GET(request: Request) {
  try {
    const { user } = await authenticated(request)
    return json({ quota: await readQuota(user.id) })
  } catch (error) { return apiFailure(error) }
}

export async function POST(request: Request) {
  try {
    const { user } = await authenticated(request)
    const body = await readJson(request, 16384)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'Envía una pregunta en el campo prompt.')
    }
    const prompt = (body as Record<string, unknown>).prompt
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.trim().length > 1000) {
      throw new ApiError(400, 'La pregunta debe tener entre 1 y 1000 caracteres.')
    }
    const question = prompt.trim()
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new ApiError(503, 'Yum no pudo conectar con el servicio de respuestas. Inténtalo más tarde.')
    const rawHistory: unknown = (body as Record<string, unknown>).history ?? []
    if (!Array.isArray(rawHistory) || rawHistory.length > 4) throw new ApiError(400, 'El historial de conversación no es válido.')
    const history: Array<{ role: 'user' | 'assistant'; text: string }> = []
    for (const entry of rawHistory as unknown[]) {
      if (!entry || typeof entry !== 'object') throw new ApiError(400, 'El historial de conversación no es válido.')
      const item = entry as Record<string, unknown>
      if ((item.role !== 'user' && item.role !== 'assistant') || typeof item.text !== 'string' || item.text.length > 600) throw new ApiError(400, 'El historial de conversación no es válido.')
      history.push({ role: item.role, text: item.text })
    }
    const quota = await consumeQuota(user.id)
    if (!quota.allowed) return json({ error: 'Límite diario alcanzado', quota }, 429, { 'Retry-After': String(Math.max(1, Math.ceil((Date.parse(quota.resetsAt) - Date.now()) / 1000))) })
    const notes: ChatNote[] = await withinBudget(4000, request.signal, signal => retrieveNotes(question, key, signal)) ?? []
    const answer = await withinBudget(20000, request.signal, async signal => {
      const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: groundedInstruction(question, notes) }] },
          contents: [...history.map(entry => ({ role: entry.role === 'assistant' ? 'model' : 'user', parts: [{ text: entry.text }] })), { role: 'user', parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 800 },
        }),
        signal,
        cache: 'no-store',
      })
      if (!response.ok) return null
      const payload = await response.json() as GeminiResponse
      return payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim() || null
    })
    if (!answer) return json({ error: 'Yum no pudo completar la respuesta técnica. Vuelve a intentarlo más tarde.', quota }, 502)
    return json({ answer, sources: notes.map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), quota })
  } catch (error) { return apiFailure(error) }
}
