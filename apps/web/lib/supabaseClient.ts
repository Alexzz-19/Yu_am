import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase: define NEXT_PUBLIC_SUPABASE_URL y ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY en apps/web/.env.local (desarrollo local) o en los ' +
      'secrets del repositorio (CI de GitHub Actions / Vercel).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
