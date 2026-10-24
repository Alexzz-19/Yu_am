'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type Fase = {
  numero: string
  titulo: string
  descripcion: string
  imagen: string
  tags: string[]
}

const fases: Fase[] = [
  {
    numero: '01',
    titulo: 'Biorreactor de luz verde',
    descripcion:
      'Núcleo de cultivo iluminado con LEDs de espectro ajustado que optimiza la fotosíntesis de microalgas y acelera la captura de carbono.',
    imagen: '/images/biorreactor-futurista.webp',
    tags: ['Hardware', 'Fotobiología'],
  },
  {
    numero: '02',
    titulo: 'Intercambio de CO₂ en microalgas',
    descripcion:
      'Las microalgas fijan CO₂ del ambiente y liberan oxígeno. El sensor MQ-135 cuantifica el intercambio gaseoso en tiempo real.',
    imagen: '/images/intercambio-co2-microalgas.webp',
    tags: ['Captura de carbono', 'MQ-135'],
  },
  {
    numero: '03',
    titulo: 'Diagrama modular IoT',
    descripcion:
      'Módulos ESP32 interconectados que persisten lecturas en búfer local y las transmiten a Supabase sin pérdidas ante fallas de red.',
    imagen: '/images/diagrama-modular-iot.webp',
    tags: ['ESP32', 'Supabase Realtime'],
  },
  {
    numero: '04',
    titulo: 'Sensores de agua y ambiente',
    descripcion:
      'Sondas de pH, oxígeno disuelto, temperatura y humedad con calibración específica para entornos biológicos.',
    imagen: '/images/sensores-agua-ambiente.webp',
    tags: ['Sensado', 'Calidad de agua'],
  },
  {
    numero: '05',
    titulo: 'Biotecnología abierta',
    descripcion:
      'Hardware y protocolos abiertos para democratizar la investigación biológica y la monitorización ambiental.',
    imagen: '/images/biotecnologia-abierta.webp',
    tags: ['Open source', 'Ciencia ciudadana'],
  },
  {
    numero: '06',
    titulo: 'Red mundial de aire limpio',
    descripcion:
      'Nodos distribuidos que comparten lecturas con ubicación ofuscada para un monitoreo ambiental global y privado.',
    imagen: '/images/red-aire-limpio.webp',
    tags: ['Red distribuida', 'Privacy-by-Design'],
  },
]

export default function PhasesSection() {
  const [activa, setActiva] = useState(0)
  const tarjetasRef = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            const elemento = entrada.target as HTMLElement
            const indice = Number(elemento.dataset.indice)
            if (!Number.isNaN(indice)) setActiva(indice)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )

    tarjetasRef.current.forEach((el) => {
      if (el) observador.observe(el)
    })

    return () => observador.disconnect()
  }, [])

  const faseActiva = fases[activa]

  return (
    <section id="modulos" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-medium text-emerald-600">Módulos del sistema</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Seis piezas que convierten un cultivo en una estación de investigación.
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* Panel fijo con la imagen de la fase activa */}
          <div className="self-start lg:sticky lg:top-24">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              {fases.map((fase, i) => (
                <Image
                  key={fase.imagen}
                  src={fase.imagen}
                  alt={fase.titulo}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority={i === 0}
                  className={`object-cover transition-opacity duration-500 ${
                    i === activa ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
            <div className="mt-5">
              <p className="font-mono text-sm text-emerald-600">Fase {faseActiva.numero}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">{faseActiva.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{faseActiva.descripcion}</p>
            </div>
          </div>

          {/* Lista scrolleable de fases */}
          <div className="space-y-4">
            {fases.map((fase, i) => (
              <div
                key={fase.numero}
                ref={(el) => {
                  tarjetasRef.current[i] = el
                }}
                data-indice={i}
                onMouseEnter={() => setActiva(i)}
                onClick={() => setActiva(i)}
                className={`cursor-pointer rounded-2xl border p-6 transition ${
                  i === activa
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">Fase {fase.numero}</span>
                  <div className="flex gap-2">
                    {fase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{fase.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{fase.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
