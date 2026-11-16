import { useMemo, useState } from 'react'
import { ANATOMICAL_LOCATIONS, MODALITIES_DB } from '../data/scenarios'
import { getSideZoom, hasSideView, resolveGeom } from '../data/anatomy'
import { buildProtocol, QUAL_LABEL, type ExamSession } from '../lib/exam'
import { usExpectedMethods, makeCtx, type Check, type CheckGroup } from '../data/consoles'
import { ClickMarker, Legend, ViewOverlay, detailNodeFor, selectOverlay, type OverlayFlags } from './AnatomyMap'
import { MapPanel } from './MapPanel'
import { Card, btnPrimary } from './ui'
import { MODALITY_SHORT } from '../data/meta'

const GROUPS: CheckGroup[] = ['Kwalifikacja', 'Ułożenie i palpacja', 'Mapa anatomiczna', 'Parametry aparatu', 'BHP i przygotowanie']

const LAW_HINTS: Record<string, string[]> = {
  sollux: ['Grotthusa-Drapera', 'Dastre-Morata'],
  laser: ['Arndta-Schultza', 'Grotthusa-Drapera'],
  thermotherapy: ['Dastre-Morata'],
  ultrasound: ['Grotthusa-Drapera'],
}

export function Stage4Protocol({ session, onNew }: { session: ExamSession; onNew: () => void }) {
  const s = session.scenario
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === s.locationId)!
  const mod = MODALITIES_DB[s.modalityId]
  const ctx = useMemo(() => makeCtx(s), [s])
  const proto = useMemo(() => buildProtocol(session), [session])
  const geom = useMemo(() => resolveGeom(s.locationId, session.side), [s.locationId, session.side])
  const usM = useMemo(() => usExpectedMethods(ctx), [ctx])
  const items = useMemo(() => selectOverlay(geom, s.modalityId, usM), [geom, s.modalityId, usM])
  const [flags, setFlags] = useState<OverlayFlags>({ paths: true, avoid: true, marks: true, targets: false })
  const stopped = session.stoppedCorrectly
  const fatal = !!session.triage && s.isContraindicated && session.triage.choice !== 'odstap'
  const click = session.position?.click ?? null
  const explored = !!session.position

  const lawNames = LAW_HINTS[s.modalityId] ?? []
  const laws = mod.mechanismsAndLaws

  return (
    <div className="space-y-5">
      {/* ===================== WERDYKT ===================== */}
      <section className={`overflow-hidden rounded-2xl shadow-sm ring-1 ${proto.passed ? 'bg-emerald-50 ring-emerald-300' : 'bg-red-50 ring-red-300'}`}>
        <div className="flex flex-wrap items-center gap-5 px-6 py-5">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-lg ${proto.passed ? 'bg-emerald-600' : 'bg-red-600'}`}>{proto.pct}%</div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Protokół egzaminacyjny · {MODALITY_SHORT[s.modalityId]} · {loc.name}</div>
            <div className={`text-3xl font-black ${proto.passed ? 'text-emerald-800' : 'text-red-800'}`}>{proto.passed ? 'EGZAMIN ZALICZONY' : 'EGZAMIN NIEZALICZONY'}</div>
            <div className="text-sm text-slate-700">
              Punkty: <strong>{proto.got}</strong> / {proto.max} · próg zaliczenia 70% i brak błędów krytycznych
            </div>
            {proto.criticals.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-red-700">
                {proto.criticals.map((c) => (
                  <li key={c.id}>Błąd krytyczny: {c.label}</li>
                ))}
              </ul>
            )}
            {stopped && <p className="mt-2 text-sm text-emerald-800">Prawidłowo odstąpiono od zabiegu na etapie kwalifikacji – dalsze etapy nie były wymagane.</p>}
            {fatal && <p className="mt-2 text-sm text-red-800">Pacjent z bezwzględnym przeciwwskazaniem został zakwalifikowany do zabiegu.</p>}
          </div>
          <button className={btnPrimary} onClick={onNew}>
            Losuj kolejnego pacjenta
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        {/* ===================== WIZUALIZACJA ===================== */}
        <div className="space-y-3">
          <Card title="Wizualizacja zabiegu na modelu" className="!p-3">
            <div className="mb-2 flex flex-wrap gap-2 text-sm">
              {([
                ['paths', 'Tory ruchu (zielone)'],
                ['avoid', 'Strefy omijania (czerwone)'],
                ['marks', 'Punkty palpacji (niebieskie)'],
                ['targets', 'Strefa docelowa kliknięcia'],
              ] as const).map(([k, lab]) => (
                <label key={k} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 ring-1 ${flags[k] ? 'bg-teal-50 text-teal-800 ring-teal-300' : 'bg-white text-slate-500 ring-slate-200'}`}>
                  <input type="checkbox" className="accent-teal-700" checked={!!flags[k]} onChange={() => setFlags((f) => ({ ...f, [k]: !f[k] }))} />
                  {lab}
                </label>
              ))}
            </div>
            <MapPanel
              focusKey={s.id + session.side}
              focus={{ view: geom.view, zoom: geom.zoom }}
              altZoom={getSideZoom(s.locationId, session.side)}
              patientSide={session.side}
              detail={(view) => detailNodeFor(s.locationId, session.side, view, s.modalityId, usM, flags)}
              overlay={(u, view, vb) => (
                <>
                  <ViewOverlay locId={s.locationId} side={session.side} view={view} modId={s.modalityId} usMethods={usM} flags={flags} u={u} vb={vb} />
                  {click && click.view === view && <ClickMarker x={click.x} y={click.y} u={u} ok={proto.checks.find((c) => c.id === 'click')?.ok} />}
                </>
              )}
              heightClass="h-[min(66vh,760px)]"
              caption={
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                  Wzorzec jest zaznaczony w widoku <strong>{geom.view === 'front' ? 'z przodu' : 'z tyłu'}</strong>{hasSideView(s.locationId) ? ' (oraz z boku – przycisk [ Bok ])' : ''}, strona {session.side === 'P' ? 'prawa' : 'lewa'} pacjenta. {explored ? 'Marker pokazuje Twoje kliknięcie (zielony = trafione, czerwony = pudło).' : ''}
                </div>
              }
            />
          </Card>
          <Card title="Legenda i opis wzorca" className="!p-4">
            <Legend items={items} flags={{ paths: true, avoid: true, marks: true }} />
          </Card>
        </div>

        {/* ===================== PROTOKÓŁ ===================== */}
        <div className="space-y-5">
          <Card title="Szczegółowa ocena kroków (Twój wybór vs wzorzec)">
            <div className="space-y-5">
              {GROUPS.map((g) => {
                const list = proto.checks.filter((c) => c.group === g)
                if (!list.length) return null
                const got = list.reduce((a, c) => a + (c.ok ? c.points : 0), 0)
                const max = list.reduce((a, c) => a + c.points, 0)
                return (
                  <div key={g}>
                    <div className="mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">{g}</h4>
                      <span className="text-xs font-semibold text-slate-500">{got}/{max} pkt</span>
                    </div>
                    <ul className="space-y-2">
                      {list.map((c) => (
                        <CheckRow key={c.id} c={c} />
                      ))}
                    </ul>
                  </div>
                )
              })}
              {(stopped || fatal || !session.position) && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-slate-200">Etapy 2–3 nie zostały wykonane, więc nie podlegają ocenie.</p>
              )}
            </div>
          </Card>

          <Card title="Wzorcowe wykonanie zabiegu (baza wiedzy)">
            <dl className="space-y-3 text-sm">
              <Row label="Zlecony zabieg" v={mod.name} />
              <Row label="Pozycja ułożeniowa" v={loc.patientPosition} />
              <Row label="Punkty orientacyjne palpacji" v={loc.palpationLandmarks} />
              <Row label="Technika aplikacji" v={loc.applicationTechnique} />
              <div>
                <dt className="font-semibold text-red-700">Strefy bezwzględnego omijania</dt>
                <dd>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {loc.zonesToAvoid.map((z) => (
                      <li key={z}>{z}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              {session.triage && <Row label="Twoja kwalifikacja" v={QUAL_LABEL[session.triage.choice]} />}
            </dl>
          </Card>

          <Card title="Prawa i mechanizmy działania">
            {lawNames.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {lawNames.map((n) => (
                  <span key={n} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                    Prawo / reguła: {n}
                  </span>
                ))}
              </div>
            )}
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              {laws.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Card>

          <Card title={`Pełna lista przeciwwskazań – ${MODALITY_SHORT[s.modalityId]}`}>
            <ul className="space-y-1 text-sm">
              {mod.contraindications.map((c) => {
                const hit = s.isContraindicated && session.triage?.reason === c
                return (
                  <li key={c} className={`flex items-start gap-2 rounded-md px-2 py-1 ${hit ? 'bg-amber-100 font-semibold' : ''}`}>
                    <span className="text-red-600">⛔</span>
                    <span>
                      {c}
                      {hit && <span className="ml-2 text-xs text-amber-800">← wskazane przez Ciebie</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <dt className="font-semibold text-teal-800">{label}</dt>
      <dd className="text-slate-700">{v}</dd>
    </div>
  )
}

function CheckRow({ c }: { c: Check }) {
  return (
    <li className={`rounded-xl border px-3 py-2 ${c.info ? 'border-slate-200 bg-slate-50' : c.ok ? 'border-emerald-200 bg-emerald-50/60' : c.critical ? 'border-red-400 bg-red-50' : 'border-red-200 bg-red-50/60'}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${c.info ? 'bg-slate-400' : c.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>{c.info ? 'i' : c.ok ? '✓' : '✗'}</span>
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">{c.label}</span>
            {c.critical && !c.ok && <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">błąd krytyczny</span>}
            {!c.info && <span className="ml-auto text-xs text-slate-500">{c.ok ? c.points : 0}/{c.points} pkt</span>}
          </div>
          <div className="mt-0.5 grid gap-x-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-slate-500">Twój wybór: </span>
              <span className={c.ok ? 'text-emerald-800' : 'font-medium text-red-800'}>{c.student}</span>
            </div>
            <div>
              <span className="text-slate-500">Wzorzec: </span>
              <span className="text-slate-800">{c.expected}</span>
            </div>
          </div>
          {c.why && <div className="mt-1 text-xs italic text-slate-600">{c.why}</div>}
        </div>
      </div>
    </li>
  )
}
