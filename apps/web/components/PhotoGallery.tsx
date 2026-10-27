'use client'

import Image from 'next/image'
import { useState } from 'react'
import Dialog from './ui/Dialog'

type Foto = { src: string; alt: string; badge: string; width: number; height: number }
const fotos: Foto[] = [
  { src: '/images/nosotros-principal.webp', alt: 'Equipo reunido en MILAB junto al prototipo con botellas iluminadas y figuras de la mascota', badge: 'Equipo y prototipo', width: 1280, height: 960 },
  { src: '/images/nosotros-1.webp', alt: 'Vista cercana del equipo y el fotobiorreactor con botellas de cultivo iluminadas en MILAB', badge: 'Prototipo en MILAB', width: 1280, height: 960 },
  { src: '/images/nosotros-2.webp', alt: 'Integrantes del proyecto posan junto a una figura de la mascota durante su visita a MILAB', badge: 'Equipo YU’AM', width: 1280, height: 960 },
  { src: '/images/nosotros-3.webp', alt: 'Integrantes del proyecto revisan información en una computadora portátil durante una sesión de trabajo', badge: 'Sesión de trabajo', width: 1280, height: 720 },
  { src: '/images/nosotros-4.webp', alt: 'Estudiantes y acompañantes conversan en el taller de MILAB, con impresoras 3D al fondo', badge: 'Intercambio en el taller', width: 1280, height: 720 },
]

export default function PhotoGallery() {
  const [selected, setSelected] = useState<Foto | null>(null)
  return <>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{fotos.map((foto, index) => <button type="button" key={foto.src} onClick={() => setSelected(foto)} aria-label={`Ampliar: ${foto.alt}`} className={`group relative cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${index === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-[4/3]'}`}><Image src={foto.src} alt={foto.alt} fill sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'} className="object-cover" /><span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-xs font-medium text-slate-700">{foto.badge}</span></button>)}</div>
    {selected && <Dialog size="wide" title="Galería del proyecto YU’AM" description={selected.alt} onClose={() => setSelected(null)}><figure><Image src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} className="mx-auto max-h-[65dvh] w-auto max-w-full rounded-xl object-contain" /><figcaption className="mt-4 text-center text-sm text-slate-200">{selected.badge}</figcaption></figure></Dialog>}
  </>
}
