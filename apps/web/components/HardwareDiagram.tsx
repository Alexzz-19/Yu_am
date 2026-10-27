export type HardwareDiagramKind = 'jumper' | 'breadboard' | 'tube' | 'air-stone' | 'gas-sensor' | 'pump'

export default function HardwareDiagram({ kind, label }: { kind: HardwareDiagramKind; label: string }) {
  return <svg role="img" aria-label={`Esquema ilustrativo: ${label}`} viewBox="0 0 320 160" className="h-40 w-full bg-emerald-50/40" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'jumper' && <>{[0, 1, 2].map(index => <g key={index} transform={`translate(0 ${index * 24})`}><path d="M65 43h40c55 0 50 42 105 42h45" /><rect x="45" y="35" width="20" height="16" rx="3" fill="white" /><path d="M35 43h10M255 85h20" /></g>)}</>}
    {kind === 'breadboard' && <><rect x="65" y="25" width="190" height="110" rx="10" fill="white" /><path d="M78 80h164M78 37h164M78 123h164" stroke="#94a3b8" />{Array.from({ length: 10 }, (_, column) => [55, 67, 93, 105].map(row => <circle key={`${column}-${row}`} cx={85 + column * 17} cy={row} r="2" fill="#64748b" stroke="none" />))}</>}
    {kind === 'tube' && <><path d="M60 120V73a35 35 0 0 1 70 0v20a35 35 0 0 0 70 0V40h60" strokeWidth="15" stroke="#a7f3d0" /><path d="M60 120V73a35 35 0 0 1 70 0v20a35 35 0 0 0 70 0V40h60" strokeWidth="4" /><circle cx="60" cy="125" r="9" fill="white" /><path d="M255 31v18" /></>}
    {kind === 'air-stone' && <><path d="M160 18v64" /><ellipse cx="160" cy="110" rx="52" ry="22" fill="#d1fae5" /><path d="M108 105v12c0 28 104 28 104 0v-12" /><circle cx="117" cy="61" r="8" stroke="#0284c7" /><circle cx="204" cy="43" r="6" stroke="#0284c7" /><circle cx="215" cy="76" r="4" stroke="#0284c7" /><path d="M128 110h2m17 6h2m18-11h2m17 8h2" /></>}
    {kind === 'gas-sensor' && <><rect x="93" y="40" width="134" height="82" rx="8" fill="#d1fae5" /><circle cx="151" cy="81" r="27" fill="white" /><path d="M135 63v36m11-42v48m11-48v48m11-43v38M128 73h46m-49 12h52m-43 12h36" stroke="#94a3b8" strokeWidth="1.5" /><path d="M192 60h18v42h-18zM115 122v15m24-15v15m24-15v15m24-15v15" /></>}
    {kind === 'pump' && <><rect x="105" y="55" width="105" height="76" rx="15" fill="white" /><circle cx="153" cy="92" r="21" fill="#d1fae5" /><path d="M210 75h35V35h22M105 109H75V88M151 55V31h-30" /><path d="M144 80c22 0 22 24 0 24m9-24v24" stroke="#0284c7" /></>}
  </svg>
}
