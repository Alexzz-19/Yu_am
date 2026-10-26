import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MapClient from '@/components/MapClient'

export default function MapaPage() {
  return (
    <div className="bg-white font-sans text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-medium text-emerald-600">Mapa global</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Una red de nodos para un aire más limpio.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Los nodos comunitarios se actualizan cada 30 minutos y muestran su última lectura y promedios semanales y mensuales.
          Haz clic en cualquier punto o usa «Mi Ubicación» para una consulta puntual de calidad del aire con Open-Meteo.
        </p>
        <MapClient />
      </main>
      <Footer />
    </div>
  )
}
