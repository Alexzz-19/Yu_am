import Image from 'next/image'
import Link from 'next/link'
import AuthNavLink from './AuthNavLink'

const navigation = [
  { href: '/', label: 'Inicio' }, { href: '/nosotros', label: 'Nosotros' },
  { href: '/mapa', label: 'Mapa' }, { href: '/hub', label: 'Hub Científico' },
  { href: '/simulador', label: 'Simulador' }, { href: '/hardware', label: 'Hardware' },
  { href: '/yum', label: 'Yum' }, { href: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  return <header className="sticky top-0 z-[2000] border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2"><Image src="/images/logos/logo-mark.webp" alt="Isotipo de YU’AM, inicio de la plataforma de fotobiorreactores" width={36} height={36} className="size-9 object-contain" /><span className="leading-tight"><span className="font-semibold text-slate-900">YU&apos;AM</span><span className="hidden text-xs text-slate-500 sm:block">CleanTech · Fotobiorreactores</span></span></Link>
      <nav aria-label="Navegación principal" className="hidden items-center gap-4 text-sm text-slate-600 xl:flex">{navigation.map(item => <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center hover:text-emerald-700">{item.label}</Link>)}</nav>
      <div className="flex shrink-0 items-center gap-2"><AuthNavLink /><details className="relative xl:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700">Menú</summary><nav aria-label="Navegación móvil" className="absolute right-0 top-full mt-2 grid w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">{navigation.map(item => <Link key={item.href} href={item.href} className="flex min-h-11 items-center rounded-lg px-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">{item.label}</Link>)}</nav></details></div>
    </div>
  </header>
}
