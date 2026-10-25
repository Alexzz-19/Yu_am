import Image from 'next/image'
import Link from 'next/link'
import CookiePreferencesButton from './CookiePreferencesButton'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logos/logo-mark.webp"
            alt="Isotipo YU'AM"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="text-sm font-semibold text-slate-900">YU&apos;AM</span>
        </Link>
        <p className="text-xs text-slate-500">
          © 2026 YU&apos;AM · MILAB · Plan K&apos;atun 2032 · ODS 3, 4, 11, 12, 13
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <Link href="/privacidad" className="underline hover:text-emerald-700">Privacidad</Link>
          <Link href="/terminos" className="underline hover:text-emerald-700">Términos</Link>
          <CookiePreferencesButton />
          <a href="mailto:Yuam_support@protonmail.com" className="hover:text-emerald-700">Yuam_support@protonmail.com</a>
        </div>
      </div>
    </footer>
  )
}
