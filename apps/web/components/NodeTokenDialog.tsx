'use client'

import { useEffect, useRef, useState } from 'react'

export default function NodeTokenDialog({ token, nodeId, onClose }: { token: string; nodeId: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const tokenField = useRef<HTMLTextAreaElement>(null)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
  }, [])

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token)
      setCopyMessage('Token copiado al portapapeles.')
    } catch {
      tokenField.current?.focus()
      tokenField.current?.select()
      setCopyMessage('El navegador bloqueó el portapapeles. El token está seleccionado para copiarlo manualmente.')
    }
  }

  return (
    <dialog ref={dialog} onClose={onClose} aria-labelledby="node-token-title" aria-describedby="node-token-description" className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/70">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between gap-4"><h2 id="node-token-title" className="text-xl font-semibold">Guarda el token de tu nodo</h2><button type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar token" className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400">×</button></div>
        <p id="node-token-description" className="mt-2 text-sm leading-6 text-slate-300">Se muestra una sola vez. Cópialo a tu dispositivo o guárdalo antes de cerrar esta ventana.</p>
      </div>
      <div className="px-6 py-5">
        <p className="break-all text-xs text-slate-400">Nodo {nodeId}</p>
        <label htmlFor="node-secret" className="mt-4 block text-sm font-medium text-emerald-300">Token de ingesta</label>
        <textarea ref={tokenField} id="node-secret" value={token} readOnly rows={3} spellCheck={false} className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 font-mono text-sm leading-6 text-emerald-200 outline-none focus:border-emerald-400" />
        <p role="status" className="mt-3 min-h-5 text-sm text-slate-300">{copyMessage}</p>
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={copyToken} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Copiar Token</button><button type="button" onClick={() => dialog.current?.close()} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Entendido / Cerrar</button></div>
      </div>
    </dialog>
  )
}
