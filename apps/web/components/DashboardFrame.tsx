import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardFrame({ currentNode, heading, children }: { currentNode?: string; heading: ReactNode; children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav aria-label="Migas de pan" className="min-w-0 flex-1">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:gap-x-3">
            <li><Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 hover:text-emerald-600"><Image src="/images/logos/logo-mark.webp" alt="Isotipo de YU’AM" width={28} height={28} />YU&apos;AM</Link></li>
            <li aria-hidden="true" className="text-slate-400">/</li>
            <li><Link href="/dashboard" aria-current={currentNode ? undefined : 'page'} className="flex items-center gap-1.5 font-medium text-emerald-700 hover:underline"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="size-4"><rect x="2.5" y="3" width="15" height="14" rx="2" /><path d="M2.5 8h15M8 8v9" /></svg>Dashboards</Link></li>
            {currentNode && <><li aria-hidden="true" className="text-slate-400">/</li><li aria-current="page" className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-900"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="size-4 shrink-0"><path d="M7 2h6M8 2v5l-4 8a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-8V2M6 12h8" /></svg><span className="break-words">{currentNode}</span></li></>}
          </ol>
        </nav>
        <nav aria-label="Navegación del dashboard" className="flex flex-wrap gap-5 text-sm text-slate-600"><Link href="/mapa" className="hover:text-emerald-600 hover:underline">Mapa</Link><Link href="/yum" className="hover:text-emerald-600 hover:underline">Yum</Link><Link href="/perfil" className="hover:text-emerald-600 hover:underline">Mi perfil y nodos</Link></nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">{heading}{children}</main>
    <footer className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-500">YU&apos;AM · Monitoreo comunitario de fotobiorreactores</footer>
  </div>
}
