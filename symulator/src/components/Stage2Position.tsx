import { useMemo, useState } from 'react'
import type { PatientScenario } from '../data/scenarios'
import { ANATOMICAL_LOCATIONS } from '../data/scenarios'
import { getSideZoom, inTarget, resolveViewGeom, type Side } from '../data/anatomy'
import { seedOf, shuffledChoices, type PositionAnswer } from '../lib/exam'
import { Card, btnPrimary } from './ui'
import { ClickMarker, ViewOverlay } from './AnatomyMap'
import { MapPanel } from './MapPanel'

const VIEW_PL = { front: 'przód', back: 'tył', side: 'bok' } as const

interface Props {
  scenario: PatientScenario
  side: Side
  answer: PositionAnswer
  onChange: (a: PositionAnswer) => void
  onNext: () => void
  learn: boolean
}

export function Stage2Position({ scenario, side, answer, onChange, onNext, learn }: Props) {
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === scenario.locationId)!
  const seed = seedOf(scenario, side)
  const positions = useMemo(() => shuffledChoices('pos', scenario.locationId, seed), [scenario.locationId, seed])
  const landmarks = useMemo(() => shuffledChoices('lm', scenario.locationId, seed), [scenario.locationId, seed])
  const [armed, setArmed] = useState(false)

  const clickGeom = answer.click ? resolveViewGeom(scenario.locationId, side, answer.click.view) : null
  const clickHit = answer.click ? !!clickGeom && clickGeom.targets.some((t) => inTarget(t, answer.click!.x, answer.click!.y)) : null
  const ready = !!answer.posId && answer.landmarks.length > 0 && !!answer.click

  const toggleLm = (id: string) => onChange({ ...answer, landmarks: answer.landmarks.includes(id) ? answer.landmarks.filter((x) => x !== id) : [...answer.landmarks, id] })


  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <div>
        <MapPanel
          focusKey={scenario.id + side}
          focus={{ view: 'front', zoom: { cx: 500, cy: 700, w: 1000 } }}
          altZoom={getSideZoom(scenario.locationId, side)}
          patientSide={side}
          onPick={(p, view) => onChange({ ...answer, click: { view, x: p.x, y: p.y } })}
          caption={
            <div className="rounded-xl bg-teal-50 px-4 py-2 text-sm text-teal-900 ring-1 ring-teal-200">
              <strong>Mapa anatomiczna:</strong> wybierz widok (przód / tył / bok), przybliż okolicę i <strong>kliknij strefę zabiegową</strong> – {loc.name}, strona {side === 'P' ? 'prawa' : 'lewa'} pacjenta.
              {!armed && <span className="ml-1 text-teal-700">(Pamiętaj: w widoku z przodu prawa strona pacjenta jest po lewej stronie ekranu.)</span>}
            </div>
          }
          overlay={(u, view, vb) => (
            <>
              {learn && answer.click && <ViewOverlay locId={scenario.locationId} side={side} view={view} modId={scenario.modalityId} usMethods={[]} flags={{ targets: true, marks: true }} u={u} vb={vb} />}
              {answer.click && answer.click.view === view && <ClickMarker x={answer.click.x} y={answer.click.y} u={u} ok={learn ? !!clickHit : undefined} />}
            </>
          )}
        />
        {answer.click && (
          <div className={`mt-2 rounded-lg px-3 py-2 text-sm ${learn ? (clickHit ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-red-50 text-red-800 ring-1 ring-red-200') : 'bg-slate-100 text-slate-700'}`}>
            {learn ? (clickHit ? '✔ Trafiony – to właściwa strefa zabiegowa.' : '✘ Pudło – spróbuj ponownie (zielony obrys pokazuje właściwą strefę).') : `Zaznaczono punkt w widoku „${VIEW_PL[answer.click.view]}”. Możesz kliknąć ponownie, aby go przesunąć.`}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <Card title="Etap 2a · Pozycja ułożeniowa pacjenta">
          <p className="mb-3 text-sm text-slate-600">
            Wybierz pozycję biomechanicznie <strong>otwierającą dostęp</strong> do struktury: {loc.name}.
          </p>
          <div className="space-y-2">
            {positions.map((p) => {
              const sel = answer.posId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setArmed(true)
                    onChange({ ...answer, posId: p.id })
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition ${sel ? (learn ? (p.correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50') : 'border-teal-600 bg-teal-50') : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <span className="font-medium text-slate-800">{p.label}</span>
                  {learn && sel && <div className={`mt-1 text-xs ${p.correct ? 'text-emerald-700' : 'text-red-700'}`}>{p.correct ? '✔ Prawidłowa pozycja.' : `✘ ${p.why}`}</div>}
                </button>
              )
            })}
          </div>
        </Card>

        <Card title="Etap 2b · Punkty orientacyjne palpacji" right={<span className="text-xs text-slate-400">zaznacz wszystkie właściwe</span>}>
          <div className="space-y-1.5">
            {landmarks.map((l) => {
              const sel = answer.landmarks.includes(l.id)
              return (
                <label key={l.id} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${sel ? (learn ? (l.correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50') : 'border-teal-600 bg-teal-50') : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-teal-700" checked={sel} onChange={() => toggleLm(l.id)} />
                  <span>{l.label}</span>
                </label>
              )
            })}
          </div>
        </Card>

        <Card title="Etap 2c · Strefa na modelu">
          <div className="flex items-center gap-3 text-sm">
            <span className={`h-3 w-3 rounded-full ${answer.click ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {answer.click ? 'Strefa zaznaczona na modelu.' : 'Kliknij właściwe miejsce zabiegu na modelu anatomicznym.'}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {!ready && <span className="text-sm text-slate-500">Uzupełnij: pozycję, punkty palpacji i kliknięcie na modelu.</span>}
          <button className={btnPrimary} disabled={!ready} onClick={onNext}>
            Zatwierdź i przejdź do konsoli aparatu →
          </button>
        </div>
      </div>
    </div>
  )
}
