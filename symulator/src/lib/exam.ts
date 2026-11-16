import type { PatientScenario } from '../data/scenarios'
import { MODALITIES_DB } from '../data/scenarios'
import type { Check } from '../data/consoles'
import { evaluateConsole, makeCtx, gotScore, maxScore } from '../data/consoles'
import type { Choice, Side, View } from '../data/anatomy'
import { getLandmarkChoices, getPositionChoices, hasSideView, inTarget, resolveGeom, resolveViewGeom } from '../data/anatomy'
import { correctContraOptions } from '../data/meta'
import type { Values } from '../data/consoles'

const VIEW_UP: Record<View, string> = { front: 'z PRZODU', back: 'z TYŁU', side: 'z BOKU' }
const VIEW_LOW: Record<View, string> = { front: 'z przodu', back: 'z tyłu', side: 'z boku' }
const VIEW_NAME: Record<View, string> = { front: 'przód', back: 'tył', side: 'bok' }

export type Qualification = 'bez' | 'mod' | 'odstap'

export const QUAL_LABEL: Record<Qualification, string> = {
  bez: 'Kwalifikuję bez modyfikacji',
  mod: 'Kwalifikuję z modyfikacją dawki',
  odstap: 'ODSTĘPUJĘ OD ZABIEGU – przeciwwskazanie',
}

export interface TriageAnswer {
  choice: Qualification
  reason: string | null
}

export interface MapClick {
  view: View
  x: number
  y: number
}

export interface PositionAnswer {
  posId: string | null
  landmarks: string[]
  click: MapClick | null
}

export interface ConsoleAnswer {
  values: Values
  bhp: string[]
}

export interface ExamSession {
  scenario: PatientScenario
  side: Side
  triage: TriageAnswer | null
  position: PositionAnswer | null
  console: ConsoleAnswer | null
  /** poprawne odstąpienie od zabiegu – egzamin zakończony na etapie 1 */
  stoppedCorrectly: boolean
  /** poziom wykonania: 1..4 – aktualny etap */
  stage: 1 | 2 | 3 | 4
  /** ewentualne kontynuowanie mimo błędu kwalifikacji (tryb treningowy) */
  continuedAfterError: boolean
}

export function correctQualification(s: PatientScenario): Qualification {
  if (s.isContraindicated) return 'odstap'
  return s.requiresDoseModification ? 'mod' : 'bez'
}

export function evaluateTriage(s: PatientScenario, a: TriageAnswer): Check[] {
  const exp = correctQualification(s)
  const out: Check[] = []
  const bad = s.isContraindicated && a.choice !== 'odstap'
  out.push({
    id: 'triage-decision',
    group: 'Kwalifikacja',
    label: 'Decyzja kwalifikacyjna',
    ok: a.choice === exp,
    student: QUAL_LABEL[a.choice],
    expected: QUAL_LABEL[exp],
    why:
      exp === 'odstap'
        ? (s.contraindicationReason ?? 'Pacjent ma bezwzględne przeciwwskazanie.')
        : exp === 'mod'
          ? (s.modificationReason ?? 'Wymagana modyfikacja dawki.')
          : a.choice === 'odstap'
            ? 'Pacjent nie ma przeciwwskazań do tego zabiegu – nieuzasadnione odstąpienie.'
            : 'Brak przeciwwskazań i brak wskazań do modyfikacji dawki.',
    points: 3,
    critical: bad,
  })
  if (s.isContraindicated) {
    const exps = correctContraOptions(s)
    out.push({
      id: 'triage-reason',
      group: 'Kwalifikacja',
      label: 'Wskazane przeciwwskazanie',
      ok: a.choice === 'odstap' && !!a.reason && exps.includes(a.reason),
      student: a.choice === 'odstap' ? (a.reason ?? '— nie wybrano —') : '— nie odstąpiono od zabiegu —',
      expected: exps.join(' | '),
      why: s.contraindicationReason,
      points: 2,
    })
  }
  return out
}

