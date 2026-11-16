import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Geom, PathDef, Pt, Side, Zone } from '../data/anatomy'
import { CENTER, polyPath, resolveViewGeom, smoothPath, type View } from '../data/anatomy'

export interface ZoomBox {
  cx: number
  cy: number
  w: number
}

/** Prostokąt widoczny w SVG (viewBox) – do przycinania dymków. */
export interface Vb {
  x: number
  y: number
  w: number
  h: number
}

interface MapProps {
  view: View
  zoom: ZoomBox
  /** widok boczny: obraz przedstawia lewą stronę pacjenta; flip = prawa strona (odbicie poziome) */
  flip?: boolean
  onPick?: (p: Pt) => void
  className?: string
  /** u – skala znaczników zależna od zoomu; vb – aktualnie widoczny prostokąt */
  overlay?: (u: number, vb: Vb) => ReactNode
}

/** Płynne przejście zoomu (kilka klatek) – bez ciężkiego re-rasteru przy każdej klatce. */
function useAnimatedZoom(target: ZoomBox): ZoomBox {
  const [cur, setCur] = useState(target)
  const ref = useRef(target)
  useEffect(() => {
    const from = ref.current
    const t0 = performance.now()
    const dur = 260
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      const z = { cx: from.cx + (target.cx - from.cx) * e, cy: from.cy + (target.cy - from.cy) * e, w: from.w + (target.w - from.w) * e }
      ref.current = z
      setCur(z)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target.cx, target.cy, target.w])
  return cur
}

/**
 * Skala znaczników względem szerokości widoku (viewBox).
 * Im większe zbliżenie (mały w), tym mniejsze pinezki, strzałki i napisy – żeby przy małych stawach
 * (nadgarstek, kostka, twarz) nie zasłaniały mięśni i kości oraz nie nakładały się na siebie.
 */
export function markerScale(w: number): number {
  const k = 0.5 + 0.5 * Math.min(1, Math.max(0, (w - 180) / 640))
  return (w / 400) * k
}

const VIEW_LABEL: Record<View, string> = { front: 'z przodu', back: 'z tyłu', side: 'z boku' }

function BodyImage({ view, flip }: { view: View; flip?: boolean }) {
  if (view === 'side') {
    // obraz 900×1200 wpisany w układ 1000×1400 (skala 1,111; przesunięcie w pionie 33,3)
    return <image href="/svg/side.webp" x={0} y={33.3} width={1000} height={1333.3} preserveAspectRatio="none" transform={flip ? 'translate(1000,0) scale(-1,1)' : undefined} />
  }
  return <image href={`/svg/${view}.svg`} x={0} y={0} width={1000} height={1400} preserveAspectRatio="none" />
}

function Defs() {
  return (
    <defs>
      <marker id="arrow-g" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#15803d" />
      </marker>
      <pattern id="hatch-r" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="rgba(220,38,38,0.22)" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(185,28,28,0.85)" strokeWidth="2.2" />
      </pattern>
    </defs>
  )
}

export function AnatomyMap({ view, zoom, flip, onPick, overlay, className }: MapProps) {
  const z = useAnimatedZoom(zoom)
  const svgRef = useRef<SVGSVGElement>(null)
  const h = z.w * 1.4
  const vbo: Vb = { x: z.cx - z.w / 2, y: z.cy - h / 2, w: z.w, h }
  const vb = `${vbo.x} ${vbo.y} ${vbo.w} ${vbo.h}`
  const u = markerScale(z.w)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPick || !svgRef.current) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const p = pt.matrixTransform(ctm.inverse())
    onPick({ x: p.x, y: p.y })
  }

  return (
    <div className={`relative aspect-[5/7] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-inner ${className ?? ''}`}>
      <svg ref={svgRef} viewBox={vb} className={`h-full w-full ${onPick ? 'cursor-crosshair' : ''}`} onClick={handleClick} role="img" aria-label={`Model anatomiczny – widok ${VIEW_LABEL[view]}`}>
        <Defs />
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#fff" />
        <BodyImage view={view} flip={flip} />
        {import.meta.env.DEV && new URLSearchParams(location.search).get('grid') && <DevGrid cx={z.cx} cy={z.cy} w={z.w} h={h} u={u} />}
        {overlay?.(u, vbo)}
      </svg>
    </div>
  )
}

