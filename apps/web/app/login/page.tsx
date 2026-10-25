import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginClient from '@/components/LoginClient'

export default function LoginPage() {
  return <div className="min-h-screen bg-white text-slate-900"><Navbar /><main className="mx-auto max-w-6xl px-6 py-12"><div className="flex items-center justify-between gap-6"><div><h1 className="text-3xl font-semibold tracking-tight">Conecta tu cultivo con YU&apos;AM</h1><p className="mt-3 max-w-xl text-slate-600">Accede para registrar tus nodos, obtener sus tokens de ingesta y compartir su ubicación aproximada en el mapa. Yum te espera para explorar la plataforma.</p></div><Image src="/images/yum/yum-idle.webp" alt="Yum, el robot asistente, te invita a iniciar sesión" width={202} height={172} className="h-16 w-auto shrink-0 object-contain sm:h-32" /></div><LoginClient /></main><Footer /></div>
}
