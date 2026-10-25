import { apiFailure, authenticated, databaseFailure, generateIngestToken, json, readJson, ApiError } from '@/lib/api-server'
import { parseNode } from '@/lib/telemetry-validation'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { client, user } = await authenticated(request)
    const { data, error } = await client.from('nodos_iot').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false })
    if (error) databaseFailure(error)
    return json({ nodes: data })
  } catch (error) { return apiFailure(error) }
}

export async function POST(request: Request) {
  try {
    const { client, user } = await authenticated(request)
    const body = await readJson(request)
    let input
    try { input = parseNode(body) } catch (error) { throw new ApiError(400, (error as Error).message) }
    const { token, hash } = generateIngestToken()
    const { data, error } = await client.rpc('yuam_register_node', {
      p_name: input.nombre, p_zone: input.zona, p_lat: input.lat, p_lng: input.lng, p_token_hash: hash,
    })
    if (error) databaseFailure(error)
    if (!data) throw new ApiError(503, 'No se recibió la confirmación del nodo registrado.')
    const { data: node, error: nodeError } = await client.from('nodos_iot').select('*').eq('id', data).eq('usuario_id', user.id).single()
    if (nodeError || !node) databaseFailure(nodeError)
    return json({ id: data, token, node }, 201)
  } catch (error) { return apiFailure(error) }
}
