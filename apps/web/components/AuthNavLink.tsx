'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/use-auth'

export default function AuthNavLink() {
  const { user, loading } = useAuth()
  return <Link href={user ? '/perfil' : '/login'} aria-label={loading ? 'Acceder a tu cuenta' : undefined} className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{user ? 'Mi perfil' : 'Acceder'}</Link>
}
