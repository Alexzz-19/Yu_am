'use client'

import { useState } from 'react'

type FirmwareId = 'arduino' | 'esp32'
type TipoAlga = 'chlorella' | 'spirulina' | 'scenedesmus'
type Categoria = 'obligatorio' | 'opcional' | 'biologico'
type DivisaId = 'GTQ' | 'USD' | 'EUR' | 'MXN' | 'COP'

type Alga = {
  id: TipoAlga
  emoji: string
  nombre: string
  tag: string
  resumen: string
  cuidados: {
    temperatura: string
    ph: string
    limpieza: string
    cosecha: string
  }
}

type Componente = {
  id: string
  nombre: string
  categoria: Categoria
  costoGTQ: number
  alternativa?: string
  algas: TipoAlga[]
}

type Divisa = {
  id: DivisaId
  simbolo: string
  nombre: string
  gtqPorUnidad: number
  decimales: number
}

type ItemCableado = {
  icono: string
  nombre: string
  detalle: string
  refUnsplash: string
  refPexels: string
}

type Pieza3D = {
  nombre: string
  detalle: string
}

const ALGAS: Alga[] = [
  {
    id: 'chlorella',
    emoji: '🟢',
    nombre: 'Chlorella vulgaris',
    tag: 'Recomendado YU\'AM — Robusta & Fácil',
    resumen: 'Hardware básico: ESP32/Arduino, MQ-135, bomba 5V y botellas de 2L.',
    cuidados: {
      temperatura: '20 – 30 °C',
      ph: '6.5 – 7.5',
      limpieza: 'Limpieza de mangueras cada 30 días.',
      cosecha: 'Cosecha parcial cada 7 – 10 días.',
    },
  },
  {
    id: 'spirulina',
    emoji: '🔵',
    nombre: 'Spirulina / Arthrospira',
    tag: 'Delicada & Nutritiva',
    resumen:
      'Hardware intermedio: sensor de pH (8.5–10.5), DS18B20, piedra difusora y bicarbonato/buffer.',
    cuidados: {
      temperatura: '30 – 37 °C',
      ph: '8.5 – 10.5',
      limpieza: 'Limpieza de mangueras cada 15 días.',
      cosecha: 'Cosecha parcial cada 5 – 7 días.',
    },
  },
  {
    id: 'scenedesmus',
    emoji: '🟣',
    nombre: 'Scenedesmus obliquus',
    tag: 'Investigación & Biomasa',
    resumen: 'Hardware avanzado: sensor de turbidez LDR/LED y tiras LED PWM regulables.',
    cuidados: {
      temperatura: '20 – 28 °C',
      ph: '6.0 – 8.0',
      limpieza: 'Limpieza de mangueras cada 30 días.',
      cosecha: 'Cosecha parcial cada 10 – 15 días.',
    },
  },
]

