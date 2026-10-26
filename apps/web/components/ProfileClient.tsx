'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { nodeRequest } from '@/lib/node-api'
import { supabase } from '@/lib/supabaseClient'
import type { NodeSummary } from '@/lib/database.types'
import { LOCATION_CATALOG, countryByName, locationForCoordinates, placeByName, type Coordinates } from '@/lib/locations'
import NodeTokenDialog from '@/components/NodeTokenDialog'
import Dialog from '@/components/ui/Dialog'
import { ALGAE_TYPES, BOARD_TYPES, SENSOR_OPTIONS, type SensorType } from '@/lib/hardware'

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="mt-3 h-72 animate-pulse rounded-2xl bg-emerald-50" aria-label="Cargando mapa" />,
})

type Node = NodeSummary

type NodeSecret = {
  id: string
  token: string
}

type NodeRegistration = NodeSecret & {
  node: Node
}

type ProfileForm = {
  username: string
  country: string
  city: string
  timezone: string
}

type NodeLocation = Coordinates & {
  country: string
  city: string
}

type StoredProfile = {
  profile?: Partial<ProfileForm>
  profile_edit_history?: unknown
}

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function defaultProfile(): ProfileForm {
  const place = LOCATION_CATALOG[0].places[0]
  return { username: '', country: LOCATION_CATALOG[0].name, city: place.name, timezone: browserTimezone() }
}

function profileFromMetadata(metadata: Record<string, unknown>, fallbackName: string): ProfileForm {
  const stored = metadata as StoredProfile
  const fallback = defaultProfile()
  return {
    username: typeof stored.profile?.username === 'string' && stored.profile.username.trim() ? stored.profile.username : fallbackName,
    country: typeof stored.profile?.country === 'string' && stored.profile.country.trim() ? stored.profile.country : fallback.country,
    city: typeof stored.profile?.city === 'string' && stored.profile.city.trim() ? stored.profile.city : fallback.city,
    timezone: typeof stored.profile?.timezone === 'string' && stored.profile.timezone.trim() ? stored.profile.timezone : fallback.timezone,
  }
}

function editsThisMonth(metadata: Record<string, unknown>) {
  const stored = metadata as StoredProfile
  const currentMonth = new Date().toISOString().slice(0, 7)
  return Array.isArray(stored.profile_edit_history)
    ? stored.profile_edit_history.filter(entry => typeof entry === 'string' && entry.startsWith(currentMonth)).length
    : 0
}

function initials(name: string) {
  const letters = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('')
  return letters || 'YU'
}

function sameProfile(left: ProfileForm, right: ProfileForm) {
  return left.username === right.username && left.country === right.country && left.city === right.city && left.timezone === right.timezone
}

function nodeLocationFrom(country: string, city: string): NodeLocation {
  const place = placeByName(country, city)
  return { country: countryByName(country).name, city: place.name, lat: place.lat, lng: place.lng }
}

function emptyNodeLocation(): NodeLocation {
  const place = LOCATION_CATALOG[0].places[0]
  return { country: '', city: '', lat: place.lat, lng: place.lng }
}

