'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let current = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (current) { setUser(session?.user ?? null); setLoading(false) }
    })
    // getUser verifica la sesión con Supabase; no se usa almacenamiento local
    // como prueba de autorización. Cada API también verifica el JWT en servidor.
    void supabase.auth.getUser().then(({ data }) => {
      if (current) { setUser(data.user); setLoading(false) }
    }).catch(() => { if (current) { setUser(null); setLoading(false) } })
    return () => { current = false; subscription.unsubscribe() }
  }, [])
  return { user, loading }
}
