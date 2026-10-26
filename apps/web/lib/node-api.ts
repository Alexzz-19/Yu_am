'use client'

import { supabase } from './supabaseClient'

export class ApiRequestError extends Error {
  constructor(message: string, public status: number, public details: Record<string, unknown>) { super(message) }
}

export async function nodeRequest<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Tu sesión terminó. Vuelve a iniciar sesión.')
  const response = await fetch(path, {
    method, cache: 'no-store', signal, headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const data: unknown = await response.json()
  if (!response.ok) {
    const details = data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : {}
    throw new ApiRequestError(typeof details.error === 'string' ? details.error : 'No se pudo completar la operación.', response.status, details)
  }
  return data as T
}
