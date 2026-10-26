'use client'

import { useState } from 'react'
import { BRIDGE_SCRIPTS, CSV_COLUMNS, type BridgeLanguage } from '@/lib/hardware-bridge'

const codeClass = 'mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 print:whitespace-pre-wrap'
const buttonClass = 'rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function HardwareFieldGuide() {
  const [language, setLanguage] = useState<BridgeLanguage>('python')
  const [connectionGuide, setConnectionGuide] = useState<'python' | 'esp32' | 'arduino'>('python')
  const [copyStatus, setCopyStatus] = useState('')
  const script = BRIDGE_SCRIPTS[language]

  const connectionExamples = {
    python: {
      label: 'Python · Script puente',
      filename: 'puente_yuam.py',
      setup: 'python -m pip install pyserial\n# Linux: SERIAL_PORT=/dev/ttyUSB0 NODE_TOKEN=yua_live_… python puente_yuam.py\n# Windows PowerShell: $env:SERIAL_PORT="COM3"; $env:NODE_TOKEN="yua_live_…"; python puente_yuam.py',
      source: String.raw`import json
import os
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

import serial

ENDPOINT = "https://yuam.tech/api/telemetry"
TOKEN = os.environ["NODE_TOKEN"]
PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
BAUD = int(os.getenv("BAUD_RATE", "115200"))
INTERVAL = 30 * 60  # Un envío cada 30 minutos como máximo
last_success = 0.0

with serial.Serial(PORT, BAUD, timeout=1) as port:
    while True:
        raw = port.readline()
        if not raw:
            continue
        try:
            reading = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
        if not isinstance(reading, dict) or not any(
            isinstance(reading.get(key), (int, float)) and not isinstance(reading.get(key), bool)
            for key in ("co2_ppm", "ph", "temperatura", "lux", "pm25", "humedad")
        ):
            continue
        wait = INTERVAL - (time.monotonic() - last_success)
        if last_success and wait > 0:
            print(f"Lectura serial omitida; faltan {int(wait)} segundos para el siguiente envío")
            continue
        request = Request(ENDPOINT, data=json.dumps(reading).encode("utf-8"), method="POST",
            headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
        try:
            with urlopen(request, timeout=15) as response:
                print("YU'AM HTTP", response.status)
                last_success = time.monotonic()
        except HTTPError as error:
            print("YU'AM HTTP", error.code, error.read().decode("utf-8", errors="replace"))
        except (URLError, TimeoutError) as error:
            print("Envío no confirmado; se conservará la siguiente lectura:", error)`
    },
    esp32: {
      label: 'ESP32 · Arduino IDE por Wi-Fi',
      filename: 'esp32_yuam.ino',
      setup: 'Instala el core ESP32 en Arduino IDE. Edita WIFI_SSID, WIFI_PASSWORD y NODE_TOKEN antes de cargar.',
      source: String.raw`#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASENA";
const char* NODE_TOKEN = "yua_live_TU_TOKEN"; // Clave de este nodo, nunca una clave Supabase
const char* ENDPOINT = "https://yuam.tech/api/telemetry";
constexpr int PIN_MQ135 = 34; // ADC1 en ESP32 clásico
constexpr unsigned long INTERVAL_MS = 30UL * 60UL * 1000UL;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    const int raw = analogRead(PIN_MQ135);
    const float co2Ppm = 300.0f + (1700.0f * raw / 4095.0f); // Aproximación; calibra el MQ-135
    const String body = String("{\"co2_ppm\":") + String(co2Ppm, 1) + "}";
    HTTPClient http;
    if (http.begin(ENDPOINT)) {
      http.addHeader("Authorization", String("Bearer ") + NODE_TOKEN);
      http.addHeader("Content-Type", "application/json");
      const int status = http.POST(body);
      Serial.printf("Telemetría YU'AM: HTTP %d\n", status);
      http.end();
    }
  }
  delay(INTERVAL_MS); // El servidor también rechaza envíos antes de 30 minutos
}`
    },
    arduino: {
      label: 'Arduino Serial + puente Python',
      filename: 'arduino_serial_yuam.ino + puente_serial.py',
      setup: 'Carga el sketch desde Arduino IDE; cierra su monitor serie. Instala pyserial y define NODE_TOKEN y SERIAL_PORT para ejecutar el puente Python.',
      firmware: String.raw`// Sketch Arduino UNO / Nano (9600 baudios)
#define PIN_MQ135 A0
unsigned long lastSample = 0;
const unsigned long INTERVAL_MS = 30UL * 60UL * 1000UL;

void setup() { Serial.begin(9600); }

void loop() {
  if (lastSample != 0 && millis() - lastSample < INTERVAL_MS) { delay(1000); return; }
  lastSample = millis();
  const int raw = analogRead(PIN_MQ135);
  const float co2Ppm = 300.0f + (1700.0f * raw / 1023.0f); // Aproximación; calibra el sensor
  Serial.print(F("{\"co2_ppm\":"));
  Serial.print(co2Ppm, 1);
  Serial.println(F("}")); // El puente envía esta trama al endpoint YU'AM
}`,
      source: String.raw`# puente_serial.py (requiere: python -m pip install pyserial)
import json, os
from urllib.request import Request, urlopen
import serial

token = os.environ["NODE_TOKEN"]
port = serial.Serial(os.getenv("SERIAL_PORT", "/dev/ttyACM0"), 9600, timeout=1)
for line in port:
    try:
        reading = json.loads(line)
        request = Request("https://yuam.tech/api/telemetry", data=json.dumps(reading).encode(),
            headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=15) as response:
            print("YU'AM HTTP", response.status)
    except (ValueError, OSError) as error:
        print("No se pudo procesar/enviar la lectura:", error)
    # El Arduino ya limita la lectura a una cada 30 minutos; el servidor la valida de nuevo.`
    },
  } as const
  const currentConnection = connectionExamples[connectionGuide]

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script.source)
      setCopyStatus('Código copiado.')
    } catch {
      setCopyStatus('No se pudo copiar. Descarga el script o selecciona el código para copiarlo.')
    }
  }

  async function copyConnectionExample() {
    try {
      const code = 'firmware' in currentConnection ? `${currentConnection.firmware}\n\n${currentConnection.source}` : currentConnection.source
      await navigator.clipboard.writeText(code)
      setCopyStatus('Guía de conexión copiada.')
    } catch {
      setCopyStatus('No se pudo copiar. Selecciona el código para copiarlo.')
    }
  }

  return (
    <div className="mt-10 space-y-10">
      <section aria-labelledby="telemetry-guides-title" className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Ingesta segura</p>
        <h2 id="telemetry-guides-title" className="mt-1 text-xl font-bold text-slate-950">Conecta cualquier placa a YU&apos;AM</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">Endpoint: <code className="rounded bg-white px-1.5 py-0.5">https://yuam.tech/api/telemetry</code>. Incluye <code className="rounded bg-white px-1.5 py-0.5">Authorization: Bearer &lt;NODE_TOKEN&gt;</code> y envía como máximo una lectura cada 30 minutos por nodo. La API responde HTTP 429 si el intervalo todavía no se cumple.</p>
        <div role="tablist" aria-label="Guías de conexión por hardware" className="mt-5 flex flex-wrap gap-2">{(Object.keys(connectionExamples) as Array<keyof typeof connectionExamples>).map(id => <button key={id} type="button" role="tab" aria-selected={connectionGuide === id} onClick={() => { setConnectionGuide(id); setCopyStatus('') }} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${connectionGuide === id ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-100'}`}>{connectionExamples[id].label}</button>)}</div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Preparación</p>
        <pre className={codeClass}><code>{currentConnection.setup}</code></pre>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{currentConnection.filename}</p><button type="button" onClick={copyConnectionExample} className={buttonClass}>Copiar guía</button></div>
        {'firmware' in currentConnection && <><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Firmware Arduino IDE</p><pre className={codeClass}><code>{currentConnection.firmware}</code></pre><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Puente Python</p></>}
        <pre role="tabpanel" className={codeClass}><code>{currentConnection.source}</code></pre>
        <p role="status" className="mt-2 text-sm text-slate-600">{copyStatus}</p>
        <p className="mt-3 text-xs leading-5 text-slate-600">Guarda el token como secreto fuera del firmware publicado. La conversión del MQ-135 del ejemplo es orientativa y requiere calibración; se recomienda un entorno de medición ventilado y estable.</p>
      </section>
      <section aria-labelledby="offline-title" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 id="offline-title" className="text-lg font-semibold text-emerald-900">📊 Alternativas de Registro Offline</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-900">
          Registra mediciones sin conexión a internet en un archivo CSV o en una hoja de cálculo
          de formato abierto (.ods). Puedes transcribirlas a mano o capturarlas por USB con un
          script puente. Guarda una copia local por reactor y respáldala al terminar cada sesión.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-emerald-950">
            <caption className="sr-only">Columnas de la plantilla de mediciones offline</caption>
            <thead><tr>{CSV_COLUMNS.map(column => <th key={column} scope="col" className="border-b border-emerald-200 py-3 pr-5 font-medium">{column}</th>)}</tr></thead>
            <tbody><tr>{['ISO 8601 con zona horaria', 'Sin unidad', '°C', 'ppm', 'g/L, tras calibración'].map(value => <td key={value} className="py-3 pr-5">{value}</td>)}</tr></tbody>
          </table>
        </div>
        <button type="button" className={`${buttonClass} mt-4 bg-white print:hidden`} onClick={() => download('\uFEFF' + CSV_COLUMNS.join(',') + '\r\n', 'yuam-mediciones.csv', 'text/csv;charset=utf-8')}>
          Descargar plantilla CSV
        </button>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-900">
          En LibreOffice Calc abre el CSV usando UTF-8 y coma como separador; configura Fecha/Hora
          como texto para conservar la zona horaria. Usa punto decimal y deja vacíos los valores
          no medidos. Para trabajar en ODS, elige Archivo → Guardar como → Hoja de cálculo ODF (.ods).
          Descarga la plantilla y prepara las dependencias antes de desconectarte; después, el
          registro por USB y la edición en Calc funcionan sin internet.
        </p>
      </section>

      <section aria-labelledby="bridge-title" className="rounded-2xl border border-slate-200 p-6">
        <h2 id="bridge-title" className="text-lg font-semibold">Scripts puente multi-lenguaje</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          Cierra el monitor serie de Arduino IDE antes de ejecutar un puente. Ajusta el puerto y
          la velocidad: el firmware Arduino de esta guía usa 9600 baudios. Python y Node.js reciben
          un objeto JSON por línea y agregan la fecha/hora UTC del ordenador. Los campos ausentes
          quedan vacíos; el firmware básico solo transmite CO₂ estimado.
        </p>
        <pre className={codeClass}><code>{'{"ph":7.1,"temperatura":26.5,"co2_ppm":520,"biomasa_g_l":0.8}'}</code></pre>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          La trama anterior ilustra el formato cuando integres todos los sensores. Para usar el
          ESP32 por USB, adapta su firmware para emitir este JSON con Serial.println incluso sin
          Wi-Fi y configura 115200 baudios en el puente. Su firmware actual solo imprime el estado
          HTTP, por lo que no genera filas de mediciones. El mapeo lineal del MQ-135 es ilustrativo:
          requiere calibración y no equivale a una medición selectiva de CO₂.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
          <label htmlFor="bridge-language" className="text-sm font-medium">Lenguaje del script</label>
          <select id="bridge-language" value={language} onChange={event => { setLanguage(event.target.value as BridgeLanguage); setCopyStatus('') }} className="min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600">
            {(Object.keys(BRIDGE_SCRIPTS) as BridgeLanguage[]).map(id => <option key={id} value={id}>{BRIDGE_SCRIPTS[id].label}</option>)}
          </select>
          <button type="button" onClick={copyScript} className={buttonClass}>Copiar código</button>
          <button type="button" onClick={() => download(script.source + '\n', script.filename, 'text/plain;charset=utf-8')} className={buttonClass}>Descargar script</button>
        </div>
        <p role="status" className="mt-2 text-sm text-slate-600 print:hidden">{copyStatus}</p>
        <div className="print:hidden">
          <h3 className="mt-4 text-sm font-semibold">Preparación y ejecución</h3>
          <pre className={codeClass}><code>{script.setup}</code></pre>
          <p className="mt-4 text-sm font-medium">{script.filename}</p>
          <pre className={codeClass}><code>{script.source}</code></pre>
        </div>
        <div className="hidden print:block">
          {Object.values(BRIDGE_SCRIPTS).map(item => <div key={item.filename}><h3 className="mt-5 font-semibold">{item.label} · {item.filename}</h3><pre className={codeClass}><code>{item.setup + '\n\n' + item.source}</code></pre></div>)}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
          Python siempre guarda en CSV y permite un POST opcional mediante la variable API_URL.
          El endpoint debe aceptar el JSON mostrado; adapta autenticación y campos a tu API. Los
          envíos fallidos permanecen en CSV, sin reintento automático. Node.js guarda el mismo CSV
          con escrituras asíncronas. Bash usa herramientas habituales de Linux sin instalar paquetes:
          cat conserva el formato recibido, así que JSON se guarda como .log; solo usa .csv si el
          firmware ya emite filas CSV. Detén el registro con Ctrl+C.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Referencias: <a className="text-emerald-700 underline" href="https://pyserial.readthedocs.io/en/latest/shortintro.html">PySerial</a> y{' '}
          <a className="text-emerald-700 underline" href="https://serialport.io/docs/api-parser-readline/">SerialPort / ReadlineParser</a>.
        </p>
      </section>

      <section aria-labelledby="sensors-title" className="rounded-2xl border border-slate-200 p-6">
        <h2 id="sensors-title" className="text-lg font-semibold">Configuración de sensores adicionales</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          Los pines siguientes corresponden al Arduino UNO y al ESP32 clásico. Reserva A0 / GPIO34
          para el MQ-135 existente; cada señal analógica necesita su propia entrada. Une las masas
          y verifica el pinout de tu placa y módulo antes de conectar.
        </p>
        <div className="mt-5 space-y-6">
          <article className="border-l-4 border-emerald-500 pl-4">
            <h3 className="font-semibold">Sensor de pH · PH-4502C</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Alimenta el módulo según su ficha (habitualmente 5 V), conecta GND a masa y PO
              (salida analógica) a A0 en UNO si está libre; con el MQ-135 usa A1. En ESP32 usa
              GPIO35 (ADC1). DO es una salida de umbral, no una lectura de pH. La señal PO puede
              superar la tensión admisible del ESP32: adapta el nivel con un divisor o buffer y
              verifica el voltaje máximo; nunca conectes una señal de 5 V directamente al ADC.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              No requiere una librería de pH específica. Promedia varias lecturas y calibra con
              dos soluciones tampón que cubran el cultivo (pH 4/7 o 7/10), a temperatura estable.
              Mide V₁ y V₂ con todo el circuito conectado, incluido el divisor. Calcula:
            </p>
            <pre className={codeClass}><code>{`UNO: V = analogRead(A1) * Vref / 1023.0; // Vref medida, normalmente ~5 V
ESP32: V = analogReadMilliVolts(35) / 1000.0; // Configura atenuación según rango
m = (pH2 - pH1) / (V2 - V1); // V1 y V2 deben ser distintos
b = pH1 - m * V1;
pH = m * V + b;`}</code></pre>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Rangos orientativos de los presets: Chlorella vulgaris 6.5–7.5; Spirulina / Arthrospira
              8.5–10.5; Scenedesmus obliquus 6.0–8.0. Ajusta al protocolo de la cepa y recalibra
              periódicamente; una pendiente fija universal no sustituye la calibración.
            </p>
            <a className="mt-2 inline-block text-sm text-emerald-700 underline" href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html">API ADC y rangos según ESP32</a>
          </article>
          <article className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold">Sensor de temperatura · DS18B20</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Usa alimentación de tres hilos: VDD a 5 V en UNO o 3.3 V en ESP32, GND a masa y DQ
              a D2 (UNO) o GPIO4 (ESP32). Conecta una resistencia pull-up de 4.7 kΩ entre DQ y VDD;
              en ESP32 la línea de datos debe subir a 3.3 V. Verifica las conexiones de la sonda,
              ya que los colores pueden variar. Instala OneWire y DallasTemperature desde el
              gestor de librerías del Arduino IDE.
            </p>
            <pre className={codeClass}><code>{`#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_DQ = 2; // ESP32: cambia a 4
OneWire bus(PIN_DQ);
DallasTemperature sensores(&bus);

void setup() {
  Serial.begin(9600);
  sensores.begin();
}

void loop() {
  sensores.requestTemperatures(); // Espera la conversión (hasta 750 ms a 12 bits)
  float temperatura = sensores.getTempCByIndex(0);
  if (temperatura != DEVICE_DISCONNECTED_C) {
    Serial.print("{\\"temperatura\\":");
    Serial.print(temperatura);
    Serial.println("}");
  }
  delay(1000);
}`}</code></pre>
            <p className="mt-2 text-sm text-slate-600">Ejemplo independiente; al integrarlo añade la temperatura a la misma trama JSON del resto de sensores.</p>
            <p className="mt-2 text-sm text-slate-600">
              Referencias: <a className="text-emerald-700 underline" href="https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf">ficha DS18B20</a> y{' '}
              <a className="text-emerald-700 underline" href="https://github.com/milesburton/Arduino-Temperature-Control-Library">DallasTemperature</a>.
            </p>
          </article>
          <article className="border-l-4 border-violet-400 pl-4">
            <h3 className="font-semibold">Turbidez y densidad óptica · TS-300B / LDR</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Para un TS-300B verifica la ficha de su módulo acondicionador, su alimentación y
              su salida analógica; no conectes una sonda sin acondicionador directamente al ADC.
              Conecta AO a A2 (UNO) o GPIO32 (ESP32), con adaptación de nivel si supera el rango
              del ADC. La salida digital de umbral no sirve para estimar densidad de forma continua.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Como alternativa, coloca un LED con resistencia limitadora frente a una LDR, a lados
              opuestos del recipiente. Conecta VCC → LDR → entrada ADC → resistencia de 10 kΩ → GND
              (VCC de 3.3 V para ESP32). Usa una cámara opaca y mantén constantes la distancia,
              el volumen y la luz del LED. Lee con analogRead; no requiere librerías adicionales.
              Un módulo comercial puede usar otra geometría óptica: caracteriza su respuesta por separado.
            </p>
            <pre className={codeClass}><code>{`// Para el montaje de transmisión LED/LDR, tras caracterizar su respuesta:
T = I / I0;                  // Intensidad corregida / blanco del medio sin algas
OD = -log10(T);             // Solo válido con I > 0 e I0 > 0
biomasa_g_l = a * OD + b;   // a y b obtenidos con muestras de masa seca conocida`}</code></pre>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              La tensión de una LDR no es directamente proporcional a la intensidad: caracteriza
              el divisor, corrige la lectura oscura y compara contra el medio sin algas. Prepara
              una curva por especie usando diluciones y masa seca, evita burbujas y diluye si la
              señal se satura. Sin esa calibración registra solo señal relativa, sin asignarle NTU
              ni g/L; deja Biomasa Estimada vacía en el CSV.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
