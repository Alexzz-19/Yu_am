'use client'

import { useEffect, useState } from 'react'

type Proveedor = 'epmc' | 'arxiv'

type Resultado = {
  id: string
  titulo: string
  autores: string
  anio: string
  openAccess: boolean
  tema: string
  fuente: string
  linkPublico: string
  linkPdf?: string
  proveedor: Proveedor
}

type ArticuloEPMC = {
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
    result?: ArticuloEPMC[]
  }
}

type ArticuloArxiv = {
  id: string
  titulo: string
  autores: string[]
  linkPdf: string
  publicado: string
}

const CHIPS_EPMC = [
  'Chlorella vulgaris',
  'Microalgae photobioreactor CO2',
  'IoT microalgae telemetry',
  'Circular bioeconomy',
]

const CHIPS_ARXIV = [
  'MQ-135 air sensor IoT',
  'Arduino photobioreactor control',
  'ESP32 environmental telemetry',
  'Embedded water pump automation',
]

const QUERY_INICIAL: Record<Proveedor, string> = {
  epmc: 'microalgae photobioreactor CO2',
  arxiv: 'ESP32 environmental telemetry',
}

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

function limpiarTexto(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim()
}

function anioDeFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO)
  return Number.isNaN(fecha.getTime()) ? '' : String(fecha.getFullYear())
}

function detectarTema(titulo: string): string {
  const t = titulo.toLowerCase()
  if (/microalga|chlorella|spirulina|algal|algae/.test(t)) return 'Microalgas'
  if (/arduino|esp32|embedded|microcontroller|mq-?135|raspberry/.test(t)) return '🛠️ Hardware & Tech'
  if (/co2|carbon dioxide|bioreactor|photobioreactor|carbon capture/.test(t)) return 'Captura de CO₂'
  if (/iot|telemetr|sensor|monitor/.test(t)) return 'IoT & Telemetría'
  if (/bioeconom|circular|sustainab|biorefin/.test(t)) return 'Bioeconomía'
  if (/biotech|bioprocess|ferment/.test(t)) return 'Biotecnología'
  return 'Investigación'
}

function formatearAutores(lista: string[]): string {
  const limpia = lista.filter(Boolean)
  if (limpia.length === 0) return 'Autores no disponibles'
  if (limpia.length > 4) return `${limpia.slice(0, 4).join(', ')} et al.`
  return limpia.join(', ')
}

function obtenerAnioEPMC(a: ArticuloEPMC): string {
  return a.pubYear ?? a.journalInfo?.year ?? a.journalInfo?.yearOfPublication ?? ''
}

function enlaceEPMC(a: ArticuloEPMC): string {
  const source = a.source || 'MED'
  const id = a.pmid || a.id
  return `https://europepmc.org/article/${source}/${id}`
}

function normalizarEPMC(a: ArticuloEPMC): Resultado {
  const titulo = limpiarHtml(a.title ?? 'Sin título')
  return {
    id: a.id,
    titulo,
    autores: formatearAutores((a.authorString ?? '').replace(/\.$/, '').split(',').map((s) => s.trim())),
    anio: obtenerAnioEPMC(a),
    openAccess: a.isOpenAccess === 'Y',
    tema: detectarTema(titulo),
    fuente: a.journalTitle ?? 'Europe PMC',
    linkPublico: enlaceEPMC(a),
    proveedor: 'epmc',
  }
}

function normalizarArxiv(a: ArticuloArxiv): Resultado {
  const titulo = limpiarTexto(a.titulo)
  return {
    id: a.id,
    titulo,
    autores: formatearAutores(a.autores),
    anio: anioDeFecha(a.publicado),
    openAccess: true,
    tema: detectarTema(titulo),
    fuente: 'arXiv Preprint',
    linkPublico: a.id,
    linkPdf: a.linkPdf,
    proveedor: 'arxiv',
  }
}

function parsearArxiv(xmlTexto: string): ArticuloArxiv[] {
  const doc = new DOMParser().parseFromString(xmlTexto, 'text/xml')
  const entries = Array.from(doc.getElementsByTagNameNS('*', 'entry'))

  return entries.map((entry) => {
    const titulo = entry.getElementsByTagNameNS('*', 'title')[0]?.textContent ?? 'Sin título'
    const id = entry.getElementsByTagNameNS('*', 'id')[0]?.textContent ?? ''
    const publicado = entry.getElementsByTagNameNS('*', 'published')[0]?.textContent ?? ''

    const autores = Array.from(entry.getElementsByTagNameNS('*', 'author')).map(
      (autor) => autor.getElementsByTagNameNS('*', 'name')[0]?.textContent ?? '',
    )

    const links = Array.from(entry.getElementsByTagNameNS('*', 'link'))
    const linkPdf =
      links.find((link) => link.getAttribute('title') === 'pdf')?.getAttribute('href') ?? ''

    return { id, titulo, autores, linkPdf, publicado }
  })
}