const COMPONENTES: Componente[] = [
  { id: 'micro', nombre: 'Microcontrolador (ESP32 / Arduino)', categoria: 'obligatorio', costoGTQ: 100, alternativa: 'Clon ESP32 o Arduino UNO/Nano genérico', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'mq135', nombre: 'Sensor MQ-135', categoria: 'obligatorio', costoGTQ: 45, alternativa: 'Módulo MQ-135 genérico', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'botella', nombre: 'Botella de 2L reciclada', categoria: 'obligatorio', costoGTQ: 0, alternativa: 'Recipiente de PET reutilizado', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'fuente', nombre: 'Fuente de poder 5V', categoria: 'obligatorio', costoGTQ: 40, alternativa: 'Cargador USB + regulador', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'bomba', nombre: 'Bomba de agua 5V', categoria: 'obligatorio', costoGTQ: 35, alternativa: 'Bomba de acuario sumergible', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'protoboard', nombre: 'Protoboard + cables jumper', categoria: 'obligatorio', costoGTQ: 30, alternativa: 'Kit de jumpers genérico', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'manguera', nombre: 'Manguera de silicona 1/4"', categoria: 'obligatorio', costoGTQ: 20, alternativa: 'Manguera de acuario transparente', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'cepa', nombre: 'Cepa de alga', categoria: 'biologico', costoGTQ: 20, alternativa: 'Donación de laboratorio', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'agua', nombre: 'Agua purificada', categoria: 'biologico', costoGTQ: 5, alternativa: 'Agua de pecera reposada', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'nutrientes', nombre: 'Nutrientes (NPK / bicarbonato)', categoria: 'biologico', costoGTQ: 15, alternativa: 'Fertilizante NPK diluido', algas: ['chlorella', 'spirulina', 'scenedesmus'] },
  { id: 'ph', nombre: 'Sensor de pH analógico', categoria: 'opcional', costoGTQ: 90, alternativa: 'Kit pH meter económico', algas: ['spirulina'] },
  { id: 'ds18b20', nombre: 'Sensor de temperatura DS18B20', categoria: 'opcional', costoGTQ: 25, alternativa: 'Termistor NTC 10k', algas: ['spirulina'] },
  { id: 'difusora', nombre: 'Piedra difusora de pecera', categoria: 'opcional', costoGTQ: 15, alternativa: 'Difusor de acuario', algas: ['spirulina'] },
  { id: 'turbidez', nombre: 'Sensor de turbidez (LDR + LED)', categoria: 'opcional', costoGTQ: 20, alternativa: 'LDR + LED DIY', algas: ['scenedesmus'] },
  { id: 'pwm', nombre: 'Tira LED PWM regulable', categoria: 'opcional', costoGTQ: 50, alternativa: 'Tira LED con driver PWM', algas: ['scenedesmus'] },
]

const DIVISAS: Divisa[] = [
  { id: 'GTQ', simbolo: 'Q', nombre: 'Quetzal (GTQ)', gtqPorUnidad: 1, decimales: 0 },
  { id: 'USD', simbolo: '$', nombre: 'Dólar (USD)', gtqPorUnidad: 7.8, decimales: 2 },
  { id: 'EUR', simbolo: '€', nombre: 'Euro (EUR)', gtqPorUnidad: 8.5, decimales: 2 },
  { id: 'MXN', simbolo: '$', nombre: 'Peso (MXN)', gtqPorUnidad: 0.44, decimales: 2 },
  { id: 'COP', simbolo: '$', nombre: 'Peso (COP)', gtqPorUnidad: 0.0018, decimales: 0 },
]

const CABLEADO: ItemCableado[] = [
  {
    icono: '🔌',
    nombre: 'Cables Jumper',
    detalle: 'Macho-Macho, Macho-Hembra y Hembra-Hembra para conectar sensores a la protoboard.',
    refUnsplash: 'https://unsplash.com/s/photos/jumper-wires',
    refPexels: 'https://www.pexels.com/search/jumper%20cables/',
  },
  {
    icono: '🧩',
    nombre: 'Protoboard / Placa de pruebas',
    detalle: 'Base sin soldadura para montar y validar el circuito antes de fijarlo.',
    refUnsplash: 'https://unsplash.com/s/photos/breadboard-electronics',
    refPexels: 'https://www.pexels.com/search/breadboard/',
  },
  {
    icono: '💧',
    nombre: 'Manguera de silicona 1/4"',
    detalle: 'Conduce agua y CO₂ entre el reactor, la bomba y la piedra difusora.',
    refUnsplash: 'https://unsplash.com/s/photos/aquarium-tubing',
    refPexels: 'https://www.pexels.com/search/aquarium%20tube/',
  },
  {
    icono: '🫧',
    nombre: 'Piedra aireadora de pecera',
    detalle: 'Difunde aire en burbujas finas para oxigenar y agitar el cultivo.',
    refUnsplash: 'https://unsplash.com/s/photos/aquarium-air-stone',
    refPexels: 'https://www.pexels.com/search/aquarium%20air%20stone/',
  },
]

