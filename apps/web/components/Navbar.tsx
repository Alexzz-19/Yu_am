import Image from 'next/image'
import Link from 'next/link'
import AuthNavLink from './AuthNavLink'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logos/logo-mark.webp"
            alt="Isotipo YU'AM"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div className="leading-tight">
            <span className="font-semibold tracking-tight text-slate-900">YU&apos;AM</span>
            <span className="block text-xs text-slate-500">CleanTech · Fotobiorreactores</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/" className="transition hover:text-emerald-600">
            Inicio
          </Link>
          <Link href="/nosotros" className="transition hover:text-emerald-600">
            Nosotros
          </Link>
          <Link href="/mapa" className="transition hover:text-emerald-600">
            Mapa
          </Link>
          <Link href="/hub" className="transition hover:text-emerald-600">
            Hub Científico
          </Link>
          <Link href="/simulador" className="transition hover:text-emerald-600">
            Simulador
          </Link>
          <Link href="/hardware" className="transition hover:text-emerald-600">
            Hardware
          </Link>
          <Link href="/dashboard" className="transition hover:text-emerald-600">
            Dashboard
          </Link>
        </nav>
        <AuthNavLink />
      </div>
    </header>
  )
}
