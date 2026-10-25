'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { nodeRequest } from '@/lib/node-api'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/lib/database.types'

type Node = Database['public']['Tables']['nodos_iot']['Row']
type Secret = { id: string; token: string }
type VisibleSecret = Secret & { ownerId: string }
const button = 'rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700'
const input = 'mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-emerald-600'

export default function ProfileClient() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodesLoading, setNodesLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [secret, setSecret] = useState<VisibleSecret | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const refresh = useCallback(async () => {
    const data = await nodeRequest<{ nodes: Node[] }>('/api/nodes')
    setNodes(data.nodes)
  }, [])
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])
  useEffect(() => {
    if (!user) return
    let current = true
    void nodeRequest<{ nodes: Node[] }>('/api/nodes').then(data => { if (current) setNodes(data.nodes) })
      .catch(error => { if (current) setMessage((error as Error).message) })
      .finally(() => { if (current) setNodesLoading(false) })
    return () => { current = false }
  }, [user])

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !user) return
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true); setMessage(''); setSecret(null)
    try {
      const result = await nodeRequest<Secret>('/api/nodes', 'POST', {
        nombre: data.get('nombre'), zona: data.get('zona'), lat: Number(data.get('lat')), lng: Number(data.get('lng')),
      })
      setSecret({ ...result, ownerId: user.id }); form.reset()
      setMessage('Nodo registrado. Copia el token antes de salir de esta página.')
      await refresh()
    } catch (error) { setMessage((error as Error).message) }
    finally { setBusy(false) }
  }

  async function manage(id: string, method: 'PATCH' | 'DELETE') {
    if (busy || !user) return
    if (!window.confirm(method === 'DELETE' ? '¿Eliminar el nodo, sus mediciones y su token?' : '¿Regenerar el token? El anterior dejará de funcionar inmediatamente.')) return
    setBusy(true); setMessage('')
    try {
      if (method === 'PATCH') {
        setSecret({ ...await nodeRequest<Secret>(`/api/nodes/${id}`, method), ownerId: user.id })
        setMessage('Token regenerado. Actualiza el firmware o script con el nuevo token.')
      } else {
        await nodeRequest(`/api/nodes/${id}`, method)
        if (secret?.id === id) setSecret(null)
        setMessage('Nodo eliminado y token revocado.')
      }
      await refresh()
    } catch (error) { setMessage((error as Error).message) }
    finally { setBusy(false) }
  }

  async function logout() {
    setBusy(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSecret(null); setNodes([]); router.replace('/login')
    } catch { setMessage('No se pudo cerrar la sesión. Inténtalo de nuevo.') }
    finally { setBusy(false) }
  }

  if (loading || !user) return <p role="status" className="mt-8 text-slate-600">Comprobando sesión…</p>
  const ownedNodes = nodes.filter(node => node.usuario_id === user.id)
  const name: string = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : 'Investigador YU’AM'
  const avatar: string | null = typeof user.user_metadata.avatar_url === 'string' && user.user_metadata.avatar_url.startsWith('https://') ? user.user_metadata.avatar_url : null
  return <div className="mt-8 space-y-8">
    <section aria-label="Perfil de usuario" className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6">
      {avatar && !avatarFailed ? (
        // El proveedor OAuth determina el host; no se envían cookies al cargar el avatar.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={`Avatar de ${name}`} width={64} height={64} referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-16 w-16 rounded-full object-cover" />
      ) : <span aria-label="Avatar por inicial" className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-900">{name.slice(0, 1).toUpperCase()}</span>}
      <div className="min-w-0 flex-1"><h2 className="break-words text-xl font-semibold">{name}</h2><p className="break-all text-sm text-slate-600">{user.email}</p></div>
      <button type="button" onClick={logout} disabled={busy} className={button}>Cerrar sesión</button>
    </section>
    <section aria-labelledby="my-nodes-title">
      <h2 id="my-nodes-title" className="text-xl font-semibold">Mis Nodos YU&apos;AM</h2>
      <p className="mt-2 text-sm text-slate-600">Hasta cuatro nodos por cuenta. Cada nodo tiene su propio token de ingesta.</p>
      {nodesLoading ? <p role="status" className="mt-5 text-slate-600">Cargando nodos…</p> : <>
        {ownedNodes.length === 0 && <p className="mt-5 text-sm text-slate-600">Aún no tienes nodos registrados. Añade el primero con el formulario.</p>}
        <ul className="mt-5 divide-y divide-slate-200">{ownedNodes.map(node => <li key={node.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="min-w-0"><h3 className="break-words font-semibold">{node.nombre_nodo}</h3><p className="text-sm text-slate-600">{node.ubicacion_ofuscada?.zona} · {node.ubicacion_ofuscada?.lat}, {node.ubicacion_ofuscada?.lng}</p><p className="mt-1 text-xs text-slate-500">{node.estado === 'activo' ? 'Última recepción correcta' : 'Sin recepción activa'} · {node.id}</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => manage(node.id, 'PATCH')} className={button}>Regenerar token<span className="sr-only"> de {node.nombre_nodo}</span></button><button type="button" disabled={busy} onClick={() => manage(node.id, 'DELETE')} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-800 hover:bg-red-50 disabled:opacity-50">Eliminar<span className="sr-only"> {node.nombre_nodo}</span></button></div>
        </li>)}</ul>
      </>}
    </section>
    <p role="status" className="text-sm text-slate-700">{message}</p>
    {secret && secret.ownerId === user.id && <section aria-label="Token de ingesta generado" className="rounded-xl border border-amber-300 bg-amber-50 p-5">
      <h2 className="font-semibold text-amber-950">Guarda el token de tu nodo</h2><p className="mt-2 text-sm text-amber-950">Solo se muestra en esta sesión de la página. En Supabase se guarda su hash. Si lo pierdes, genera uno nuevo; no lo incluyas en repositorios públicos.</p>
      <code className="mt-4 block break-all rounded-lg bg-white p-3 text-sm">{secret.token}</code>
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(secret.token); setMessage('Token copiado.') } catch { setMessage('Selecciona el token y cópialo manualmente; el navegador bloqueó el portapapeles.') } }} className={`${button} mt-3 bg-white`}>Copiar token</button>
    </section>}
    <section aria-labelledby="register-node-title" className="rounded-2xl border border-slate-200 p-6">
      <h2 id="register-node-title" className="text-lg font-semibold">Registrar nodo</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">El nombre, la zona y las coordenadas aproximadas serán públicos en el mapa. Usa una referencia general de tu comunidad; las coordenadas se redondean a dos decimales.</p>
      <form onSubmit={register} className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium" htmlFor="node-name">Nombre del nodo<input className={input} id="node-name" name="nombre" required maxLength={100} placeholder="Cultivo comunitario" /></label>
        <label className="text-sm font-medium" htmlFor="node-zone">Ubicación / zona<input className={input} id="node-zone" name="zona" required maxLength={150} placeholder="Municipio o zona" /></label>
        <label className="text-sm font-medium" htmlFor="node-lat">Latitud aproximada<input className={input} id="node-lat" name="lat" type="number" required min={-90} max={90} step="any" placeholder="14.60" /></label>
        <label className="text-sm font-medium" htmlFor="node-lng">Longitud aproximada<input className={input} id="node-lng" name="lng" type="number" required min={-180} max={180} step="any" placeholder="-90.51" /></label>
        <button disabled={busy || nodesLoading || ownedNodes.length >= 4} className={`${button} justify-self-start bg-emerald-50`}>{busy ? 'Guardando…' : 'Registrar y generar token'}</button>
      </form>
    </section>
    <section className="rounded-xl bg-slate-50 p-5"><h2 className="font-semibold">Conectar ESP32 o Python</h2><p className="mt-2 text-sm text-slate-600">Envía un POST a /api/telemetry con el token del nodo y al menos una medición. Espera 60 segundos entre lecturas. Ante HTTP 429, respeta Retry-After; no descartes tu registro local.</p>
      <pre className="mt-4 overflow-x-auto text-xs leading-relaxed"><code>{`POST /api/telemetry
Authorization: Bearer yua_live_TU_TOKEN
Content-Type: application/json

{"co2_ppm": 520, "ph": 7.1, "temperatura": 26.5}`}</code></pre>
    </section>
  </div>
}
