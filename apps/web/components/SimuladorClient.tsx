'use client'

import { useState } from 'react'

type EspecieId = 'chlorella' | 'spirulina' | 'scenedesmus'
type NivelAireacion = 'bajo' | 'medio' | 'alto'

type Especie = {
  id: EspecieId
  nombre: string
  tag: string | null
  tasa: number
}

type Preset = {
  nombre: string
  m2: number
}

type Escenario = {
  id: string
  nombre: string
  volumen: number
  horas: number
  dias: number
}

type Hito = {
  dia: number
  titulo: string
  detalle: string
}

type PuntoProyeccion = {
  dia: number
  biomasa: number
  co2: number
}

const ESPECIES: Especie[] = [
  { id: 'chlorella', nombre: 'Chlorella vulgaris', tag: 'Recomendada YU\'AM', tasa: 1.83 },
  { id: 'spirulina', nombre: 'Spirulina / Arthrospira platensis', tag: null, tasa: 1.8 },
  { id: 'scenedesmus', nombre: 'Scenedesmus obliquus', tag: null, tasa: 1.75 },
]

const PRESETS: Preset[] = [
  { nombre: 'Habitación', m2: 15 },
  { nombre: 'Oficina', m2: 30 },
  { nombre: 'Salón de Clases', m2: 60 },
  { nombre: 'Auditorio', m2: 150 },
]

const AIREACION: Array<{ id: NivelAireacion; etiqueta: string; factor: number }> = [
  { id: 'bajo', etiqueta: 'Bajo', factor: 0.6 },
  { id: 'medio', etiqueta: 'Medio', factor: 1.0 },
  { id: 'alto', etiqueta: 'Alto', factor: 1.3 },
]

const ESCENARIOS: Escenario[] = [
  { id: 'hogar', nombre: '🏠 Modo Hogar', volumen: 10, horas: 12, dias: 30 },
  { id: 'escuela', nombre: '🏫 Modo Escuela', volumen: 30, horas: 16, dias: 30 },
  { id: 'oficina', nombre: '🏢 Modo Oficina', volumen: 60, horas: 24, dias: 30 },
]

const HITOS: Hito[] = [
  { dia: 1, titulo: 'Inoculación inicial', detalle: 'Siembra del cultivo de microalgas en el reactor.' },
  { dia: 7, titulo: 'Control de nutrientes y pH', detalle: 'Ajuste del medio de cultivo y verificación del pH.' },
  {
    dia: 15,
    titulo: 'Revisión de biomasa y posible cosecha parcial',
    detalle: 'Evalúa el crecimiento y aplica el protocolo de cosecha correspondiente a la cepa.',
  },
  {
    dia: 30,
    titulo: 'Mantenimiento de mangueras y purga de biomasa',
    detalle: 'Limpieza del sistema hidráulico y purga completa del reactor.',
  },
]

// g de biomasa por litro por día (productividad base de referencia)
const PRODUCTIVIDAD_BASE = 0.3

function fmtMasa(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${g.toFixed(1)} g`
}

function TarjetaImpacto({
  etiqueta,
  valor,
  unidad,
  color,
}: {
  etiqueta: string
  valor: string
  unidad: string
  color: 'emerald' | 'teal' | 'cyan'
}) {
  const paleta = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    teal: 'border-teal-200 bg-teal-50 text-teal-700',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  }[color]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${paleta}`}>
        {etiqueta}
      </span>
      <p className="mt-3 text-3xl font-bold text-slate-900">
        {valor}
        {unidad && <span className="ml-1 text-sm font-normal text-slate-400">{unidad}</span>}
      </p>
      <p className="mt-1 text-xs text-slate-400">(Aproximado)</p>
    </div>
  )
}

