'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function MotionReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion()
  return <motion.div
    className={className}
    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : delay, ease: 'easeOut' }}
  >{children}</motion.div>
}
