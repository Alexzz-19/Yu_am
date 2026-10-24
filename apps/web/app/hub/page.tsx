import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HubClient from '@/components/HubClient'

export default function HubPage() {
  return (
    <div className="bg-white font-sans text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-medium text-emerald-600">Hub Científico</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Literatura abierta sobre biotecnología y fotobiorreactores.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Busca papers científicos indexados en Europe PMC y accede a las fuentes originales en un clic.
        </p>
        <HubClient />
      </main>
      <Footer />
    </div>
  )
}
