import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PhotoGallery from '@/components/PhotoGallery'

type Material = {
  nombre: string
  icono: string
  detalle: string
  categoria: string
}

const materiales: Material[] = [
  {
    nombre: 'Placa Arduino / Snapino',
    icono: '🔌',
    detalle: 'Cerebro del sistema que orquesta sensores y actuadores.',
    categoria: 'IoT',
  },
  {
    nombre: 'Sensor MQ-135',
    icono: '🌫️',
    detalle: 'Mide CO₂ y calidad del aire en tiempo real.',
    categoria: 'IoT',
  },
  {
    nombre: 'Cultivo de microalgas Chlorella',
    icono: '🟢',
    detalle: 'Biomasa viva que fija carbono por fotosíntesis.',
    categoria: 'Biomasa',
  },
  {
    nombre: 'Luces LED',
    icono: '💡',
    detalle: 'Espectro ajustado para acelerar la fotosíntesis.',
    categoria: 'Hardware',
  },
  {
    nombre: 'Bomba de agua',
    icono: '⛲',
    detalle: 'Recircula el medio de cultivo y oxigena la biomasa.',
    categoria: 'Hidráulica',
  },
  {
    nombre: 'Botellas recicladas de 2 litros',
    icono: '♻️',
    detalle: 'Recipientes del reactor: economía circular desde el diseño.',
    categoria: 'Reciclado',
  },
  {
    nombre: 'Mangueras transparentes',
    icono: '🔗',
    detalle: 'Conducen el flujo de agua y CO₂ entre módulos.',
    categoria: 'Hidráulica',
  },
  {
    nombre: 'Estante de madera',
    icono: '🪵',
    detalle: 'Estructura estable y de bajo impacto ambiental.',
    categoria: 'Estructura',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white font-sans text-slate-900">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Image
              src="/images/logos/logo-horizontal.webp"
              alt="Logotipo oficial YU'AM"
              width={1280}
              height={512}
              priority
              className="h-auto w-full max-w-sm object-contain"
            />
            <p className="mt-8 text-sm font-medium text-emerald-600">Nosotros · Historia del prototipo</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
              Un fotobiorreactor nacido de la crisis del aire.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              La historia de YU&apos;AM es la de un equipo que decidió responder a la contaminación del aire
              con biotecnología accesible, hardware abierto y datos en tiempo real.
            </p>
          </div>
        </section>

        {/* Origen */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_2fr] md:py-20">
            <h2 className="text-sm font-medium text-emerald-600">Origen de la propuesta</h2>
            <div className="space-y-4 leading-relaxed text-slate-600">
              <p>
                YU&apos;AM nació de una pregunta sencilla: ¿qué pasaría si una comunidad pudiera capturar
                dióxido de carbono con biotecnología construida a partir de los materiales que ya tiene a
                la mano?
              </p>
              <p>
                La idea del fotobiorreactor accesible surgió al observar cómo las microalgas —organismos
                microscópicos— hacen de forma natural lo que las grandes plantas industriales intentan
                replicar: fijar CO₂ y devolver oxígeno. Convertir ese proceso en un dispositivo abierto,
                medible en tiempo real y replicable fue el origen de este prototipo.
              </p>
              <div className="flex items-center gap-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <Image src="/images/yum/yum-perspective.webp" alt="Yum, robot asistente del proyecto MILAB YU'AM" width={82} height={120} className="h-24 w-auto shrink-0 object-contain" />
                <p className="text-sm leading-relaxed text-emerald-950">Yum acompaña esta historia como el robot asistente de MILAB: ayuda a descubrir el proyecto y a consultar sus notas científicas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Justificación */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_2fr] md:py-20">
            <h2 className="text-sm font-medium text-emerald-600">Justificación</h2>
            <div className="space-y-4 leading-relaxed text-slate-600">
              <p>
                Frente a la crisis climática y a la falta de sensores ambientales accesibles en tiempo real,
                las soluciones locales de captura biológica de carbono se vuelven urgentes.
              </p>
              <p>
                La mayoría de los biorreactores comerciales son costosos y cerrados. YU&apos;AM propone lo
                contrario: hardware abierto, materiales reciclados y telemetría IoT con ESP32 y MQ-135, para
                que medir y mitigar emisiones no dependa de grandes presupuestos.
              </p>
            </div>
          </div>
        </section>

        {/* Galería: del taller al laboratorio */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <p className="text-sm font-medium text-emerald-600">Del taller al laboratorio</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Pruebas reales, materiales reales.
            </h2>
            <div className="mt-10">
              <PhotoGallery />
            </div>
          </div>
        </section>

        {/* Impacto comunitario y juvenil */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_2fr] md:py-20">
            <h2 className="text-sm font-medium text-emerald-600">Impacto comunitario y juvenil</h2>
            <div className="space-y-4 leading-relaxed text-slate-600">
              <p>
                El prototipo no solo reduce emisiones a escala local: convierte el aula y el taller en
                laboratorios vivos.
              </p>
              <p>
                Al usar botellas recicladas, placas accesibles como Arduino y código abierto, YU&apos;AM inspira
                a jóvenes a involucrarse en proyectos STEM, hardware abierto y biotecnología, demostrando que
                la ciencia no es un privilegio, sino una herramienta al alcance de cualquier persona.
              </p>
            </div>
          </div>
        </section>

        {/* Materiales */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <p className="text-sm font-medium text-emerald-600">Lista de materiales y hardware</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Ocho piezas, un reactor vivo.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {materiales.map((material) => (
                <div
                  key={material.nombre}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
                >
                  <span className="absolute right-4 top-4 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                    {material.categoria}
                  </span>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-2xl transition group-hover:scale-110">
                    {material.icono}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{material.nombre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{material.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mensaje reflexivo */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="mx-auto mb-6 h-px w-16 bg-emerald-500" />
            <p className="text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">
              «La democratización de la ciencia y la economía circular no son ideales lejanos: son decisiones
              de diseño.»
            </p>
            <p className="mt-8 leading-relaxed text-slate-600">
              Cada botella reutilizada y cada lectura compartida nos recuerdan que la responsabilidad
              ambiental se construye con manos locales, conocimiento abierto y la convicción de que el aire
              limpio es un derecho, no un lujo.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