async function buscarEPMC(query: string): Promise<{ resultados: Resultado[]; total: number }> {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
    query,
  )}&format=json&pageSize=12`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo conectar con Europe PMC.')
  const json: RespuestaEPMC = await res.json()
  const crudos = json.resultList?.result ?? []
  return { resultados: crudos.map(normalizarEPMC), total: json.hitCount ?? crudos.length }
}

async function buscarArxiv(query: string): Promise<{ resultados: Resultado[]; total: number }> {
  const url = `/api/arxiv?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo conectar con arXiv.')
  const texto = await res.text()
  const resultados = parsearArxiv(texto).map(normalizarArxiv)
  return { resultados, total: resultados.length }
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
  const [proveedor, setProveedor] = useState<Proveedor>('epmc')
  const [termino, setTermino] = useState('')
  const [query, setQuery] = useState(QUERY_INICIAL.epmc)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function ejecutarBusqueda(nuevaQuery: string, prov: Proveedor) {
    setQuery(nuevaQuery)
    setTermino(nuevaQuery)
    setCargando(true)
    setError(null)
    try {
      const r = prov === 'epmc' ? await buscarEPMC(nuevaQuery) : await buscarArxiv(nuevaQuery)
      setResultados(r.resultados)
      setTotal(r.total)
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al consultar el proveedor.'
      setError(mensaje)
      setResultados([])
      setTotal(0)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    async function cargaInicial() {
      try {
        const r = await buscarEPMC(QUERY_INICIAL.epmc)
        if (!activo) return
        setResultados(r.resultados)
        setTotal(r.total)
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

  function cambiarProveedor(prov: Proveedor) {
    if (prov === proveedor) return
    setProveedor(prov)
    ejecutarBusqueda(QUERY_INICIAL[prov], prov)
  }

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const q = termino.trim()
    if (q) ejecutarBusqueda(q, proveedor)
  }

  const chips = proveedor === 'epmc' ? CHIPS_EPMC : CHIPS_ARXIV

  return (
    <div className="mt-10">
      {/* Tabs de proveedores */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => cambiarProveedor('epmc')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            proveedor === 'epmc'
              ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🟢 Europe PMC <span className="hidden lg:inline">· Biotecnología & Algas</span>
        </button>
        <button
          type="button"
          onClick={() => cambiarProveedor('arxiv')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            proveedor === 'arxiv'
              ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🔵 arXiv <span className="hidden lg:inline">· Hardware, Sensores & IoT</span>
        </button>
      </div>

      {/* Buscador */}
      <form onSubmit={onSubmit} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="text"
            value={termino}
            onChange={(evento) => setTermino(evento.target.value)}
            placeholder={
              proveedor === 'epmc'
                ? 'Buscar literatura científica sobre fotobiorreactores, microalgas…'
                : 'Buscar papers de hardware, sensores e IoT…'
            }
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
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => ejecutarBusqueda(chip, proveedor)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="mt-8">
        {!cargando && !error && resultados.length > 0 && (
          <p className="mb-4 text-sm text-slate-500">
            {total.toLocaleString()} resultados en {proveedor === 'epmc' ? 'Europe PMC' : 'arXiv'} ·
            mostrando {resultados.length}
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
        ) : resultados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-lg font-medium text-slate-700">Sin resultados</p>
            <p className="mt-1 text-sm text-slate-500">
              No se encontraron artículos para «{query}». Prueba con otros términos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {resultados.map((r) => (
              <article
                key={`${r.proveedor}-${r.id}`}
                className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {r.proveedor === 'arxiv' ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                      ⚡ arXiv Preprint
                    </span>
                  ) : r.openAccess ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      🔓 Open Access
                    </span>
                  ) : null}
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {r.tema}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">{r.titulo}</h3>

                <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <span aria-hidden="true">✍️</span>
                  <span>
                    {r.autores}
                    {r.anio ? <span className="text-slate-400"> ({r.anio})</span> : null}
                  </span>
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="truncate font-mono text-xs text-slate-400">{r.fuente}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    {r.proveedor === 'arxiv' && r.linkPdf && (
                      <a
                        href={r.linkPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-800"
                      >
                        PDF Directo 📄
                      </a>
                    )}
                    <a
                      href={r.linkPublico}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
                    >
                      {r.proveedor === 'arxiv' ? 'Ver en arXiv ↗' : 'Ver en Europe PMC ↗'}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {resultados.length > 0 && !cargando && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Datos proporcionados por{' '}
          <a
            href={proveedor === 'epmc' ? 'https://europepmc.org/' : 'https://arxiv.org/'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-500"
          >
            {proveedor === 'epmc' ? 'Europe PMC' : 'arXiv'}
          </a>
        </p>
      )}
    </div>
  )
}
