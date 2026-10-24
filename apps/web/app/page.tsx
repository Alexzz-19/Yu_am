import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Punto de integración Supabase
// El Dashboard (/dashboard) ya consume telemetría en tiempo real desde
// `telemetria_mq135`. Los tipos de abajo replican el esquema público y pueden
// sustituirse por tipos generados: Database['public']['Tables']['readings']['Row'].
// ─────────────────────────────────────────────────────────────────────────────

type Lectura = {
  etiqueta: string
  valor: string
  unidad: string
}

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

const lecturas: Lectura[] = [
  { etiqueta: 'CO₂ · MQ-135', valor: '412.5', unidad: 'ppm' },
  { etiqueta: 'Temperatura', valor: '26.4', unidad: '°C' },
  { etiqueta: 'pH del medio', valor: '7.2', unidad: 'pH' },
  { etiqueta: 'O₂ disuelto', valor: '6.8', unidad: 'mg/L' },
]

const especificaciones: Especificacion[] = [
  { clave: 'Sensado', detalle: 'ESP32 + MQ-135: CO₂, temperatura, humedad y calidad de aire.' },
  { clave: 'Resiliencia', detalle: 'Búfer local ante fallas de red; la telemetría no se pierde.' },
  { clave: 'Nube', detalle: 'Supabase: PostgreSQL, Realtime y Row Level Security.' },
  { clave: 'Privacidad', detalle: 'Ofuscación de coordenadas de nodos (Privacy-by-Design).' },
  { clave: 'Acceso', detalle: 'Autenticación segura y hasta 4 API keys por usuario.' },
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
    disponible: false,
    icono: '🗺️',
  },
  {
    nombre: 'Hub Científico & Buscador',
    descripcion: 'Protocolos, papers y biblioteca biotecnológica.',
    href: '/hub',
    disponible: false,
    icono: '🔬',
  },
  {
    nombre: 'Calculadora de Impacto & Simulador',
    descripcion: 'Proyecta captura de CO₂ y crecimiento del cultivo.',
    href: '/calculadora',
    disponible: false,
    icono: '🧮',
  },
  {
    nombre: 'DIY Hardware Studio',
    descripcion: 'Arma tu fotobiorreactor con ESP32 y MQ-135.',
    href: '/diy',
    disponible: false,
    icono: '🛠️',
  },
  {
    nombre: 'Auth & Perfil de Nodo',
    descripcion: 'Registra, autentica y gestiona tus nodos.',
    href: '/auth',
    disponible: false,
    icono: '🔐',
  },
]

const ods = ['3', '4', '11', '12', '13']

