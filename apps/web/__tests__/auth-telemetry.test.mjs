import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function modules(mockClient) {
  const cache = new Map()
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const source = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    vm.runInNewContext(source, {
      exports, Response, Request, Buffer, URL,
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test', SUPABASE_SERVICE_ROLE_KEY: 'server-test' } },
      require: name => {
        if (name === 'server-only') return {}
        if (name === '@supabase/supabase-js') return { createClient: () => mockClient }
        if (name.startsWith('@/')) return load(name.slice(2) + '.ts')
        if (name.startsWith('.')) return load(path.join(path.dirname(file), name) + '.ts')
        return require(name)
      },
    }, { filename: file })
    return exports
  }
  return load
}

const token = 'yua_live_' + 'a'.repeat(64)
function request(body, authorization = `Bearer ${token}`) {
  return new Request('https://yuam.test/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) }, body: JSON.stringify(body) })
}

describe('ingesta autenticada', () => {
  it('rechaza tokens ausentes o mal formados antes de consultar Supabase', async () => {
    const route = modules({ rpc: () => assert.fail('No debe consultar DB') })('app/api/telemetry/route.ts')
    for (const auth of [null, 'Basic abc', 'Bearer yua_live_corto', `Bearer ${token} extra`]) {
      assert.equal((await route.POST(request({ co2_ppm: 500 }, auth))).status, 401)
    }
  })

  it('autoriza la clave del nodo y guarda sus métricas en la transacción de hardware', async () => {
    let args
    const route = modules({ rpc: async (name, input) => {
      assert.equal(name, 'yuam_ingest_hardware'); args = input
      return { data: { status: 'accepted', nodo_id: 'node-1', created_at: '2026-10-25T00:00:00Z' }, error: null }
    } })('app/api/telemetry/route.ts')
    const response = await route.POST(request({ co2_ppm: 520, ph: 7.1, temperatura: 26.5 }))
    assert.equal(response.status, 201)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.equal((await response.json()).estado, 'Activo')
    assert.equal(args.p_token, token)
    assert.equal(args.p_ph, 7.1)
    assert.equal((await route.POST(request({ nodo_id: 'other', co2_ppm: 520 }))).status, 400)
  })

  it('devuelve 429 y Retry-After cuando PostgreSQL rechaza el intervalo', async () => {
    const route = modules({ rpc: async () => ({ data: { status: 'rate_limited', retry_after: 59 }, error: null }) })('app/api/telemetry/route.ts')
    const response = await route.POST(request({ co2_ppm: 520 }))
    assert.equal(response.status, 429)
    assert.equal(response.headers.get('Retry-After'), '59')
    assert.equal((await response.json()).error, 'Frecuencia de envío superada. Máximo 1 lectura cada 30 minutos por nodo.')
  })

  it('rechaza tokens revocados y falla sin filtrar detalles de la base', async () => {
    const revoked = modules({ rpc: async () => ({ data: { status: 'unauthorized' }, error: null }) })('app/api/telemetry/route.ts')
    assert.equal((await revoked.POST(request({ ph: 7 }))).status, 401)
    const failed = modules({ rpc: async () => ({ data: null, error: { message: 'SECRET DATABASE DETAIL' } }) })('app/api/telemetry/route.ts')
    const response = await failed.POST(request({ ph: 7 }))
    assert.equal(response.status, 503)
    assert.ok(!(await response.text()).includes('SECRET'))
  })

  it('rechaza cuerpo vacío, tipos incorrectos, límites, JSON inválido y cuerpos grandes', async () => {
    const route = modules({ rpc: () => assert.fail('No debe consultar DB') })('app/api/telemetry/route.ts')
    for (const body of [{}, [], null, { ph: 15 }, { ph: '7' }, { temperatura: -56 }, { co2_ppm: -1 }, { co2_ppm: true }, { lux: -1 }, { pm25: -1 }, { humedad: 101 }, { humedad: -1 }, { humedad: '50' }]) {
      assert.equal((await route.POST(request(body))).status, 400)
    }
    const invalid = new Request('https://yuam.test/api/telemetry', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{' })
    assert.equal((await route.POST(invalid)).status, 400)
    assert.equal((await route.POST(request({ ph: 'a'.repeat(5000) }))).status, 413)
    const wrongType = new Request('https://yuam.test/api/telemetry', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: '{}' })
    assert.equal((await route.POST(wrongType)).status, 415)
  })
})

describe('dashboard real y explorador comunitario', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const context = { params: Promise.resolve({ id }) }
  const authorized = () => new Request(`https://yuam.test/api/nodes/${id}/readings?user_id=other&reactor_id=other`, { headers: { Authorization: 'Bearer verified-session' } })

  it('impide consultar lecturas sin sesión y de nodos ajenos', async () => {
    const noSession = modules({})('app/api/nodes/[id]/readings/route.ts')
    assert.equal((await noSession.GET(new Request('https://yuam.test/api/nodes/x/readings'), context)).status, 401)
    const filters = {}
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
      from: table => {
        assert.equal(table, 'nodes', 'No debe consultar reactores ni lecturas de un nodo ajeno')
        const query = { select: () => query, eq: (field, value) => { filters[field] = value; return query }, maybeSingle: async () => ({ data: null, error: null }) }
        return query
      },
    })('app/api/nodes/[id]/readings/route.ts')
    assert.equal((await route.GET(authorized(), context)).status, 404)
    assert.deepEqual(filters, { id, user_id: 'owner' })
  })

  it('vincula el nodo y reactor del propietario antes de obtener sus lecturas', async () => {
    const filters = {}
    const reading = { id: 1, reactor_id: 'owned-reactor', ppm_value: 0, humidity: 0, ph_value: 7.1, created_at: '2026-10-25T10:00:00Z' }
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
      from: table => {
        filters[table] = {}
        const query = {
          select: columns => { assert.ok(!/token|api_key/.test(columns)); return query },
          eq: (field, value) => { filters[table][field] = value; return query },
          maybeSingle: async () => ({ data: table === 'nodes' ? { id } : { id: 'owned-reactor', node_id: id }, error: null }),
          order: (field, options) => { assert.equal(field, 'created_at'); assert.equal(options.ascending, false); return query },
          limit: async count => { assert.equal(count, 96); return { data: [reading], error: null } },
        }
        return query
      },
    })('app/api/nodes/[id]/readings/route.ts')
    const response = await route.GET(authorized(), context)
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.readings[0].humidity, 0)
    assert.equal(result.readings[0].ppm_value, 0)
    assert.deepEqual(filters, { nodes: { id, user_id: 'owner' }, reactors: { node_id: id, user_id: 'owner' }, readings: { reactor_id: 'owned-reactor' } })
  })

  it('publica metadatos y estadísticas sin claves, propietario ni coordenadas precisas', async () => {
    const route = modules({
      rpc: async () => ({ data: [{ id, nombre_nodo: 'Cultivo', estado: 'inactivo', ubicacion_ofuscada: { lat: 14.6, lng: -90.5 }, ultimo_envio: null, token: 'SECRET', user_id: 'owner' }], error: null }),
      from: table => {
        assert.equal(table, 'nodes')
        return { select: columns => {
          assert.ok(!/token|user_id|api_key/.test(columns))
          return { in: async (field, ids) => {
            assert.equal(field, 'id'); assert.equal(ids[0], id)
            return { data: [{ id, country: 'Guatemala', city: 'Petén', algae_type: 'Spirulina', category: 'Investigación', university: 'Universidad local', token: 'SECRET', lat: 14.5968 }], error: null }
          } }
        } }
      },
    })('app/api/nodes/route.ts')
    const response = await route.GET(new Request('https://yuam.test/api/nodes?scope=community'))
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.nodes[0].city, 'Petén')
    assert.equal(result.nodes[0].university, 'Universidad local')
    assert.ok(!JSON.stringify(result).includes('SECRET'))
    assert.ok(!('user_id' in result.nodes[0]))
    assert.ok(!('lat' in result.nodes[0]))
  })

  it('combina búsquedas sin acentos, cepa y categoría; conserva ceros y ausencias', () => {
    const { filterDashboards, formatMetric } = modules({})('lib/dashboard.ts')
    const nodes = [
      { id: 'a', name: 'Cultivo Norte', city: 'Petén', country: 'Guatemala', algae_type: 'Spirulina platensis', university: 'Universidad Pública', category: 'Investigación' },
      { id: 'b', name: 'Cultivo Sur', city: 'Guatemala', country: 'Guatemala', algae_type: 'Chlorella vulgaris', category: null },
    ]
    const filters = { text: 'peten publica', algae: 'spirulina', category: 'Investigación' }
    assert.deepEqual([...filterDashboards(nodes, filters)].map(node => node.id), ['a'])
    assert.equal(filterDashboards(nodes, { ...filters, algae: 'Chlorella' }).length, 0)
    assert.equal(filterDashboards(nodes, { text: '', algae: '', category: 'Biomasa' }).length, 0)
    assert.equal(filterDashboards(nodes, { text: '', algae: '', category: '' }).length, 2)
    assert.equal(formatMetric(0), '0.0')
    assert.equal(formatMetric(null), 'Sin datos')
  })

  it('acepta humedad real en porcentaje y la envía a la función de ingesta', async () => {
    const route = modules({ rpc: async (_name, input) => {
      assert.equal(input.p_humidity, 0)
      return { data: { status: 'accepted', nodo_id: id }, error: null }
    } })('app/api/telemetry/route.ts')
    assert.equal((await route.POST(request({ humedad: 0 }))).status, 201)
  })
})

