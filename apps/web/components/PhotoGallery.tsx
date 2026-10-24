'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type Foto = {
  src: string
  alt: string
  badge: string
}

const fotos: Foto[] = [
  { src: '/images/nosotros-principal.webp', alt: 'Prototipo del fotobiorreactor YU\'AM', badge: 'Prototipo YU\'AM v2.0' },
  { src: '/images/nosotros-1.webp', alt: 'Pruebas de laboratorio del equipo YU\'AM', badge: 'Laboratorio MILAB' },
  { src: '/images/nosotros-2.webp', alt: 'Ensamble de sensores y cultivo de microalgas', badge: 'Equipo YU\'AM' },
  { src: '/images/nosotros-3.webp', alt: 'Medición de calidad del aire con MQ-135', badge: 'Sensado MQ-135' },
  { src: '/images/nosotros-4.webp', alt: 'Presentación del prototipo YU\'AM', badge: 'Presentación' },
]

export default function PhotoGallery() {
  const [seleccionada, setSeleccionada] = useState<Foto | null>(null)

  useEffect(() => {
    if (!seleccionada) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSeleccionada(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [seleccionada])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {fotos.map((foto, i) => (
          <button
            type="button"
            key={foto.src}
            onClick={() => setSeleccionada(foto)}
            aria-label={`Ampliar: ${foto.alt}`}
            className={`group relative cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${
              i === 0 ? 'col-span-2 aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto' : 'aspect-[4/3]'
            }`}
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
              priority={i === 0}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
              {foto.badge}
            </span>
          </button>
        ))}
      </div>

      {seleccionada && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setSeleccionada(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setSeleccionada(null)}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>
          <figure className="max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image
              src={seleccionada.src}
              alt={seleccionada.alt}
              width={1600}
              height={1200}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
            />
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center text-sm text-white/90">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
                {seleccionada.badge}
              </span>
              <span>{seleccionada.alt}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
