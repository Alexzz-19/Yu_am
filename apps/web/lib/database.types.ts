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
  id: number
  titulo: string
  contenido: string
  etiquetas: string | null
}

export type RegisteredNode = {
  id: string
  user_id: string
  name: string
  country: string
  city: string
  lat: number
  lng: number
  token: string
  created_at: string
  board_type: string
  algae_type: string
  sensors: string[]
  category: string | null
  university: string | null
}

export type HardwareReactor = { id: string; node_id: string | null; user_id: string | null; name: string; board_type: string; algae_type: string; sensors: string[]; location_name: string; latitude: number; longitude: number; api_key: string; created_at: string }
export type HardwareReading = { id: number; reactor_id: string | null; ppm_value: number | null; water_temperature: number | null; ph_value: number | null; light_lux: number | null; pm25: number | null; humidity: number | null; air_pump_status: boolean | null; status_quality: string; created_at: string }
export type TelemetryMetrics = { ppm: number | null; pm25: number | null; temperature: number | null; ph: number | null; lux: number | null; humidity: number | null }
export type NodeTelemetry = { last: TelemetryMetrics; week: TelemetryMetrics; month: TelemetryMetrics; weekSamples: number; monthSamples: number }

export type NodeSummary = Omit<RegisteredNode, 'token'>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PublicNode = {
  id: string
  nombre_nodo: string
  ubicacion_ofuscada: UbicacionOfuscada
  estado: EstadoNodo
  ultimo_envio: string | null
  telemetry?: NodeTelemetry
  country?: string
  city?: string
  algae_type?: string
  board_type?: string
  category?: string | null
  university?: string | null
}

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] }
export type Database = {
  public: {
    Tables: {
      nodes: Table<RegisteredNode>
      nodos_iot: Table<NodoIoT>
      telemetria_mq135: Table<TelemetriaMq135>
      readings: Table<HardwareReading>
      reactors: Table<HardwareReactor>
      boveda_memoria: Table<BovedaMemoria>
      yuam_chat_usage: Table<{ user_id: string; usage_date: string; used: number }>
      yum_chat_history: Table<{ id: string; user_id: string; role: 'user' | 'assistant'; content: string; created_at: string }>
    }
    Views: { [_ in never]: never }
    Functions: {
      yuam_consume_chat_quota: { Args: { p_user_id: string }; Returns: Json }
      yuam_public_node_stats: { Args: Record<string, never>; Returns: PublicNode[] }
      yuam_ingest_hardware: { Args: { p_token: string; p_ppm: number | null; p_ph: number | null; p_temperature: number | null; p_lux: number | null; p_pm25: number | null; p_humidity: number | null }; Returns: Json }
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