const PIEZAS_3D: Pieza3D[] = [
  { nombre: 'Soporte de botella (2L)', detalle: 'Anillo que sujeta la botella reciclada al estante de madera.' },
  { nombre: 'Abrazaderas de manguera', detalle: 'Fijan las mangueras de 1/4" al borde del reactor.' },
  { nombre: 'Carcasa del sensor MQ-135', detalle: 'Protege el sensor de salpicaduras y facilita su montaje.' },
]

const CODIGO_ARDUINO = String.raw`// ============================================================
// YU'AM — Firmware Arduino (UNO / Nano / Snapino)
// Lee el sensor MQ-135 (A0) y emite tramas JSON por Serial.
// ============================================================

#define PIN_MQ135 A0

void setup() {
  Serial.begin(9600);
  delay(100);
}

void loop() {
  int lectura = analogRead(PIN_MQ135);                // 0 - 1023
  float co2_ppm = map(lectura, 0, 1023, 300, 2000);  // ppm aproximado

  Serial.print(F("{\"co2_ppm\":"));
  Serial.print(co2_ppm);
  Serial.print(F(",\"nodo\":\"yuam-arduino\"}"));
  Serial.println();

  delay(30000);
}`.trim()

const CODIGO_ESP32 = String.raw`// ============================================================
// YU'AM — Firmware ESP32 (Telemetría directa por Wi-Fi)
// Envía tramas JSON al Dashboard YU'AM vía HTTP.
// Librerías: WiFi.h, HTTPClient.h, ArduinoJson.h
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASS = "TU_CONTRASENA";
const char* ENDPOINT  = "https://TU_PROYECTO.supabase.co/rest/v1/telemetria_mq135";
const char* API_KEY   = "TU_SUPABASE_ANON_KEY";

#define PIN_MQ135 34

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado");
}

void loop() {
  int lectura = analogRead(PIN_MQ135);
  float co2_ppm = map(lectura, 0, 4095, 300, 2000);

  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<256> doc;
    doc["ppm_co2"] = co2_ppm;
    doc["calidad_aire"] = 90.0;
    doc["temperatura"] = 26.5;
    doc["humedad"] = 78.0;

    String payload;
    serializeJson(doc, payload);

    HTTPClient http;
    http.begin(ENDPOINT);
    http.addHeader("apikey", API_KEY);
    http.addHeader("Authorization", String("Bearer ") + API_KEY);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    Serial.printf("HTTP %d\n", code);
    http.end();
  }

  delay(30000);
}`.trim()

function seleccionInicial(): Record<string, boolean> {
  const ini: Record<string, boolean> = {}
  COMPONENTES.filter((c) => c.algas.includes('chlorella')).forEach((c) => {
    ini[c.id] = true
  })
  return ini
}