function GraficaProyeccion({ puntos }: { puntos: PuntoProyeccion[] }) {
  const W = 640
  const H = 200
  const PADX = 12
  const PADTOP = 14
  const PADBOTTOM = 30

  if (puntos.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Aumenta los días de proyección para ver la gráfica.
      </div>
    )
  }

  const maxValor = Math.max(...puntos.map((p) => p.co2), ...puntos.map((p) => p.biomasa), 1)

  const coordX = (i: number) => PADX + (i / (puntos.length - 1)) * (W - PADX * 2)
  const coordY = (v: number) => H - PADBOTTOM - (v / maxValor) * (H - PADTOP - PADBOTTOM)

  const biomasaPts = puntos.map((p, i) => `${coordX(i).toFixed(1)},${coordY(p.biomasa).toFixed(1)}`).join(' ')
  const co2Pts = puntos.map((p, i) => `${coordX(i).toFixed(1)},${coordY(p.co2).toFixed(1)}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Proyección de biomasa y CO₂">
        <line x1={PADX} y1={H - PADBOTTOM} x2={W - PADX} y2={H - PADBOTTOM} stroke="#e2e8f0" strokeWidth={1} />
        <polyline points={co2Pts} fill="none" stroke="#06b6d4" strokeWidth={2} strokeLinejoin="round" />
        <polyline points={biomasaPts} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" />
        <text x={PADX} y={H - 10} fontSize="11" fill="#94a3b8">
          Día 1
        </text>
        <text x={W - PADX} y={H - 10} fontSize="11" fill="#94a3b8" textAnchor="end">
          Día {puntos.length}
        </text>
      </svg>
      <div className="mt-2 flex justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded bg-emerald-500" /> Biomasa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded bg-cyan-500" /> CO₂ capturado
        </span>
      </div>
    </div>
  )
}

export default function SimuladorClient() {
  const [especie, setEspecie] = useState<EspecieId>('chlorella')
  const [area, setArea] = useState(30)
  const [volumen, setVolumen] = useState(10)
  const [horas, setHoras] = useState(16)
  const [aireacion, setAireacion] = useState<NivelAireacion>('medio')
  const [dias, setDias] = useState(30)

  const especieSeleccionada = ESPECIES.find((e) => e.id === especie) ?? ESPECIES[0]
  const factorAireacion = AIREACION.find((a) => a.id === aireacion)?.factor ?? 1

  const litrosRecomendados = area
  const modulosNecesarios = Math.ceil(litrosRecomendados / 10)
  const cobertura = Math.min(100, Math.round((volumen / Math.max(litrosRecomendados, 1)) * 100))

  const factorLuz = horas / 16
  const produccionDiaria = volumen * PRODUCTIVIDAD_BASE * factorLuz * factorAireacion
  const biomasa = produccionDiaria * dias
  const co2 = biomasa * especieSeleccionada.tasa

  const puntos: PuntoProyeccion[] = Array.from({ length: dias }, (_, i) => {
    const d = i + 1
    const b = produccionDiaria * d
    return { dia: d, biomasa: b, co2: b * especieSeleccionada.tasa }
  })

  const hitosVisibles = HITOS.filter((h) => h.dia <= dias)

  function aplicarEscenario(escenario: Escenario) {
    setVolumen(escenario.volumen)
    setHoras(escenario.horas)
    setDias(escenario.dias)
  }

  return (
    <div className="mt-8">
      {/* Contenido interactivo (oculto al imprimir) */}
      <div className="print:hidden">
        {/* Presets de escenario */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ESCENARIOS.map((escenario) => (
            <button
              key={escenario.id}
              type="button"
              onClick={() => aplicarEscenario(escenario)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {escenario.nombre}
            </button>
          ))}
        </div>

        {/* Nota científica */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-amber-800">
            <span aria-hidden="true">🧪</span>
            <span>
              <strong>Modelo orientativo:</strong> Proyecciones calculadas con parámetros de referencia.
              Requieren validación experimental en tu prototipo. Los resultados reales dependen de la
              cepa, temperatura, nutrientes e intensidad lumínica.
            </span>
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Columna de controles */}
          <div className="space-y-8">
            {/* Tipo de microalga */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">Tipo de microalga</h2>
              <p className="mt-1 text-xs text-slate-500">Constantes biológicas de fijación de CO₂.</p>
              <div className="mt-4 space-y-3">
                {ESPECIES.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEspecie(e.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      especie === e.id
                        ? 'border-emerald-400 bg-emerald-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{e.nombre}</span>
                      {e.tag && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {e.tag}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">{e.tasa} g CO₂ / g biomasa</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Dimensión del espacio */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">Dimensión del espacio</h2>
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-600">Área a purificar</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={area}
                    onChange={(e) => setArea(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="text-sm text-slate-500">m²</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.nombre}
                    type="button"
                    onClick={() => setArea(preset.m2)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      area === preset.m2
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {preset.nombre} ({preset.m2} m²)
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <p className="flex justify-between text-slate-600">
                  <span>Litros de cultivo recomendados</span>
                  <span className="font-semibold text-slate-900">{litrosRecomendados} L</span>
                </p>
                <p className="flex justify-between text-slate-600">
                  <span>Módulos YU&apos;AM (10 L c/u)</span>
                  <span className="font-semibold text-slate-900">{modulosNecesarios}</span>
                </p>
                <p className="flex justify-between text-slate-600">
                  <span>Cobertura alcanzada</span>
                  <span className="font-semibold text-emerald-700">{cobertura}%</span>
                </p>
              </div>
            </section>

            {/* Controles de operación */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">Controles de operación del reactor</h2>

              <div className="mt-5">
                <label className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Volumen actual del reactor</span>
                  <span className="font-semibold text-slate-900">{volumen} L</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={volumen}
                  onChange={(e) => setVolumen(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-600"
                />
              </div>

              <div className="mt-5">
                <label className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Horas de iluminación LED al día</span>
                  <span className="font-semibold text-slate-900">{horas} h</span>
                </label>
                <input
                  type="range"
                  min={6}
                  max={24}
                  value={horas}
                  onChange={(e) => setHoras(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-600"
                />
              </div>

              <div className="mt-5">
                <label className="text-xs font-medium text-slate-600">Nivel de aireación / Bomba de agua</label>
                <div className="mt-2 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  {AIREACION.map((nivel) => (
                    <button
                      key={nivel.id}
                      type="button"
                      onClick={() => setAireacion(nivel.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        aireacion === nivel.id
                          ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {nivel.etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <label className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Días de proyección</span>
                  <span className="font-semibold text-slate-900">{dias} días</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={365}
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-600"
                />
              </div>
            </section>
          </div>

          {/* Columna de resultados */}
          <div className="self-start space-y-6 lg:sticky lg:top-24">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TarjetaImpacto etiqueta="CO₂ Fijado Estimado" valor={fmtMasa(co2)} unidad="" color="emerald" />
              <TarjetaImpacto etiqueta="Biomasa Viva Estimada" valor={fmtMasa(biomasa)} unidad="" color="teal" />
              <TarjetaImpacto etiqueta="Cobertura de Aire" valor={String(cobertura)} unidad="%" color="cyan" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Proyección de crecimiento</h3>
              <p className="mt-1 text-xs text-slate-500">
                Acumulado de biomasa y CO₂ capturado durante {dias} días.
              </p>
              <div className="mt-4">
                <GraficaProyeccion puntos={puntos} />
              </div>
            </div>

            {/* Agenda biológica */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Agenda biológica</h3>
              <p className="mt-1 text-xs text-slate-500">Hitos de mantenimiento según los días seleccionados.</p>
              <ol className="relative mt-5 ml-3 border-l border-slate-200">
                {hitosVisibles.map((hito) => (
                  <li key={hito.dia} className="relative mb-5 pl-6 last:mb-0">
                    <span className="absolute -left-[7px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Día {hito.dia}
                      </span>
                      <span className="text-sm font-medium text-slate-900">{hito.titulo}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{hito.detalle}</p>
                  </li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              📄 Descargar Reporte de Impacto
            </button>

            <p className="text-center text-xs text-slate-400">
              Simulación con {especieSeleccionada.nombre} · {especieSeleccionada.tasa} g CO₂/g biomasa ·{' '}
              {volumen} L · {horas} h luz · aireación {aireacion}
            </p>
          </div>
        </div>
      </div>

      {/* Reporte imprimible (solo visible al imprimir) */}
      <div id="reporte-impacto" className="hidden print:block">
        <h1 className="text-2xl font-bold text-slate-900">Reporte de Impacto — YU&apos;AM</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generado el {new Date().toLocaleDateString()} · Simulación de fotobiorreactor
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Especie</span>
            <span className="font-medium text-slate-900">{especieSeleccionada.nombre}</span>
          </p>
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Volumen del reactor</span>
            <span className="font-medium text-slate-900">{volumen} L</span>
          </p>
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Horas de luz LED</span>
            <span className="font-medium text-slate-900">{horas} h/día</span>
          </p>
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Días de proyección</span>
            <span className="font-medium text-slate-900">{dias} días</span>
          </p>
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Aireación</span>
            <span className="font-medium text-slate-900">{aireacion}</span>
          </p>
          <p className="flex justify-between border-b border-slate-200 py-1.5">
            <span className="text-slate-500">Área objetivo</span>
            <span className="font-medium text-slate-900">{area} m²</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">CO₂ Fijado Estimado</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{fmtMasa(co2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Biomasa Viva Estimada</p>
            <p className="mt-1 text-xl font-bold text-teal-700">{fmtMasa(biomasa)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Cobertura de Aire</p>
            <p className="mt-1 text-xl font-bold text-cyan-700">{cobertura}%</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900">Agenda biológica</h2>
          <ul className="mt-3 space-y-2">
            {hitosVisibles.map((hito) => (
              <li key={hito.dia} className="flex gap-3 text-sm">
                <span className="font-medium text-emerald-700">Día {hito.dia}</span>
                <span className="text-slate-700">{hito.titulo}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Nota científica: proyecciones e índices de captura aproximados, calculados bajo condiciones
          controladas de laboratorio. Los valores reales pueden variar.
        </p>
      </div>
    </div>
  )
}
