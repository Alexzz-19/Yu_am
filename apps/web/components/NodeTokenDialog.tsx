'use client'

import { useRef, useState } from 'react'
import Dialog from './ui/Dialog'

export default function NodeTokenDialog({ token, nodeId, onClose }: { token: string; nodeId: string; onClose: () => void }) {
  const tokenField = useRef<HTMLTextAreaElement>(null)
  const [copyMessage, setCopyMessage] = useState('')

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
    <Dialog title="Clave API de tu nodo" description="Copia esta clave para configurar tu dispositivo. Se oculta al cerrar la ventana; puedes consultarla de nuevo desde tu perfil." onClose={onClose}>
        <p className="break-all text-xs text-slate-400">Nodo {nodeId}</p>
        <label htmlFor="node-secret" className="mt-4 block text-sm font-medium text-emerald-300">Token de ingesta</label>
        <textarea ref={tokenField} id="node-secret" value={token} readOnly rows={3} spellCheck={false} className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 font-mono text-sm leading-6 text-emerald-200 outline-none focus:border-emerald-400" />
        <p role="status" className="mt-3 min-h-5 text-sm text-slate-300">{copyMessage}</p>
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={copyToken} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Copiar</button><button type="button" onClick={onClose} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Entendido</button></div>
    </Dialog>
  )
}
