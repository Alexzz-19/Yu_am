import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginClient from '@/components/LoginClient'

export default function LoginPage() {
  return <div className="min-h-screen bg-white text-slate-900"><Navbar /><main className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-semibold tracking-tight">Conecta tu cultivo con YU&apos;AM</h1><p className="mt-3 max-w-xl text-slate-600">Accede para registrar tus nodos, obtener sus tokens de ingesta y compartir su ubicación aproximada en el mapa.</p><LoginClient /></main><Footer /></div>
}
