import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HardwareClient from '@/components/HardwareClient'

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
        <HardwareClient />
      </main>
      <Footer />
    </div>
  )
}
