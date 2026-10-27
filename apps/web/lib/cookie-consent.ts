export type CookieConsent = 'all' | 'essential'
export const CONSENT_KEY = 'yuam_cookie_consent'
export const CONSENT_EVENT = 'yuam-cookie-consent-change'
let memoryChoice: CookieConsent | null = null
let memoryOnly = false

export function getCookieConsent(): CookieConsent | null {
  if (memoryOnly) return memoryChoice
  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    return value === 'all' || value === 'essential' ? value : null
  } catch { return memoryChoice }
}

export function setCookieConsent(choice: CookieConsent | null) {
  memoryChoice = choice
  try {
    if (choice) window.localStorage.setItem(CONSENT_KEY, choice)
    else window.localStorage.removeItem(CONSENT_KEY)
    memoryOnly = false
  } catch { memoryOnly = true }
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (gaId) Object.assign(window, { [`ga-disable-${gaId}`]: choice !== 'all' })
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

export function subscribeCookieConsent(onChange: () => void) {
  const storageChanged = () => { memoryOnly = false; onChange() }
  window.addEventListener('storage', storageChanged)
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', storageChanged)
    window.removeEventListener(CONSENT_EVENT, onChange)
  }
}
