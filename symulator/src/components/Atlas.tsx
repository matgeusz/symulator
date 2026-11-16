import { useMemo, useState } from 'react'
import { ANATOMICAL_LOCATIONS, MODALITIES_DB, type AnatomicalLocation } from '../data/scenarios'
import { MID_LOCATIONS, MODALITY_SHORT, PHASE_LABEL } from '../data/meta'
import { getSideZoom, resolveGeom, type Side } from '../data/anatomy'
import { Legend, ViewOverlay, detailNodeFor, selectOverlay, type OverlayFlags } from './AnatomyMap'
import { MapPanel } from './MapPanel'
import { Card } from './ui'

const GROUP_LABEL: Record<AnatomicalLocation['regionGroup'], string> = {
  głowa_szyja: 'Głowa i szyja',
  kregoslup: 'Kręgosłup',
  konczyna_gorna: 'Kończyna górna',
  konczyna_dolna: 'Kończyna dolna',
}

const ATLAS_US = ['segmentarna', 'odgłowowy', 'odogonowy', 'lokalna']

type Sub = 'okolice' | 'tabele' | 'macierz'

export function Atlas() {
  const [sub, setSub] = useState<Sub>('okolice')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ['okolice', '🦴 Okolice anatomiczne (20)'],
          ['tabele', '📋 Tabele dawek i przeciwwskazań (8 działów)'],
          ['macierz', '⛔ Macierz przeciwwskazań'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sub === k ? 'bg-teal-700 text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </div>
      {sub === 'okolice' && <AtlasRegions />}
      {sub === 'tabele' && <AtlasTables />}
      {sub === 'macierz' && <AtlasMatrix />}
    </div>
  )
}

