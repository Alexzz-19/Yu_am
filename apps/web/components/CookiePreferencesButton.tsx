'use client'
import { setCookieConsent } from '@/lib/cookie-consent'

export default function CookiePreferencesButton({ label = 'Preferencias de cookies' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => setCookieConsent(null)}
      className="inline-flex min-h-11 items-center underline hover:text-emerald-700"
    >
      {label}
    </button>
  )
}
