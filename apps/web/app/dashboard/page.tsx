import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import DashboardExplorer from '@/components/DashboardExplorer'

export const metadata: Metadata = {
  title: 'Dashboards de fotobiorreactores — YU’AM',
  description: 'Telemetría de tus nodos y estadísticas de la comunidad de fotobiorreactores de Guatemala y el mundo.',
}

export default function DashboardPage() {
  return <div className="flex min-h-screen flex-col bg-[#03110D] font-sans text-[#E8F5F0]">
    <header className="border-b border-emerald-900/60 bg-[#061A14]"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"><Link href="/" className="flex items-center gap-3 font-semibold text-emerald-100"><Image src="/images/logos/logo-mark.webp" alt="YU’AM, inicio" width={36} height={36} />YU&apos;AM</Link><nav aria-label="Navegación del dashboard" className="flex gap-5 text-sm text-emerald-100"><Link href="/mapa" className="hover:underline">Mapa</Link><Link href="/yum" className="hover:underline">Yum</Link><Link href="/perfil" className="hover:underline">Mi perfil y nodos</Link></nav></div></header>
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-6"><div className="min-w-0"><h1 className="break-words text-2xl font-bold tracking-tight text-emerald-50 sm:text-4xl">Dashboards de fotobiorreactores</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#A2C4B8]">Sigue las mediciones de tus sensores y explora los cultivos de la comunidad.</p></div><Image src="/images/yum/yum-working.webp?v=20261025-alpha" alt="Yum analiza la telemetría de los fotobiorreactores" width={181} height={216} className="h-20 w-auto shrink-0 object-contain sm:h-28" /></div>
      <DashboardExplorer />
    </main>
    <footer className="border-t border-emerald-900/60 px-6 py-6 text-center text-xs text-[#A2C4B8]">YU&apos;AM · Monitoreo comunitario de fotobiorreactores</footer>
  </div>
}
