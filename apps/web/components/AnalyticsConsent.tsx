'use client'

import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { getCookieConsent, subscribeCookieConsent } from '@/lib/cookie-consent'

export default function AnalyticsConsent({ gaId, children }: { gaId: string; children: ReactNode }) {
  const consent = useSyncExternalStore(subscribeCookieConsent, getCookieConsent, () => null)
  const enabled = consent === 'all'
  useEffect(() => {
    // La marca desactiva también una instancia de GA ya cargada al retirar permiso.
    Object.assign(window, { [`ga-disable-${gaId}`]: !enabled })
  }, [enabled, gaId])
  return enabled ? children : null
}