function BadgeCategoria({ categoria }: { categoria: Categoria }) {
  const estilos = {
    obligatorio: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    opcional: 'border-blue-200 bg-blue-50 text-blue-700',
    biologico: 'border-violet-200 bg-violet-50 text-violet-700',
  }[categoria]
  const etiqueta = {
    obligatorio: 'OBLIGATORIO',
    opcional: 'OPCIONAL / AVANZADO',
    biologico: 'INSUMO BIOLÓGICO',
  }[categoria]
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${estilos}`}>
      {etiqueta}
    </span>
  )
}

export default function HardwareClient() {
  const [alga, setAlga] = useState<TipoAlga>('chlorella')
  const [divisa, setDivisa] = useState<DivisaId>('GTQ')
  const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>(seleccionInicial)
  const [firmware, setFirmware] = useState<FirmwareId>('arduino')
  const [copiado, setCopiado] = useState(false)

  const algaActual = ALGAS.find((a) => a.id === alga) ?? ALGAS[0]
  const divisaActual = DIVISAS.find((d) => d.id === divisa) ?? DIVISAS[0]
  const componentesVisibles = COMPONENTES.filter((c) => c.algas.includes(alga))

  const totalGTQ = componentesVisibles.reduce(
    (suma, c) => (seleccionados[c.id] ? suma + c.costoGTQ : suma),
    0,
  )

  const formatearDivisa = (gtq: number): string => {
    const valor = gtq / divisaActual.gtqPorUnidad
    return `${divisaActual.simbolo} ${valor.toFixed(divisaActual.decimales)}`
  }

  const codigoActual = firmware === 'arduino' ? CODIGO_ARDUINO : CODIGO_ESP32

  function cambiarAlga(id: TipoAlga) {
    setAlga(id)
    const ini: Record<string, boolean> = {}
    COMPONENTES.filter((c) => c.algas.includes(id)).forEach((c) => {
      ini[c.id] = true
    })
    setSeleccionados(ini)
  }

  function toggleComponente(id: string) {
    setSeleccionados((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoActual)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  const tabClase = (activo: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      activo
        ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="mt-8 space-y-10">
      {/* Botón PDF */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          📄 Descargar Manual Completo en PDF
        </button>
      </div>

      {/* Nota open source */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-emerald-800">
          <span aria-hidden="true">🔓</span>
          <span>
            <strong>Manual Maestro de Replicabilidad Biotecnológica Global:</strong> hardware, firmware,
            software y biología documentados para replicar YU&apos;AM en cualquier parte del mundo.
          </span>
        </p>
      </div>

      {/* Preset biológico */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 print:hidden">
        <h2 className="text-lg font-semibold text-slate-900">Preset biológico (configuración por especie)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige la especie y la lista de componentes, sensores y requerimientos se reconfigura sola.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {ALGAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => cambiarAlga(a.id)}
              className={`rounded-xl border p-4 text-left transition ${
                alga === a.id
                  ? 'border-emerald-400 bg-emerald-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="block text-sm font-medium text-slate-900">
                {a.emoji} {a.nombre}
              </span>
              <span className="mt-1 block text-xs text-emerald-700">{a.tag}</span>
              <span className="mt-2 block text-xs text-slate-500">{a.resumen}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Encabezado solo para impresión */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-slate-900">
          Manual Maestro — {algaActual.emoji} {algaActual.nombre}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{algaActual.tag} · {algaActual.resumen}</p>
      </div>

      {/* Software y backend (Python + uv) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Software y backend recomendado (Python + uv)</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Para scripts de telemetría y procesamiento de datos recomendamos{' '}
          <strong>uv</strong> (de{' '}
          <a href="https://astral.sh/" target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:text-emerald-500">
            Astral
          </a>
          ), entre 10 y 100 veces más rápido que <code className="font-mono text-slate-800">pip</code>.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
{`curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv
uv pip install requests pyserial
uv run main.py`}
        </pre>
      </section>

      {/* Firmware dual */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Firmware (Arduino IDE)</h2>

        <div className="mt-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 print:hidden">
          <button type="button" onClick={() => setFirmware('arduino')} className={tabClase(firmware === 'arduino')}>
            Arduino sin Wi-Fi (Serial JSON)
          </button>
          <button type="button" onClick={() => setFirmware('esp32')} className={tabClase(firmware === 'esp32')}>
            ESP32 / Wi-Fi (Telemetría Directa)
          </button>
        </div>

        <div className="mt-4 print:hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">
              {firmware === 'arduino' ? 'firmware_arduino.ino' : 'firmware_esp32.ino'}
            </span>
            <button
              type="button"
              onClick={copiarCodigo}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {copiado ? '✅ Copiado' : '📋 Copiar Código'}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            <code>{codigoActual}</code>
          </pre>
        </div>

        <div className="hidden print:block">
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Arduino sin Wi-Fi (Serial JSON)</h3>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            <code>{CODIGO_ARDUINO}</code>
          </pre>
          <h3 className="mt-6 text-sm font-semibold text-slate-900">ESP32 / Wi-Fi (Telemetría Directa)</h3>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            <code>{CODIGO_ESP32}</code>
          </pre>
        </div>

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Guía rápida — Arduino IDE</h3>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            <li>
              Instala <strong>Arduino IDE</strong> desde{' '}
              <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500">
                arduino.cc
              </a>
              .
            </li>
            <li>
              Para ESP32 agrega en <em>Preferences → Additional Boards URLs</em>:{' '}
              <code className="font-mono text-xs text-slate-800">https://dl.espressif.com/dl/package_esp32_index.json</code>{' '}
              e instala <strong>esp32</strong>.
            </li>
            <li>
              <em>Herramientas → Placa</em>: «Arduino Uno/Nano» o «ESP32 Dev Module».
            </li>
            <li>
              <em>Herramientas → Puerto</em>: COM3 (Windows) o <code className="font-mono text-xs text-slate-800">/dev/ttyUSB0</code> (Linux).
            </li>
            <li>Pega el código, <strong>Compila (✓)</strong> y <strong>Sube (→)</strong>.</li>
          </ol>
        </div>
      </section>

      {/* Componentes y costos multimoneda */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Componentes y costos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Lista para {algaActual.emoji} {algaActual.nombre}. Marca o desmarca componentes para recalcular.
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <label className="text-xs font-medium text-slate-600">Divisa</label>
            <select
              value={divisa}
              onChange={(e) => setDivisa(e.target.value as DivisaId)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              {DIVISAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.simbolo} {d.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Componente</th>
                <th className="py-3 pr-4">Categoría</th>
                <th className="py-3 pr-4">Costo est.</th>
                <th className="py-3 print:hidden">Incluir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {componentesVisibles.map((c) => (
                <tr key={c.id} className="transition hover:bg-emerald-50/40">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-900">{c.nombre}</p>
                    {c.alternativa && <p className="text-xs text-slate-400">Alternativa: {c.alternativa}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <BadgeCategoria categoria={c.categoria} />
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-700">{formatearDivisa(c.costoGTQ)}</td>
                  <td className="py-3 print:hidden">
                    <input
                      type="checkbox"
                      checked={!!seleccionados[c.id]}
                      onChange={() => toggleComponente(c.id)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <strong>Costo total estimado: {formatearDivisa(totalGTQ)}</strong> · aproximado según la divisa
          seleccionada y los componentes marcados.
        </p>
      </section>

      {/* Guía visual de cableado */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Guía visual de cableado y materiales de pecera</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tarjetas de ayuda con enlaces a fotos de referencia (atribución Unsplash / Pexels).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CABLEADO.map((item) => (
            <div key={item.nombre} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icono}</span>
                <span className="font-medium text-slate-900">{item.nombre}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.detalle}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <a href={item.refUnsplash} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:text-emerald-500">
                  📷 Unsplash ↗
                </a>
                <a href={item.refPexels} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:text-emerald-500">
                  📷 Pexels ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cuidados del cultivo */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Cuidados del cultivo — {algaActual.emoji} {algaActual.nombre}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Temperatura ideal</p>
            <p className="mt-1 font-semibold text-slate-900">{algaActual.cuidados.temperatura}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">pH objetivo</p>
            <p className="mt-1 font-semibold text-slate-900">{algaActual.cuidados.ph}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Limpieza de mangueras</p>
            <p className="mt-1 font-semibold text-slate-900">{algaActual.cuidados.limpieza}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Frecuencia de cosecha</p>
            <p className="mt-1 font-semibold text-slate-900">{algaActual.cuidados.cosecha}</p>
          </div>
        </div>
      </section>

      {/* Replicación 3D */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Replicación 3D (STL) opcional</h2>
        <p className="mt-1 text-sm text-slate-500">
          Piezas imprimibles para reforzar el montaje. Busca los modelos en{' '}
          <a href="https://www.printables.com/search/models?q=photobioreactor" target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:text-emerald-500">
            Printables ↗
          </a>
          .
        </p>
        <ul className="mt-4 space-y-3">
          {PIEZAS_3D.map((pieza) => (
            <li key={pieza.nombre} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span aria-hidden="true">🧱</span>
              <div>
                <p className="text-sm font-medium text-slate-900">{pieza.nombre}</p>
                <p className="text-xs text-slate-500">{pieza.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
