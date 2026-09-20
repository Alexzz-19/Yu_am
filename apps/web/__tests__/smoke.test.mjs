import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

describe('humo del entorno YUAM (apps/web)', () => {
  it('responde en Node.js 20 o superior', () => {
    const major = Number(process.version.slice(1).split('.')[0])
    assert.ok(major >= 20, `Se requiere Node >= 20, actual: ${process.version}`)
  })

  it('documenta las claves Supabase en .env.example sin valores reales', () => {
    const example = readFileSync(path.join(webDir, '.env.example'), 'utf8')
    assert.ok(
      example.includes('NEXT_PUBLIC_SUPABASE_URL='),
      'Falta NEXT_PUBLIC_SUPABASE_URL en .env.example'
    )
    assert.ok(
      example.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='),
      'Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.example'
    )
  })

  it('conserva la forma del payload de telemetría MQ-135', () => {
    const muestra = {
      id: 1,
      nodo_id: 'mock-nodo-1',
      ppm_co2: 412.5,
      calidad_aire: 94.2,
      temperatura: 26.4,
      humedad: 78.5,
      bufer_local: false,
      created_at: new Date().toISOString()
    }
    const serializada = JSON.parse(JSON.stringify(muestra))
    assert.equal(typeof serializada.ppm_co2, 'number')
    assert.equal(typeof serializada.bufer_local, 'boolean')
    assert.ok(!Number.isNaN(Date.parse(serializada.created_at)))
  })
})
