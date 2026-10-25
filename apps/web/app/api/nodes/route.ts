import { apiFailure, authenticated, databaseFailure, generateIngestToken, json, readJson, ApiError, serverSupabase } from '@/lib/api-server'
import { parseNode } from '@/lib/telemetry-validation'

export const runtime = 'nodejs'
const NODE_COLUMNS = 'id,user_id,name,country,city,lat,lng,created_at' as const

export async function GET(request: Request) {
  try {
    if (new URL(request.url).searchParams.get('scope') === 'community') {
      const { data, error } = await serverSupabase(true).from('nodes').select('id,name,country,city,lat,lng').order('created_at', { ascending: false }).limit(1000)
      if (error) databaseFailure(error)
      return json({ nodes: (data ?? []).map(node => ({ id: node.id, nombre_nodo: node.name, ubicacion_ofuscada: { zona: `${node.city}, ${node.country}`, lat: Math.round(node.lat * 100) / 100, lng: Math.round(node.lng * 100) / 100 }, estado: 'inactivo', ultimo_envio: null })) })
    }
    const { user } = await authenticated(request)
    const { data, error } = await serverSupabase(true).from('nodes').select(NODE_COLUMNS).eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) databaseFailure(error)
    return json({ nodes: data })
  } catch (error) { return apiFailure(error) }
}

export async function POST(request: Request) {
  try {
    const { user } = await authenticated(request)
    const body = await readJson(request)
    let input
    try { input = parseNode(body) } catch (error) { throw new ApiError(400, (error as Error).message) }
    if (!input.country || !input.city) throw new ApiError(400, 'Selecciona país y ciudad o departamento.')
    const { token } = generateIngestToken()
    // El propietario se toma exclusivamente del JWT verificado por Supabase.
    const { data: node, error } = await serverSupabase(true).from('nodes').insert({ user_id: user.id, name: input.nombre, country: input.country, city: input.city, lat: input.lat, lng: input.lng, token }).select(NODE_COLUMNS).single()
    if (error) databaseFailure(error)
    if (!node) throw new ApiError(503, 'No se recibió la confirmación del nodo registrado.')
    return json({ id: node.id, user_id: user.id, token, node }, 201)
  } catch (error) { return apiFailure(error) }
}
