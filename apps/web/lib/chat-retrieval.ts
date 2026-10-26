import 'server-only'

import { createHash } from 'node:crypto'
import { serverSupabase } from './api-server'
import type { ChatNote } from './chat-grounding'

type EmbeddingResponse = { embedding?: { values?: number[] }; embeddings?: Array<{ values?: number[] }> }
const vectors = new Map<string, { expires: number; values: number[] }>()
const MODEL = 'gemini-embedding-001'

function validVector(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === 768 && value.every(item => typeof item === 'number' && Number.isFinite(item))
}

async function embed(key: string, texts: string[], query: boolean, signal: AbortSignal): Promise<number[][]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ requests: texts.map(text => ({ model: `models/${MODEL}`, content: { parts: [{ text }] }, taskType: query ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT', outputDimensionality: 768 })) }),
    signal, cache: 'no-store',
  })
  if (!response.ok) throw new Error('Embedding no disponible')
  const payload = await response.json() as EmbeddingResponse
  const result = payload.embeddings?.map(item => item.values) ?? []
  if (result.length !== texts.length || !result.every(validVector)) throw new Error('Embedding inválido')
  return result as number[][]
}

function cosine(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0)
  const norm = Math.hypot(...left) * Math.hypot(...right)
  return norm ? dot / norm : 0
}

// El esquema desplegado no tiene pgvector ni una RPC de similitud. La búsqueda
// vectorial se calcula en el servidor sobre las notas reales de Supabase.
export async function retrieveNotes(question: string, key: string | undefined, parent?: AbortSignal): Promise<ChatNote[]> {
  const signal = AbortSignal.any([AbortSignal.timeout(4000), ...(parent ? [parent] : [])])
  const { data, error } = await serverSupabase(true).from('boveda_memoria').select('id,titulo,contenido,etiquetas').limit(50).abortSignal(signal)
  if (error) throw error
  const notes: ChatNote[] = (data ?? []).map(note => ({ ...note, id: String(note.id), etiquetas: Array.isArray(note.etiquetas) ? note.etiquetas : (note.etiquetas ?? '').split(',').map(tag => tag.trim()).filter(Boolean) }))
  if (!notes.length || !key) return notes.slice(0, 5)
  const now = Date.now()
  for (const [id, entry] of vectors) if (entry.expires < now) vectors.delete(id)
  if (vectors.size > 500) vectors.clear()
  const items = notes.map(note => {
    const text = `${note.titulo}\n${note.contenido}`.slice(0, 6000)
    return { note, text, id: createHash('sha256').update(text).digest('hex') }
  })
  const missing = items.filter(item => !vectors.has(item.id))
  const batches: Array<typeof missing> = []
  for (let start = 0; start < missing.length; start += 16) {
    batches.push(missing.slice(start, start + 16))
  }
  const queryId = `query:${createHash('sha256').update(question).digest('hex')}`
  const cachedQuery = vectors.get(queryId)
  const [model] = await Promise.all([
    cachedQuery ? Promise.resolve([cachedQuery.values]) : embed(key, [question], true, signal),
    Promise.all(batches.map(async batch => {
      const embeddings = await embed(key, batch.map(item => item.text), false, signal)
      if (!signal.aborted) batch.forEach((item, index) => vectors.set(item.id, { expires: now + 10 * 60 * 1000, values: embeddings[index] }))
    })),
  ])
  signal.throwIfAborted()
  vectors.set(queryId, { expires: now + 10 * 60 * 1000, values: model[0] })
  return items.map(item => ({ note: item.note, score: cosine(model[0], vectors.get(item.id)!.values) }))
    .filter(item => item.score >= 0.45).sort((left, right) => right.score - left.score).slice(0, 5).map(item => item.note)
}
