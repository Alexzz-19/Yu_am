import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileClient from '@/components/ProfileClient'

export default function ProfilePage() {
  return <div className="min-h-screen bg-white text-slate-900"><Navbar /><main className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-semibold tracking-tight">Mi perfil y nodos</h1><ProfileClient /></main><Footer /></div>
}