export default function Home() {
  return (
    <div className="min-h-screen bg-[#03110D] text-[#E8F5F0] font-sans selection:bg-emerald-500/30">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#03110D]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-mono text-sm text-emerald-300">
              🌱
            </div>
            <div className="leading-tight">
              <span className="font-semibold tracking-tight text-emerald-300">YU&apos;AM</span>
              <span className="block text-xs text-[#7FA79A]">fotobiorreactores en tiempo real</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[#9CC3B6] md:flex">
            <a href="#prototipo" className="transition hover:text-emerald-300">
              Prototipo
            </a>
            <a href="#impacto" className="transition hover:text-emerald-300">
              Impacto
            </a>
            <a href="#herramientas" className="transition hover:text-emerald-300">
              Herramientas
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-[#03110D] transition hover:bg-emerald-400"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm text-emerald-300/80">
              Telemetría viva para fotobiorreactores — MILAB, Guatemala
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Biotecnología que respira en tiempo real.
            </h1>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-emerald-400 to-transparent" />
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#9CC3B6] sm:text-lg">
              YU&apos;AM conecta fotobiorreactores a la nube con nodos IoT (ESP32 + MQ-135), optimiza la
              captura de CO₂ y abre la investigación biológica a cualquier persona, con privacidad desde
              el diseño.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-[#03110D] shadow-[0_0_40px_-12px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
              >
                Ver telemetría en vivo
              </Link>
              <a
                href="#prototipo"
                className="rounded-lg border border-emerald-800/60 px-6 py-3 text-sm font-medium text-emerald-200 transition hover:border-emerald-500/60 hover:bg-emerald-500/10"
              >
                Conocer el prototipo v2.0
              </a>
            </div>
          </div>

          {/* Reactor + instrumento */}
          <div className="flex flex-col items-center md:items-end">
            <div className="relative">
              <div className="relative h-72 w-40 overflow-hidden rounded-[2.5rem] border border-emerald-500/25 bg-gradient-to-b from-[#04231C] to-[#02110D] shadow-[0_0_90px_-25px_rgba(16,185,129,0.6)]">
                <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-emerald-500/35 via-teal-400/20 to-cyan-300/10" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-emerald-400/10 blur-2xl [animation-duration:5s] motion-reduce:animate-none" />
                <div className="absolute bottom-10 left-6 h-2 w-2 animate-pulse rounded-full bg-emerald-300/70 motion-reduce:animate-none" />
                <div className="absolute bottom-20 left-14 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/70 [animation-delay:1s] motion-reduce:animate-none" />
                <div className="absolute bottom-16 left-24 h-2.5 w-2.5 animate-pulse rounded-full bg-teal-300/60 [animation-delay:2s] motion-reduce:animate-none" />
              </div>
              <div className="absolute -top-3 left-8 h-6 w-2 rounded-full bg-emerald-500/40" />
              <div className="absolute -top-3 right-8 h-6 w-2 rounded-full bg-emerald-500/40" />
            </div>

            <div className="mt-6 w-full max-w-xs rounded-xl border border-emerald-800/40 bg-[#04120E]/90 p-4 font-mono text-xs">
              <p className="mb-2 text-[#4E7568]">referencia de telemetría</p>
              {lecturas.map((lectura) => (
                <div
                  key={lectura.etiqueta}
                  className="flex items-baseline justify-between border-b border-emerald-900/40 py-1.5 last:border-0"
                >
                  <span className="text-[#7FA79A]">{lectura.etiqueta}</span>
                  <span className="text-emerald-300">
                    {lectura.valor} <span className="text-[#4E7568]">{lectura.unidad}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visión y misión */}
        <section className="border-t border-emerald-900/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
            <div>
              <h2 className="text-sm text-emerald-300/80">Visión</h2>
              <p className="mt-4 text-2xl font-medium leading-snug text-[#E8F5F0]">
                Democratizar el conocimiento biotecnológico y la monitorización ambiental mediante
                interfaces inteligentes e IoT.
              </p>
            </div>
            <div>
              <h2 className="text-sm text-emerald-300/80">Misión</h2>
              <p className="mt-4 text-2xl font-medium leading-snug text-[#E8F5F0]">
                Optimizar la captura de CO₂ y la investigación de cultivos biológicos con hardware
                abierto, datos en tiempo real y ciencia reproducible.
              </p>
            </div>
          </div>
        </section>

        {/* Prototipo v2.0 */}
        <section id="prototipo" className="border-t border-emerald-900/40">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <p className="text-sm text-emerald-300/80">Prototipo v2.0</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Hardware abierto, nube segura, datos en vivo.
            </h2>
            <dl className="mt-10 divide-y divide-emerald-900/40 border-y border-emerald-900/40">
              {especificaciones.map((spec) => (
                <div key={spec.clave} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <dt className="font-mono text-sm text-emerald-300">{spec.clave}</dt>
                  <dd className="text-[#9CC3B6]">{spec.detalle}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Impacto CleanTech */}
        <section id="impacto" className="border-t border-emerald-900/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
            <div>
              <p className="text-sm text-emerald-300/80">Impacto CleanTech</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Ciencia abierta para un planeta más limpio.
              </h2>
            </div>
            <div className="space-y-4 text-[#9CC3B6] leading-relaxed">
              <p>
                Cada nodo convierte un fotobiorreactor en una estación de investigación continua:
                mide, persiste ante fallas y comparte datos sin exponer la ubicación de quien investiga.
              </p>
              <p>
                La plataforma alinea su desarrollo con el Plan Nacional K&apos;atun 2032 de Guatemala y
                con los Objetivos de Desarrollo Sostenible.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {ods.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-emerald-800/50 bg-emerald-500/5 px-3 py-1 font-mono text-xs text-emerald-300"
                  >
                    ODS {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Herramientas */}
        <section id="herramientas" className="border-t border-emerald-900/40">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <p className="text-sm text-emerald-300/80">Herramientas</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que necesitas para investigar.
            </h2>
            <ul className="mt-10 divide-y divide-emerald-900/40 border-y border-emerald-900/40">
              {herramientas.map((herramienta) => (
                <li key={herramienta.nombre}>
                  {herramienta.disponible ? (
                    <Link
                      href={herramienta.href}
                      className="group flex items-center gap-5 py-5 transition hover:bg-emerald-500/5 sm:gap-8"
                    >
                      <span className="text-xl">{herramienta.icono}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-[#E8F5F0]">{herramienta.nombre}</span>
                        <span className="block text-sm text-[#7FA79A]">{herramienta.descripcion}</span>
                      </span>
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        Disponible
                      </span>
                      <span className="text-emerald-300 transition group-hover:translate-x-1">→</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-5 py-5 opacity-60 sm:gap-8">
                      <span className="text-xl grayscale">{herramienta.icono}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-[#E8F5F0]">{herramienta.nombre}</span>
                        <span className="block text-sm text-[#7FA79A]">{herramienta.descripcion}</span>
                      </span>
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                        Próximamente
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-[#4E7568] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 YU&apos;AM · MILAB · Plan K&apos;atun 2032 · ODS 3, 4, 11, 12, 13</p>
          <p>bionexo_support@proton.me</p>
        </div>
      </footer>
    </div>
  )
}
