import { pageMetadata } from '@/lib/seo'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginClient from '@/components/LoginClient'

export const metadata = pageMetadata("Iniciar sesión o crear cuenta", "Accede a tu cuenta YU’AM para registrar nodos, gestionar sus credenciales y consultar el historial privado de telemetría y asistencia técnica.", "/login", { index: false })

export default function LoginPage() {
  return <div className="min-h-screen bg-[#F5FAF7] text-slate-900"><Navbar /><main id="main-content" tabIndex={-1} className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_.9fr] lg:py-20"><div><p className="text-sm font-medium text-emerald-700">Tu espacio de investigación</p><h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">Conecta cada lectura con una decisión mejor.</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">Inicia sesión para organizar tus nodos, conservar sus credenciales y seguir el cultivo con datos que sí te pertenecen.</p><LoginClient /></div><aside className="relative flex min-h-80 items-end justify-center overflow-hidden rounded-[2rem] border border-emerald-100 bg-white px-8 pt-8 shadow-sm"><div className="absolute inset-x-0 bottom-0 h-1/2 bg-emerald-50" /><div className="relative text-center"><p className="mb-2 text-sm font-medium text-emerald-900">Yum te da la bienvenida</p><Image src="/images/yum/yum-wave.webp?v=20261025-alpha" alt="Yum, el robot asistente de YU'AM, saludando" width={1080} height={1629} priority className="h-64 w-auto object-contain" /></div></aside></main><Footer /></div>
}
