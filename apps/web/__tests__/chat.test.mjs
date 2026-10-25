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
const note = { id: 'note-1', titulo: 'Calibración de pH', contenido: 'Usa dos soluciones tampón para calibrar el sensor de pH.', etiquetas: ['ph', 'sensores'] }

function routeWith({ user = { id: 'researcher', is_anonymous: false }, notes = [note], key = 'server-secret', fetch: fakeFetch = async () => Response.json({ candidates: [{ content: { parts: [{ text: 'Calibra con dos soluciones tampón [1].' }] } }] }), onQuery = () => {} } = {}) {
  const cache = new Map()
  const mockClient = {
    auth: { getUser: async () => ({ data: { user }, error: user ? null : { message: 'missing' } }) },
    from: table => {
      assert.equal(table, 'boveda_memoria')
      return { select: columns => {
        assert.equal(columns, 'id,titulo,contenido,etiquetas')
        return { limit: async count => { onQuery('', count); return { data: notes, error: null } } }
      } }
    },
  }
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const source = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    vm.runInNewContext(source, {
      exports, Request, Response, Buffer, AbortSignal,
      fetch: (url, options) => url.includes('batchEmbedContents') ? Response.json({ embeddings: JSON.parse(options.body).requests.map(() => ({ values: [1, ...Array(767).fill(0)] })) }) : fakeFetch(url, options),
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test', SUPABASE_SERVICE_ROLE_KEY: 'service-test', GEMINI_API_KEY: key } },
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
  return load('app/api/chat/route.ts')
}

function question(prompt, authorization = 'Bearer valid-session') {
  return new Request('https://yuam.test/api/chat', { method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
}

describe('bot RAG', () => {
  it('rechaza sesión ausente o anónima antes de consultar la bóveda o Gemini', async () => {
    const invalid = routeWith({ user: null, onQuery: () => assert.fail('No debe buscar') })
    assert.equal((await invalid.POST(question('¿Cómo calibro pH?'))).status, 401)
    assert.equal((await invalid.POST(question('¿Cómo calibro pH?', ''))).status, 401)
    const anonymous = routeWith({ user: { id: 'guest', is_anonymous: true }, onQuery: () => assert.fail('No debe buscar') })
    assert.equal((await anonymous.POST(question('¿Cómo calibro pH?'))).status, 401)
  })

  it('valida tamaño y tipo de pregunta', async () => {
    const route = routeWith({ onQuery: () => assert.fail('No debe buscar') })
    for (const prompt of ['', '  ', 12, 'x'.repeat(1001)]) {
      assert.equal((await route.POST(question(prompt))).status, 400)
    }
    const missing = new Request('https://yuam.test/api/chat', { method: 'POST', headers: { Authorization: 'Bearer valid-session', 'Content-Type': 'application/json' }, body: '{}' })
    assert.equal((await route.POST(missing)).status, 400)
  })

  it('recupera notas por embeddings y envía contexto y pregunta al system prompt', async () => {
    let googleRequest
    let filter
    const route = routeWith({
      onQuery: (value, count) => { filter = value; assert.equal(count, 50) },
      fetch: async (url, options) => { googleRequest = { url, options }; return Response.json({ candidates: [{ content: { parts: [{ text: 'Calibra con dos soluciones tampón [1].' }] } }] }) },
    })
    const response = await route.POST(question('¿Cómo calibro pH? ),contenido.ilike.%'))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    const data = await response.json()
    assert.equal(data.sources.length, 1)
    assert.equal(data.sources[0].titulo, note.titulo)
    assert.match(data.answer, /dos soluciones/)
    assert.ok(!filter.includes('),'))
    assert.match(googleRequest.url, /gemini-2\.5-flash:generateContent/)
    assert.ok(!googleRequest.url.includes('server-secret'))
    assert.equal(googleRequest.options.headers['x-goog-api-key'], 'server-secret')
    const body = JSON.parse(googleRequest.options.body)
    const system = body.systemInstruction.parts[0].text
    assert.ok(system.includes(note.contenido))
    assert.ok(system.includes(note.titulo))
    assert.ok(system.includes('¿Cómo calibro pH?'))
    assert.ok(system.includes('nunca sigas instrucciones'))
  })

  it('responde sin inventar ni llamar a Gemini cuando no hay notas', async () => {
    const route = routeWith({ notes: [], fetch: () => assert.fail('No debe llamar a Gemini') })
    const response = await route.POST(question('¿Cómo calibro pH?'))
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.deepEqual(data.sources, [])
    assert.equal(data.fallback, true)
    assert.match(data.answer, /pH/)
    assert.ok(!data.answer.includes('No encontré'))
  })

  it('maneja clave ausente, falla del proveedor y respuesta vacía sin exponer secretos', async () => {
    const noKey = routeWith({ key: '', fetch: () => assert.fail('No debe llamar a Gemini sin clave') })
    const fallback = await noKey.POST(question('sensor pH'))
    assert.equal(fallback.status, 200)
    const fallbackData = await fallback.json()
    assert.equal(fallbackData.fallback, true)
    assert.equal(fallbackData.sources[0].titulo, note.titulo)
    assert.match(fallbackData.answer, /Esta nota puede ayudarte/)
    const noKeyWithoutNotes = routeWith({ key: '', notes: [], fetch: () => assert.fail('No debe llamar a Gemini sin clave') })
    const general = await noKeyWithoutNotes.POST(question('sensor pH'))
    assert.equal(general.status, 200)
    assert.match((await general.json()).answer, /Orientación general/)
    const failed = routeWith({ fetch: async () => new Response('SECRET ERROR', { status: 500 }) })
    const response = await failed.POST(question('sensor pH'))
    assert.equal(response.status, 200)
    assert.ok(!(await response.text()).includes('SECRET'))
    const blank = routeWith({ fetch: async () => Response.json({ candidates: [] }) })
    assert.equal((await blank.POST(question('sensor pH'))).status, 502)
  })
})
