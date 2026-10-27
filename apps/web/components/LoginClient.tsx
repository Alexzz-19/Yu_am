'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/use-auth'
import Turnstile from './Turnstile'

type AuthMode = 'login' | 'signup'

function authOrigin(): string {
  return process.env.NODE_ENV === 'development' ? window.location.origin : 'https://yuam.tech'
}

export default function LoginClient() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const captchaRequired = process.env.NODE_ENV !== 'development' && Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
  const [captchaToken, setCaptchaToken] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<AuthMode>('login')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    if (user && !loading) router.replace('/perfil')
  }, [user, loading, router])

  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get('error_description') || new URLSearchParams(url.hash.slice(1)).get('error_description')
    if (error) {
      queueMicrotask(() => setMessage('No se pudo completar el acceso con Google. Inténtalo de nuevo.'))
      window.history.replaceState(null, '', '/login')
    }
  }, [])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setCaptchaToken('')
    setAttempt(value => value + 1)
  }

  async function google() {
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${authOrigin()}/login` } })
      if (error) throw error
    } catch {
      setMessage('No se pudo iniciar el acceso con Google. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  async function email(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((captchaRequired && !captchaToken) || busy) return
    setBusy(true)
    setMessage('')
    const fields = new FormData(event.currentTarget)
    const credentials = { email: String(fields.get('email')).trim(), password: String(fields.get('password')) }
    const captchaOptions = captchaRequired ? { captchaToken } : {}
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ ...credentials, options: { ...captchaOptions, emailRedirectTo: `${authOrigin()}/login` } })
        if (error) throw error
        if (data.session) router.replace('/perfil')
        else setMessage('Revisa tu correo para confirmar la cuenta y luego inicia sesión.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ ...credentials, options: captchaOptions })
        if (error) throw error
        if (data.session) router.replace('/perfil')
      }
    } catch {
      const detail = mode === 'login' ? 'No se pudo acceder. Comprueba tu correo y contraseña.' : 'No se pudo crear la cuenta. Revisa los datos.'
      setMessage(captchaRequired ? `${detail} También verifica el control anti-bot.` : detail)
    } finally {
      setBusy(false)
      setCaptchaToken('')
      setAttempt(value => value + 1)
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !resetEmail.trim()) return
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), { redirectTo: `${authOrigin()}/login` })
      if (error) throw error
      setResetOpen(false)
      setMessage('Si existe una cuenta para ese correo, recibirás instrucciones para restablecer la contraseña.')
    } catch {
      setMessage('No se pudo solicitar el restablecimiento. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (loading || user) return <p role="status" className="py-8 text-slate-600">Comprobando sesión…</p>

  const button = 'w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
  const input = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600'

  return (
    <div className="mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Acceso a YU'AM">
        <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${mode === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Iniciar sesión</button>
        <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => switchMode('signup')} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Registrarse</button>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-slate-600">{mode === 'login' ? 'Vuelve a tus nodos, datos y protocolos.' : 'Crea tu espacio para registrar y gestionar tus nodos YU’AM.'}</p>
      <button type="button" disabled={busy} onClick={google} className={`${button} mt-5 border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}>Continuar con Google</button>
      <div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-200" />o con correo<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={email} className="space-y-5">
        <label className="block text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={input} /></label>
        <label className="block text-sm font-medium" htmlFor="password">Contraseña<input id="password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'signup' ? 8 : 1} maxLength={128} className={input} /></label>
        {mode === 'signup' && <p className="text-sm text-slate-600">Usa al menos ocho caracteres. Enviaremos un correo de confirmación.</p>}
        {captchaRequired && <Turnstile key={attempt} onToken={setCaptchaToken} />}
        <button disabled={busy || (captchaRequired && !captchaToken)} className={`${button} bg-emerald-700 text-white hover:bg-emerald-800`}>{busy ? 'Procesando…' : mode === 'login' ? 'Entrar a YU’AM' : 'Crear mi cuenta'}</button>
      </form>
      {mode === 'login' && <button type="button" disabled={busy} onClick={() => setResetOpen(true)} className="mt-5 text-sm font-medium text-emerald-800 underline">¿Olvidaste tu contraseña?</button>}
      <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>

      {resetOpen && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="reset-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><h2 id="reset-title" className="text-xl font-semibold">Restablecer contraseña</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Te enviaremos un enlace seguro si existe una cuenta asociada al correo.</p></div><button type="button" onClick={() => setResetOpen(false)} className="rounded-lg p-2 text-xl leading-none hover:bg-slate-100" aria-label="Cerrar">×</button></div>
          <form onSubmit={resetPassword} className="mt-5"><label className="block text-sm font-medium" htmlFor="reset-email">Correo electrónico<input id="reset-email" type="email" autoComplete="email" value={resetEmail} onChange={event => setResetEmail(event.target.value)} required className={input} /></label><button disabled={busy} className={`${button} mt-5 bg-emerald-700 text-white hover:bg-emerald-800`}>{busy ? 'Enviando…' : 'Enviar enlace'}</button></form>
        </section>
      </div>}
    </div>
  )
}