describe('gestión de nodos', () => {
  it('requiere JWT validado en servidor y rechaza sesiones anónimas', async () => {
    const route = modules({ auth: { getUser: async () => ({ data: { user: null }, error: new Error('invalid') }) } })('app/api/nodes/route.ts')
    assert.equal((await route.POST(request({}))).status, 401)
    assert.equal((await route.GET(new Request('https://yuam.test/api/nodes'))).status, 401)
    const anonymous = modules({ auth: { getUser: async () => ({ data: { user: { id: 'x', is_anonymous: true } }, error: null }) } })('app/api/nodes/route.ts')
    assert.equal((await anonymous.POST(request({}))).status, 401)
  })

  it('inserta en nodes con propietario validado y tokens únicos; redondea ubicación', async () => {
    const calls = []
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
      from: table => {
        assert.equal(table, 'nodes')
        return { insert: input => { calls.push(input); return { select: columns => { assert.ok(!columns.split(',').includes('token')); return { single: async () => ({ data: { id: 'node-1', user_id: input.user_id, name: input.name }, error: null }) } } } } }
      },
    })('app/api/nodes/route.ts')
    const body = { name: ' Cultivo ', country: 'Guatemala', city: 'Guatemala', lat: 14.5968, lng: -90.5103, board_type: 'ESP32', algae_type: 'Spirulina', sensors: ['ph', 'temperature'] }
    const first = await route.POST(request(body)); const one = await first.json()
    const second = await route.POST(request(body)); const two = await second.json()
    assert.equal(first.status, 201); assert.equal(second.status, 201)
    assert.match(one.token, /^yua_live_[a-f0-9]{64}$/)
    assert.notEqual(one.token, two.token)
    assert.equal(calls[0].user_id, 'owner')
    assert.equal(calls[0].lat, 14.6); assert.equal(calls[0].lng, -90.51)
    assert.equal(calls[0].name, 'Cultivo')
    assert.equal(calls[0].token, one.token)
    assert.equal(calls[0].board_type, 'ESP32')
    assert.equal(calls[0].algae_type, 'Spirulina')
    assert.deepEqual([...calls[0].sensors], ['ph', 'temperature'])
  })

  it('no confirma un alta si Supabase rechaza la inserción', async () => {
    let input
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner-id', is_anonymous: false } }, error: null }) },
      from: () => ({ insert: payload => { input = payload; return { select: () => ({ single: async () => ({ data: null, error: { code: '42501' } }) }) } } }),
    })('app/api/nodes/route.ts')
    const response = await route.POST(request({ name: 'Cultivo comunitario', country: 'Guatemala', city: 'Petén', lat: 16.9226, lng: -89.892, board_type: 'Arduino', algae_type: 'Chlorella vulgaris', sensors: ['lux'] }))
    assert.equal(response.status, 403)
    const result = await response.json()
    assert.equal(input.user_id, 'owner-id')
    assert.equal(input.name, 'Cultivo comunitario')
    assert.equal(input.city, 'Petén')
    assert.equal(input.lat, 16.92)
    assert.ok(!result.token)
  })

  it('rechaza nombres vacíos y coordenadas fuera del mundo', () => {
    const { parseNode } = modules({})('lib/telemetry-validation.ts')
    for (const body of [{ nombre: '', zona: 'X', lat: 0, lng: 0 }, { nombre: 'X', zona: 'Y', lat: 91, lng: 0 }, { nombre: 'X', zona: 'Y', lat: 0, lng: -181 }, { name: 'X', country: '', city: 'Guatemala', lat: 14, lng: -90 }, { name: 'X', country: 'Guatemala', city: '', lat: 14, lng: -90 }, { name: 'X', country: 'Guatemala', city: 'Guatemala', user_id: 'other', lat: 14, lng: -90 }]) {
      assert.throws(() => parseNode(body))
    }
    const structured = parseNode({ name: ' Sensor ', country: 'Guatemala', city: 'Petén', lat: 16.9226, lng: -89.892 })
    assert.equal(structured.nombre, 'Sensor')
    assert.equal(structured.zona, 'Petén, Guatemala')
  })

  it('mantiene el control de propiedad en rotación y borrado', async () => {
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'other-owner' } }, error: null }) },
      from: () => {
        const query = { eq: (column, value) => { if (column === 'user_id') assert.equal(value, 'other-owner'); return query }, select: () => query, maybeSingle: async () => ({ data: null, error: null }) }
        return { update: () => query, delete: () => query }
      },
    })('app/api/nodes/[id]/route.ts')
    const context = { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    assert.equal((await route.PATCH(request({}), context)).status, 404)
    assert.equal((await route.DELETE(request({}), context)).status, 404)
  })

  it('reubica solo el nodo del propietario sin cambiar su token', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    let updated
    const filters = {}
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
      from: table => {
        assert.equal(table, 'nodes')
        const query = {
          eq: (column, value) => { filters[column] = value; return query },
          select: columns => { assert.ok(!columns.split(',').includes('token')); return query },
          maybeSingle: async () => ({ data: { id, user_id: 'owner', ...updated }, error: null }),
        }
        return { update: input => { updated = input; return query } }
      },
    })('app/api/nodes/[id]/route.ts')
    const response = await route.PATCH(request({ action: 'relocate', name: 'Cultivo', country: 'Guatemala', city: 'Petén', lat: 16.9226, lng: -89.892 }), { params: Promise.resolve({ id }) })
    assert.equal(response.status, 200)
    const { node } = await response.json()
    assert.equal(node.city, 'Petén')
    assert.equal(updated.lat, 16.92)
    assert.ok(!('token' in updated))
    assert.deepEqual(filters, { id, user_id: 'owner' })
  })

  it('DELETE /api/nodes elimina únicamente el id indicado y su propietario verificado', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    const filters = {}
    const route = modules({
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
      from: table => {
        assert.equal(table, 'nodes')
        const query = { eq: (column, value) => { filters[column] = value; return query }, select: () => query, maybeSingle: async () => ({ data: { id }, error: null }) }
        return { delete: () => query }
      },
    })('app/api/nodes/route.ts')
    const response = await route.DELETE(request({ id, user_id: 'other' }))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).deleted, true)
    assert.deepEqual(filters, { id, user_id: 'owner' })
    assert.equal((await route.DELETE(request({ id: 'invalid' }))).status, 400)
  })
})
