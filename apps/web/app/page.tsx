import { pageMetadata } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PhasesSection from '@/components/PhasesSection'
import PhotobioreactorHero from '@/components/PhotobioreactorHero'
import MotionReveal from '@/components/MotionReveal'

type Especificacion = {
  clave: string
  detalle: string
}

type Herramienta = {
  nombre: string
  descripcion: string
  href: string
  disponible: boolean
  icono: string
}

const especificaciones: Especificacion[] = [
  { clave: 'Sensado', detalle: 'Controladores compatibles y sensores de gases, pH, temperatura, humedad y luz según el montaje.' },
  { clave: 'Registro local', detalle: 'Puentes compatibles para conservar mediciones en un archivo CSV.' },
  { clave: 'Nube', detalle: 'Supabase: PostgreSQL, Realtime y Row Level Security.' },
  { clave: 'Privacidad', detalle: 'Ofuscación de coordenadas de nodos (Privacy-by-Design).' },
  { clave: 'Acceso', detalle: 'Sesión autenticada y claves individuales para conectar cada nodo.' },
]

const herramientas: Herramienta[] = [
  {
    nombre: 'Dashboard Telemetría',
    descripcion: 'Monitoriza nodos, sensores y series en tiempo real.',
    href: '/dashboard',
    disponible: true,
    icono: '📊',
  },
  {
    nombre: 'Mapa Global',
    descripcion: 'Nodos interactivos con ubicación ofuscada.',
    href: '/mapa',
    disponible: true,
    icono: '🗺️',
  },
  {
    nombre: 'Hub Científico & Buscador',
    descripcion: 'Protocolos, papers y biblioteca biotecnológica.',
    href: '/hub',
    disponible: true,
    icono: '🔬',
  },
  {
    nombre: 'Calculadora de Impacto & Simulador',
    descripcion: 'Proyecta captura de CO₂ y crecimiento del cultivo.',
    href: '/simulador',
    disponible: true,
    icono: '🧮',
  },
  {
    nombre: 'DIY Hardware Studio',
    descripcion: 'Arma tu fotobiorreactor con ESP32 y MQ-135.',
    href: '/hardware',
    disponible: true,
    icono: '🛠️',
  },
  {
    nombre: 'Auth & Perfil de Nodo',
    descripcion: 'Registra, autentica y gestiona tus nodos.',
    href: '/login',
    disponible: true,
    icono: '🔐',
  },
]

const ods = ['3', '4', '11', '12', '13']

export const metadata = pageMetadata("YU'AM | Plataforma IoT & Biotecnología para Fotobiorreactores", "Explora YU’AM: telemetría IoT, cultivos de microalgas, recursos científicos y hardware abierto para fotobiorreactores desde Guatemala.", "/", { absolute: true })

export default function Home() {
  return (
    <div className="bg-white font-sans text-slate-900 selection:bg-emerald-100">
      <Navbar />

      <main id="main-content" tabIndex={-1}>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Image
              src="/images/logos/logo-horizontal.webp"
              alt="Logotipo oficial YU'AM"
              width={1280}
              height={512}
              className="h-auto w-full max-w-xs object-contain"
            />
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              CleanTech · Telemetría IoT
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
              Fotobiorreactores y ciencia abierta en Guatemala.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              YU&apos;AM reúne lecturas de sensores, guías de hardware abierto y recursos científicos
              para estudiar cultivos de microalgas y fotobiorreactores desde Guatemala.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Ver telemetría en vivo
              </Link>
              <a
                href="#modulos"
                className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Explorar los módulos
              </a>
            </div>
          </div>

          <div className="relative min-w-0">
            <PhotobioreactorHero />
          </div>
        </section>

        {/* Visión y misión */}
        <MotionReveal><section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-emerald-600">Visión</h2>
              <p className="mt-4 text-2xl font-medium leading-snug text-slate-900">
                Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante
                interfaces inteligentes e IoT.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-emerald-600">Misión</h2>
              <p className="mt-4 text-2xl font-medium leading-snug text-slate-900">
                Optimizar la captura de CO₂ y la investigación de cultivos biológicos con hardware
                abierto, datos en tiempo real y ciencia reproducible.
              </p>
            </div>
          </div>
        </section></MotionReveal>

        {/* Módulos / fases interactivas */}
        <MotionReveal><PhasesSection /></MotionReveal>

        {/* Prototipo v2.0 */}
        <MotionReveal><section id="prototipo" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-sm font-medium text-emerald-600">Prototipo v2.0</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Hardware abierto, nube segura, datos en vivo.
            </h2>
            <dl className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {especificaciones.map((spec) => (
                <div key={spec.clave} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <dt className="font-mono text-sm text-emerald-700">{spec.clave}</dt>
                  <dd className="text-slate-600">{spec.detalle}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section></MotionReveal>

        {/* Impacto CleanTech */}
        <MotionReveal><section id="impacto" className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-emerald-600">Impacto CleanTech</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Ciencia abierta para un planeta más limpio.
              </h2>
            </div>
            <div className="space-y-4 leading-relaxed text-slate-600">
              <p>
                Cada nodo convierte un fotobiorreactor en una estación de investigación continua: mide,
                persiste ante fallas y comparte datos sin exponer la ubicación de quien investiga.
              </p>
              <p>
                La plataforma alinea su desarrollo con el Plan Nacional K&apos;atun 2032 de Guatemala y con
                los Objetivos de Desarrollo Sostenible.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {ods.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs text-emerald-700"
                  >
                    ODS {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section></MotionReveal>

        {/* Herramientas */}
        <MotionReveal><section id="herramientas" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-sm font-medium text-emerald-600">Herramientas</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Todo lo que necesitas para investigar.
            </h2>
            <ul className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {herramientas.map((herramienta) => (
                <li key={herramienta.nombre}>
                  {herramienta.disponible ? (
                    <Link
                      href={herramienta.href}
                      className="group flex items-center gap-5 py-5 transition hover:bg-slate-50 sm:gap-8"
                    >
                      <span className="text-xl">{herramienta.icono}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-slate-900">{herramienta.nombre}</span>
                        <span className="block text-sm text-slate-500">{herramienta.descripcion}</span>
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        Disponible
                      </span>
                      <span className="text-emerald-600 transition group-hover:translate-x-1">→</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-5 py-5 opacity-60 sm:gap-8">
                      <span className="text-xl grayscale">{herramienta.icono}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-slate-900">{herramienta.nombre}</span>
                        <span className="block text-sm text-slate-500">{herramienta.descripcion}</span>
                      </span>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-400">
                        Próximamente
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section></MotionReveal>
      </main>

      <Footer />
    </div>
  )
}
