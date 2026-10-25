'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

type ConsentChoice = 'all' | 'essential'
const CONSENT_KEY = 'yuam_cookie_consent'
const CHANGE_EVENT = 'yuam-cookie-consent-change'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function hasSavedConsent() {
  try {
    const saved = window.localStorage.getItem(CONSENT_KEY)
    return saved === 'all' || saved === 'essential'
  } catch {
    return false
  }
}

export default function CookieBanner() {
  const hasConsent = useSyncExternalStore(subscribe, hasSavedConsent, () => false)

  function choose(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice)
    } catch {
      // Consent storage may be disabled by the browser.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  if (hasConsent) return null

  return (
    <aside
      aria-label="Preferencias de cookies"
      className="fixed bottom-20 left-4 z-50 w-[calc(100vw-2rem)] max-w-xl rounded-2xl border border-emerald-200 bg-white p-5 text-slate-900 shadow-xl md:bottom-4"
    >
      <h2 className="text-base font-semibold">Tu privacidad en YU&apos;AM</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Usamos almacenamiento esencial para mantener tu sesión y guardar esta preferencia. Google Analytics
        mide visitas y navegación únicamente si aceptas las cookies analíticas.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        <Link href="/privacidad" className="font-medium text-emerald-800 underline">Política de privacidad</Link>
        {' · '}
        <Link href="/terminos" className="font-medium text-emerald-800 underline">Condiciones de servicio</Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose('all')}
          className="rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Aceptar todas
        </button>
        <button
          type="button"
          onClick={() => choose('essential')}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Solo esenciales
        </button>
      </div>
    </aside>
  )
}
