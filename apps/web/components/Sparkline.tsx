type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

type Punto = {
  x: number
  y: number
}

function construirPuntos(data: number[], width: number, height: number, pad: number): Punto[] {
  if (data.length === 0) return []

  const min = Math.min(...data)
  const max = Math.max(...data)
  const rango = max - min || 1
  const pasoX = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0

  return data.map((valor, i) => ({
    x: pad + i * pasoX,
    y: height - pad - ((valor - min) / rango) * (height - pad * 2),
  }))
}

export default function Sparkline({
  data,
  width = 320,
  height = 64,
  stroke = '#34d399',
  fill = 'rgba(16, 185, 129, 0.18)',
}: SparklineProps) {
  const pad = 6
  const puntos = construirPuntos(data, width, height, pad)

  if (puntos.length < 2) {
    return (
      <div className="flex h-16 items-center justify-center text-xs text-[#A2C4B8]">
        sin datos suficientes
      </div>
    )
  }

  const linea = puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const primero = puntos[0]
  const ultimo = puntos[puntos.length - 1]
  const area = `M ${primero.x.toFixed(1)},${(height - pad).toFixed(1)} ${puntos
    .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')} L ${ultimo.x.toFixed(1)},${(height - pad).toFixed(1)} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-16 w-full"
      role="img"
      aria-label="Gráfico de tendencia"
    >
      <path d={area} fill={fill} />
      <polyline
        points={linea}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
