import { pageMetadata } from '@/lib/seo'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileClient from '@/components/ProfileClient'

export const metadata = pageMetadata("Perfil y registro de nodos", "Administra tu perfil, la ubicación de tus nodos y sus claves privadas para conectar sensores a la plataforma YU’AM.", "/perfil", { index: false })

export default function ProfilePage() {
  return <div className="min-h-screen bg-[#f7faf8] text-slate-900"><Navbar /><main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-12 lg:py-16"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Espacio personal</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Perfil, preferencias y nodos</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Administra tu identidad de investigación y las ubicaciones aproximadas de tu red YU’AM.</p><div className="mt-8"><ProfileClient /></div></main><Footer /></div>
}
