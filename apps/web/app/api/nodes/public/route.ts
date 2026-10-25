import { apiFailure, json, serverSupabase } from '@/lib/api-server'

export async function GET() {
  try {
    const { data, error } = await serverSupabase().rpc('yuam_public_nodes')
    if (error) throw error
    return json({ nodes: data })
  } catch (error) { return apiFailure(error) }
}
