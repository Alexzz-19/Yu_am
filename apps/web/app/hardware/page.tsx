import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HardwareClient from '@/components/HardwareClient'
import HardwareFieldGuide from '@/components/HardwareFieldGuide'

export default function HardwarePage() {
  return (
    <div className="bg-white font-sans text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-medium text-emerald-600">DIY Hardware Studio</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Guía completa de replicabilidad open source.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Construye tu propio fotobiorreactor YU&apos;AM con hardware abierto, firmware listo para cargar y
          materiales reciclados de bajo costo.
        </p>
        <aside
          aria-label="Requisito de Seguridad y Estructura"
          className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950"
        >
          <p>
            <strong>⚠️ Requisito de Seguridad y Estructura:</strong> La base debe ser resistente al
            agua y a la humedad (madera sellada con barniz marino, PVC, acrílico o aluminio).
            Mantén la caja del circuito electrónico (ESP32/fuente) en la parte superior, aislada de
            posibles goteos o salpicaduras.
          </p>
        </aside>
        <HardwareClient />
        <HardwareFieldGuide />
        <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-emerald-900">
            🌱 Aprovechamiento de Biomasa Cosechada y Residuos
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-emerald-800">
            La biomasa cosechada y los residuos biológicos permiten cerrar el ciclo del cultivo y
            aprovechar sus nutrientes en una economía circular.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-800">
            <li>Biofertilizante orgánico rico en nitrógeno y fósforo para plantas y cultivos.</li>
            <li>
              Materia prima para suplementos proteicos, cosmética y extractos pigmentarios
              (Phycocyanin).
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  )
}
