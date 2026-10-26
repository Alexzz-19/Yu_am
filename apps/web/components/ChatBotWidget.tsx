'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { ApiRequestError, nodeRequest } from '@/lib/node-api'
import { isChatQuota, type ChatQuota, type ChatReply, type ChatSource } from '@/lib/chat-types'
import Dialog from './ui/Dialog'

type Message = { id: string; role: 'user' | 'assistant'; text: string; sources?: ChatSource[]; error?: boolean }
type StoredMessage = { id: string; role: 'user' | 'assistant'; content: string; created_at: string }
const WELCOME = '¡Hola! Soy Yum, tu guía de YU’AM. Cuéntame qué necesitas resolver sobre tu cultivo, fotobiorreactor o sensores. Tienes cinco preguntas al día.'

type Mood = 'idle' | 'working' | 'happy' | 'sad' | 'pointing'

function RobotAvatar({ mood, size = 40 }: { mood: Mood; size?: number }) {
  const descriptions: Record<Mood, string> = {
    idle: 'Yum, el robot asistente de YU’AM',
    working: 'Yum consultando las notas científicas',
    happy: 'Yum feliz tras responder',
    sad: 'Yum triste porque no pudo responder',
    pointing: 'Yum te invita a iniciar sesión',
  }
  return <Image src={`/images/yum/yum-${mood}.webp?v=20261025-alpha`} alt={descriptions[mood]} width={size} height={size} className="shrink-0 object-contain" />
}

