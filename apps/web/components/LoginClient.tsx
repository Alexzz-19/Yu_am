'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/use-auth'
import Turnstile from './Turnstile'

export default function LoginClient() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [captchaToken, setCaptchaToken] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  useEffect(() => { if (user && !loading) router.replace('/perfil') }, [user, loading, router])
  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get('error_description') || new URLSearchParams(url.hash.slice(1)).get('error_description')
    if (error) {
      // No reflejar mensajes remotos arbitrarios ni tokens de callback en pantalla.
      queueMicrotask(() => setMessage('No se pudo completar el acceso con Google. Inténtalo de nuevo.'))
      window.history.replaceState(null, '', '/login')
    }
  }, [])

  async function google() {
    setBusy(true); setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/login` } })
      if (error) throw error
    } catch { setMessage('No se pudo iniciar el acceso con Google. Inténtalo de nuevo.'); setBusy(false) }
  }

  async function email(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!captchaToken || busy) return
    setBusy(true); setMessage('')
    const fields = new FormData(event.currentTarget)
    const credentials = { email: String(fields.get('email')).trim(), password: String(fields.get('password')) }
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ ...credentials, options: { captchaToken, emailRedirectTo: `${window.location.origin}/login` } })
        if (error) throw error
        if (data.session) router.replace('/perfil')
        else setMessage('Si el correo admite el registro, recibirás un enlace para confirmar tu cuenta.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ ...credentials, options: { captchaToken } })
        if (error) throw error
        router.replace('/perfil')
      }
    } catch {
      setMessage(mode === 'login' ? 'No se pudo acceder. Comprueba tu correo, contraseña y verificación anti-bot.' : 'No se pudo crear la cuenta. Revisa los datos y la verificación anti-bot.')
    } finally { setBusy(false); setCaptchaToken(''); setAttempt(value => value + 1) }
  }

  if (loading || user) return <p role="status" className="py-8 text-slate-600">Comprobando sesión…</p>
  const button = 'w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
  const input = 'mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 focus-visible:outline-2 focus-visible:outline-emerald-600'
  return <div className="mt-8 max-w-md rounded-2xl border border-slate-200 p-6">
    <button type="button" disabled={busy} onClick={google} className={`${button} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}>Continuar con Google</button>
    <p className="my-6 text-center text-sm text-slate-500">O usa tu correo electrónico</p>
    <form onSubmit={email} className="space-y-5">
      <label className="block text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={input} /></label>
      <label className="block text-sm font-medium" htmlFor="password">Contraseña<input id="password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'signup' ? 8 : 1} maxLength={128} className={input} /></label>
      {mode === 'signup' && <p className="text-sm text-slate-600">Usa al menos 8 caracteres. Te enviaremos un correo de confirmación.</p>}
      <Turnstile key={attempt} onToken={setCaptchaToken} />
      <button disabled={busy || !captchaToken} className={`${button} bg-emerald-600 text-white hover:bg-emerald-700`}>{busy ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</button>
    </form>
    <button type="button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); setCaptchaToken(''); setAttempt(value => value + 1) }} className="mt-5 text-sm font-medium text-emerald-700 underline">{mode === 'login' ? 'Crear una cuenta con correo' : 'Ya tengo una cuenta'}</button>
    <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>
  </div>
}
