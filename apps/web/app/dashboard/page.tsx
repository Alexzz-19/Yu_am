import type { Metadata } from 'next'
import Image from 'next/image'
import DashboardExplorer from '@/components/DashboardExplorer'

export const metadata: Metadata = {
  title: 'Dashboards de fotobiorreactores — YU’AM',
  description: 'Telemetría de tus nodos y estadísticas de la comunidad de fotobiorreactores de Guatemala y el mundo.',
}

export default function DashboardPage() {
  return <DashboardExplorer heading={<div className="flex items-center justify-between gap-6"><div className="min-w-0"><h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">Dashboards de fotobiorreactores</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Sigue las mediciones de tus sensores y explora los cultivos de la comunidad.</p></div><Image src="/images/yum/yum-working.webp?v=20261025-alpha" alt="Yum analiza la telemetría de los fotobiorreactores" width={181} height={216} className="h-20 w-auto shrink-0 object-contain sm:h-28" /></div>} />
}
