'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/use-auth'
import { YumChatSession } from '@/components/ChatBotWidget'

type Mood = 'idle' | 'working' | 'happy' | 'sad' | 'pointing'

export default function YumControlCenter() {
  const { user, loading } = useAuth()
  const [mood, setMood] = useState<Mood>('idle')
  return <section className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl shadow-emerald-950/5">
    <header className="flex items-center gap-4 bg-emerald-950 px-5 py-5 text-white sm:px-8">
      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50"><Image src={`/images/yum/yum-${mood}.webp?v=20261025-alpha`} alt={`Yum, ${mood === 'working' ? 'analizando tu consulta' : 'guía técnica de YU’AM'}`} width={58} height={58} className="object-contain" /></span>
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Centro de asistencia</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Yum</h1><p className="mt-1 text-sm text-emerald-100">Guía de YU&apos;AM &amp; Fotobiorreactores</p></div>
    </header>
    <div className="p-3 sm:p-6">
      {loading ? <p role="status" className="p-8 text-center text-sm text-slate-600">Comprobando sesión…</p> : user
        ? <div className="flex h-[min(68vh,48rem)] min-h-[34rem] flex-col overflow-hidden rounded-2xl border border-slate-200"><YumChatSession key={user.id} open onMoodChange={setMood} /></div>
        : <div className="flex min-h-[28rem] flex-col items-center justify-center gap-5 px-5 text-center"><Image src="/images/yum/yum-pointing.webp?v=20261025-alpha" alt="Yum te invita a iniciar sesión para consultar la asistencia técnica" width={180} height={230} className="h-44 w-auto object-contain" /><h2 className="text-xl font-bold text-slate-950">Inicia sesión para consultar a Yum</h2><p className="max-w-md text-sm leading-6 text-slate-600">El historial y las cinco consultas diarias se asocian de forma privada a tu cuenta.</p><Link href="/login" className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900">Iniciar sesión</Link></div>}
    </div>
  </section>
}