// ---------------------------------------------------------------------------------- okolice
function AtlasRegions() {
  const q = new URLSearchParams(location.search)
  const [locId, setLocId] = useState(import.meta.env.DEV && ANATOMICAL_LOCATIONS.some((l) => l.id === q.get('loc')) ? q.get('loc')! : ANATOMICAL_LOCATIONS[0].id)
  const [side, setSide] = useState<Side>(import.meta.env.DEV && q.get('side') === 'L' ? 'L' : 'P')
  const [modId, setModId] = useState('ultrasound')
  const [flags, setFlags] = useState<OverlayFlags>({ paths: true, avoid: true, marks: true, targets: false })
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === locId)!
  const geom = useMemo(() => resolveGeom(locId, side), [locId, side])
  const items = useMemo(() => selectOverlay(geom, modId, ATLAS_US), [geom, modId])
  const groups = Object.keys(GROUP_LABEL) as AnatomicalLocation['regionGroup'][]

  return (
    <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,560px)_minmax(0,1fr)]">
      <nav className="max-h-[80vh] space-y-3 overflow-y-auto rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 scroll-thin">
        {groups.map((g) => (
          <div key={g}>
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">{GROUP_LABEL[g]}</div>
            {ANATOMICAL_LOCATIONS.filter((l) => l.regionGroup === g).map((l) => (
              <button key={l.id} onClick={() => setLocId(l.id)} className={`mb-0.5 w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${l.id === locId ? 'bg-teal-700 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                {l.name}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="space-y-3 lg:col-span-1">
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-2 px-3 text-sm shadow-sm ring-1 ring-slate-200">
          {!MID_LOCATIONS.has(locId) && (
            <label className="flex items-center gap-1">
              Strona:
              <select value={side} onChange={(e) => setSide(e.target.value as Side)} className="rounded-md border border-slate-300 px-2 py-1">
                <option value="P">prawa</option>
                <option value="L">lewa</option>
              </select>
            </label>
          )}
          <label className="flex items-center gap-1">
            Technika dla zabiegu:
            <select value={modId} onChange={(e) => setModId(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1">
              {Object.keys(MODALITIES_DB).map((m) => (
                <option key={m} value={m}>
                  {MODALITY_SHORT[m]}
                </option>
              ))}
            </select>
          </label>
          {([
            ['paths', 'Tory'],
            ['avoid', 'Strefy omijania'],
            ['marks', 'Palpacja'],
          ] as const).map(([k, lab]) => (
            <label key={k} className="flex items-center gap-1">
              <input type="checkbox" className="accent-teal-700" checked={!!flags[k]} onChange={() => setFlags((f) => ({ ...f, [k]: !f[k] }))} />
              {lab}
            </label>
          ))}
        </div>
        <MapPanel
          focusKey={locId + side}
          focus={{ view: geom.view, zoom: geom.zoom }}
          altZoom={getSideZoom(locId, side)}
          patientSide={side}
          overlay={(u, view, vb) => <ViewOverlay locId={locId} side={side} view={view} modId={modId} usMethods={ATLAS_US} flags={flags} u={u} vb={vb} />}
          detail={(view) => detailNodeFor(locId, side, view, modId, ATLAS_US, flags)}
          heightClass="h-[min(70vh,800px)]"
        />
      </div>

      <div className="space-y-4 lg:col-span-2 xl:col-span-1">
        <Card title={loc.name}>
          <div className="mb-3 flex flex-wrap gap-2">
            {loc.commonPathologies.map((p) => (
              <div key={p.name} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs ring-1 ring-slate-200">
                <div className="font-semibold text-slate-800">{p.name}</div>
                <div className="text-slate-500">{p.typicalPhases.map((ph) => PHASE_LABEL[ph]).join(' · ')}</div>
              </div>
            ))}
          </div>
          <dl className="space-y-3 text-sm">
            <Info label="Pozycja ułożeniowa" v={loc.patientPosition} />
            <Info label="Palpacja / punkty orientacyjne" v={loc.palpationLandmarks} />
            <Info label="Technika aplikacji" v={loc.applicationTechnique} />
            <div>
              <dt className="font-semibold text-red-700">Strefy omijania</dt>
              <dd>
                <ul className="list-disc pl-5">
                  {loc.zonesToAvoid.map((z) => (
                    <li key={z}>{z}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </Card>
        <Card title="Legenda mapy" className="!p-4">
          <Legend items={items} flags={{ paths: true, avoid: true, marks: true }} />
        </Card>
      </div>
    </div>
  )
}

function Info({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <dt className="font-semibold text-teal-800">{label}</dt>
      <dd className="text-slate-700">{v}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------------- tabele
function AtlasTables() {
  const ids = Object.keys(MODALITIES_DB)
  const [id, setId] = useState(ids[0])
  const m = MODALITIES_DB[id]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ids.map((k, i) => (
          <button key={k} onClick={() => setId(k)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${id === k ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {i + 1}. {MODALITY_SHORT[k]}
          </button>
        ))}
      </div>
      <Card title={m.name} right={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{m.category}</span>}>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Tabela parametrów i dawek</h4>
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-left text-white">
                  <tr>
                    <th className="w-1/4 px-3 py-2">Parametr</th>
                    <th className="px-3 py-2">Wartości / zasady</th>
                  </tr>
                </thead>
                <tbody>
                  {m.parameters.map((p, i) => (
                    <tr key={p.label} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-3 py-2 align-top font-semibold text-slate-800">{p.label}</td>
                      <td className="px-3 py-2 text-slate-700">{p.values}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <List title="Prawa i mechanizmy" items={m.mechanismsAndLaws} tone="indigo" />
          <List title="Metodyka i BHP" items={m.methodology} tone="teal" />
          <List title="Wskazania" items={m.indications} tone="emerald" />
          <List title="Przeciwwskazania" items={m.contraindications} tone="red" />
          {m.specialRules && <List title="Zasady szczególne" items={m.specialRules} tone="amber" />}
        </div>
      </Card>
    </div>
  )
}

const TONE: Record<string, string> = {
  indigo: 'bg-indigo-50 ring-indigo-200 text-indigo-900',
  teal: 'bg-teal-50 ring-teal-200 text-teal-900',
  emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-900',
  red: 'bg-red-50 ring-red-200 text-red-900',
  amber: 'bg-amber-50 ring-amber-200 text-amber-900',
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className={`rounded-xl p-4 ring-1 ${TONE[tone]}`}>
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wider">{title}</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------------- macierz
const MATRIX: { label: string; rx: RegExp }[] = [
  { label: 'Ciąża', rx: /ciąża/i },
  { label: 'Choroba nowotworowa', rx: /nowotwor/i },
  { label: 'Gorączka', rx: /gorączk/i },
  { label: 'Nadczynność tarczycy', rx: /nadczynność tarczycy/i },
  { label: 'Ostry stan zapalny / obrzęk', rx: /ostr\w* stan\w* zapaln|obrzęk/i },
  { label: 'Gruźlica', rx: /gruźlic/i },
  { label: 'Rozrusznik / implanty elektroniczne', rx: /rozrusznik|elektroniczn/i },
  { label: 'Metalowe implanty w polu', rx: /metalowe implanty/i },
  { label: 'Żylaki / zakrzepowe zapalenie żył', rx: /żylak|zakrzepow/i },
  { label: 'Zaburzenia krzepnięcia / krwawienia', rx: /krwawie|krzepnięcia/i },
  { label: 'Niewydolność / choroby krążenia', rx: /niewydolność krążenia|chorob\w* układu krążenia|ciężkie choroby serca|pozawałow|nadciśnieni/i },
  { label: 'Wyniszczenie / wiek starczy', rx: /wyniszczeni|wiek starczy|osłabieni/i },
  { label: 'Leki sterydowe', rx: /steryd/i },
  { label: 'Zespół Raynauda / Sudecka / zimno', rx: /raynauda|sudeck|zimno/i },
  { label: 'Okolica nasad kości u dzieci', rx: /nasad/i },
  { label: 'Przerwanie ciągłości skóry', rx: /przerwanie ciągłości|uszkodzeni\w* skóry/i },
]

function AtlasMatrix() {
  const ids = Object.keys(MODALITIES_DB)
  return (
    <Card title="Macierz przeciwwskazań – szybka ściągawka (wg bazy wiedzy)">
      <p className="mb-3 text-sm text-slate-600">Zestawienie wygenerowane automatycznie z list przeciwwskazań w bazie. Pełne brzmienia znajdziesz w zakładce „Tabele dawek i przeciwwskazań”.</p>
      <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
        <table className="w-full text-center text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Przeciwwskazanie</th>
              {ids.map((k) => (
                <th key={k} className="px-2 py-2 text-xs font-semibold">
                  {MODALITY_SHORT[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row, i) => (
              <tr key={row.label} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                <td className="px-3 py-2 text-left font-medium text-slate-800">{row.label}</td>
                {ids.map((k) => {
                  const hit = MODALITIES_DB[k].contraindications.find((c) => row.rx.test(c))
                  return (
                    <td key={k} className="px-2 py-2" title={hit}>
                      {hit ? <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">✕</span> : <span className="text-slate-300">–</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
