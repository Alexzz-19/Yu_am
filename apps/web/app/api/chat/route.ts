import { ApiError, apiFailure, authenticated, json, readJson } from '@/lib/api-server'
import { groundedInstruction, yumFallback } from '@/lib/chat-grounding'
import type { ChatNote } from '@/lib/chat-grounding'
import { retrieveNotes } from '@/lib/chat-retrieval'

export const runtime = 'nodejs'

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export async function POST(request: Request) {
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
    let notes: ChatNote[] = []
    try { notes = await retrieveNotes(question, key) } catch { /* Yum mantiene la orientación contextual si falla la búsqueda. */ }
    if (notes.length === 0) return json({ answer: yumFallback(question, []), sources: [], fallback: true })

    if (!key) return json({ answer: yumFallback(question, notes), sources: notes.slice(0, 1).map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), fallback: true })
    let response: Response
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: groundedInstruction(question, notes) }] },
          contents: [{ role: 'user', parts: [{ text: 'Responde la pregunta del sistema usando solo las notas proporcionadas.' }] }],
          generationConfig: { maxOutputTokens: 1200 },
        }),
        signal: AbortSignal.timeout(20000),
        cache: 'no-store',
      })
    } catch {
      return json({ answer: yumFallback(question, notes), sources: notes.slice(0, 1).map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), fallback: true })
    }
    if (!response.ok) return json({ answer: yumFallback(question, notes), sources: notes.slice(0, 1).map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })), fallback: true })
    let payload: GeminiResponse
    try { payload = await response.json() as GeminiResponse } catch {
      throw new ApiError(502, 'El asistente devolvió una respuesta inválida.')
    }
    const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim()
    if (!answer) throw new ApiError(502, 'El asistente no pudo generar una respuesta. Reformula la pregunta.')
    return json({ answer, sources: notes.map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })) })
  } catch (error) { return apiFailure(error) }
}