export function YumChatSession({ open, onMoodChange }: { open: boolean; onMoodChange: (mood: Mood) => void }) {
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'assistant', text: WELCOME }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [quota, setQuota] = useState<ChatQuota | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(true)
  const [quotaError, setQuotaError] = useState('')
  const [historyReady, setHistoryReady] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [limitOpen, setLimitOpen] = useState(false)
  const latestQuota = useRef<ChatQuota | null>(null)
  const historyLoaded = useRef(false)
  const pending = useRef<AbortController | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [messages, busy, open])
  useEffect(() => { if (open && !quotaLoading && quota && quota.remaining > 0) input.current?.focus() }, [open, quotaLoading, quota])
  useEffect(() => () => pending.current?.abort(), [])
  const refreshQuota = useCallback(async () => {
    const result = await nodeRequest<{ quota: ChatQuota }>('/api/chat')
    if (!isChatQuota(result.quota)) throw new Error('No se pudo comprobar la cuota de Yum.')
    return result.quota
  }, [])
  const applyQuota = useCallback((value: ChatQuota) => {
    const previous = latestQuota.current
    const current = previous && (Date.parse(previous.resetsAt) > Date.parse(value.resetsAt) || (previous.resetsAt === value.resetsAt && previous.used > value.used)) ? previous : value
    latestQuota.current = current
    setQuota(current)
    setQuotaError('')
    setLimitOpen(current.remaining === 0)
  }, [])
  useEffect(() => {
    if (!open) return
    void refreshQuota().then(applyQuota).catch(error => setQuotaError(error instanceof Error ? error.message : 'No se pudo comprobar la cuota.')).finally(() => setQuotaLoading(false))
  }, [open, refreshQuota, applyQuota])
  useEffect(() => {
    if (!open || historyLoaded.current) return
    historyLoaded.current = true
    void nodeRequest<{ messages: StoredMessage[] }>('/api/chat/history')
      .then(result => setMessages(result.messages.length
        ? result.messages.map(message => ({ id: String(message.id), role: message.role, text: message.content }))
        : [{ id: 'welcome', role: 'assistant', text: WELCOME }]))
      .catch(error => setHistoryError(error instanceof Error ? error.message : 'No se pudo recuperar el historial.'))
      .finally(() => setHistoryReady(true))
  }, [open])
  useEffect(() => {
    if (!quota) return
    const timer = window.setTimeout(() => { void refreshQuota().then(applyQuota).catch(() => setQuotaError('Vuelve a abrir el chat para comprobar tu cuota.')) }, Math.max(1000, Date.parse(quota.resetsAt) - Date.now() + 1000))
    return () => window.clearTimeout(timer)
  }, [quota, refreshQuota, applyQuota])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt || busy || !historyReady || quotaLoading || quotaError || !quota) return
    if (quota.remaining === 0) { setLimitOpen(true); return }
    setBusy(true)
    onMoodChange('working')
    setDraft('')
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text: prompt }])
    const controller = new AbortController()
    pending.current = controller
    try {
      try {
        const saved = await nodeRequest<{ message: StoredMessage }>('/api/chat/history', 'POST', { role: 'user', content: prompt }, controller.signal)
        setMessages(previous => previous.map(message => message.role === 'user' && message.text === prompt && message.id.length > 30 ? { ...message, id: String(saved.message.id) } : message))
        setHistoryError('')
      } catch (error) {
        if (!controller.signal.aborted) setHistoryError(error instanceof Error ? `No se guardó el historial: ${error.message}` : 'No se guardó el historial.')
      }
      const history = messages.filter(message => message.id !== 'welcome' && !message.error).slice(-4).map(({ role, text }) => ({ role, text: text.slice(0, 600) }))
      const reply = await nodeRequest<ChatReply>('/api/chat', 'POST', { prompt, history }, controller.signal)
      if (!controller.signal.aborted) {
        if (typeof reply.answer !== 'string' || !Array.isArray(reply.sources)) throw new Error('Respuesta incompleta del asistente.')
        if (!isChatQuota(reply.quota)) throw new Error('No se pudo verificar la cuota de la respuesta.')
        applyQuota(reply.quota)
        onMoodChange('happy')
        setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', text: reply.answer, sources: reply.sources }])
        try {
          const saved = await nodeRequest<{ message: StoredMessage }>('/api/chat/history', 'POST', { role: 'assistant', content: reply.answer }, controller.signal)
          setMessages(previous => {
            const last = previous.at(-1)
            return last?.role === 'assistant' && last.text === reply.answer ? [...previous.slice(0, -1), { ...last, id: String(saved.message.id) }] : previous
          })
          setHistoryError('')
        } catch (error) {
          if (!controller.signal.aborted) setHistoryError(error instanceof Error ? `Respuesta lista, pero no se guardó: ${error.message}` : 'Respuesta lista, pero no se guardó en el historial.')
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        onMoodChange('sad')
        if (error instanceof ApiRequestError && isChatQuota(error.details.quota)) {
          applyQuota(error.details.quota)
        }
        if (error instanceof ApiRequestError && error.status === 429) return
        const detail = error instanceof Error ? error.message : 'No se pudo consultar el asistente.'
        setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', text: detail, error: true }])
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false)
      pending.current = null
    }
  }

  return <div className="flex min-h-0 flex-1 flex-col">
    <div aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
      {!historyReady && <div role="status" className="text-sm text-slate-600">Recuperando la conversación…</div>}
      {messages.map(message => <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && <RobotAvatar mood={message.error ? 'sad' : 'happy'} size={28} />}
        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-emerald-700 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-900'}`}>
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          {message.sources && message.sources.length > 0 && <div className="mt-3 border-t border-slate-300 pt-2 text-xs text-slate-600">
            <p className="font-semibold">Notas consultadas</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4">{message.sources.map(source => <li key={source.id}>{source.titulo}</li>)}</ol>
          </div>}
        </div>
      </div>)}
      {busy && <div role="status" className="flex items-center gap-2 text-sm text-slate-600"><RobotAvatar mood="working" size={28} /><span>Consultando notas y preparando la respuesta…</span></div>}
      <div ref={end} />
    </div>
    <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
      <label htmlFor="yuam-chat-prompt" className="sr-only">Escribe una pregunta para el asistente</label>
      <div className="flex items-end gap-2">
      <textarea id="yuam-chat-prompt" ref={input} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={2} maxLength={1000} placeholder={quota?.remaining === 0 ? 'Límite diario alcanzado' : 'Pregunta sobre YU’AM…'} disabled={busy || !historyReady || quotaLoading || !!quotaError || !quota || quota.remaining === 0} className="max-h-28 min-h-12 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-900" />
        <button type="submit" disabled={busy || !historyReady || quotaLoading || !!quotaError || !quota || quota.remaining === 0 || !draft.trim()} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Enviar</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">{quota ? `${quota.remaining} de 5 preguntas disponibles hoy.` : 'Comprobando preguntas disponibles…'} Enter envía; Shift + Enter añade una línea.</p>
      {historyError && <p role="status" className="mt-2 text-xs text-amber-700">{historyError}</p>}
      {quota?.remaining === 0 && <p className="mt-2 text-sm text-slate-700">¿Necesitas ayuda antes del reinicio? <a className="font-semibold text-emerald-800 underline" href="mailto:Yuam_support@protonmail.com">Contacta a soporte</a>.</p>}
      {quotaError && <p role="alert" className="mt-2 text-xs text-rose-700">{quotaError} <button type="button" onClick={() => { void refreshQuota().then(applyQuota).catch(() => setQuotaError('No se pudo comprobar la cuota.')) }} className="font-semibold underline">Reintentar</button></p>}
    </form>
    {open && limitOpen && <Dialog title="Límite diario alcanzado" description="Ya utilizaste tus cinco preguntas de hoy. Tu cuota se renueva a diario y se mantiene aunque cierres sesión o abras otra ventana." onClose={() => setLimitOpen(false)}><p className="text-sm text-slate-300">{quota && `Podrás volver a preguntar el ${new Date(quota.resetsAt).toLocaleString('es-GT')}.`}</p><div className="mt-5 flex flex-wrap gap-3"><a href="mailto:Yuam_support@protonmail.com" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-300">Contactar soporte</a><button type="button" onClick={() => setLimitOpen(false)} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold">Entendido</button></div></Dialog>}
  </div>
}

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const { user, loading } = useAuth()
  const pathname = usePathname()
  if (pathname === '/yum') return null
  return <aside className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 print:hidden" aria-label="Asistente de YU’AM">
    <section id="yuam-chat-panel" role="dialog" aria-label="Asistente de YU’AM" aria-hidden={!open} className={`${open ? 'flex' : 'hidden'} z-[9999] h-[min(34rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl sm:w-96`}>
      <div className="flex items-center gap-3 bg-emerald-950 px-4 py-3 text-white">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50" aria-label="Yum, asistente de YU’AM"><RobotAvatar mood="idle" size={42} /></span>
        <div className="min-w-0 flex-1"><h2 className="font-semibold">Yum</h2><p className="text-xs text-emerald-100">Guía de YU&apos;AM &amp; Fotobiorreactores</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="rounded-lg p-2 text-lg leading-none hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">×</button>
      </div>
      {loading ? <p role="status" className="p-5 text-sm text-slate-600">Comprobando sesión…</p> : user ? <YumChatSession key={user.id} open={open} onMoodChange={setMood} /> : <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <RobotAvatar mood="pointing" size={86} />
        <p className="text-sm leading-relaxed text-slate-700">El asistente eco-tecnológico requiere una sesión para consultar la bóveda de YU&apos;AM.</p>
        <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Iniciar sesión</Link>
      </div>}
    </section>
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="yuam-chat-panel" className="z-[9999] flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
      <RobotAvatar mood={loading ? 'working' : !user ? 'pointing' : mood} size={30} /><span>{open ? 'Ocultar chat' : 'Preguntar a Yum'}</span>
    </button>
  </aside>
}
