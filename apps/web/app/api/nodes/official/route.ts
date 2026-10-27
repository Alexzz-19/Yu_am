import { apiFailure, json } from '@/lib/api-server'
import { communityNodes } from '@/lib/community-nodes'
import { FAIR_NODE } from '@/lib/fair-node'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const node = (await communityNodes()).find(node => node.id === FAIR_NODE.id) ?? null
    return json({ node })
  } catch (error) { return apiFailure(error) }
}
