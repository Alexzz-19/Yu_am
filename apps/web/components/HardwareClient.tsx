'use client'

import { useState } from 'react'

type FirmwareId = 'arduino' | 'esp32'

type Material = {
  componente: string
  costo: string
  alternativa: string
}

const CODIGO_ARDUINO = String.raw`// ============================================================
// YU'AM — Firmware Arduino (UNO / Nano / Snapino)
// Lee el sensor MQ-135 (A0) y emite tramas JSON por Serial.
// Publica una lectura cada 30 segundos.
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
// Librerías requeridas: WiFi.h, HTTPClient.h, ArduinoJson.h
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
  int lectura = analogRead(PIN_MQ135);                // 0 - 4095
  float co2_ppm = map(lectura, 0, 4095, 300, 2000);  // ppm aproximado

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

const MATERIALES: Material[] = [
  { componente: 'Placa ESP32 (o Arduino)', costo: 'Q 80 – 150', alternativa: 'Clon ESP32 o Arduino UNO/Nano genérico' },
  { componente: 'Sensor MQ-135', costo: 'Q 30 – 60', alternativa: 'Módulo MQ-135 genérico' },
  { componente: 'Contenedor del reactor', costo: 'Q 0', alternativa: 'Botellas plásticas de 2 L recicladas' },
  { componente: 'Mangueras', costo: 'Q 15 – 30', alternativa: 'Manguera de acuario transparente' },
  { componente: 'Bomba de agua', costo: 'Q 25 – 50', alternativa: 'Bomba sumergible de acuario pequeña' },
  { componente: 'Luces LED', costo: 'Q 20 – 40', alternativa: 'Tira LED blanca/roja de bajo consumo' },
  { componente: 'Estante de madera', costo: 'Q 0', alternativa: 'Madera de palet reciclada' },
  { componente: 'Microalgas (Chlorella)', costo: 'Q 10 – 30', alternativa: 'Cepa inicial o donación de laboratorio' },
]

export default function HardwareClient() {
  const [firmware, setFirmware] = useState<FirmwareId>('arduino')
  const [copiado, setCopiado] = useState(false)

  const codigoActual = firmware === 'arduino' ? CODIGO_ARDUINO : CODIGO_ESP32

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
            <strong>Guía de replicabilidad open source:</strong> todo el hardware, firmware y software de
            YU&apos;AM está documentado para que cualquier persona pueda construirlo, mejorarlo y compartirlo.
          </span>
        </p>
      </div>

      {/* Software y backend (Python + uv) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Software y backend recomendado (Python + uv)</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Para los scripts de telemetría y el procesamiento de datos recomendamos{' '}
          <strong>uv</strong>, el gestor de paquetes y proyectos de Python creado por{' '}
          <a
            href="https://astral.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Astral
          </a>
          . Es entre 10 y 100 veces más rápido que <code className="font-mono text-slate-800">pip</code>{' '}
          estándar, crea entornos virtuales sin fricción y es ideal para scripts de sensores y análisis de
          datos en Python.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
{`# Instalar uv (Linux/macOS)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Crear entorno virtual
uv venv

# Instalar dependencias de telemetría
uv pip install requests pyserial

# Ejecutar el script principal
uv run main.py`}
        </pre>
      </section>

      {/* Firmware dual */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Firmware (Arduino IDE)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige el firmware según tu placa y conéctalo al Dashboard YU&apos;AM.
        </p>

        {/* Selector de pestañas (oculto al imprimir) */}
        <div className="mt-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 print:hidden">
          <button type="button" onClick={() => setFirmware('arduino')} className={tabClase(firmware === 'arduino')}>
            Arduino sin Wi-Fi (Serial JSON)
          </button>
          <button type="button" onClick={() => setFirmware('esp32')} className={tabClase(firmware === 'esp32')}>
            ESP32 / Wi-Fi (Telemetría Directa)
          </button>
        </div>

        {/* Código de la pestaña activa (oculto al imprimir) */}
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

        {/* Ambos firmwares (solo al imprimir) */}
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

        {/* Guía rápida del IDE */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Guía rápida — Arduino IDE</h3>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            <li>
              Descarga e instala <strong>Arduino IDE</strong> desde{' '}
              <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500">
                arduino.cc
              </a>{' '}
              (o usa Arduino Web Editor).
            </li>
            <li>
              Para ESP32: agrega en <em>File → Preferences → Additional Boards URLs</em> la URL{' '}
              <code className="font-mono text-xs text-slate-800">https://dl.espressif.com/dl/package_esp32_index.json</code>{' '}
              e instala el paquete <strong>esp32</strong> desde el Board Manager.
            </li>
            <li>
              Conecta la placa por USB y ve a <em>Herramientas → Placa</em>: «Arduino Uno/Nano» o «ESP32 Dev Module».
            </li>
            <li>
              En <em>Herramientas → Puerto</em> selecciona el puerto (COM3 en Windows, <code className="font-mono text-xs text-slate-800">/dev/ttyUSB0</code> en Linux).
            </li>
            <li>Pega el código, pulsa <strong>Compilar (✓)</strong> y luego <strong>Subir (→)</strong>.</li>
          </ol>
        </div>
      </section>

      {/* Materiales reciclados */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Materiales reciclados y bajo costo</h2>
        <p className="mt-1 text-sm text-slate-500">
          Costo estimado por componente y alternativas económicas para reducir el presupuesto.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Componente</th>
                <th className="py-3 pr-4">Costo estimado</th>
                <th className="py-3">Alternativa económica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MATERIALES.map((material) => (
                <tr key={material.componente} className="transition hover:bg-emerald-50/40">
                  <td className="py-3 pr-4 font-medium text-slate-900">{material.componente}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-700">{material.costo}</td>
                  <td className="py-3 text-slate-600">{material.alternativa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <strong>Costo total estimado: Q 180 – 360</strong> reutilizando botellas de 2 L y madera de palet
          (los ítems marcados en «Q 0» no tienen costo monetario).
        </p>
      </section>
    </div>
  )
}
