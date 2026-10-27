'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

export default function Dialog({ title, description, children, onClose, busy = false, size = 'default' }: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  busy?: boolean
  size?: 'default' | 'wide'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal()
  }, [])
  return <dialog ref={ref} onClose={onClose} onCancel={event => { if (busy) event.preventDefault() }} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={`fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] ${size === 'wide' ? 'max-w-5xl' : 'max-w-lg'} overflow-y-auto rounded-3xl border border-emerald-800 bg-slate-950 p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/70`}>
    <header className="border-b border-emerald-900/60 px-6 py-5"><div className="flex items-start justify-between gap-4"><h2 id={titleId} className="text-xl font-semibold text-emerald-100">{title}</h2><button type="button" disabled={busy} onClick={() => ref.current?.close()} aria-label="Cerrar ventana" className="grid min-h-11 min-w-11 place-items-center rounded-lg px-2 py-1 text-xl leading-none text-slate-300 hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:opacity-50">×</button></div>{description && <p id={descriptionId} className="mt-3 text-sm leading-6 text-slate-300">{description}</p>}</header>
    <div className="px-6 py-5">{children}</div>
  </dialog>
}
