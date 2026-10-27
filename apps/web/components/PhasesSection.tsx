'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import NetworkIllustration from './NetworkIllustration'

type Fase = {
  numero: string
  titulo: string
  descripcion: string
  imagen: string | null
  alt: string
  visualType?: 'photo'
  tags: string[]
}

const fases: Fase[] = [
  {
    numero: '01',
    titulo: 'Biorreactor de luz verde',
    descripcion:
      'La iluminación LED permite ajustar el fotoperiodo del cultivo de microalgas según el protocolo de la cepa.',
    imagen: '/images/biorreactor-futurista.webp',
    alt: 'Ilustración conceptual de un fotobiorreactor cilíndrico con cultivo verde e iluminación',
    tags: ['Hardware', 'Fotobiología'],
  },
  {
    numero: '02',
    titulo: 'Intercambio de CO₂ en microalgas',
    descripcion:
      'Las microalgas incorporan carbono mediante fotosíntesis. El intercambio gaseoso se evalúa con instrumentos calibrados y un balance de entradas y salidas.',
    imagen: '/images/intercambio-co2-microalgas.webp',
    alt: 'Esquema conceptual de Chlorella con entradas de CO₂ y salida de oxígeno durante la fotosíntesis',
    tags: ['Captura de carbono', 'MQ-135'],
  },
  {
    numero: '03',
    titulo: 'Diagrama modular IoT',
    descripcion:
      'Controladores y sondas transmiten mediciones a Supabase. Los puentes compatibles permiten guardar un registro local para consultarlo ante fallas de red.',
    imagen: '/images/diagrama-modular-iot.webp',
    alt: 'Despiece conceptual de un reactor con tubo de acrílico, sondas y una placa ESP32 en una carcasa modular',
    tags: ['ESP32', 'Supabase Realtime'],
  },
  {
    numero: '04',
    titulo: 'Sensores de agua y ambiente',
    descripcion:
      'Sondas de pH y temperatura y sensores de aire o humedad, según el montaje. Cada sensor necesita una calibración apropiada.',
    imagen: '/images/sensores-agua-ambiente.webp',
    alt: 'Ilustración conceptual de una sonda de pH, una sonda de temperatura y un sensor de gases',
    tags: ['Sensado', 'Calidad de agua'],
  },
  {
    numero: '05',
    titulo: 'Biotecnología abierta',
    descripcion:
      'Hardware y protocolos abiertos para democratizar la investigación biológica y la monitorización ambiental.',
    imagen: '/images/nosotros-3.webp',
    visualType: 'photo',
    alt: 'Integrantes del proyecto revisan el trabajo en una computadora portátil durante una sesión en MILAB',
    tags: ['Open source', 'Ciencia ciudadana'],
  },
  {
    numero: '06',
    titulo: 'Red mundial de aire limpio',
    descripcion:
      'Nodos distribuidos que comparten lecturas con ubicación ofuscada para un monitoreo ambiental global y privado.',
    imagen: null,
    alt: 'Esquema conceptual de una red que conecta sensores, cultivos, lecturas y comunidad',
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
              {faseActiva.imagen ? <Image
                  key={faseActiva.imagen}
                  src={faseActiva.imagen}
                  alt={faseActiva.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority={activa === 0}
                  className="object-cover"
                /> : <NetworkIllustration />}
            </div>
            <div className="mt-5">
              <h3 className="mt-1 text-xl font-semibold text-slate-900">{faseActiva.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{faseActiva.descripcion}</p>
              <p className="mt-3 text-xs text-slate-500">{faseActiva.visualType === 'photo' ? 'Fotografía de una sesión de trabajo en MILAB.' : 'Ilustración conceptual del sistema; consulta las fotos del prototipo en Nosotros.'}</p>
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
                onFocus={() => setActiva(i)}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiva(i) } }}
                role="button"
                tabIndex={0}
                aria-pressed={i === activa}
                className={`cursor-pointer rounded-2xl border p-6 transition ${
                  i === activa
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
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
