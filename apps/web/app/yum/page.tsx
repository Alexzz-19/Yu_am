import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import YumControlCenter from '@/components/YumControlCenter'


export const metadata = pageMetadata("Yum AI | Asistente de Inteligencia Artificial para Biocultivos", "Consulta a Yum sobre biocultivos, fotobiorreactores y sensores. Asistencia técnica con fuentes cuando están disponibles e historial privado de tu cuenta.", "/yum", { absolute: true })

export default function YumPage() {
  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
    <Navbar />
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Historial privado · 5 preguntas diarias</p><Link href="/hardware" className="text-sm font-semibold text-emerald-800 underline">Ver guías de hardware</Link></div>
      <YumControlCenter />
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">Las respuestas de Yum son orientación técnica; verifica los protocolos de cultivo y la calibración de tus sensores.</p>
    </main>
    <Footer />
  </div>
}
