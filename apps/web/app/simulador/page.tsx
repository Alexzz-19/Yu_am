import { pageMetadata } from '@/lib/seo'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SimuladorClient from '@/components/SimuladorClient'

export const metadata = pageMetadata("Simulador de microalgas y captura de CO₂", "Explora escenarios orientativos de crecimiento de biomasa y fijación de carbono. Ajusta cultivo y volumen sin confundir estimaciones con mediciones.", "/simulador", {})

export default function SimuladorPage() {
  return (
    <div className="bg-white font-sans text-slate-900">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-12">
        <div className="print:hidden">
          <p className="text-sm font-medium text-emerald-600">Calculadora de Impacto & Simulador</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Proyecta la captura de CO₂ de tu fotobiorreactor.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Simula crecimiento de biomasa, fijación de CO₂ y cobertura de aire según tu espacio y
            condiciones de cultivo.
          </p>
        </div>
        <SimuladorClient />
      </main>
      <Footer />
    </div>
  )
}
