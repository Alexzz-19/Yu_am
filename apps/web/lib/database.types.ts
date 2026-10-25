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
  ph: number | null
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

export type BovedaMemoria = {
  id: string
  titulo: string
  contenido: string
  etiquetas: string[]
  created_at: string
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PublicNode = {
  id: string
  nombre_nodo: string
  ubicacion_ofuscada: UbicacionOfuscada
  estado: EstadoNodo
  ultimo_envio: string | null
}

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] }
export type Database = {
  public: {
    Tables: {
      nodos_iot: Table<NodoIoT>
      telemetria_mq135: Table<TelemetriaMq135>
      readings: Table<Reading>
      reactors: Table<Reactor>
      boveda_memoria: Table<BovedaMemoria>
    }
    Views: { [_ in never]: never }
    Functions: {
      yuam_register_node: {
        Args: { p_name: string; p_zone: string; p_lat: number; p_lng: number; p_token_hash: string }
        Returns: string
      }
      yuam_rotate_node_token: { Args: { p_node_id: string; p_token_hash: string }; Returns: undefined }
      yuam_delete_node: { Args: { p_node_id: string }; Returns: undefined }
      yuam_public_nodes: { Args: Record<string, never>; Returns: PublicNode[] }
      yuam_ingest_telemetry: {
        Args: { p_token_hash: string; p_co2: number | null; p_ph: number | null; p_temperature: number | null }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
