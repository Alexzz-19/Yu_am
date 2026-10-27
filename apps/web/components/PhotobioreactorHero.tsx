'use client'

import { motion, useReducedMotion } from 'framer-motion'

const bubbles = [
  { x: 82, delay: 0, duration: 5.2, size: 8 },
  { x: 122, delay: 1.4, duration: 6.1, size: 5 },
  { x: 176, delay: 0.7, duration: 5.8, size: 7 },
  { x: 219, delay: 2.1, duration: 6.4, size: 5 },
  { x: 263, delay: 1.1, duration: 5.5, size: 8 },
  { x: 300, delay: 2.8, duration: 6.7, size: 4 },
]

export default function PhotobioreactorHero() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      className="relative mx-auto aspect-[4/3] w-full max-w-[38rem] overflow-hidden rounded-[2rem] border border-emerald-100 bg-[radial-gradient(ellipse_at_50%_90%,#d1fae5_0%,#f0fdf4_47%,#ffffff_80%)] shadow-[0_28px_90px_-50px_rgba(5,150,105,0.55)]"
      aria-label="Ilustración animada de un fotobiorreactor con microalgas"
    >
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6" aria-hidden="true">
        <span className="rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm">Cultivo fotobiológico</span>
        <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"><span className="size-2 rounded-full bg-emerald-500" />Intercambio de gases</span>
      </div>

      <svg viewBox="0 0 380 300" role="img" aria-labelledby="reactor-title reactor-desc" className="absolute inset-0 h-full w-full">
        <title id="reactor-title">Fotobiorreactor de microalgas YU’AM</title>
        <desc id="reactor-desc">Un recipiente transparente contiene un cultivo verde. Burbujas de dióxido de carbono ascienden entre indicadores de pH, luz y temperatura.</desc>
        <defs>
          <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".9"/><stop offset=".5" stopColor="#dcfce7" stopOpacity=".35"/><stop offset="1" stopColor="#a7f3d0" stopOpacity=".65"/></linearGradient>
          <linearGradient id="algae" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#86efac"/><stop offset=".42" stopColor="#34d399"/><stop offset="1" stopColor="#047857"/></linearGradient>
          <clipPath id="vessel-clip"><path d="M108 62h164v177a20 20 0 0 1-20 20H128a20 20 0 0 1-20-20V62Z"/></clipPath>
          <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>

        <ellipse cx="190" cy="264" rx="118" ry="13" fill="#059669" opacity=".12" filter="url(#soft-glow)" />
        <g clipPath="url(#vessel-clip)">
          <rect x="108" y="62" width="164" height="198" fill="url(#glass)" />
          <motion.path d="M106 142c28-12 53 8 84-1s54-10 86 0v120H106Z" fill="url(#algae)"
            animate={reducedMotion ? undefined : { d: ['M106 142c28-12 53 8 84-1s54-10 86 0v120H106Z', 'M106 137c30 11 54-10 84-1s54 11 86 0v125H106Z', 'M106 142c28-12 53 8 84-1s54-10 86 0v120H106Z'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          <path d="M134 68v171" stroke="white" strokeWidth="7" strokeLinecap="round" opacity=".46" />
          <path d="M246 72v154" stroke="#ecfdf5" strokeWidth="2" strokeLinecap="round" opacity=".65" />
          {bubbles.map((bubble, index) => <motion.circle key={index} cx={bubble.x} cy="219" r={bubble.size} fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5"
            initial={reducedMotion ? { cy: 132 } : { cy: 228, opacity: 0 }}
            animate={reducedMotion ? undefined : { cy: [228, 78], opacity: [0, .9, .65, 0], scale: [0.8, 1, 1.12] }}
            transition={{ duration: bubble.duration, delay: bubble.delay, repeat: Infinity, ease: 'easeInOut' }} />)}
          <motion.g animate={reducedMotion ? undefined : { rotate: [0, 5, -4, 0], y: [0, -2, 2, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '190px 190px' }}>
            <circle cx="166" cy="190" r="9" fill="#a7f3d0" opacity=".8"/><circle cx="198" cy="211" r="13" fill="#10b981" opacity=".45"/><circle cx="226" cy="177" r="7" fill="#d1fae5" opacity=".85"/><circle cx="154" cy="226" r="5" fill="#ecfdf5" opacity=".9"/>
          </motion.g>
        </g>
        <path d="M108 62h164v177a20 20 0 0 1-20 20H128a20 20 0 0 1-20-20V62Z" fill="url(#glass)" stroke="#047857" strokeOpacity=".35" strokeWidth="2" />
        <path d="M98 59h184M119 50h142" stroke="#065f46" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
        <path d="M190 43v31m-12-22h24" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        <path d="M153 261v13m74-13v13m-86 0h98" stroke="#047857" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
        <g fill="none" stroke="#10b981" strokeOpacity=".48" strokeWidth="1.5"><path d="M72 119h30m174 4h32M74 208h29m174-15h31"/><circle cx="70" cy="119" r="3" fill="#10b981"/><circle cx="310" cy="123" r="3" fill="#10b981"/><circle cx="70" cy="208" r="3" fill="#10b981"/><circle cx="312" cy="193" r="3" fill="#10b981"/></g>
      </svg>

      <div className="absolute bottom-4 left-3 right-3 flex flex-wrap justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5" aria-hidden="true">
        <span className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">pH <span className="text-emerald-700">Seguimiento</span></span>
        <span className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">Luz <span className="text-emerald-700">Fotoperiodo</span></span>
        <span className="hidden rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm min-[420px]:inline-block">CO₂ <span className="text-emerald-700">Intercambio</span></span>
      </div>
    </motion.div>
  )
}
