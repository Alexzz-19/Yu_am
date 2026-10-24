'use client'

import { useEffect, useState } from 'react'

type Articulo = {
  id: string
  source?: string
  pmid?: string
  title?: string
  authorString?: string
  journalTitle?: string
  pubYear?: string
  isOpenAccess?: string
  journalInfo?: {
    year?: string
    yearOfPublication?: string
  }
}

type RespuestaEPMC = {
  hitCount?: number
  resultList?: {
    result?: Articulo[]
  }
}

const CHIPS = [
  'Chlorella vulgaris',
  'Microalgae photobioreactor CO2',
  'IoT microalgae telemetry',
  'Circular bioeconomy',
]

const BUSQUEDA_INICIAL = 'microalgae photobioreactor CO2'

function limpiarHtml(texto: string): string {
  return texto
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function obtenerAnio(a: Articulo): string {
  return a.pubYear ?? a.journalInfo?.year ?? a.journalInfo?.yearOfPublication ?? ''
}

function detectarTema(titulo: string): string {
  const t = titulo.toLowerCase()
  if (/microalga|chlorella|spirulina|algal|algae/.test(t)) return 'Microalgas'
  if (/co2|carbon dioxide|bioreactor|photobioreactor|carbon capture/.test(t)) return 'Captura de CO₂'
  if (/iot|telemetr|sensor|monitor|embedded/.test(t)) return 'IoT & Telemetría'
  if (/bioeconom|circular|sustainab|biorefin/.test(t)) return 'Bioeconomía'
  if (/biotech|bioprocess|ferment/.test(t)) return 'Biotecnología'
  return 'Investigación'
}

function autores(a: Articulo): string {
  const crudo = (a.authorString ?? '').replace(/\.$/, '').trim()
  if (!crudo) return 'Autores no disponibles'
  const lista = crudo
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (lista.length === 0) return 'Autores no disponibles'
  if (lista.length > 4) return `${lista.slice(0, 4).join(', ')} et al.`
  return lista.join(', ')
}

function enlaceArticulo(a: Articulo): string {
  const source = a.source || 'MED'
  const id = a.pmid || a.id
  return `https://europepmc.org/article/${source}/${id}`
}

async function buscar(query: string): Promise<{ articulos: Articulo[]; total: number }> {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
    query,
  )}&format=json&pageSize=12`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo conectar con Europe PMC.')
  const json: RespuestaEPMC = await res.json()
  return { articulos: json.resultList?.result ?? [], total: json.hitCount ?? 0 }
}

function TarjetaSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-1/2 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-full rounded bg-slate-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-px w-full bg-slate-100" />
      <div className="mt-4 flex justify-end">
        <div className="h-4 w-32 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function HubClient() {
  const [termino, setTermino] = useState('')
  const [query, setQuery] = useState(BUSQUEDA_INICIAL)
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function ejecutarBusqueda(nuevaQuery: string) {
    setQuery(nuevaQuery)
    setTermino(nuevaQuery)
    setCargando(true)
    setError(null)
    try {
      const resultado = await buscar(nuevaQuery)
      setArticulos(resultado.articulos)
      setTotal(resultado.total)
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al consultar Europe PMC.'
      setError(mensaje)
      setArticulos([])
      setTotal(0)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    async function cargaInicial() {
      try {
        const resultado = await buscar(BUSQUEDA_INICIAL)
        if (!activo) return
        setArticulos(resultado.articulos)
        setTotal(resultado.total)
      } catch (err: unknown) {
        if (!activo) return
        setError(err instanceof Error ? err.message : 'Error al consultar Europe PMC.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargaInicial()

    return () => {
      activo = false
    }
  }, [])

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const q = termino.trim()
    if (q) ejecutarBusqueda(q)
  }

  return (
    <div className="mt-10">
      {/* Buscador */}
      <form onSubmit={onSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            value={termino}
            onChange={(evento) => setTermino(evento.target.value)}
            placeholder="Buscar literatura científica sobre fotobiorreactores, microalgas, IoT…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Buscar
        </button>
      </form>

      {/* Chips rápidos */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => ejecutarBusqueda(chip)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="mt-8">
        {!cargando && !error && articulos.length > 0 && (
          <p className="mb-4 text-sm text-slate-500">
            {total.toLocaleString()} resultados en Europe PMC · mostrando {articulos.length}
          </p>
        )}

        {cargando ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <TarjetaSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-sm font-medium text-amber-800">{error}</p>
          </div>
        ) : articulos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-lg font-medium text-slate-700">Sin resultados</p>
            <p className="mt-1 text-sm text-slate-500">
              No se encontraron artículos para «{query}». Prueba con otros términos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {articulos.map((articulo) => {
              const titulo = limpiarHtml(articulo.title ?? 'Sin título')
              const anio = obtenerAnio(articulo)
              const tema = detectarTema(titulo)
              return (
                <article
                  key={`${articulo.source ?? 'med'}-${articulo.id}`}
                  className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {articulo.isOpenAccess === 'Y' && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                        🔓 Open Access
                      </span>
                    )}
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {tema}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">{titulo}</h3>

                  <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <span aria-hidden="true">✍️</span>
                    <span>
                      {autores(articulo)}
                      {anio ? <span className="text-slate-400"> ({anio})</span> : null}
                    </span>
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="truncate font-mono text-xs text-slate-400">
                      {articulo.journalTitle ?? 'Europe PMC'}
                    </span>
                    <a
                      href={enlaceArticulo(articulo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
                    >
                      Ver en Europe PMC ↗
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {articulos.length > 0 && !cargando && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Datos y literatura científica proporcionados por{' '}
          <a
            href="https://europepmc.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-500"
          >
            Europe PMC
          </a>
        </p>
      )}
    </div>
  )
}
