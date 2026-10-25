'use client'

import { useEffect, useSyncExternalStore, type ReactNode } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('yuam-cookie-consent-change', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('yuam-cookie-consent-change', callback)
  }
}

function accepted() {
  try { return localStorage.getItem('yuam_cookie_consent') === 'all' } catch { return false }
}

export default function AnalyticsConsent({ gaId, children }: { gaId: string; children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, accepted, () => false)
  useEffect(() => {
    // La marca desactiva también una instancia de GA ya cargada al retirar permiso.
    Object.assign(window, { [`ga-disable-${gaId}`]: !enabled })
  }, [enabled, gaId])
  return enabled ? children : null
}
