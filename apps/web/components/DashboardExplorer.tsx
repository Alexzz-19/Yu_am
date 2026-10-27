'use client'

import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/use-auth'
import { nodeRequest } from '@/lib/node-api'
import { filterDashboards, normalized } from '@/lib/dashboard'
import { NODE_CATEGORIES } from '@/lib/hardware'
import type { NodeSummary, PublicNode } from '@/lib/database.types'
import NodeTelemetryPanel from './NodeTelemetryPanel'
import NodeTelemetrySummary from './NodeTelemetrySummary'
import DashboardFrame from './DashboardFrame'
import OfficialFairNode from './OfficialFairNode'
import PublicNodeCharts from './PublicNodeCharts'
import { FAIR_NODE } from '@/lib/fair-node'

const views = [
  { id: 'public', label: 'Dashboards Públicos' },
  { id: 'private', label: 'Mi Panel Privado' },
] as const
const regions = [
  { id: 'guatemala', label: 'Guatemala' },
  { id: 'global', label: 'Comunidad global' },
] as const
type View = typeof views[number]['id']
type Region = typeof regions[number]['id']
const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-emerald-600'

function PublicDashboardCard({ node, refreshKey, onSelect }: { node: PublicNode; refreshKey: number; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex-1 p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-600">{node.city}, {node.country}</p><span className={'shrink-0 rounded-full px-2.5 py-1 text-xs ' + (node.estado === 'activo' ? 'bg-emerald-50 text-slate-800' : 'bg-slate-100 text-slate-600')}>{node.estado === 'activo' ? 'Activo' : node.ultimo_envio ? 'Sin lectura reciente' : 'Sin lecturas'}</span></div>
      <h3 className="mt-4 break-words text-lg font-semibold text-slate-900">{node.nombre_nodo}</h3>
      {node.university && <p className="mt-1 text-sm text-slate-600">{node.university}</p>}
      <p className="mt-3 text-sm text-emerald-700">{node.algae_type || 'Cepa por definir'}</p><p className="mt-1 text-xs text-slate-600">{node.category || 'Sin categoría'}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4"><div><dt className="text-xs text-slate-600">CO₂ estimado (ppm)</dt><dd className="mt-1 font-mono text-lg text-slate-800">{node.telemetry?.last.ppm?.toFixed(1) ?? 'Sin datos'}</dd></div><div><dt className="text-xs text-slate-600">Temperatura (°C)</dt><dd className="mt-1 font-mono text-lg text-slate-800">{node.telemetry?.last.temperature?.toFixed(1) ?? 'Sin datos'}</dd></div></dl>
      <p className="mt-4 text-xs leading-5 text-slate-600">{node.ultimo_envio ? 'Última lectura: ' + new Date(node.ultimo_envio).toLocaleString('es-GT') : 'El nodo aún no ha enviado telemetría.'}</p>
    </div>
    <details className="border-t border-slate-200" onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary onClick={onSelect} className="cursor-pointer px-5 py-3 text-sm font-semibold text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600">Ver métricas, promedios y gráficos<span className="sr-only"> de {node.nombre_nodo}</span></summary>
      {expanded && <div className="space-y-5 bg-white p-4 sm:p-5"><NodeTelemetrySummary node={node} /><PublicNodeCharts nodeId={node.id} refreshKey={refreshKey} /></div>}
    </details>
  </article>
}

function Filters({ text, setText, algae, setAlgae, category, setCategory, extraAlgae }: {
  text: string; setText: (value: string) => void
  algae: string; setAlgae: (value: string) => void
  category: string; setCategory: (value: string) => void
  extraAlgae: string[]
}) {
  return <form role="search" aria-label="Filtrar dashboards" onSubmit={event => event.preventDefault()} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
    <label className="text-sm font-medium text-slate-700">Buscar nodo, ciudad o universidad<input type="search" value={text} onChange={event => setText(event.target.value)} placeholder="Nombre, ubicación o institución" className={fieldClass} /></label>
    <label className="text-sm font-medium text-slate-700">Cepa de alga<select value={algae} onChange={event => setAlgae(event.target.value)} className={fieldClass}><option value="">Todas las cepas</option>{['Spirulina', 'Chlorella', 'Scenedesmus', ...extraAlgae].map(value => <option key={value}>{value}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Categoría<select value={category} onChange={event => setCategory(event.target.value)} className={fieldClass}><option value="">Todas las categorías</option>{NODE_CATEGORIES.map(value => <option key={value}>{value}</option>)}</select></label>
    <button type="button" onClick={() => { setText(''); setAlgae(''); setCategory('') }} className="self-end rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">Limpiar filtros</button>
  </form>
}

function ExplorerSession({ userId, authLoading, heading }: { userId: string | null; authLoading: boolean; heading: ReactNode }) {
  const [view, setView] = useState<View>('public')
  const [region, setRegion] = useState<Region>('guatemala')
  const [privateState, setPrivateState] = useState<{ userId: string; nodes: NodeSummary[]; loading: boolean; error: string }>({ userId: '', nodes: [], loading: true, error: '' })
  const [publicNodes, setPublicNodes] = useState<PublicNode[]>([])
  const [publicLoading, setPublicLoading] = useState(true)
  const [publicError, setPublicError] = useState('')
  const [revision, setRevision] = useState(0)
  const [liveRevision, setLiveRevision] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [selectedPublicName, setSelectedPublicName] = useState('')
  const [text, setText] = useState('')
  const [algae, setAlgae] = useState('')
  const [category, setCategory] = useState('')

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
  }, [revision, liveRevision])

  useEffect(() => {
    const stream = new EventSource('/api/nodes/public/stream')
    const changed = () => setLiveRevision(value => value + 1)
    stream.addEventListener('readings', changed)
    return () => { stream.removeEventListener('readings', changed); stream.close() }
  }, [])

  useEffect(() => {
    if (!userId) return
    const activeUserId = userId
    let current = true
    const controller = new AbortController()
    async function refresh() {
      try {
        const result = await nodeRequest<{ nodes: NodeSummary[] }>('/api/nodes', 'GET', undefined, controller.signal)
        if (current) setPrivateState({ userId: activeUserId, nodes: result.nodes ?? [], error: '', loading: false })
      } catch (error) {
        if (current) setPrivateState(previous => ({ userId: activeUserId, nodes: previous.userId === activeUserId ? previous.nodes : [], error: error instanceof Error ? error.message : 'No se pudieron cargar tus nodos.', loading: false }))
      }
    }
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 60000)
    return () => { current = false; controller.abort(); window.clearInterval(timer) }
  }, [userId, revision])

  const nodes = userId && privateState.userId === userId ? privateState.nodes : []
  const privateLoading = !!userId && (privateState.userId !== userId || privateState.loading)
  const privateError = userId && privateState.userId === userId ? privateState.error : ''
  const filters = { text, algae, category }
  const privateResults = filterDashboards(nodes, filters)
  const candidates = publicNodes.map(node => ({ ...node, name: node.nombre_nodo, country: node.country ?? '', city: node.city ?? '', algae_type: node.algae_type ?? '' }))
  const publicResults = filterDashboards(candidates, filters).filter(node => region !== 'guatemala' || normalized(node.country) === 'guatemala')
  const guatemalaCount = candidates.filter(node => normalized(node.country) === 'guatemala').length
  const selected = privateResults.find(node => node.id === selectedId) ?? privateResults[0]
  const extraAlgae = [...new Set([...nodes, ...candidates].map(node => node.algae_type).filter(value => value && !/spirulina|chlorella|scenedesmus/i.test(value)))].sort()
  const visibleCount = view === 'private' ? privateResults.length : publicResults.length
  const loading = view === 'public' ? publicLoading : authLoading || (!!userId && privateLoading)
  const error = view === 'public' ? publicError : privateError
  const breadcrumb = view === 'private' && selected ? selected.name : selectedPublicName || FAIR_NODE.breadcrumb
  const publicRefreshKey = revision + liveRevision

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + views.length) % views.length
    setView(views[next].id)
    document.getElementById('dashboard-view-' + views[next].id)?.focus()
  }

  return <DashboardFrame currentNode={breadcrumb} heading={heading}>
    <div role="tablist" aria-label="Tipo de dashboard" className="flex gap-1 overflow-x-auto border-b border-slate-200">{views.map((tab, index) => <button key={tab.id} type="button" role="tab" id={'dashboard-view-' + tab.id} aria-selected={view === tab.id} aria-controls="dashboard-content" tabIndex={view === tab.id ? 0 : -1} onClick={() => setView(tab.id)} onKeyDown={event => moveTab(event, index)} className={'shrink-0 border-b-2 px-4 py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600 ' + (view === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-emerald-700')}>{tab.label}</button>)}</div>
    <section id="dashboard-content" role="tabpanel" aria-labelledby={'dashboard-view-' + view} className="space-y-6">
      {view === 'public' && <>
        <OfficialFairNode refreshKey={publicRefreshKey} />
        <div role="tablist" aria-label="Dashboards públicos por región" className="flex gap-1 overflow-x-auto border-b border-slate-200">{regions.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={region === tab.id} onClick={() => setRegion(tab.id)} className={'shrink-0 border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600 ' + (region === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-600 hover:text-emerald-700')}>{tab.label}<span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs">{tab.id === 'guatemala' ? guatemalaCount : publicNodes.length}</span></button>)}</div>
        <Filters text={text} setText={setText} algae={algae} setAlgae={setAlgae} category={category} setCategory={setCategory} extraAlgae={extraAlgae} />
        <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" aria-atomic="true" className="text-sm text-slate-600">{loading ? 'Cargando dashboards públicos…' : visibleCount + (visibleCount === 1 ? ' dashboard encontrado' : ' dashboards encontrados')}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="text-sm font-semibold text-emerald-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-emerald-600">Actualizar catálogo</button></div>
        {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} Usa «Actualizar catálogo» para reintentar.</p>}
        {!loading && !error && publicResults.length === 0 && <div className="rounded-2xl border border-slate-200 p-8 text-center"><h2 className="text-lg font-semibold text-slate-900">No hay dashboards que coincidan</h2><p className="mt-2 text-sm text-slate-600">Prueba otra búsqueda o limpia los filtros.</p></div>}
        {region === 'guatemala' && publicResults.length > 0 && <section aria-label="Nodos de Guatemala"><h2 className="mb-4 text-xl font-semibold text-slate-900">Nodos de Guatemala</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{publicResults.map(node => <PublicDashboardCard key={node.id} node={node} refreshKey={publicRefreshKey} onSelect={() => setSelectedPublicName(node.nombre_nodo)} />)}</div></section>}
        {region === 'global' && publicResults.length > 0 && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{publicResults.map(node => <PublicDashboardCard key={node.id} node={node} refreshKey={publicRefreshKey} onSelect={() => setSelectedPublicName(node.nombre_nodo)} />)}</div>}
        <p className="text-xs leading-5 text-slate-600">El catálogo público se actualiza cada 30 minutos. Las nuevas lecturas de telemetría se reflejan en tiempo real.</p>
      </>}

      {view === 'private' && !userId && authLoading && <div className="flex items-center gap-3 py-8 text-sm text-emerald-800"><Image src="/images/yum/yum-working.webp?v=20261025-alpha" alt="Yum comprueba tu sesión" width={48} height={58} className="animate-float h-12 w-auto object-contain" /><span>Comprobando sesión…</span></div>}
      {view === 'private' && !userId && !authLoading && <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9"><h2 className="text-xl font-semibold text-slate-900">Inicia sesión para abrir tu panel privado</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Tus nodos, credenciales y el historial completo solo están disponibles para tu cuenta.</p><Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Iniciar sesión</Link></div>}
      {view === 'private' && !!userId && <div className="space-y-6">
        <Filters text={text} setText={setText} algae={algae} setAlgae={setAlgae} category={category} setCategory={setCategory} extraAlgae={extraAlgae} />
        <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" aria-atomic="true" className="text-sm text-slate-600">{loading ? 'Cargando tus nodos…' : visibleCount + (visibleCount === 1 ? ' nodo encontrado' : ' nodos encontrados')}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="text-sm font-semibold text-emerald-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-emerald-600">Actualizar mis nodos</button></div>
        {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {!loading && !error && !privateResults.length && <div className="rounded-2xl border border-slate-200 p-8 text-center"><h2 className="text-lg font-semibold text-slate-900">{nodes.length ? 'No hay nodos que coincidan' : 'Registra tu primer nodo'}</h2><p className="mt-2 text-sm text-slate-600">{nodes.length ? 'Prueba otra búsqueda o limpia los filtros.' : 'Crea un nodo y conecta sensores para ver aquí sus mediciones.'}</p>{!nodes.length && <Link href="/perfil" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Registrar nodo</Link>}</div>}
        {!!selected && <><label className="block max-w-xl text-sm font-medium text-slate-700">Nodo seleccionado<select value={selected.id} onChange={event => setSelectedId(event.target.value)} className={fieldClass}>{privateResults.map(node => <option key={node.id} value={node.id}>{node.name} — {node.city}, {node.country}</option>)}</select></label><NodeTelemetryPanel key={selected.id} node={selected} userId={userId} /></>}
      </div>}
    </section>
  </DashboardFrame>
}

export default function DashboardExplorer({ heading }: { heading: ReactNode }) {
  const { user, loading } = useAuth()
  return <ExplorerSession userId={loading ? null : user?.id ?? null} authLoading={loading} heading={heading} />
}