export function shuffledChoices(kind: 'pos' | 'lm', locId: string, seed: number): Choice[] {
  const list = kind === 'pos' ? getPositionChoices(locId) : getLandmarkChoices(locId)
  // prosty deterministyczny shuffle, aby kolejność była stabilna w obrębie sesji
  const a = [...list]
  let s = seed + (kind === 'pos' ? 7 : 13)
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function seedOf(s: PatientScenario, side: Side): number {
  let h = 0
  for (const ch of s.id + side) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

export function evaluatePosition(s: PatientScenario, side: Side, a: PositionAnswer): Check[] {
  const seed = seedOf(s, side)
  const pos = shuffledChoices('pos', s.locationId, seed)
  const lms = shuffledChoices('lm', s.locationId, seed)
  const out: Check[] = []
  const chosen = pos.find((p) => p.id === a.posId)
  const correctPos = pos.filter((p) => p.correct)
  out.push({
    id: 'pos',
    group: 'Ułożenie i palpacja',
    label: 'Pozycja ułożeniowa pacjenta',
    ok: !!chosen?.correct,
    student: chosen?.label ?? '— nie wybrano —',
    expected: correctPos.map((p) => p.label).join('  /  '),
    why: chosen && !chosen.correct ? chosen.why : undefined,
    points: 2,
  })
  const okIds = lms.filter((l) => l.correct).map((l) => l.id)
  const pickedOk = a.landmarks.filter((id) => okIds.includes(id))
  const pickedBad = a.landmarks.filter((id) => !okIds.includes(id))
  out.push({
    id: 'lm',
    group: 'Ułożenie i palpacja',
    label: 'Punkty orientacyjne palpacji',
    ok: pickedOk.length === okIds.length && pickedBad.length === 0,
    student: a.landmarks.length ? lms.filter((l) => a.landmarks.includes(l.id)).map((l) => (l.correct ? '✓ ' : '✗ ') + l.label).join('  |  ') : '— nie wybrano —',
    expected: lms.filter((l) => l.correct).map((l) => l.label).join('  |  '),
    why: pickedBad.length ? 'Zaznaczono punkty niezwiązane z tą okolicą (dystraktory).' : pickedOk.length < okIds.length ? 'Nie wskazano wszystkich punktów orientacyjnych.' : undefined,
    points: 2,
  })
  const g = resolveGeom(s.locationId, side)
  let clickOk = false
  let clickWhy: string | undefined
  if (a.click) {
    const cg = resolveViewGeom(s.locationId, side, a.click.view)
    if (!cg) clickWhy = `Ta okolica leży w widoku ${VIEW_UP[g.view]}${hasSideView(s.locationId) ? ' (opis także z BOKU)' : ''}; kliknięto w widoku ${VIEW_LOW[a.click.view]}.`
    else {
      clickOk = cg.targets.some((t) => inTarget(t, a.click!.x, a.click!.y))
      if (!clickOk) clickWhy = 'Kliknięto poza właściwą strefą zabiegową (sprawdź stronę ciała i odległość od punktów orientacyjnych).'
    }
  }
  out.push({
    id: 'click',
    group: 'Mapa anatomiczna',
    label: `Strefa zabiegowa na modelu (strona ${side === 'P' ? 'prawa' : 'lewa'} pacjenta)`,
    ok: clickOk,
    student: a.click ? `widok: ${VIEW_NAME[a.click.view]}, punkt (${Math.round(a.click.x)}, ${Math.round(a.click.y)})` : '— nie kliknięto —',
    expected: `widok: ${VIEW_NAME[g.view]}, strefa wskazana na zielono`,
    why: clickWhy,
    points: 2,
  })
  return out
}

export interface Protocol {
  checks: Check[]
  got: number
  max: number
  pct: number
  criticals: Check[]
  passed: boolean
}

export function buildProtocol(sess: ExamSession): Protocol {
  const checks: Check[] = []
  if (sess.triage) checks.push(...evaluateTriage(sess.scenario, sess.triage))
  const skip = sess.stoppedCorrectly
  if (!skip) {
    if (sess.position) checks.push(...evaluatePosition(sess.scenario, sess.side, sess.position))
    if (sess.console) checks.push(...evaluateConsole(makeCtx(sess.scenario), sess.console.values, sess.console.bhp))
  }
  const got = gotScore(checks)
  const max = maxScore(checks)
  const criticals = checks.filter((c) => c.critical && !c.ok)
  const pct = max ? Math.round((got / max) * 100) : 0
  return { checks, got, max, pct, criticals, passed: pct >= 70 && criticals.length === 0 }
}

export function modalityName(s: PatientScenario) {
  return MODALITIES_DB[s.modalityId].name
}
