import { useEffect, useState, type ReactNode } from 'react'
import { AnatomyMap, type Vb, type ZoomBox } from './AnatomyMap'
import { CENTER, ZOOM_PRESETS, type Pt, type Side, type View } from '../data/anatomy'

export interface Focus {
  view: View
  zoom: ZoomBox
}

interface Props {
  /** zmiana tego klucza resetuje widok/zoom do `focus` */
  focusKey: string
  focus: Focus
  /** zbliżenie okolicy w widoku bocznym (jeśli okolica ma opis w profilu) */
  altZoom?: ZoomBox | null
  /** strona pacjenta (decyduje o odbiciu widoku bocznego: grafika przedstawia lewą stronę) */
  patientSide?: Side
  onPick?: (p: Pt, view: View) => void
  overlay: (u: number, view: View, vb: Vb) => ReactNode
  /** zbliżenie szczegółowe dla bieżącego widoku (null = brak przycisku) */
  detail?: (view: View) => ReactNode | null
  /** opcjonalny dodatkowy opis nad mapą */
  caption?: ReactNode
  heightClass?: string
}

const btn = 'rounded-md px-3 py-1.5 text-sm font-medium transition'
const VIEWS: [View, string][] = [
  ['front', 'Przód'],
  ['back', 'Tył'],
  ['side', 'Bok'],
]

export function MapPanel({ focusKey, focus, altZoom, patientSide, onPick, overlay, detail, caption, heightClass }: Props) {
  const [view, setView] = useState<View>(focus.view)
  const [zoom, setZoom] = useState<ZoomBox>(focus.zoom)
  const [preset, setPreset] = useState('all')
  const [pside, setPside] = useState<Side>(patientSide ?? 'P')
  const [detailOn, setDetailOn] = useState(false)
  // widok boczny zawsze zgodny ze stroną pacjenta (wzorzec i obraz muszą się pokrywać)
  const sideOfBody: Side = patientSide ?? pside

  useEffect(() => {
    setView(focus.view)
    setZoom(focus.zoom)
    setPreset('custom')
    setDetailOn(false)
    if (patientSide) setPside(patientSide)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  const applyPreset = (id: string, v: View, s: Side) => {
    const p = ZOOM_PRESETS.find((x) => x.id === id)
    if (!p) return
    const b = p[v]
    const mirror = v === 'side' ? sideOfBody === 'P' : p.paired && s === 'L'
    const cx = mirror ? 2 * CENTER[v] - b.cx : b.cx
    setZoom({ cx, cy: b.cy, w: b.w })
  }

  const changeView = (v: View) => {
    setView(v)
    setDetailOn(false)
    if (preset !== 'custom') applyPreset(preset, v, pside)
    else if (v === focus.view) setZoom(focus.zoom)
    else if (v === 'side' && altZoom) setZoom(altZoom)
    else {
      setZoom({ cx: 500, cy: 700, w: 1000 })
      setPreset('all')
    }
  }

  const detailNode = detail?.(view) ?? null
  const flip = view === 'side' && sideOfBody === 'P'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <div className="flex overflow-hidden rounded-lg ring-1 ring-slate-300">
          {VIEWS.map(([v, label]) => (
            <button key={v} onClick={() => changeView(v)} className={`${btn} ${view === v ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1 text-sm text-slate-600">
          Zbliżenie:
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value)
              setDetailOn(false)
              applyPreset(e.target.value, view, pside)
            }}
          >
            <option value="custom" disabled>
              — okolica zabiegowa —
            </option>
            {ZOOM_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 text-sm text-slate-600" title={patientSide ? 'Widok boczny zawsze pokazuje stronę z karty pacjenta' : undefined}>
          Strona:
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={pside}
            onChange={(e) => {
              const s = e.target.value as Side
              setPside(s)
              if (preset !== 'custom') applyPreset(preset, view, s)
            }}
          >
            <option value="P">prawa pacjenta</option>
            <option value="L">lewa pacjenta</option>
          </select>
        </label>
        <button
          onClick={() => {
            setView(focus.view)
            setZoom(focus.zoom)
            setPreset('custom')
            setDetailOn(false)
          }}
          className={`${btn} bg-teal-50 text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100`}
          title="Przybliż okolicę z karty pacjenta"
        >
          🔍 Okolica pacjenta
        </button>
        <button
          onClick={() => {
            setZoom({ cx: 500, cy: 700, w: 1000 })
            setPreset('all')
            setDetailOn(false)
          }}
          className={`${btn} bg-slate-100 text-slate-700 hover:bg-slate-200`}
        >
          Całe ciało
        </button>
        {detailNode && (
          <button
            onClick={() => setDetailOn((d) => !d)}
            className={`${btn} ring-1 ${detailOn ? 'bg-indigo-600 text-white ring-indigo-700' : 'bg-indigo-50 text-indigo-800 ring-indigo-200 hover:bg-indigo-100'}`}
            title="Powiększony fragment z liniami odniesienia poza obrysem ciała"
          >
            [ Zbliżenie szczegółowe ]
          </button>
        )}
      </div>
      {caption}
      {detailOn && detailNode ? (
        <div className={`flex items-start justify-center overflow-auto ${heightClass ?? 'h-[min(74vh,860px)]'}`}>{detailNode}</div>
      ) : (
        <div className={`flex justify-center ${heightClass ?? 'h-[min(74vh,860px)]'}`}>
          <AnatomyMap view={view} zoom={zoom} flip={flip} onPick={onPick ? (p) => onPick(p, view) : undefined} overlay={(u, vb) => overlay(u, view, vb)} className="h-full max-w-full" />
        </div>
      )}
    </div>
  )
}
