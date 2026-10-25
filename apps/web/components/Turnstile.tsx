'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string; callback: (token: string) => void;
        'expired-callback': () => void; 'error-callback': () => void;
        theme: 'light'; size: 'flexible'
      }) => string
      remove: (id: string) => void
    }
  }
}

export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const sitekey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  useEffect(() => {
    if (!ready || !sitekey || !container.current || !window.turnstile) return
    const api = window.turnstile
    const id = api.render(container.current, {
      sitekey, theme: 'light', size: 'flexible',
      callback: token => { setError(''); onToken(token) },
      'expired-callback': () => { onToken(''); setError('La verificación expiró. Completa de nuevo el CAPTCHA.') },
      'error-callback': () => { onToken(''); setError('No se pudo verificar el CAPTCHA. Revisa tu conexión y vuelve a intentarlo.') },
    })
    return () => api.remove(id)
  }, [ready, sitekey, onToken])
  if (!sitekey) return <p className="text-sm text-amber-800">El acceso por correo estará disponible cuando se configure la verificación anti-bot.</p>
  return <div>
    <Script id="yuam-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => { onToken(''); setError('No se pudo cargar la verificación. Revisa tu conexión.') }} />
    <div ref={container} className="min-h-16" />
    <p role="status" className="mt-2 text-sm text-amber-800">{error}</p>
  </div>
}
