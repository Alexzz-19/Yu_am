// Tipos de base de datos alineados con packages/database/schema.sql.
// Sustituibles por tipos generados con: `supabase gen types typescript --project-id <id>`
// y luego `Database['public']['Tables']['readings']['Row']`, etc.

export type EstadoNodo = 'activo' | 'inactivo' | 'mantenimiento'

export type UbicacionOfuscada = {
  zona?: string
  lat?: number
  lng?: number
}

export type NodoIoT = {
  id: string
  usuario_id: string | null
  nombre_nodo: string
  avatar_id: number | null
  ubicacion_ofuscada: UbicacionOfuscada | null
  estado: EstadoNodo
  created_at: string
  updated_at: string
}

export type TelemetriaMq135 = {
  id: number
  nodo_id: string
  ppm_co2: number | null
  calidad_aire: number | null
  temperatura: number | null
  humedad: number | null
  bufer_local: boolean
  created_at: string
  updated_at: string
}

export type Reactor = {
  id: string
  usuario_id: string | null
  nombre: string
  tipo_cultivo: string | null
  estado: EstadoNodo
  created_at: string
  updated_at: string
}

export type Reading = {
  id: number
  reactor_id: string
  temperatura: number | null
  ph: number | null
  oxigeno_disuelto: number | null
  created_at: string
  updated_at: string
}
