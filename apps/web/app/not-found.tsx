import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return <div className="flex min-h-screen flex-col bg-white text-slate-900">
    <Navbar />
    <main id="main-content" tabIndex={-1} className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-6 py-12 sm:py-20 md:grid-cols-[1.3fr_1fr]">
      <div><p className="text-sm font-semibold text-emerald-700">404 · Página no encontrada</p><h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">Parece que te has desviado del cultivo</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Yum no encuentra esta página. Puedes volver al inicio o abrir el centro de asistencia para seguir explorando YU&apos;AM.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Volver al Inicio</Link><Link href="/yum" className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Ir a Yum</Link></div></div>
      <div className="flex justify-center"><Image src="/images/yum/yum-surprised.webp?v=20261025-alpha" alt="Yum, el robot asistente de YU’AM, sorprendido al no encontrar la ruta del cultivo" width={320} height={420} className="h-64 w-auto max-w-full object-contain sm:h-80" /></div>
    </main>
    <Footer />
  </div>
}
