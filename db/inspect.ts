import { supabase } from './client'

async function inspectTables() {
  console.log('🔍 Inspeccionando tablas en Supabase (YU_AM v2.0)...')
  const tables = ['avatares', 'perfiles', 'nodos_iot', 'telemetria_mq135']
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ Tabla '${table}': No accesible o no existe (${error.message})`)
    } else {
      console.log(`✅ Tabla '${table}': Accesible correctamente (Total registros: ${count ?? 0})`)
    }
  }
}

inspectTables().catch((err) => {
  console.error('Error al inspeccionar tablas:', err)
})
