'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { nodeRequest } from '@/lib/node-api'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/lib/database.types'

type Node = Database['public']['Tables']['nodos_iot']['Row']

type NodeSecret = {
  id: string
  token: string
}

type ProfileForm = {
  username: string
  country: string
  city: string
  timezone: string
}

type Coordinates = {
  lat: number
  lng: number
}

type City = Coordinates & {
  name: string
}

type Country = {
  name: string
  cities: City[]
}

type StoredProfile = {
  profile?: Partial<ProfileForm>
  profile_edit_history?: unknown
}

const LOCATION_CATALOG: Country[] = [
  {
    name: 'Guatemala',
    cities: [
      { name: 'Ciudad de Guatemala', lat: 14.6349, lng: -90.5069 },
      { name: 'Quetzaltenango', lat: 14.8347, lng: -91.518 },
      { name: 'Cobán', lat: 15.4700, lng: -90.3700 },
    ],
  },
  {
    name: 'México',
    cities: [
      { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 },
      { name: 'Oaxaca de Juárez', lat: 17.0732, lng: -96.7266 },
      { name: 'Mérida', lat: 20.9674, lng: -89.5926 },
    ],
  },
  {
    name: 'Colombia',
    cities: [
      { name: 'Bogotá', lat: 4.711, lng: -74.0721 },
      { name: 'Medellín', lat: 6.2442, lng: -75.5812 },
      { name: 'Cali', lat: 3.4516, lng: -76.532 },
    ],
  },
  {
    name: 'España',
    cities: [
      { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
      { name: 'Barcelona', lat: 41.3874, lng: 2.1686 },
      { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    ],
  },
]

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function defaultProfile(): ProfileForm {
  const city = LOCATION_CATALOG[0].cities[0]
  return { username: '', country: LOCATION_CATALOG[0].name, city: city.name, timezone: browserTimezone() }
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

function cityFor(countryName: string, cityName: string) {
  const country = LOCATION_CATALOG.find(entry => entry.name === countryName) ?? LOCATION_CATALOG[0]
  return country.cities.find(entry => entry.name === cityName) ?? country.cities[0]
}

function sameProfile(left: ProfileForm, right: ProfileForm) {
  return left.username === right.username && left.country === right.country && left.city === right.city && left.timezone === right.timezone
}

export default function ProfileClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodesLoading, setNodesLoading] = useState(true)
  const [name, setName] = useState('')
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile)
  const [savedProfile, setSavedProfile] = useState<ProfileForm>(defaultProfile)
  const [editsUsed, setEditsUsed] = useState(0)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [message, setMessage] = useState('')
  const [locationMessage, setLocationMessage] = useState('Selecciona una ciudad, usa tu ubicación o marca un punto aproximado en el mapa.')
  const [busy, setBusy] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [secret, setSecret] = useState<NodeSecret | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const selectedCountry = useMemo(() => LOCATION_CATALOG.find(entry => entry.name === profile.country) ?? LOCATION_CATALOG[0], [profile.country])
  const profileDirty = !sameProfile(profile, savedProfile)

  const loadNodes = useCallback(async () => {
    const result = await nodeRequest<{ nodes: Node[] }>('/api/nodes')
    setNodes(result.nodes)
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
      const fallbackCity = cityFor(nextProfile.country, nextProfile.city)
      if (active) {
        setProfile(nextProfile)
        setSavedProfile(nextProfile)
        setEditsUsed(editsThisMonth(user.app_metadata))
        setCoordinates({ lat: fallbackCity.lat, lng: fallbackCity.lng })
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

  function changeCountry(countryName: string) {
    const country = LOCATION_CATALOG.find(entry => entry.name === countryName) ?? LOCATION_CATALOG[0]
    const city = country.cities[0]
    setProfile(current => ({ ...current, country: country.name, city: city.name }))
    setCoordinates({ lat: city.lat, lng: city.lng })
    setLocationMessage(`Ubicación aproximada de ${city.name}, ${country.name}.`)
  }

  function changeCity(cityName: string) {
    const city = cityFor(profile.country, cityName)
    setProfile(current => ({ ...current, city: city.name }))
    setCoordinates({ lat: city.lat, lng: city.lng })
    setLocationMessage(`Ubicación aproximada de ${city.name}, ${profile.country}.`)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Este navegador no permite compartir ubicación. Puedes marcar el mapa manualmente.')
      return
    }
    setLocationMessage('Solicitando ubicación aproximada…')
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocationMessage('Ubicación aproximada aplicada. Conservamos país y ciudad como referencia de tu nodo.')
      },
      () => setLocationMessage('No pudimos acceder a tu ubicación. Marca un punto aproximado en el mapa.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  function chooseMapPoint(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    const city = cityFor(profile.country, profile.city)
    setCoordinates({ lat: city.lat + (0.5 - y) * 0.14, lng: city.lng + (x - 0.5) * 0.2 })
    setLocationMessage('Punto aproximado marcado en el mapa. Puedes volver a pulsar para ajustarlo.')
  }

  async function registerNode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!coordinates) {
      setMessage('Elige una ubicación aproximada antes de registrar el nodo.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const result = await nodeRequest<NodeSecret>('/api/nodes', 'POST', {
        nombre: name.trim() || `Nodo ${profile.city}`,
        zona: `${profile.city}, ${profile.country}`,
        lat: coordinates.lat,
        lng: coordinates.lng,
      })
      setSecret(result)
      setName('')
      await loadNodes()
      setMessage('Nodo registrado. Guarda su token antes de cerrar esta pantalla.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo registrar el nodo.')
    } finally {
      setBusy(false)
    }
  }

  async function rotateNode(node: Node) {
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
              <select value={profile.country} onChange={event => changeCountry(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {LOCATION_CATALOG.map(country => <option key={country.name}>{country.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">Ciudad o zona
              <select value={profile.city} onChange={event => changeCity(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {selectedCountry.cities.map(city => <option key={city.name}>{city.name}</option>)}
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
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Registra un nodo sin coordenadas manuales</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Usa país y ciudad como referencia; la ubicación solo se usa para situar tu medición ambiental de forma aproximada.</p>
        </div>
        <form onSubmit={registerNode} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Nombre del nodo
            <input value={name} onChange={event => setName(event.target.value)} maxLength={80} placeholder={`Ej. Laboratorio ${profile.city}`} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold text-slate-700">País
              <select value={profile.country} onChange={event => changeCountry(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {LOCATION_CATALOG.map(country => <option key={country.name}>{country.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">Ciudad / zona
              <select value={profile.city} onChange={event => changeCity(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                {selectedCountry.cities.map(city => <option key={city.name}>{city.name}</option>)}
              </select>
            </label>
          </div>
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">{locationMessage}</p>
              <button type="button" onClick={useCurrentLocation} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100">📍 Usar mi ubicación aproximada</button>
            </div>
            <button type="button" onClick={chooseMapPoint} aria-label="Marcar ubicación aproximada en el mapa" className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-emerald-200 bg-[linear-gradient(125deg,#d9f5e6_0%,#eefaf4_42%,#d8ecf8_100%)] text-left shadow-inner" style={{ backgroundSize: 'auto, 28px 28px', backgroundImage: 'linear-gradient(125deg,#d9f5e6_0%,#eefaf4_42%,#d8ecf8_100%), linear-gradient(rgba(16,185,129,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,.14) 1px, transparent 1px)' }}>
              <span className="absolute left-5 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-950">Mapa aproximado · pulsa para ubicar</span>
              <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-600 shadow-lg" aria-hidden="true" />
            </button>
            {coordinates && <p className="mt-2 text-xs text-slate-500">Ubicación elegida: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}.</p>}
          </div>
          <div className="lg:col-span-2">
            <button type="submit" disabled={busy} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Registrando…' : 'Registrar nodo'}</button>
          </div>
        </form>

        {secret && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-bold">Token de {secret.id}</p><code className="mt-2 block select-all break-all rounded-lg bg-white p-3 text-xs">{secret.token}</code><p className="mt-2 text-xs">Este token solo se muestra ahora. Guárdalo en un lugar seguro.</p></div>}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-950">Nodos registrados</h3>
          {nodesLoading ? <p className="mt-3 text-sm text-slate-500">Cargando nodos…</p> : nodes.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aún no tienes nodos registrados.</p> : <ul className="mt-3 grid gap-3">{nodes.map(node => <li key={node.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"><div><p className="font-bold text-slate-900">{node.nombre_nodo}</p><p className="text-xs text-slate-500">{node.ubicacion_ofuscada?.zona ?? 'Zona sin definir'} · {node.estado}</p></div><button type="button" disabled={busy} onClick={() => rotateNode(node)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Rotar token</button></li>)}</ul>}
        </div>
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
