import { ApiError, apiFailure, authenticated, json, readJson } from '@/lib/api-server'
import { groundedInstruction, yumFallback } from '@/lib/chat-grounding'
import type { ChatNote } from '@/lib/chat-grounding'
import { retrieveNotes } from '@/lib/chat-retrieval'
import { withinBudget } from '@/lib/async-budget'

export const runtime = 'nodejs'

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export async function POST(request: Request) {
  const deadline = Date.now() + 1600
  try {
    await authenticated(request)
    const body = await readJson(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'Envía una pregunta en el campo prompt.')
    }
    const prompt = (body as Record<string, unknown>).prompt
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.trim().length > 1000) {
      throw new ApiError(400, 'La pregunta debe tener entre 1 y 1000 caracteres.')
    }
    const question = prompt.trim()
    const key = process.env.GEMINI_API_KEY
    const notes: ChatNote[] = await withinBudget(Math.min(650, deadline - Date.now()), request.signal, signal => retrieveNotes(question, key, signal)) ?? []
    if (notes.length === 0) return json({ answer: yumFallback(question, []), sources: [], fallback: true })

    if (!key) return json({ answer: yumFallback(question, notes), sources: notes.slice(0, 1).map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), fallback: true })
    const answer = await withinBudget(deadline - Date.now(), request.signal, async signal => {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: groundedInstruction(question, notes) }] },
          contents: [{ role: 'user', parts: [{ text: 'Responde la pregunta del sistema usando solo las notas proporcionadas.' }] }],
          generationConfig: { maxOutputTokens: 320 },
        }),
        signal,
        cache: 'no-store',
      })
      if (!response.ok) return null
      const payload = await response.json() as GeminiResponse
      return payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim() || null
    })
    if (!answer) return json({ answer: yumFallback(question, notes), sources: notes.slice(0, 1).map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), fallback: true })
    return json({ answer, sources: notes.map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })) })
  } catch (error) { return apiFailure(error) }
}
