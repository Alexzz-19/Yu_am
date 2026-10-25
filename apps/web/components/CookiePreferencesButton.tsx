'use client'

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.removeItem('yuam_cookie_consent')
        } catch {
          // The banner can still be reopened if browser storage is disabled.
        }
        window.dispatchEvent(new Event('yuam-cookie-consent-change'))
      }}
      className="underline hover:text-emerald-700"
    >
      Preferencias de cookies
    </button>
  )
}
