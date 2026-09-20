import { supabase } from './client'

async function inspectTables() {
  console.log('🔍 Inspeccionando tablas en Supabase (YU_AM v2.0)...')
  const tables = ['readings', 'reactors', 'mediciones_aire', 'avatares', 'perfiles', 'nodos_iot', 'telemetria_mq135']
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ Tabla '${table}': No accesible / No existe (${error.message})`)
    } else {
      console.log(`✅ Tabla '${table}': Accesible (Total registros: ${count ?? 0})`)
    }
  }
}

inspectTables().catch((err) => {
  console.error('Error al inspeccionar tablas:', err)
})
