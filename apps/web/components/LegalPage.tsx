import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type LegalPageProps = {
  title: string
  description: string
  children: ReactNode
}

export default function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        <header className="border-b border-emerald-100 bg-[#F2F8F5]">
          <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
            <p className="text-sm font-medium text-emerald-700">YU&apos;AM · MILAB</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{description}</p>
            <p className="mt-6 text-sm text-slate-500">Vigente desde el 25 de octubre de 2026</p>
          </div>
        </header>
        <article className="mx-auto max-w-5xl px-6 py-12 sm:py-16 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:leading-relaxed [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_p]:mt-4 [&_p]:max-w-3xl [&_p]:leading-relaxed [&_p]:text-slate-600 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6 [&_a]:text-emerald-800 [&_a]:underline">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  )
}
