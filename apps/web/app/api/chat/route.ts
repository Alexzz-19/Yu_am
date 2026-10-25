import { ApiError, apiFailure, authenticated, json, readJson } from '@/lib/api-server'
import { groundedInstruction, NO_CONTEXT_ANSWER, searchFilter, searchTerms } from '@/lib/chat-grounding'
import type { ChatNote } from '@/lib/chat-grounding'

export const runtime = 'nodejs'

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export async function POST(request: Request) {
  try {
    const { client } = await authenticated(request)
    const body = await readJson(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'Envía una pregunta en el campo prompt.')
    }
    const prompt = (body as Record<string, unknown>).prompt
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.trim().length > 1000) {
      throw new ApiError(400, 'La pregunta debe tener entre 1 y 1000 caracteres.')
    }
    const question = prompt.trim()
    const terms = searchTerms(question)
    if (terms.length === 0) return json({ answer: NO_CONTEXT_ANSWER, sources: [] })

    const { data, error } = await client.from('boveda_memoria')
      .select('id,titulo,contenido,etiquetas')
      .or(searchFilter(terms))
      .limit(5)
    if (error) throw error
    const notes: ChatNote[] = data ?? []
    if (notes.length === 0) return json({ answer: NO_CONTEXT_ANSWER, sources: [] })

    const key = process.env.GEMINI_API_KEY
    if (!key) throw new ApiError(503, 'El asistente está pendiente de configuración.')
    let response: Response
    try {
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
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
      throw new ApiError(502, 'El asistente no respondió a tiempo. Inténtalo de nuevo.')
    }
    if (!response.ok) throw new ApiError(502, 'El asistente no está disponible en este momento.')
    let payload: GeminiResponse
    try { payload = await response.json() as GeminiResponse } catch {
      throw new ApiError(502, 'El asistente devolvió una respuesta inválida.')
    }
    const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim()
    if (!answer) throw new ApiError(502, 'El asistente no pudo generar una respuesta. Reformula la pregunta.')
    return json({ answer, sources: notes.map(({ id, titulo, etiquetas }) => ({ id, titulo, etiquetas })) })
  } catch (error) { return apiFailure(error) }
}