export default function ProfileClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodesLoading, setNodesLoading] = useState(true)
  const [name, setName] = useState('')
  const [boardType, setBoardType] = useState('ESP32')
  const [algaeType, setAlgaeType] = useState('Chlorella vulgaris')
  const [sensors, setSensors] = useState<SensorType[]>(['ph', 'temperature'])
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null)
  const [deletionError, setDeletionError] = useState('')
  const [apiNodeId, setApiNodeId] = useState('')
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile)
  const [savedProfile, setSavedProfile] = useState<ProfileForm>(defaultProfile)
  const [editsUsed, setEditsUsed] = useState(0)
  const [nodeLocation, setNodeLocation] = useState<NodeLocation>(emptyNodeLocation)
  const [message, setMessage] = useState('')
  const [locationMessage, setLocationMessage] = useState('Selecciona una ciudad, usa tu ubicación o marca un punto aproximado en el mapa.')
  const [busy, setBusy] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [secret, setSecret] = useState<NodeSecret | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const nodeForm = useRef<HTMLFormElement>(null)
  const nodesRevision = useRef(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const selectedCountry = useMemo(() => countryByName(profile.country), [profile.country])
  const selectedNodeCountry = useMemo(() => nodeLocation.country ? countryByName(nodeLocation.country) : null, [nodeLocation.country])
  const profileDirty = !sameProfile(profile, savedProfile)
  const nodeReady = name.trim().length > 0 && !!boardType && !!algaeType && nodeLocation.country.length > 0 && nodeLocation.city.length > 0 && Number.isFinite(nodeLocation.lat) && Number.isFinite(nodeLocation.lng)

  const loadNodes = useCallback(async () => {
    const revision = nodesRevision.current
    const result = await nodeRequest<{ nodes: Node[] }>('/api/nodes')
    if (revision === nodesRevision.current) setNodes(result.nodes)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }

    let active = true
    void (async () => {
      const fallbackName = typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name
        : user.email?.split('@')[0] || 'Investigador YU’AM'
      const nextProfile = profileFromMetadata(user.app_metadata, fallbackName)
      if (active) {
        setProfile(nextProfile)
        setSavedProfile(nextProfile)
        setEditsUsed(editsThisMonth(user.app_metadata))
      }
      try {
        await loadNodes()
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los nodos.')
      } finally {
        if (active) setNodesLoading(false)
      }
    })()
    return () => { active = false }
  }, [loadNodes, loading, router, user])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profileDirty) return
    setProfileSaving(true)
    setMessage('')
    try {
      const result = await nodeRequest<{ profile: ProfileForm; editsRemaining: number }>('/api/profile', 'PATCH', profile)
      setProfile(result.profile)
      setSavedProfile(result.profile)
      setEditsUsed(3 - result.editsRemaining)
      await supabase.auth.refreshSession()
      setMessage(`Perfil guardado. Te quedan ${result.editsRemaining} cambio${result.editsRemaining === 1 ? '' : 's'} este mes.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el perfil.')
    } finally {
      setProfileSaving(false)
    }
  }

  function changeProfileCountry(countryName: string) {
    const country = countryByName(countryName)
    const place = country.places[0]
    setProfile(current => ({ ...current, country: country.name, city: place.name }))
  }

  function changeProfilePlace(placeName: string) {
    const place = placeByName(profile.country, placeName)
    setProfile(current => ({ ...current, city: place.name }))
  }

  function changeNodeCountry(countryName: string) {
    const country = countryByName(countryName)
    setNodeLocation(nodeLocationFrom(country.name, country.places[0].name))
    setLocationMessage(`Mapa centrado en ${country.places[0].name}, ${country.name}.`)
  }

  function changeNodePlace(placeName: string) {
    setNodeLocation(nodeLocationFrom(nodeLocation.country, placeName))
    setLocationMessage(`Mapa centrado en ${placeName}, ${nodeLocation.country}.`)
  }

  function updateNodeCoordinates(point: Coordinates) {
    const location = locationForCoordinates(point)
    if (location) setNodeLocation({ country: location.country.name, city: location.place.name, ...point })
    else setNodeLocation(current => ({ ...current, ...point }))
    setLocationMessage(location ? `Ubicación actualizada en ${location.place.name}, ${location.country.name}.` : 'Ubicación actualizada en el mapa.')
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Este navegador no permite compartir ubicación. Puedes marcar el mapa manualmente.')
      return
    }
    setLocationMessage('Solicitando ubicación aproximada…')
    navigator.geolocation.getCurrentPosition(
      position => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude }
        updateNodeCoordinates(point)
      },
      () => setLocationMessage('No pudimos acceder a tu ubicación. Marca un punto aproximado en el mapa.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  async function registerNode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!nodeReady || busy) {
      setMessage('Completa el nombre del nodo y selecciona una ubicación antes de registrarlo.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const input = {
        board_type: boardType, algae_type: algaeType, sensors,
        name: name.trim(),
        country: nodeLocation.country,
        city: nodeLocation.city,
        lat: nodeLocation.lat,
        lng: nodeLocation.lng,
      }
      if (editingNodeId) {
        const { node } = await nodeRequest<{ node: Node }>(`/api/nodes/${editingNodeId}`, 'PATCH', { ...input, action: 'relocate' })
        nodesRevision.current += 1
        setNodes(current => current.map(entry => entry.id === node.id ? node : entry))
        resetNodeForm()
        setMessage('Ubicación y hardware actualizados en el nodo y su reactor. Su clave sigue siendo válida.')
        return
      }
      const result = await nodeRequest<NodeRegistration>('/api/nodes', 'POST', input)
      setSecret({ id: result.id, token: result.token })
      nodesRevision.current += 1
      setNodes(current => [result.node, ...current.filter(node => node.id !== result.node.id)])
      resetNodeForm()
      setMessage('¡Nodo guardado exitosamente! Token generado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo registrar el nodo.')
    } finally {
      setBusy(false)
    }
  }

  async function rotateNode(node: Node) {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const result = await nodeRequest<NodeSecret>(`/api/nodes/${node.id}`, 'PATCH', { action: 'rotate' })
      setSecret(result)
      setMessage('Token rotado. Guarda el nuevo token antes de cerrar esta pantalla.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo rotar la clave.')
    } finally {
      setBusy(false)
    }
  }

  function resetNodeForm() {
    setEditingNodeId(null)
    setName('')
    setBoardType('ESP32')
    setAlgaeType('Chlorella vulgaris')
    setSensors(['ph', 'temperature'])
    setNodeLocation(emptyNodeLocation())
    setLocationMessage('Selecciona una ciudad, usa tu ubicación o marca un punto aproximado en el mapa.')
  }

  function editNode(node: Node) {
    if (busy) return
    setEditingNodeId(node.id)
    setName(node.name)
    setBoardType(node.board_type)
    setAlgaeType(node.algae_type)
    setSensors(node.sensors.filter((sensor): sensor is SensorType => SENSOR_OPTIONS.some(option => option.value === sensor)))
    setNodeLocation({ country: node.country, city: node.city, lat: node.lat, lng: node.lng })
    setLocationMessage(`Reubicando ${node.name}. Pulsa en el mapa o arrástralo y guarda los cambios.`)
    nodeForm.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
  }

  async function deleteNode(node: Node) {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      await nodeRequest<{ deleted: boolean }>('/api/nodes', 'DELETE', { id: node.id })
      nodesRevision.current += 1
      setNodes(current => current.filter(entry => entry.id !== node.id))
      if (editingNodeId === node.id) resetNodeForm()
      if (secret?.id === node.id) setSecret(null)
      if (apiNodeId === node.id) setApiNodeId('')
      setNodeToDelete(null)
      setMessage('Nodo eliminado y token revocado.')
    } catch (error) {
      setDeletionError(error instanceof Error ? error.message : 'No se pudo eliminar el nodo.')
    } finally {
      setBusy(false)
    }
  }

  async function viewApiKey() {
    if (!apiNodeId || busy) return
    setBusy(true)
    try { setSecret(await nodeRequest<NodeSecret>(`/api/nodes/${apiNodeId}/key`)) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo consultar la clave del nodo.') }
    finally { setBusy(false) }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  async function deleteAccount() {
    if (!deleteConfirmed) return
    setBusy(true)
    setMessage('')
    try {
      await nodeRequest<{ deleted: boolean }>('/api/account', 'DELETE')
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.')
      setBusy(false)
    }
  }

  if (loading || !user) return <div className="py-24 text-center text-slate-600">Cargando tu espacio de investigación…</div>

  return (
    <div className="space-y-8">
      {message && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p>}

      <section className="grid gap-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm lg:grid-cols-[auto_1fr] lg:p-8">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-3xl font-black text-white shadow-lg shadow-emerald-900/15" aria-label={`Avatar de ${profile.username}`}>
          {initials(profile.username)}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Identidad de investigador</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{profile.username}</h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Nombre de usuario
              <input value={profile.username} onChange={event => setProfile(current => ({ ...current, username: event.target.value }))} required minLength={2} maxLength={50} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label className="text-sm font-bold text-slate-700">Zona horaria
              <input value={profile.timezone} onChange={event => setProfile(current => ({ ...current, timezone: event.target.value }))} required maxLength={100} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Detectada automáticamente: {browserTimezone()}</span>
            </label>
            <label className="text-sm font-bold text-slate-700">País
              <select value={profile.country} onChange={event => changeProfileCountry(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {LOCATION_CATALOG.map(country => <option key={country.name} value={country.name} disabled={country.disabled}>{country.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">{profile.country === 'Guatemala' ? 'Departamento' : 'Ciudad o zona'}
              <select value={profile.city} onChange={event => changeProfilePlace(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {selectedCountry.places.map(place => <option key={place.name}>{place.name}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button type="submit" disabled={!profileDirty || profileSaving || editsUsed >= 3} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                {profileSaving ? 'Guardando…' : 'Guardar perfil'}
              </button>
              <span className="text-xs text-slate-500">{Math.max(0, 3 - editsUsed)} de 3 ediciones disponibles este mes.</span>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Red de sensores</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{editingNodeId ? `Editar ubicación de ${name}` : 'Registra un nodo sin coordenadas manuales'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Usa país y ciudad como referencia; la ubicación solo se usa para situar tu medición ambiental de forma aproximada.</p>
        </div>
        <form ref={nodeForm} onSubmit={registerNode} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Nombre del nodo
            <input value={name} onChange={event => setName(event.target.value)} required maxLength={80} placeholder={`Ej. Laboratorio ${nodeLocation.city}`} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold text-slate-700">País
              <select value={nodeLocation.country} required onChange={event => changeNodeCountry(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="" disabled>Selecciona un país</option>
                {nodeLocation.country && !LOCATION_CATALOG.some(country => country.name === nodeLocation.country) && <option value={nodeLocation.country}>{nodeLocation.country}</option>}
                {LOCATION_CATALOG.map(country => <option key={country.name} value={country.name} disabled={country.disabled}>{country.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">{nodeLocation.country === 'Guatemala' ? 'Departamento' : 'Ciudad / zona'}
              <select value={nodeLocation.city} required onChange={event => changeNodePlace(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="" disabled>Selecciona una ubicación</option>
                {nodeLocation.city && !selectedNodeCountry?.places.some(place => place.name === nodeLocation.city) && <option value={nodeLocation.city}>{nodeLocation.city}</option>}
                {selectedNodeCountry?.places.map(place => <option key={place.name} value={place.name}>{place.name}</option>)}
              </select>
            </label>
          </div>
          <fieldset className="grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:grid-cols-2 lg:col-span-2">
            <legend className="px-2 text-sm font-bold text-emerald-900">Hardware y cultivo</legend>
            <label className="text-sm font-bold text-slate-700">Placa / Controlador<select required value={boardType} onChange={event => setBoardType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900">{!BOARD_TYPES.some(value => value === boardType) && <option>{boardType}</option>}{BOARD_TYPES.map(value => <option key={value}>{value}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Cepa de alga<select required value={algaeType} onChange={event => setAlgaeType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900">{!ALGAE_TYPES.some(value => value === algaeType) && <option>{algaeType}</option>}{ALGAE_TYPES.map(value => <option key={value}>{value}</option>)}</select></label>
            <div className="sm:col-span-2"><p className="text-sm font-bold text-slate-700">Sensores incluidos</p><div className="mt-2 flex flex-wrap gap-4">{SENSOR_OPTIONS.map(option => <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={sensors.includes(option.value)} onChange={event => setSensors(current => event.target.checked ? [...current, option.value] : current.filter(value => value !== option.value))} className="size-4 accent-emerald-700" />{option.label}</label>)}</div></div>
          </fieldset>
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">{locationMessage}</p>
              <button type="button" onClick={useCurrentLocation} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100">📍 Usar mi ubicación aproximada</button>
            </div>
            <LeafletMap coordinates={nodeLocation} onCoordinatesChange={updateNodeCoordinates} />
            <p className="mt-2 text-xs text-slate-500">Ubicación elegida: {nodeLocation.lat.toFixed(4)}, {nodeLocation.lng.toFixed(4)}.</p>
          </div>
          <div className="lg:col-span-2">
            {!nodeReady && <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Ingresa un nombre y selecciona país y departamento o ciudad para registrar el nodo.</p>}
            <button type="submit" disabled={busy || !nodeReady} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Guardando…' : editingNodeId ? 'Guardar ubicación' : 'Registrar nodo'}</button>
            {editingNodeId && <button type="button" disabled={busy} onClick={resetNodeForm} className="ml-3 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar edición</button>}
          </div>
        </form>

        {secret && <NodeTokenDialog token={secret.token} nodeId={secret.id} onClose={() => setSecret(null)} />}
        {nodeToDelete && <Dialog title="Eliminar nodo comunitario" description="¿Estás seguro de eliminar este nodo comunitario? Esta acción no se puede deshacer." onClose={() => { if (!busy) setNodeToDelete(null) }} busy={busy}><p className="text-sm text-slate-300">Se eliminarán «{nodeToDelete.name}», su reactor y las lecturas asociadas. La clave dejará de funcionar.</p>{deletionError && <p role="alert" className="mt-3 text-sm text-rose-300">{deletionError}</p>}<div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => setNodeToDelete(null)} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Cancelar</button><button type="button" disabled={busy} onClick={() => deleteNode(nodeToDelete)} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">{busy ? 'Eliminando…' : 'Eliminar nodo'}</button></div></Dialog>}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-950">Nodos registrados</h3>
          {nodesLoading ? <p className="mt-3 text-sm text-slate-500">Cargando nodos…</p> : nodes.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aún no tienes nodos registrados.</p> : <ul className="mt-3 grid gap-3">{nodes.map(node => <li key={node.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${editingNodeId === node.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100'}`}><div><p className="font-bold text-slate-900">{node.name}</p><p className="text-xs text-slate-500">{node.city}, {node.country}</p><p className="mt-1 text-xs text-emerald-700">{node.board_type} · {node.algae_type} · {node.sensors.length} sensores</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => editNode(node)} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">Editar ubicación<span className="sr-only"> de {node.name}</span></button><button type="button" disabled={busy} onClick={() => rotateNode(node)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Rotar token<span className="sr-only"> de {node.name}</span></button><button type="button" disabled={busy} onClick={() => { setDeletionError(''); setNodeToDelete(node) }} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Eliminar nodo<span className="sr-only"> {node.name}</span></button></div></li>)}</ul>}
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 lg:p-8">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Conectar tu hardware</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Selecciona tu nodo para consultar o copiar su clave API. Tu dispositivo envía las mediciones a esta plataforma y se guardan en Supabase; nunca uses una clave de administración en el firmware.</p>
        <div className="mt-5 flex flex-wrap items-end gap-3"><label className="min-w-48 flex-1 text-sm font-bold text-slate-700">Nodo<select value={apiNodeId} onChange={event => setApiNodeId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900"><option value="">Selecciona un nodo</option>{nodes.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}</select></label><button type="button" disabled={!apiNodeId || busy} onClick={viewApiKey} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">Consultar / Copiar API Key</button></div>
        <p className="mt-5 text-sm font-semibold text-slate-800">Ejemplo de envío (máximo una lectura por minuto)</p>
        <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200"><code>{`POST https://yuam.tech/api/telemetry
Authorization: Bearer TU_CLAVE_DEL_NODO
Content-Type: application/json

{"co2_ppm":520,"ph":7.1,"temperatura":26.5,"lux":850,"pm25":12.4}`}</code></pre>
      </section>

      <section className="rounded-[2rem] border border-rose-200 bg-rose-50/40 p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Cuenta</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Gestiona tu acceso</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Puedes cerrar sesión en este dispositivo o eliminar permanentemente tu cuenta y sus credenciales.</p>
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={signOut} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50">Cerrar sesión</button><button type="button" onClick={() => setDeleteOpen(true)} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-800">Eliminar cuenta</button></div>
      </section>

      {deleteOpen && <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 id="delete-account-title" className="text-xl font-black text-slate-950">¿Eliminar tu cuenta?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Esta acción elimina tu acceso y no se puede deshacer. Tus claves dejarán de ser válidas.</p><label className="mt-5 flex gap-3 text-sm text-slate-700"><input type="checkbox" checked={deleteConfirmed} onChange={event => setDeleteConfirmed(event.target.checked)} className="mt-1 size-4 accent-rose-700" />Entiendo que esta acción es permanente.</label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setDeleteOpen(false); setDeleteConfirmed(false) }} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700">Cancelar</button><button type="button" disabled={!deleteConfirmed || busy} onClick={deleteAccount} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Eliminar definitivamente</button></div></div></div>}
    </div>
  )
}