/** Siatka kalibracyjna (tylko DEV, ?grid=1). */
function DevGrid({ cx, cy, w, h, u }: { cx: number; cy: number; w: number; h: number; u: number }) {
  const step = w > 600 ? 50 : w > 300 ? 20 : 10
  const x0 = Math.floor((cx - w / 2) / step) * step
  const y0 = Math.floor((cy - h / 2) / step) * step
  const xs: number[] = []
  const ys: number[] = []
  for (let x = x0; x <= cx + w / 2; x += step) xs.push(x)
  for (let y = y0; y <= cy + h / 2; y += step) ys.push(y)
  return (
    <g pointerEvents="none" opacity={0.55}>
      {xs.map((x) => (
        <g key={'x' + x}>
          <line x1={x} y1={cy - h / 2} x2={x} y2={cy + h / 2} stroke={x % (step * 5) === 0 ? '#2563eb' : '#93c5fd'} strokeWidth={0.5 * u} />
          {x % (step * 2) === 0 && (
            <text x={x + 1} y={cy - h / 2 + 8 * u} fontSize={7 * u} fill="#1d4ed8">
              {x}
            </text>
          )}
        </g>
      ))}
      {ys.map((y) => (
        <g key={'y' + y}>
          <line x1={cx - w / 2} y1={y} x2={cx + w / 2} y2={y} stroke={y % (step * 5) === 0 ? '#2563eb' : '#93c5fd'} strokeWidth={0.5 * u} />
          {y % (step * 2) === 0 && (
            <text x={cx - w / 2 + 1} y={y - 1} fontSize={7 * u} fill="#1d4ed8">
              {y}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

// ------------------------------------------------------------------------------------ overlay
export interface OverlayItems {
  paths: { def: PathDef; n: number }[]
  avoid: { zone: Zone; n: number }[]
  marks: { id: string; label: string; x: number; y: number; n: number }[]
}

export function selectOverlay(g: Geom, modId: string, usMethods: string[]): OverlayItems {
  const paths = g.paths.filter((p) => (!p.mods || p.mods.includes(modId)) && (!p.usMethod || (modId === 'ultrasound' && usMethods.includes(p.usMethod))))
  return {
    paths: paths.map((def, i) => ({ def, n: i + 1 })),
    avoid: g.avoid.map((zone, i) => ({ zone, n: i + 1 })),
    marks: g.marks.map((m, i) => ({ ...m, n: i + 1 })),
  }
}

export interface OverlayFlags {
  paths?: boolean
  avoid?: boolean
  marks?: boolean
  targets?: boolean
}

const COL = { T: '#15803d', Z: '#b91c1c', P: '#1d4ed8' } as const

/** Pinezka z numerem (T = tor, Z = strefa omijania, P = punkt palpacji). */
function Badge({ x, y, n, color, u, prefix, r = 10 }: { x: number; y: number; n: number; color: string; u: number; prefix: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * u} fill={color} stroke="#fff" strokeWidth={2 * u} />
      <text x={x} y={y + r * 0.42 * u} textAnchor="middle" fontSize={r * 1.2 * u} fontWeight={800} fill="#fff" fontFamily="Inter, sans-serif" pointerEvents="none">
        {prefix}
        {n}
      </text>
    </g>
  )
}

// ---- rozmieszczenie pinezek (bez nakładania, z liniami odniesienia) ----
interface BEntry {
  key: string
  prefix: 'T' | 'Z' | 'P'
  n: number
  label: string
  ax: number
  ay: number
  px: number
  py: number
}

function zoneAnchor(z: Zone): Pt {
  return z.x2 !== undefined && z.y2 !== undefined ? { x: (z.x + z.x2) / 2, y: (z.y + z.y2) / 2 } : { x: z.x, y: z.y }
}

function badgeEntries(g: Geom, items: OverlayItems, flags: OverlayFlags, u: number, view: View, dest: 'inline' | 'bands'): BEntry[] {
  const cx = CENTER[view]
  const out: BEntry[] = []
  if (flags.avoid) {
    for (const { zone, n } of items.avoid) {
      const a = zoneAnchor(zone)
      out.push({ key: `Z${zone.id}`, prefix: 'Z', n, label: zone.label, ax: a.x, ay: a.y, px: a.x, py: a.y - (dest === 'inline' && zone.x2 !== undefined ? 11 * u : 0) })
    }
  }
  if (flags.paths) {
    for (const { def, n } of items.paths) {
      const p0 = def.pts[0]
      out.push({ key: `T${def.id}`, prefix: 'T', n, label: def.label, ax: p0.x, ay: p0.y, px: p0.x, py: p0.y - 13 * u })
      if (def.sym) out.push({ key: `T${def.id}-m`, prefix: 'T', n, label: def.label, ax: 2 * cx - p0.x, ay: p0.y, px: 2 * cx - p0.x, py: p0.y - 13 * u })
    }
  }
  if (flags.marks) {
    for (const m of items.marks) out.push({ key: `P${m.id}`, prefix: 'P', n: m.n, label: m.label, ax: m.x, ay: m.y, px: m.x + 19 * u, py: m.y - 17 * u })
  }
  void g
  return out
}

/** Prosta relaksacja sił: pinezki odpychają się od siebie i od kropek palpacji, ale ciągną ku pozycji preferowanej. */
function layoutBadges(entries: BEntry[], u: number): Map<string, Pt> {
  const r = 10 * u
  const minD = 2.35 * r
  const pos = entries.map((e) => ({ x: e.px, y: e.py }))
  const obstacles = entries.filter((e) => e.prefix === 'P').map((e) => ({ x: e.ax, y: e.ay }))
  for (let it = 0; it < 90; it++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x
        let dy = pos[j].y - pos[i].y
        let d = Math.hypot(dx, dy)
        if (d < minD) {
          if (d < 0.001) {
            const a = (i + 1) * 2.399
            dx = Math.cos(a)
            dy = Math.sin(a)
            d = 1
          }
          const push = (minD - d) / 2
          pos[i].x -= (dx / d) * push
          pos[i].y -= (dy / d) * push
          pos[j].x += (dx / d) * push
          pos[j].y += (dy / d) * push
        }
      }
      for (const o of obstacles) {
        const dx = pos[i].x - o.x
        const dy = pos[i].y - o.y
        const d = Math.hypot(dx, dy) || 0.001
        const need = r + 8.5 * u
        if (d < need) {
          pos[i].x += (dx / d) * (need - d)
          pos[i].y += (dy / d) * (need - d)
        }
      }
      pos[i].x += (entries[i].px - pos[i].x) * 0.05
      pos[i].y += (entries[i].py - pos[i].y) * 0.05
    }
  }
  const m = new Map<string, Pt>()
  entries.forEach((e, i) => m.set(e.key, pos[i]))
  return m
}

function wrapText(s: string, max: number): string[] {
  const words = s.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

interface Hov {
  key: string
  text: string
  x: number
  y: number
  color: string
}

/** Kształty nakładki (bez pinezek): strefy docelowe, strefy omijania, tory, kropki palpacji. */
function OverlayShapes({ g, items, flags, u, view, onHover }: { g: Geom; items: OverlayItems; flags: OverlayFlags; u: number; view: View; onHover?: (key: string | null) => void }) {
  const cx = CENTER[view]
  const mir = (p: Pt): Pt => ({ x: 2 * cx - p.x, y: p.y })
  const hv = (key: string) => (onHover ? { onMouseEnter: () => onHover(key), onMouseLeave: () => onHover(null) } : {})
  return (
    <g>
      {flags.targets &&
        g.targets.map((t, i) =>
          t.r !== undefined ? (
            <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="rgba(34,197,94,0.14)" stroke="#16a34a" strokeWidth={1.6 * u} strokeDasharray={`${5 * u} ${4 * u}`} pointerEvents="none" />
          ) : (
            <ellipse key={i} cx={t.x} cy={t.y} rx={t.rx} ry={t.ry} fill="rgba(34,197,94,0.14)" stroke="#16a34a" strokeWidth={1.6 * u} strokeDasharray={`${5 * u} ${4 * u}`} pointerEvents="none" />
          ),
        )}
      {flags.avoid &&
        items.avoid.map(({ zone: z }) => (
          <g key={z.id} {...hv(`Z${z.id}`)}>
            {z.x2 !== undefined && z.y2 !== undefined ? (
              <>
                <line x1={z.x} y1={z.y} x2={z.x2} y2={z.y2} stroke="#fff" strokeWidth={6.5 * u} strokeLinecap="round" opacity={0.85} />
                <line x1={z.x} y1={z.y} x2={z.x2} y2={z.y2} stroke="#dc2626" strokeWidth={4 * u} strokeLinecap="round" className="pulse" />
              </>
            ) : z.rx !== undefined ? (
              <ellipse cx={z.x} cy={z.y} rx={z.rx} ry={z.ry} fill="url(#hatch-r)" stroke="#dc2626" strokeWidth={2 * u} className="pulse" />
            ) : (
              <circle cx={z.x} cy={z.y} r={z.r} fill="url(#hatch-r)" stroke="#dc2626" strokeWidth={2 * u} className="pulse" />
            )}
          </g>
        ))}
      {flags.paths &&
        items.paths.map(({ def }) => {
          const draw = (pts: Pt[], key: string, hk: string) => {
            const d = def.smooth && pts.length >= 3 ? smoothPath(pts) : polyPath(pts)
            const period = 10.5 * u
            return (
              <g key={key} {...hv(hk)}>
                <path d={d} fill="none" stroke="#fff" strokeWidth={7.5 * u} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
                <path d={d} fill="none" stroke="#16a34a" strokeWidth={4.2 * u} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${6 * u} ${4.5 * u}`} markerEnd="url(#arrow-g)">
                  <animate attributeName="stroke-dashoffset" from="0" to={-period} dur="0.9s" repeatCount="indefinite" />
                </path>
              </g>
            )
          }
          return (
            <g key={def.id}>
              {draw(def.pts, def.id, `T${def.id}`)}
              {def.sym && draw(def.pts.map(mir), def.id + '-m', `T${def.id}-m`)}
            </g>
          )
        })}
      {flags.marks &&
        items.marks.map((m) => (
          <g key={m.id} {...hv(`P${m.id}`)}>
            <circle cx={m.x} cy={m.y} r={15 * u} fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth={2 * u} className="pulse" />
            <circle cx={m.x} cy={m.y} r={8 * u} fill="#facc15" stroke="#1e3a8a" strokeWidth={3 * u} />
            <circle cx={m.x} cy={m.y} r={2.6 * u} fill="#1e3a8a" />
          </g>
        ))}
    </g>
  )
}

export function GeomOverlay({ g, items, flags, u, view, vb }: { g: Geom; items: OverlayItems; flags: OverlayFlags; u: number; view: View; vb?: Vb }) {
  const [hov, setHov] = useState<Hov | null>(null)
  const entries = useMemo(() => badgeEntries(g, items, flags, u, view, 'inline'), [g, items, flags.paths, flags.avoid, flags.marks, u, view])
  const pos = useMemo(() => layoutBadges(entries, u), [entries, u])
  const byKey = useMemo(() => new Map(entries.map((e) => [e.key, e])), [entries])
  const onHover = (key: string | null) => {
    if (!key) return setHov(null)
    const e = byKey.get(key)
    const p = pos.get(key)
    if (e && p) setHov({ key, text: `${e.prefix}${e.n} · ${e.label}`, x: p.x, y: p.y, color: COL[e.prefix] })
  }
  const r = 10 * u

  // dymek: tekst zawijany, przycinany do widocznego obszaru
  const tip = (() => {
    if (!hov) return null
    const fs = 11 * u
    const maxChars = 30
    const lines = wrapText(hov.text, maxChars)
    const w = Math.min(maxChars, Math.max(...lines.map((l) => l.length))) * fs * 0.54 + 10 * u
    const hh = lines.length * fs * 1.25 + 8 * u
    let x = hov.x + r + 3 * u
    let y = hov.y - hh - 2 * u
    if (vb) {
      if (x + w > vb.x + vb.w - 2 * u) x = hov.x - r - 3 * u - w
      if (x < vb.x + 2 * u) x = vb.x + 2 * u
      if (y < vb.y + 2 * u) y = hov.y + r + 3 * u
      if (y + hh > vb.y + vb.h - 2 * u) y = vb.y + vb.h - hh - 2 * u
    }
    return { x, y, w, hh, fs, lines }
  })()

  return (
    <g>
      <OverlayShapes g={g} items={items} flags={flags} u={u} view={view} onHover={onHover} />
      {entries.map((e) => {
        const p = pos.get(e.key)!
        const far = Math.hypot(p.x - e.ax, p.y - e.ay) > r * 1.35
        return (
          <g key={e.key} onMouseEnter={() => onHover(e.key)} onMouseLeave={() => onHover(null)} style={{ cursor: 'help' }}>
            {far && (
              <>
                <line x1={e.ax} y1={e.ay} x2={p.x} y2={p.y} stroke="#fff" strokeWidth={3.4 * u} strokeLinecap="round" opacity={0.9} pointerEvents="none" />
                <line x1={e.ax} y1={e.ay} x2={p.x} y2={p.y} stroke={COL[e.prefix]} strokeWidth={1.4 * u} strokeLinecap="round" pointerEvents="none" />
              </>
            )}
            <Badge x={p.x} y={p.y} n={e.n} color={COL[e.prefix]} u={u} prefix={e.prefix} />
          </g>
        )
      })}
      {tip && hov && (
        <g pointerEvents="none">
          <rect x={tip.x} y={tip.y} width={tip.w} height={tip.hh} rx={3 * u} fill="rgba(15,23,42,0.94)" stroke={hov.color} strokeWidth={1.4 * u} />
          {tip.lines.map((l, i) => (
            <text key={i} x={tip.x + 5 * u} y={tip.y + 4 * u + tip.fs * (1.05 + i * 1.25)} fontSize={tip.fs} fill="#fff" fontFamily="Inter, sans-serif">
              {l}
            </text>
          ))}
        </g>
      )}
    </g>
  )
}

/** Nakładka dla okolicy w danym widoku (przód/tył/bok) – sama wybiera geometrię i elementy dla zabiegu. */
export function ViewOverlay({ locId, side, view, modId, usMethods, flags, u, vb }: { locId: string; side: Side; view: View; modId: string; usMethods: string[]; flags: OverlayFlags; u: number; vb?: Vb }) {
  const g = useMemo(() => resolveViewGeom(locId, side, view), [locId, side, view])
  const items = useMemo(() => (g ? selectOverlay(g, modId, usMethods) : null), [g, modId, usMethods])
  if (!g || !items) return null
  return <GeomOverlay g={g} items={items} flags={flags} u={u} view={view} vb={vb} />
}

export function ClickMarker({ x, y, u, ok }: { x: number; y: number; u: number; ok?: boolean }) {
  const c = ok === undefined ? '#f97316' : ok ? '#16a34a' : '#dc2626'
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={9 * u} fill="none" stroke={c} strokeWidth={2.4 * u} />
      <line x1={x - 14 * u} y1={y} x2={x + 14 * u} y2={y} stroke={c} strokeWidth={2 * u} />
      <line x1={x} y1={y - 14 * u} x2={x} y2={y + 14 * u} stroke={c} strokeWidth={2 * u} />
      <circle cx={x} cy={y} r={2.4 * u} fill={c} />
    </g>
  )
}

// ------------------------------------------------------------------------------------ zbliżenie szczegółowe
/** Okolice drobne, dla których dostępny jest przycisk „Zbliżenie szczegółowe”. */
export const DETAIL_LOCS = new Set(['nerw_twarzowy', 'nerw_trojdzielny', 'nadgarstek_reka_dloniowa', 'nadgarstek_reka_grzbietowa', 'staw_skokowy_kostka', 'staw_skokowy_ostroga'])

function geomBox(g: Geom, cx: number, withSym: boolean): { x0: number; y0: number; x1: number; y1: number } {
  const xs: number[] = []
  const ys: number[] = []
  const add = (x: number, y: number, r = 0) => {
    xs.push(x - r, x + r)
    ys.push(y - r, y + r)
  }
  g.targets.forEach((t) => add(t.x, t.y, t.r ?? Math.max(t.rx ?? 0, t.ry ?? 0)))
  g.paths.forEach((p) =>
    p.pts.forEach((q) => {
      add(q.x, q.y)
      if (withSym && p.sym) add(2 * cx - q.x, q.y)
    }),
  )
  g.avoid.forEach((z) => {
    add(z.x, z.y, z.r ?? Math.max(z.rx ?? 0, z.ry ?? 0))
    if (z.x2 !== undefined && z.y2 !== undefined) add(z.x2, z.y2)
  })
  g.marks.forEach((m) => add(m.x, m.y))
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
}

/**
 * Powiększony fragment (np. nadgarstek, twarz, stopa): obraz przycięty do ramki, a pinezki z numerami
 * stoją w białych polach PO BOKACH – linie odniesienia (leader lines) prowadzą do punktów, więc nic nie zasłania miejsca aplikacji.
 */
export function DetailMap({ locId, side, view, modId, usMethods, flags }: { locId: string; side: Side; view: View; modId: string; usMethods: string[]; flags: OverlayFlags }) {
  const g = useMemo(() => resolveViewGeom(locId, side, view), [locId, side, view])
  const items = useMemo(() => (g ? selectOverlay(g, modId, usMethods) : null), [g, modId, usMethods])
  const flip = view === 'side' && side === 'P'
  if (!g || !items) return null

  const cxAxis = CENTER[view]
  const bb = geomBox(g, cxAxis, true)
  const bw = bb.x1 - bb.x0
  const bh = bb.y1 - bb.y0
  const w = Math.max(bw * 1.9, (bh * 1.9) / 1.2, 150)
  const h = w * 1.2
  const rcx = (bb.x0 + bb.x1) / 2
  const rcy = (bb.y0 + bb.y1) / 2
  const band = w * 0.2
  const left = rcx - w / 2
  const top = rcy - h / 2
  const W = w + 2 * band
  const ud = w / 400 / 1.15 // skala kształtów w zbliżeniu
  const r = w * 0.034
  const fs = r * 1.2

  const entries = badgeEntries(g, items, flags, ud, view, 'bands')
  // podział na lewą i prawą stronę wg położenia kotwicy (po medianie x)
  const sortedX = [...entries].sort((a, b) => a.ax - b.ax)
  const half = Math.ceil(sortedX.length / 2)
  const leftSet = new Set(sortedX.slice(0, half).map((e) => e.key))
  const placed: { e: BEntry; bx: number; by: number; leftSide: boolean }[] = []
  for (const leftSide of [true, false]) {
    const list = entries.filter((e) => leftSet.has(e.key) === leftSide).sort((a, b) => a.ay - b.ay)
    const gap = r * 2.5
    const ys: number[] = []
    list.forEach((e, i) => ys.push(i === 0 ? Math.max(e.ay, top + r * 1.5) : Math.max(e.ay, ys[i - 1] + gap)))
    for (let i = ys.length - 1; i >= 0; i--) {
      const maxY = i === ys.length - 1 ? top + h - r * 1.5 : ys[i + 1] - gap
      ys[i] = Math.min(ys[i], maxY)
    }
    list.forEach((e, i) => placed.push({ e, bx: leftSide ? left - band * 0.5 : left + w + band * 0.5, by: ys[i], leftSide }))
  }

  return (
    <div className="mx-auto w-full max-w-[640px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-inner">
      <svg viewBox={`${left - band} ${top} ${W} ${h}`} className="h-auto w-full" role="img" aria-label="Zbliżenie szczegółowe z liniami odniesienia">
        <Defs />
        <defs>
          <clipPath id="detail-clip">
            <rect x={left} y={top} width={w} height={h} />
          </clipPath>
        </defs>
        <rect x={left - band} y={top} width={W} height={h} fill="#f8fafc" />
        <g clipPath="url(#detail-clip)">
          <rect x={left} y={top} width={w} height={h} fill="#fff" />
          <BodyImage view={view} flip={flip} />
          <OverlayShapes g={g} items={items} flags={flags} u={ud} view={view} />
        </g>
        <rect x={left} y={top} width={w} height={h} fill="none" stroke="#475569" strokeWidth={w * 0.004} />
        {placed.map(({ e, bx, by, leftSide }) => {
          const edgeX = leftSide ? left : left + w
          return (
            <g key={e.key}>
              <polyline points={`${e.ax},${e.ay} ${edgeX},${by} ${bx},${by}`} fill="none" stroke="#fff" strokeWidth={r * 0.28} strokeLinejoin="round" opacity={0.95} />
              <polyline points={`${e.ax},${e.ay} ${edgeX},${by} ${bx},${by}`} fill="none" stroke={COL[e.prefix]} strokeWidth={r * 0.1} strokeLinejoin="round" />
              <circle cx={e.ax} cy={e.ay} r={r * 0.28} fill="#fff" stroke={COL[e.prefix]} strokeWidth={r * 0.1} />
              <g>
                <title>{`${e.prefix}${e.n} · ${e.label}`}</title>
                <circle cx={bx} cy={by} r={r} fill={COL[e.prefix]} stroke="#fff" strokeWidth={r * 0.18} />
                <text x={bx} y={by + fs * 0.35} textAnchor="middle" fontSize={fs} fontWeight={800} fill="#fff" fontFamily="Inter, sans-serif" pointerEvents="none">
                  {e.prefix}
                  {e.n}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Element „zbliżenie szczegółowe” dla okolicy/widoku albo null (okolica nie jest drobna lub brak opisu w tym widoku). */
export function detailNodeFor(locId: string, side: Side, view: View, modId: string, usMethods: string[], flags: OverlayFlags): ReactNode | null {
  if (!DETAIL_LOCS.has(locId) || !resolveViewGeom(locId, side, view)) return null
  return <DetailMap locId={locId} side={side} view={view} modId={modId} usMethods={usMethods} flags={flags} />
}

export function Legend({ items, flags }: { items: OverlayItems; flags: OverlayFlags }) {
  return (
    <div className="space-y-3 text-sm">
      {flags.paths && items.paths.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-2 font-semibold text-green-700">
            <span className="inline-block h-1.5 w-8 rounded bg-green-600" /> Tory ruchu / aplikacji
          </div>
          <ul className="space-y-1">
            {items.paths.map(({ def, n }) => (
              <li key={def.id} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 min-w-6 items-center justify-center rounded-full bg-green-700 px-1 text-[11px] font-bold text-white">T{n}</span>
                <span>{def.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {flags.avoid && items.avoid.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-2 font-semibold text-red-700">
            <span className="inline-block h-3 w-8 rounded border border-red-600 bg-red-200" /> Strefy bezwzględnego omijania
          </div>
          <ul className="space-y-1">
            {items.avoid.map(({ zone, n }) => (
              <li key={zone.id} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 min-w-6 items-center justify-center rounded-full bg-red-700 px-1 text-[11px] font-bold text-white">Z{n}</span>
                <span>{zone.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {flags.marks && items.marks.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-2 font-semibold text-blue-700">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-yellow-400 ring-2 ring-blue-800" /> Punkty orientacyjne palpacji
          </div>
          <ul className="space-y-1">
            {items.marks.map((m) => (
              <li key={m.id} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 min-w-6 items-center justify-center rounded-full bg-blue-700 px-1 text-[11px] font-bold text-white">P{m.n}</span>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
