export const CSV_COLUMNS = [
  'Fecha/Hora', 'pH', 'Temperatura (°C)', 'CO₂ (ppm)', 'Biomasa Estimada (g/L)',
] as const

export const BRIDGE_SCRIPTS = {
  python: {
    label: 'Python (uv + PySerial)',
    filename: 'puente.py',
    setup: 'uv venv\nuv pip install pyserial\nuv run puente.py',
    source: String.raw`import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen
import serial

PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")  # Windows: COM3
BAUD = int(os.getenv("BAUD_RATE", "9600"))
API_URL = os.getenv("API_URL")  # Opcional: endpoint propio que acepte este JSON
path = Path("mediciones.csv")
columns = ["Fecha/Hora", "pH", "Temperatura (°C)", "CO₂ (ppm)",
           "Biomasa Estimada (g/L)"]

def number(data, key):
    value = data.get(key)
    return value if type(value) in (int, float) else ""

try:
    with serial.Serial(PORT, BAUD, timeout=1) as port, path.open(
        "a", newline="", encoding="utf-8"
    ) as file:
        writer = csv.writer(file)
        if file.tell() == 0:
            writer.writerow(columns)
            file.flush()
        pending = b""
        while True:
            pending += port.read_until(b"\n")
            if not pending.endswith(b"\n"):
                if len(pending) > 8192:
                    pending = b""  # Descarta tramas incompletas excesivas
                continue
            raw, pending = pending, b""
            try:
                data = json.loads(raw)
            except (ValueError, UnicodeDecodeError):
                continue  # Ignora mensajes de arranque y JSON inválido
            if not isinstance(data, dict):
                continue
            if not any(type(data.get(k)) in (int, float) for k in
                       ("ph", "temperatura", "co2_ppm", "biomasa_g_l")):
                continue
            data["fecha_hora"] = datetime.now(timezone.utc).isoformat()
            writer.writerow([data["fecha_hora"], number(data, "ph"),
                number(data, "temperatura"), number(data, "co2_ppm"),
                number(data, "biomasa_g_l")])
            file.flush()  # Guarda antes de intentar usar la red
            if API_URL:
                request = Request(API_URL, data=json.dumps(data).encode(),
                    headers={"Content-Type": "application/json"}, method="POST")
                try:
                    with urlopen(request, timeout=5) as response:
                        print("HTTP", response.status)
                except (URLError, TimeoutError) as error:
                    print("Sin envío; lectura conservada en CSV:", error, file=sys.stderr)
except KeyboardInterrupt:
    print("Registro detenido; CSV guardado.")
except (serial.SerialException, OSError) as error:
    sys.exit(str(error))`,
  },
  node: {
    label: 'Node.js (SerialPort)',
    filename: 'puente.mjs',
    setup: 'npm install serialport @serialport/parser-readline\nnode puente.mjs',
    source: String.raw`import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { open } from 'node:fs/promises';

const port = new SerialPort({
  path: process.env.SERIAL_PORT || '/dev/ttyUSB0',
  baudRate: Number(process.env.BAUD_RATE || 9600),
  autoOpen: false,
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
port.on('error', error => parser.destroy(error));
port.on('close', () => parser.end());
const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : '';
const file = await open('mediciones.csv', 'a');
process.once('SIGINT', () => { if (port.isOpen) port.close(); });
try {
  if ((await file.stat()).size === 0) {
    await file.write('Fecha/Hora,pH,Temperatura (°C),CO₂ (ppm),Biomasa Estimada (g/L)\r\n');
  }
  await new Promise((resolve, reject) => port.open(error => error ? reject(error) : resolve()));
  // Iteración asíncrona: cada fila termina de escribirse antes de la siguiente.
  for await (const line of parser) {
    let data;
    try { data = JSON.parse(line); } catch { continue; }
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
    const values = [data.ph, data.temperatura, data.co2_ppm, data.biomasa_g_l].map(numeric);
    if (values.every(value => value === '')) continue;
    await file.write([new Date().toISOString(), ...values].join(',') + '\r\n');
  }
} catch (error) {
  console.error('Registro detenido:', error.message);
  process.exitCode = 1;
} finally {
  if (port.isOpen) await new Promise(resolve => port.close(resolve));
  await file.close();
}`,
  },
  bash: {
    label: 'Linux Bash (stty / cat)',
    filename: 'puente.sh',
    setup: 'bash puente.sh',
    source: String.raw`#!/usr/bin/env bash
set -euo pipefail
port="/dev/ttyUSB0"  # También puede ser /dev/ttyACM0
baud=9600            # Debe coincidir con Serial.begin(...)
previous=$(stty -F "$port" -g)
trap 'stty -F "$port" "$previous"' EXIT
stty -F "$port" "$baud" raw -echo cs8 -cstopb -parenb -ixon -ixoff -crtscts clocal cread

# El firmware actual emite JSON: conserva cada trama sin convertirla.
cat "$port" >> mediciones.log
# Ctrl+C para detener. No abras el monitor serie al mismo tiempo.

# SOLO si cambias el firmware para emitir filas CSV de cinco campos
# en el orden de la plantilla (incluyendo Fecha/Hora), sustituye cat por:
# if [[ ! -s mediciones.csv ]]; then
#   printf 'Fecha/Hora,pH,Temperatura (°C),CO₂ (ppm),Biomasa Estimada (g/L)\n' > mediciones.csv
# fi
# cat "$port" >> mediciones.csv`,
  },
} as const

export type BridgeLanguage = keyof typeof BRIDGE_SCRIPTS
