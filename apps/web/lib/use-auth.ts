'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

let legacySessionMigration: Promise<void> | null = null

async function migrateLegacySession(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!legacySessionMigration) {
    legacySessionMigration = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return

      const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
      const storageKey = `sb-${projectRef}-auth-token`
      const serialized = window.localStorage.getItem(storageKey)
      if (!serialized) return

      try {
        const stored = JSON.parse(serialized) as { access_token?: unknown; refresh_token?: unknown }
        if (typeof stored.access_token !== 'string' || typeof stored.refresh_token !== 'string') return
        const { error } = await supabase.auth.setSession({
          access_token: stored.access_token,
          refresh_token: stored.refresh_token,
        })
        if (!error) window.localStorage.removeItem(storageKey)
      } catch {
        // Una sesión antigua o dañada no debe impedir el acceso normal.
        window.localStorage.removeItem(storageKey)
      }
    })().catch(() => undefined)
  }
  await legacySessionMigration
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let current = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (current) {
        setUser(session?.user ?? null)
        if (event !== 'INITIAL_SESSION') setLoading(false)
      }
    })
    void (async () => {
      try {
        await migrateLegacySession()
        // getUser verifies the session with Supabase instead of trusting browser storage.
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        if (current) setUser(data.user)
      } catch {
        if (current) setUser(null)
      } finally {
        if (current) setLoading(false)
      }
    })()
    return () => { current = false; subscription.unsubscribe() }
  }, [])
  return { user, loading }
}
