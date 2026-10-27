import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function modules(window = undefined) {
  const cache = new Map()
  function load(filename) {
    const file = ['.ts', '.tsx', ''].map(extension => path.join(root, filename + extension)).find(existsSync)
    if (!file) throw new Error('Módulo ausente: ' + filename)
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
    vm.runInNewContext(source, { exports, window, Event, URL, process: { env: { NEXT_PUBLIC_GA_ID: 'G-TEST' } }, require: name => {
      if (name.startsWith('@/')) return load(name.slice(2))
      if (name.startsWith('.')) return load(path.relative(root, path.join(path.dirname(file), name)))
      return require(name)
    } }, { filename: file })
    return exports
  }
  return load
}

function browser(blocked = false) {
  const values = new Map()
  const window = new EventTarget()
  window.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (blocked) throw new Error('blocked'); values.set(key, value) },
    removeItem: key => { if (blocked) throw new Error('blocked'); values.delete(key) },
  }
  return { window, values }
}

describe('SEO de producción', () => {
  it('genera canonicals y títulos únicos; distingue las páginas autenticadas', () => {
    const seo = modules()('lib/seo')
    assert.equal(seo.SITE_URL, 'https://yuam.tech')
    assert.equal(seo.TITLE_TEMPLATE, "%s | YU'AM - Fotobiorreactores & CleanTech Guatemala")
    const map = seo.pageMetadata("Mapa Interactivo de Fotobiorreactores | YU'AM", 'Descripción del mapa', '/mapa', { absolute: true })
    assert.equal(map.title.absolute, "Mapa Interactivo de Fotobiorreactores | YU'AM")
    assert.equal(map.alternates.canonical, '/mapa')
    assert.equal(map.openGraph.url, '/mapa')
    assert.equal(map.robots.index, true)
    const dashboard = seo.pageMetadata('Dashboard', 'Datos privados', '/dashboard', { index: false })
    assert.equal(dashboard.robots.index, false)
  })

  it('publica únicamente URLs canónicas públicas en el sitemap y permite su rastreo', () => {
    const sitemap = modules()('app/sitemap').default()
    const urls = [...sitemap].map(entry => entry.url)
    assert.equal(new Set(urls).size, urls.length)
    for (const route of ['/', '/mapa', '/hub', '/yum', '/hardware', '/nosotros', '/privacidad', '/terminos']) assert.ok(urls.includes('https://yuam.tech' + route))
    for (const route of ['/dashboard', '/perfil', '/login', '/about']) assert.ok(!urls.includes('https://yuam.tech' + route))
    const robots = readFileSync(path.join(root, 'app/robots.txt'), 'utf8')
    assert.match(robots, /User-agent: \*/)
    assert.match(robots, /Allow: \/\n/)
    assert.match(robots, /Sitemap: https:\/\/yuam\.tech\/sitemap\.xml/)
  })

  it('incluye Organization y SoftwareApplication y serializa JSON-LD sin cerrar el script', () => {
    const { STRUCTURED_DATA, serializeJsonLd } = modules()('lib/seo')
    assert.ok(STRUCTURED_DATA['@graph'].some(entry => entry['@type'] === 'Organization'))
    assert.ok(STRUCTURED_DATA['@graph'].some(entry => entry['@type'] === 'SoftwareApplication'))
    assert.ok(!JSON.stringify(STRUCTURED_DATA).includes('aggregateRating'))
    const payload = { text: '</script><script>alert(1)</script>' }
    const serialized = serializeJsonLd(payload)
    assert.ok(!serialized.includes('<'))
    assert.equal(JSON.parse(serialized).text, payload.text)
  })
})

describe('consentimiento de analítica', () => {
  it('parte sin consentimiento, persiste la elección y desactiva GA al retirarla', () => {
    const { window, values } = browser()
    const store = modules(window)('lib/cookie-consent')
    assert.equal(store.getCookieConsent(), null)
    let changes = 0
    const unsubscribe = store.subscribeCookieConsent(() => { changes += 1 })
    store.setCookieConsent('all')
    assert.equal(values.get('yuam_cookie_consent'), 'all')
    assert.equal(window['ga-disable-G-TEST'], false)
    store.setCookieConsent(null)
    assert.equal(store.getCookieConsent(), null)
    assert.equal(window['ga-disable-G-TEST'], true)
    assert.equal(changes, 2)
    unsubscribe()
    store.setCookieConsent('essential')
    assert.equal(changes, 2)
  })

  it('recuerda una elección durante la sesión aunque localStorage rechace escrituras', () => {
    const { window } = browser(true)
    const store = modules(window)('lib/cookie-consent')
    store.setCookieConsent('all')
    assert.equal(store.getCookieConsent(), 'all')
    store.setCookieConsent('essential')
    assert.equal(store.getCookieConsent(), 'essential')
    assert.equal(window['ga-disable-G-TEST'], true)
    store.setCookieConsent(null)
    assert.equal(store.getCookieConsent(), null)
  })

  it('sincroniza cambios entre pestañas y no renderiza scripts GA desde el servidor', () => {
    const { window, values } = browser()
    const load = modules(window)
    const store = load('lib/cookie-consent')
    store.setCookieConsent('all')
    const unsubscribe = store.subscribeCookieConsent(() => {})
    values.set('yuam_cookie_consent', 'essential')
    window.dispatchEvent(new Event('storage'))
    assert.equal(store.getCookieConsent(), 'essential')
    unsubscribe()
    const AnalyticsConsent = load('components/AnalyticsConsent').default
    const html = renderToStaticMarkup(React.createElement(AnalyticsConsent, { gaId: 'G-TEST' }, React.createElement('script', { src: 'https://example.test/analytics.js' })))
    assert.equal(html, '')
  })
})

describe('contenido legal y accesibilidad', () => {
  it('conserva las mismas cláusulas en ambos idiomas y convierte el soporte en mailto', () => {
    const load = modules()
    const { PRIVACY_CONTENT, TERMS_CONTENT } = load('lib/legal-content')
    const Document = load('components/BilingualLegalDocument').default
    for (const [kind, content] of [['privacy', PRIVACY_CONTENT], ['terms', TERMS_CONTENT]]) {
      assert.deepEqual([...content.es].map(section => section.id), [...content.en].map(section => section.id))
      const html = renderToStaticMarkup(React.createElement(Document, { kind, content }))
      assert.match(html, /lang="es"/)
      assert.match(html, /lang="en"/)
      assert.match(html, /href="mailto:Yuam_support@protonmail.com"/)
      const withoutAnchors = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, '')
      assert.ok(!withoutAnchors.includes('Yuam_support@protonmail.com'))
    }
  })

  it('requiere alt en todas las imágenes JSX de las vistas y componentes', () => {
    const files = []
    function visit(directory) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name)
        if (entry.isDirectory()) visit(file)
        else if (file.endsWith('.tsx')) files.push(file)
      }
    }
    visit(path.join(root, 'app')); visit(path.join(root, 'components'))
    let images = 0
    for (const file of files) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      function check(node) {
        if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && ['Image', 'img'].includes(node.tagName.getText(source))) {
          images += 1
          assert.ok(node.attributes.properties.some(property => ts.isJsxAttribute(property) && property.name.getText(source) === 'alt'), 'Falta alt: ' + path.relative(root, file))
        }
        ts.forEachChild(node, check)
      }
      check(source)
    }
    assert.ok(images > 10)
  })
})
