import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde packages/database/.env
dotenv.config({ path: path.resolve(__dirname, '.env') })

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Advertencia: Faltan variables de entorno de Supabase en packages/database/.env')
}

// Cliente Supabase compatible con Node.js 20 para operaciones backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: { 'x-client-info': 'yuam-backend' },
  },
  realtime: {
    transport: WebSocket as any,
  },
})
