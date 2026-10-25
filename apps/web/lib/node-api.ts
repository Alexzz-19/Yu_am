'use client'

import { supabase } from './supabaseClient'

export async function nodeRequest<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Tu sesión terminó. Vuelve a iniciar sesión.')
  const response = await fetch(path, {
    method, cache: 'no-store', signal, headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo completar la operación.')
  return data as T
}
