'use client'

import { useEffect, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/use-auth'
import { nodeRequest } from '@/lib/node-api'
import { filterDashboards, formatMetric, normalized } from '@/lib/dashboard'
import { NODE_CATEGORIES } from '@/lib/hardware'
import type { NodeSummary, PublicNode } from '@/lib/database.types'
import NodeTelemetryPanel from './NodeTelemetryPanel'
import NodeTelemetrySummary from './NodeTelemetrySummary'

const tabs = [
  { id: 'private', label: 'Mis Dashboards / Nodos Privados' },
  { id: 'guatemala', label: 'Dashboards de Guatemala' },
  { id: 'global', label: 'Comunidad Global' },
] as const
type View = typeof tabs[number]['id']
const fieldClass = 'mt-2 w-full rounded-xl border border-emerald-800 bg-[#03110D] px-3 py-2.5 text-sm text-emerald-50 placeholder:text-[#A2C4B8] focus-visible:outline-2 focus-visible:outline-emerald-300'

function PublicDashboardCard({ node }: { node: PublicNode }) {
  const last = node.telemetry?.last
  return <article className="flex flex-col overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#061A14]">
    <div className="flex-1 p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-[#A2C4B8]">{node.city}, {node.country}</p><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${node.estado === 'activo' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-200'}`}>{node.estado === 'activo' ? 'Activo' : node.ultimo_envio ? 'Sin lectura reciente' : 'Sin lecturas'}</span></div>
      <h3 className="mt-4 break-words text-lg font-semibold text-emerald-50">{node.nombre_nodo}</h3>
      {node.university && <p className="mt-1 text-sm text-[#A2C4B8]">{node.university}</p>}
      <p className="mt-3 text-sm text-emerald-200">{node.algae_type || 'Cepa por definir'}</p><p className="mt-1 text-xs text-[#A2C4B8]">{node.category || 'Sin categoría'}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-emerald-900/60 pt-4"><div><dt className="text-xs text-[#A2C4B8]">CO₂ estimado (ppm)</dt><dd className="mt-1 font-mono text-lg text-emerald-100">{formatMetric(last?.ppm)}</dd></div><div><dt className="text-xs text-[#A2C4B8]">Temperatura (°C)</dt><dd className="mt-1 font-mono text-lg text-emerald-100">{formatMetric(last?.temperature)}</dd></div></dl>
      <p className="mt-4 text-xs leading-5 text-[#A2C4B8]">{node.ultimo_envio ? `Última lectura: ${new Date(node.ultimo_envio).toLocaleString('es-GT')}` : 'El nodo aún no ha enviado telemetría.'}</p>
    </div>
    <details className="border-t border-emerald-900/60"><summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">Ver métricas y promedios<span className="sr-only"> de {node.nombre_nodo}</span></summary><div className="overflow-x-auto bg-white p-5"><NodeTelemetrySummary node={node} /></div></details>
  </article>
}

function ExplorerSession({ userId }: { userId: string }) {
  const [view, setView] = useState<View>('private')
  const [nodes, setNodes] = useState<NodeSummary[]>([])
  const [publicNodes, setPublicNodes] = useState<PublicNode[]>([])
  const [privateLoading, setPrivateLoading] = useState(true)
  const [publicLoading, setPublicLoading] = useState(true)
  const [privateError, setPrivateError] = useState('')
  const [publicError, setPublicError] = useState('')
  const [revision, setRevision] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [text, setText] = useState('')
  const [algae, setAlgae] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let current = true
    const controller = new AbortController()
    async function refresh() {
      try {
        const result = await nodeRequest<{ nodes: NodeSummary[] }>('/api/nodes', 'GET', undefined, controller.signal)
        if (current) { setNodes(result.nodes ?? []); setPrivateError('') }
      } catch (error) {
        if (current) setPrivateError(error instanceof Error ? error.message : 'No se pudieron cargar tus nodos.')
      } finally { if (current) setPrivateLoading(false) }
    }
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 60000)
    return () => { current = false; controller.abort(); window.clearInterval(timer) }
  }, [userId, revision])

  useEffect(() => {
    let current = true
    const controller = new AbortController()
    async function refresh() {
      try {
        const response = await fetch('/api/nodes?scope=community', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('No se pudo actualizar el catálogo comunitario. Reintenta la consulta.')
        const result: { nodes: PublicNode[] } = await response.json()
        if (current) { setPublicNodes(result.nodes); setPublicError('') }
      } catch (error) {
        if (current) setPublicError(error instanceof Error ? error.message : 'No se pudieron cargar los dashboards públicos.')
      } finally { if (current) setPublicLoading(false) }
    }
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 30 * 60 * 1000)
    return () => { current = false; controller.abort(); window.clearInterval(timer) }
  }, [revision])

  const filters = { text, algae, category }
  const privateResults = filterDashboards(nodes, filters)
  const candidates = publicNodes.map(node => ({ ...node, name: node.nombre_nodo, country: node.country ?? '', city: node.city ?? '', algae_type: node.algae_type ?? '' }))
  const publicResults = filterDashboards(candidates, filters).filter(node => view !== 'guatemala' || normalized(node.country) === 'guatemala')
  const guatemalaCount = candidates.filter(node => normalized(node.country) === 'guatemala').length
  const regions = [...new Set(publicResults.map(node => node.city || 'Región sin especificar'))].sort((a, b) => a.localeCompare(b, 'es'))
  const selected = privateResults.find(node => node.id === selectedId) ?? privateResults[0]
  const extraAlgae = [...new Set([...nodes, ...candidates].map(node => node.algae_type).filter(value => value && !/spirulina|chlorella|scenedesmus/i.test(value)))].sort()
  const visibleCount = view === 'private' ? privateResults.length : publicResults.length
  const loading = view === 'private' ? privateLoading : publicLoading
  const error = view === 'private' ? privateError : publicError

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setView(tabs[next].id)
    document.getElementById(`dashboard-tab-${tabs[next].id}`)?.focus()
  }

  return <div className="space-y-6">
    <div role="tablist" aria-label="Explorar dashboards" className="flex gap-1 overflow-x-auto border-b border-emerald-900/60">{tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`dashboard-tab-${tab.id}`} aria-selected={view === tab.id} aria-controls="dashboard-results" tabIndex={view === tab.id ? 0 : -1} onClick={() => setView(tab.id)} onKeyDown={event => moveTab(event, index)} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300 ${view === tab.id ? 'border-emerald-300 text-emerald-200' : 'border-transparent text-[#A2C4B8] hover:text-emerald-50'}`}>{tab.label}<span className="ml-2 rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs">{tab.id === 'private' ? nodes.length : tab.id === 'guatemala' ? guatemalaCount : publicNodes.length}</span></button>)}</div>
    <form role="search" aria-label="Filtrar dashboards" onSubmit={event => event.preventDefault()} className="grid gap-4 rounded-2xl border border-emerald-900/60 bg-[#061A14] p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
      <label className="text-sm font-medium text-[#C4DED3]">Buscar nodo, ciudad o universidad<input type="search" value={text} onChange={event => setText(event.target.value)} placeholder="Nombre, ubicación o institución" className={fieldClass} /></label>
      <label className="text-sm font-medium text-[#C4DED3]">Cepa de alga<select value={algae} onChange={event => setAlgae(event.target.value)} className={fieldClass}><option value="">Todas las cepas</option>{['Spirulina', 'Chlorella', 'Scenedesmus', ...extraAlgae].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="text-sm font-medium text-[#C4DED3]">Categoría<select value={category} onChange={event => setCategory(event.target.value)} className={fieldClass}><option value="">Todas las categorías</option>{NODE_CATEGORIES.map(value => <option key={value}>{value}</option>)}</select></label>
      <button type="button" onClick={() => { setText(''); setAlgae(''); setCategory('') }} className="self-end rounded-xl border border-emerald-800 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-300">Limpiar filtros</button>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-[#A2C4B8]">{loading ? 'Cargando dashboards…' : `${visibleCount} ${visibleCount === 1 ? 'dashboard encontrado' : 'dashboards encontrados'}`}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="text-sm font-semibold text-emerald-200 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-emerald-300">Actualizar catálogo</button></div>
    <section id="dashboard-results" role="tabpanel" aria-labelledby={`dashboard-tab-${view}`} className="space-y-6">
      {error && <p role="alert" className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-100">{error} Usa «Actualizar catálogo» para reintentar.</p>}
      {!loading && !error && visibleCount === 0 && <div className="rounded-2xl border border-emerald-900/60 p-8 text-center"><h2 className="text-lg font-semibold text-emerald-50">{view === 'private' && nodes.length === 0 ? 'Registra tu primer nodo' : 'No hay dashboards que coincidan'}</h2><p className="mt-2 text-sm text-[#A2C4B8]">{view === 'private' && nodes.length === 0 ? 'Crea un nodo y conecta tus sensores para ver aquí sus mediciones.' : 'Prueba otra búsqueda o limpia los filtros.'}</p>{view === 'private' && nodes.length === 0 && <Link href="/perfil" className="mt-5 inline-flex rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-950">Registrar nodo</Link>}</div>}
      {view === 'private' && selected && <><label className="block max-w-xl text-sm font-medium text-[#C4DED3]">Nodo seleccionado<select value={selected.id} onChange={event => setSelectedId(event.target.value)} className={fieldClass}>{privateResults.map(node => <option key={node.id} value={node.id}>{node.name} — {node.city}, {node.country}</option>)}</select></label><NodeTelemetryPanel key={selected.id} node={selected} userId={userId} /></>}
      {view === 'guatemala' && regions.map(region => <section key={region} aria-label={`Nodos de ${region}`}><div className="mb-4 flex items-baseline gap-3"><h2 className="text-xl font-semibold text-emerald-50">{region}</h2><span className="text-xs text-[#A2C4B8]">Departamento / región</span></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{publicResults.filter(node => (node.city || 'Región sin especificar') === region).map(node => <PublicDashboardCard key={node.id} node={node} />)}</div></section>)}
      {view === 'global' && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{publicResults.map(node => <PublicDashboardCard key={node.id} node={node} />)}</div>}
      {view !== 'private' && <p className="text-xs leading-5 text-[#A2C4B8]">Estadísticas públicas actualizadas cada 30 minutos. Solo se muestra la ubicación aproximada de cada nodo.</p>}
    </section>
  </div>
}

export default function DashboardExplorer() {
  const { user, loading } = useAuth()
  if (loading) return <p role="status" className="py-8 text-sm text-emerald-200">Comprobando sesión…</p>
  if (!user) return <p className="py-8 text-sm text-emerald-100">Tu sesión terminó. <Link href="/login" className="font-semibold underline">Inicia sesión para abrir tus dashboards.</Link></p>
  return <ExplorerSession key={user.id} userId={user.id} />
}
