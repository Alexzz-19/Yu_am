export type TelemetryInput = { co2_ppm: number | null; ph: number | null; temperatura: number | null }
export type NodeInput = { nombre: string; zona: string; lat: number; lng: number }

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Se requiere un objeto JSON.')
  return value as Record<string, unknown>
}

function numeric(value: unknown, min: number, max: number, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} debe ser un número entre ${min} y ${max}.`)
  }
  return value
}

export function parseTelemetry(value: unknown): TelemetryInput {
  const data = object(value)
  if (Object.keys(data).some(key => !['co2_ppm', 'ph', 'temperatura'].includes(key))) {
    throw new Error('Campos permitidos: co2_ppm, ph y temperatura.')
  }
  const result = {
    co2_ppm: data.co2_ppm == null ? null : numeric(data.co2_ppm, 0, 1000000, 'CO₂'),
    ph: data.ph == null ? null : numeric(data.ph, 0, 14, 'pH'),
    temperatura: data.temperatura == null ? null : numeric(data.temperatura, -55, 125, 'Temperatura'),
  }
  if (Object.values(result).every(item => item === null)) throw new Error('Envía al menos una medición.')
  return result
}

export function parseNode(value: unknown): NodeInput {
  const data = object(value)
  const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : ''
  const zona = typeof data.zona === 'string' ? data.zona.trim() : ''
  if (!nombre || nombre.length > 100) throw new Error('El nombre debe tener entre 1 y 100 caracteres.')
  if (!zona || zona.length > 150) throw new Error('La ubicación debe tener entre 1 y 150 caracteres.')
  return { nombre, zona, lat: Math.round(numeric(data.lat, -90, 90, 'Latitud') * 100) / 100,
    lng: Math.round(numeric(data.lng, -180, 180, 'Longitud') * 100) / 100 }
}

export function bearerToken(header: string | null): string | null {
  return header?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null
}
