export default function NetworkIllustration() {
  return <svg role="img" aria-label="Esquema conceptual: sensores y cultivos comparten lecturas mediante YU’AM, sin cifras de usuarios ni datos de ejemplo" viewBox="0 0 600 340" className="h-full w-full bg-white">
    <g fill="none" stroke="#6ee7b7" strokeWidth="3"><path d="M300 170L120 80M300 170L480 80M300 170L120 260M300 170L480 260" /></g>
    <circle cx="300" cy="170" r="52" fill="#ecfdf5" stroke="#059669" strokeWidth="3" />
    <text x="300" y="176" textAnchor="middle" fill="#065f46" fontFamily="sans-serif" fontSize="22" fontWeight="600">YU&apos;AM</text>
    {[{ x: 120, y: 80, text: 'Sensores' }, { x: 480, y: 80, text: 'Cultivos' }, { x: 120, y: 260, text: 'Lecturas' }, { x: 480, y: 260, text: 'Comunidad' }].map(node => <g key={node.text}><circle cx={node.x} cy={node.y} r="22" fill="#059669" /><circle cx={node.x} cy={node.y} r="7" fill="white" /><text x={node.x} y={node.y + 42} textAnchor="middle" fill="#334155" fontFamily="sans-serif" fontSize="17">{node.text}</text></g>)}
  </svg>
}
