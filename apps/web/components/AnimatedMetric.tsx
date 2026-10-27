'use client'

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedMetric({ value, digits, unit, loading }: { value: number | null | undefined; digits: number; unit: string; loading: boolean }) {
  const reducedMotion = useReducedMotion()
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : null
  const counter = useMotionValue(numericValue ?? 0)
  const [display, setDisplay] = useState('')
  useMotionValueEvent(counter, 'change', current => setDisplay(current.toFixed(digits)))

  useEffect(() => {
    if (numericValue === null) return
    if (reducedMotion) {
      counter.set(numericValue)
      return
    }
    const controls = animate(counter, numericValue, { duration: 0.65, ease: 'easeOut' })
    return () => controls.stop()
  }, [counter, digits, numericValue, reducedMotion])

  if (numericValue === null && loading) return <span aria-hidden="true" className="metric-shimmer inline-block h-8 w-20 rounded-md" />
  if (numericValue === null) return <span className="font-sans text-sm font-medium text-slate-600">Sin datos</span>
  return <>{reducedMotion ? numericValue.toFixed(digits) : display}{unit && <span className="ml-2 font-sans text-xs text-slate-600">{unit}</span>}</>
}
