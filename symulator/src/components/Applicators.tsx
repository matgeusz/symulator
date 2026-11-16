import type { ConsoleSpec, Values } from '../data/consoles'

interface P {
  spec: ConsoleSpec
  values: Values
  running: boolean
}

const skin = (
  <g>
    <rect x="0" y="128" width="300" height="42" fill="#f3c9a8" />
    <rect x="0" y="128" width="300" height="4" fill="#e0a982" />
    <rect x="0" y="150" width="300" height="20" fill="#d98b8b" opacity=".55" />
  </g>
)

export function Applicator({ spec, values: v, running }: P) {
  const cls = running ? 'beam' : ''
  let body: React.ReactNode = null
  switch (spec.id) {
    case 'laser': {
      const ir = v.probe === 'IR'
      const col = v.probe === '' ? '#94a3b8' : ir ? '#7f1d1d' : '#ef4444'
      body = (
        <>
          {skin}
          <g transform="translate(150,0)">
            <rect x="-14" y="8" width="28" height="70" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            <rect x="-9" y="78" width="18" height="30" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            <rect x="-7" y="108" width="14" height="18" rx="2" fill={col} />
            {running && <polygon points="-6,126 6,126 14,160 -14,160" fill={col} opacity=".5" className={cls} />}
            <circle cx="0" cy="128" r="3" fill={running ? '#fff' : col} className={cls} />
          </g>
          <text x="150" y="20" fontSize="11" textAnchor="middle" fill="#475569" transform="translate(70,0)">
            {v.probe === 'IR' ? 'IR 800–950 nm' : v.probe === 'R' ? 'R 500–760 nm' : 'sonda nie wybrana'}
          </text>
        </>
      )
      break
    }
    case 'ultrasound': {
      const water = v.tech === 'woda'
      body = (
        <>
          {water ? (
            <g>
              <rect x="50" y="70" width="200" height="90" rx="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
              <text x="150" y="150" fontSize="11" textAnchor="middle" fill="#075985">
                woda odgazowana
              </text>
            </g>
          ) : (
            skin
          )}
          <g transform="translate(150,0)">
            <rect x="-16" y="6" width="32" height="64" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            <rect x="-22" y={water ? 70 : 76} width="44" height="14" rx="3" fill="#475569" />
            <rect x="-22" y={water ? 84 : 90} width="44" height="6" fill={v.coupling === 'masc' ? '#f59e0b' : '#a5f3fc'} />
            {running &&
              [0, 1, 2].map((i) => (
                <path key={i} d={`M-26,${100 + i * 10} Q0,${112 + i * 10} 26,${100 + i * 10}`} fill="none" stroke="#0ea5e9" strokeWidth="2" opacity=".7" className={cls} />
              ))}
          </g>
          <text x="40" y="22" fontSize="11" fill="#475569">
            {v.mhz ? `${v.mhz} MHz` : 'częstotliwość?'} · {v.tech || 'technika?'}
          </text>
        </>
      )
      break
    }
    case 'magnetotherapy': {
      const r = v.solenoid === 500 ? 62 : v.solenoid === 315 ? 46 : v.solenoid === 200 ? 30 : 40
      body = (
        <>
          <g transform="translate(150,80)">
            <ellipse cx="0" cy="0" rx={r + 22} ry={r + 4} fill="none" stroke="#65a30d" strokeWidth="9" />
            <ellipse cx="0" cy="0" rx={r + 22} ry={r + 4} fill="none" stroke="#bef264" strokeWidth="3" />
            <ellipse cx="0" cy="0" rx={r} ry={r * 0.45} fill="#f1f5f9" opacity=".7" />
            {running &&
              [-1, 0, 1].map((i) => <path key={i} d={`M${i * 12},-${r} L${i * 12},${r}`} stroke="#16a34a" strokeWidth="2" strokeDasharray="5 5" className="flow" />)}
            <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#fbbf24" />
          </g>
          <text x="150" y="160" fontSize="11" textAnchor="middle" fill="#475569">
            {v.solenoid ? `solenoid Ø ${v.solenoid} mm` : 'solenoid nie wybrany'}
          </text>
        </>
      )
      break
    }
    case 'magnetostimulation': {
      const pad = v.appl === 'mata' || v.appl === 'klin'
      body = (
        <>
          <g transform="translate(150,84)">
            {pad ? <rect x="-110" y="-12" width="220" height="48" rx="8" fill="#5eead4" stroke="#0f766e" strokeWidth="3" /> : <ellipse cx="0" cy="10" rx={v.appl === 'pierscien' ? 34 : 56} ry="26" fill="#5eead4" stroke="#0f766e" strokeWidth="3" />}
            {!pad && v.appl === 'pierscien' && <ellipse cx="0" cy="10" rx="14" ry="9" fill="#f1f5f9" />}
            {running && <path d="M-90,8 C-60,-24 -30,40 0,8 S60,-24 90,8" stroke="#0f766e" strokeWidth="3" fill="none" className="flow" />}
          </g>
          <text x="150" y="150" fontSize="11" textAnchor="middle" fill="#475569">
            {v.appl ? String(v.appl) : 'aplikator nie wybrany'} · {v.prog || 'P?'} / {v.m || 'M?'} / I {String(v.i)}
          </text>
        </>
      )
      break
    }
    case 'sollux': {
      const col = v.filter === 'niebieski' ? '#3b82f6' : v.filter === 'czerwony' ? '#dc2626' : '#f59e0b'
      const d = Number(v.dist) || 40
      const y = 20 + Math.min(80, d * 0.6)
      body = (
        <>
          {skin}
          <g transform="translate(150,0)">
            <rect x="-6" y="0" width="12" height="14" fill="#94a3b8" />
            <rect x="-34" y="14" width="68" height="30" rx="10" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            <ellipse cx="0" cy="46" rx="26" ry="6" fill={col} opacity=".85" />
            <polygon points={`-26,46 26,46 ${Math.min(90, 26 + d * 0.5)},128 ${-Math.min(90, 26 + d * 0.5)},128`} fill={col} opacity={running ? 0.4 : 0.2} className={cls} />
            <line x1="60" y1="46" x2="60" y2="128" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="66" y={y + 40} fontSize="11" fill="#334155">
              {d} cm
            </text>
          </g>
        </>
      )
      break
    }
    case 'polarized_light': {
      const d = Number(v.dist) || 20
      const ang = Number(v.angle) || 90
      body = (
        <>
          {skin}
          <g transform={`translate(150,0) rotate(${90 - ang} 0 128)`}>
            <rect x="-26" y="10" width="52" height="30" rx="8" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
            <polygon points={`-18,40 18,40 ${8 + d * 0.5},128 ${-8 - d * 0.5},128`} fill="#818cf8" opacity={running ? 0.45 : 0.22} className={cls} />
          </g>
          <text x="40" y="22" fontSize="11" fill="#475569">
            {d} cm · kąt {v.angle || '?'}°
          </text>
        </>
      )
      break
    }
    case 'cryotherapy': {
      const m = String(v.method)
      const nozzle = ['azot', 'powietrze', 'co2'].includes(m)
      const col = m === 'azot' ? '#e0f2fe' : m === 'co2' ? '#f1f5f9' : '#bae6fd'
      body = (
        <>
          {skin}
          {nozzle ? (
            <g transform="translate(120,0)">
              <rect x="-28" y="4" width="56" height="40" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              <polygon points="-8,44 8,44 40,120 -40,120" fill={col} opacity={running ? 0.85 : 0.35} className={cls} />
              <text x="45" y="90" fontSize="11" fill="#334155">
                {String(v.dist)} cm
              </text>
            </g>
          ) : m === 'woreczek' || m === 'masaz' || m === 'kapiel' ? (
            <g transform="translate(150,70)">
              <rect x="-50" y="-4" width="100" height="56" rx="12" fill="#bfdbfe" stroke="#2563eb" strokeWidth="3" opacity=".85" />
              {[-26, 0, 26].map((x) => (
                <rect key={x} x={x - 9} y="10" width="18" height="18" rx="3" fill="#eff6ff" stroke="#93c5fd" />
              ))}
            </g>
          ) : m === 'komora' ? (
            <g>
              <rect x="80" y="10" width="140" height="130" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
              <text x="150" y="80" fontSize="14" textAnchor="middle" fill="#075985">
                {String(v.temp)}°C
              </text>
            </g>
          ) : (
            <text x="150" y="80" textAnchor="middle" fontSize="12" fill="#64748b">
              wybierz rodzaj zabiegu
            </text>
          )}
        </>
      )
      break
    }
    case 'thermotherapy': {
      const t = Number(v.temp) || 45
      const hot = t >= 55 ? '#fb923c' : t >= 45 ? '#fdba74' : '#fde68a'
      body = (
        <>
          {skin}
          <g transform="translate(150,60)">
            <rect x="-70" y="-6" width="140" height="64" rx="14" fill={hot} stroke="#c2410c" strokeWidth="3" />
            {[-40, -10, 20, 50].map((x, i) => (
              <path key={i} d={`M${x},-14 C${x - 6},-24 ${x + 6},-30 ${x},-40`} stroke="#ea580c" strokeWidth="3" fill="none" opacity={running ? 0.9 : 0.4} className={cls} />
            ))}
            <text x="0" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#7c2d12">
              {v.method === 'termofor' ? 'termofor' : `${t}°C`}
            </text>
          </g>
        </>
      )
      break
    }
  }
  return (
    <svg viewBox="0 0 300 170" className="w-full rounded-lg bg-linear-to-b from-slate-50 to-slate-100">
      {body}
    </svg>
  )
}
