import 'server-only'
import { serverSupabase } from './api-server'
import type { DashboardReading } from './dashboard'
import { FAIR_NODE } from './fair-node'

export const FAIR_REACTOR_ID = '18e57a0c-6a18-41f8-9e18-1ed0018a2026'

export type PublicReactor = {
  id: string
  node_id: string | null
  name: string
  board_type: string
  algae_type: string
}

const READING_FIELDS = 'id,reactor_id,ppm_value,water_temperature,ph_value,humidity,light_lux,pm25,air_pump_status,status_quality,created_at'

export async function publicNodeReadings(nodeId: string) {
  const client = serverSupabase(true)
  const initial = await client.from('reactors')
    .select('id,node_id,name,board_type,algae_type')
    .eq('node_id', nodeId).maybeSingle()
  if (initial.error) throw initial.error
  let reactor = initial.data

  if (!reactor && nodeId === FAIR_NODE.id) {
    const result = await client.from('reactors').select('id,node_id,name,board_type,algae_type')
      .eq('id', FAIR_REACTOR_ID).maybeSingle()
    if (result.error) throw result.error
    reactor = result.data
  }

  if (!reactor) return { reactor: null as PublicReactor | null, readings: [] as DashboardReading[], usedLegacyFallback: false }

  const primary = await client.from('readings').select(READING_FIELDS)
    .eq('reactor_id', reactor.id).order('created_at', { ascending: false }).limit(96)
  if (primary.error) throw primary.error
  if (primary.data?.length) return { reactor, readings: primary.data, usedLegacyFallback: false }

  if (nodeId !== FAIR_NODE.id) {
    return { reactor, readings: [] as DashboardReading[], usedLegacyFallback: false }
  }

  // Legacy readings have no node reference. This fallback is limited to the
  // public INED node requested by the project; rows remain unchanged in storage.
  const legacy = await client.from('readings').select(READING_FIELDS)
    .is('reactor_id', null).order('created_at', { ascending: false }).limit(96)
  if (legacy.error) throw legacy.error
  return { reactor, readings: legacy.data ?? [], usedLegacyFallback: true }
}
