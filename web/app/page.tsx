import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Nav */}
      <header className="border-b border-emerald-800/40 backdrop-blur-md bg-slate-900/60 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-900/50">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-emerald-400">YU&apos;AM v2.0</h1>
            <p className="text-xs text-slate-400">Biotecnología & Plataforma IoT</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <span className="px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs">
            Q&apos;eqchi&apos;: Vida, Alma y Salud
          </span>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6 animate-pulse">
          ✨ MILAB Guatemala • Plan K&apos;atun 2032 & ODS
        </div>
        
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
          Democratizando la Biotecnología y el Monitoreo Ambiental
        </h2>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Plataforma científica de convergencia entre biología aplicada y tecnología IoT (ESP32 + MQ-135) para optimizar la captura de CO₂ y la investigación biológica con privacidad garantizada.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-16">
          <div className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer text-center">
            🚀 Panel IoT (Próximamente)
          </div>
          <div className="flex-1 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-slate-200 transition cursor-pointer text-center">
            📚 Biblioteca Biotecnológica
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Hardware IoT ESP32</h3>
            <p className="text-sm text-slate-400">
              Captura continua de calidad del aire (MQ-135), CO₂, temperatura y humedad con búfer local ante fallas de red.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Privacy-by-Design</h3>
            <p className="text-sm text-slate-400">
              Ofuscación automatizada de coordenadas geográficas en mapas públicos para proteger la ubicación de los nodos experimentales.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 shadow-xl backdrop-blur">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-emerald-400 text-lg mb-2">Supabase & Realtime</h3>
            <p className="text-sm text-slate-400">
              Base de datos relacional robusta con Row Level Security (RLS), autenticación segura y gestión de avatares.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 YU&apos;AM v2.0 • MILAB • ODS 3, 4, 11, 12, 13</p>
      </footer>
    </div>
  );
}
