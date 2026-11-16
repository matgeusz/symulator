import { useMemo, useState } from 'react'
import { ALL_SCENARIOS } from './data/extraScenarios'
import { MODALITIES_DB, type PatientScenario } from './data/scenarios'
import { CONSOLES, makeCtx } from './data/consoles'
import { MODALITY_SHORT, MID_LOCATIONS, deriveSide } from './data/meta'
import type { ConsoleAnswer, ExamSession, PositionAnswer, TriageAnswer } from './lib/exam'
import { Atlas } from './components/Atlas'
import { Quiz } from './components/Quiz'
import { Stage1Triage } from './components/Stage1Triage'
import { Stage2Position } from './components/Stage2Position'
import { Stage3Console } from './components/Stage3Console'
import { Stage4Protocol } from './components/Stage4Protocol'
import { PatientCard, StageBar } from './components/ui'
import { normalizeValues } from './components/DeviceConsole'

type Tab = 'exam' | 'atlas' | 'quiz'

const pickOne = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

/** Losowanie równomierne po zabiegach (najpierw zabieg, potem scenariusz), bez powtórzenia poprzedniego zabiegu pod rząd. */
function newSession(pool: PatientScenario[], last?: PatientScenario): ExamSession {
  const mods = [...new Set(pool.map((s) => s.modalityId))]
  const freeMods = mods.length > 1 ? mods.filter((m) => m !== last?.modalityId) : mods
  const mod = pickOne(freeMods)
  const sameMod = pool.filter((s) => s.modalityId === mod)
  const scenario = pickOne(sameMod.length > 1 ? sameMod.filter((s) => s.id !== last?.id) : sameMod)
  return {
    scenario,
    side: MID_LOCATIONS.has(scenario.locationId) ? 'P' : deriveSide(scenario),
    triage: null,
    position: null,
    console: null,
    stoppedCorrectly: false,
    stage: 1,
    continuedAfterError: false,
  }
}

/** Tylko tryb deweloperski: ?s=scen_04&stage=3 – skok do wybranego scenariusza i etapu. */
function devSession(): ExamSession | null {
  if (!import.meta.env.DEV) return null
  const q = new URLSearchParams(location.search)
  const id = q.get('s')
  if (!id) return null
  const scenario = ALL_SCENARIOS.find((s) => s.id === id)
  if (!scenario) return null
  const stage = Number(q.get('stage') ?? 1) as 1 | 2 | 3 | 4
  const base = newSession([scenario])
  const side = q.get('side') === 'L' ? 'L' : q.get('side') === 'P' ? 'P' : base.side
  const spec = CONSOLES[scenario.modalityId]
  const ctx = makeCtx(scenario)
  return {
    ...base,
    side,
    stage,
    triage: stage > 1 ? { choice: scenario.isContraindicated ? 'odstap' : scenario.requiresDoseModification ? 'mod' : 'bez', reason: null } : null,
    position: stage > 1 ? { posId: null, landmarks: [], click: null } : null,
    console: stage > 2 ? { values: normalizeValues(spec, ctx, spec.defaults(ctx)), bhp: [] } : null,
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const q = import.meta.env.DEV ? new URLSearchParams(location.search).get('tab') : null
    return q === 'atlas' || q === 'quiz' ? q : 'exam'
  })
  const [session, setSession] = useState<ExamSession | null>(() => devSession())
  const [filter, setFilter] = useState<string>('all')
  const [learn, setLearn] = useState(false)
  const [maxStage, setMaxStage] = useState<1 | 2 | 3 | 4>(() => devSession()?.stage ?? 1)

  const pool = useMemo(() => (filter === 'all' ? ALL_SCENARIOS : ALL_SCENARIOS.filter((s) => s.modalityId === filter)), [filter])

  const draw = () => {
    setSession(newSession(pool, session?.scenario))
    setMaxStage(1)
    setTab('exam')
  }

  const goStage = (n: 1 | 2 | 3 | 4) => setSession((s) => (s ? { ...s, stage: n } : s))

  const submitTriage = (a: TriageAnswer, next: 'stage2' | 'protocol') => {
    setSession((s) => {
      if (!s) return s
      const correctRefusal = s.scenario.isContraindicated && a.choice === 'odstap'
      if (next === 'protocol') return { ...s, triage: a, stoppedCorrectly: correctRefusal, stage: 4 }
      return { ...s, triage: a, position: s.position ?? { posId: null, landmarks: [], click: null }, stage: 2, continuedAfterError: s.scenario.isContraindicated && a.choice !== 'odstap' }
    })
    setMaxStage(next === 'protocol' ? 4 : 2)
  }

  const setPosition = (position: PositionAnswer) => setSession((s) => (s ? { ...s, position } : s))
  const setConsole = (c: ConsoleAnswer) => setSession((s) => (s ? { ...s, console: c } : s))

  const toConsole = () => {
    setSession((s) => {
      if (!s) return s
      const spec = CONSOLES[s.scenario.modalityId]
      const ctx = makeCtx(s.scenario)
      return { ...s, stage: 3, console: s.console ?? { values: normalizeValues(spec, ctx, spec.defaults(ctx)), bhp: [] } }
    })
    setMaxStage((m) => (m < 3 ? 3 : m))
  }

  const toProtocol = () => {
    setSession((s) => (s ? { ...s, stage: 4 } : s))
    setMaxStage(4)
  }

  const doneFlags = session
    ? [!!session.triage, !!session.position && session.stage > 2, !!session.console && session.stage > 3, session.stage === 4]
    : [false, false, false, false]

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-600 to-teal-800 text-xl text-white shadow">⚕</div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight text-slate-900">Symulator egzaminu z fizykoterapii</div>
              <div className="text-xs text-slate-500">stanowisko praktyczne · 8 modalności · 20 okolic</div>
            </div>
          </div>
          <nav className="ml-4 flex gap-1 rounded-xl bg-slate-100 p-1">
            {([
              ['exam', '🩺 Egzamin praktyczny'],
              ['atlas', '📖 Atlas kliniczny i ściągawka'],
              ['quiz', '✍️ Quiz: Wskazania i Przeciwwskazania'],
            ] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-white text-teal-800 shadow' : 'text-slate-600 hover:text-slate-900'}`}>
                {l}
              </button>
            ))}
          </nav>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-700" title="Podpowiedzi na bieżąco w etapach 2 i 3">
            <input type="checkbox" className="h-4 w-4 accent-teal-700" checked={learn} onChange={(e) => setLearn(e.target.checked)} />
            Tryb nauki (podpowiedzi)
          </label>
          {tab === 'exam' && session && (
            <button onClick={draw} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-800">
              Nowy pacjent
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-5">
        {tab === 'atlas' && <Atlas />}
        {tab === 'quiz' && <Quiz />}
        {tab === 'exam' && !session && <Landing filter={filter} setFilter={setFilter} count={pool.length} onDraw={draw} />}
        {tab === 'exam' && session && (
          <div className="space-y-4">
            <PatientCard s={session.scenario} side={session.side} compact />
            <StageBar stage={session.stage} done={doneFlags} maxReached={maxStage} onGo={session.stoppedCorrectly || (session.stage === 4 && !session.position) ? undefined : goStage} />
            {session.stage === 1 && <Stage1Triage key={session.scenario.id} scenario={session.scenario} initial={session.triage} onSubmit={submitTriage} />}
            {session.stage === 2 && session.position && <Stage2Position scenario={session.scenario} side={session.side} answer={session.position} onChange={setPosition} onNext={toConsole} learn={learn} />}
            {session.stage === 3 && session.console && <Stage3Console scenario={session.scenario} answer={session.console} onChange={setConsole} onFinish={toProtocol} learn={learn} />}
            {session.stage === 4 && <Stage4Protocol session={session} onNew={draw} />}
          </div>
        )}
      </main>
      <footer className="mx-auto max-w-[1500px] px-5 pb-8 text-center text-xs text-slate-400">
        Symulator edukacyjny – parametry i przeciwwskazania wg bazy wiedzy (scenarios.ts / kompletna baza fizykoterapii). Nie zastępuje wiedzy klinicznej ani procedur placówki.
      </footer>
    </div>
  )
}

function Landing({ filter, setFilter, count, onDraw }: { filter: string; setFilter: (f: string) => void; count: number; onDraw: () => void }) {
  const ids = Object.keys(MODALITIES_DB)
  return (
    <div className="mx-auto grid max-w-5xl gap-6 pt-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-3xl bg-linear-to-br from-teal-800 via-teal-700 to-emerald-600 p-8 text-white shadow-xl">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">Praktyczny egzamin z fizykoterapii</div>
        <h1 className="mt-2 text-4xl font-black leading-tight">Zostań egzaminowany jak na prawdziwym stanowisku.</h1>
        <p className="mt-4 text-teal-50">
          Wylosuj pacjenta, zakwalifikuj go do zabiegu, ułóż i zbadaj palpacyjnie, wskaż strefę na modelu anatomicznym, ustaw parametry na konsoli aparatu i otrzymaj szczegółowy protokół z wizualizacją toru ruchu głowicy.
        </p>
        <ol className="mt-5 grid grid-cols-2 gap-2 text-sm">
          {['1 · Kwalifikacja kliniczna', '2 · Ułożenie, palpacja, mapa', '3 · Konsola aparatu', '4 · Protokół i wizualizacja'].map((t) => (
            <li key={t} className="rounded-lg bg-white/15 px-3 py-2 font-medium">
              {t}
            </li>
          ))}
        </ol>
        <button onClick={onDraw} className="mt-7 w-full rounded-2xl bg-white px-6 py-4 text-lg font-extrabold text-teal-800 shadow-lg transition hover:bg-teal-50 active:translate-y-px">
          🎲 Losuj Pacjenta Egzaminacyjnego
        </button>
      </section>
      <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Zakres losowania</h2>
        <div className="grid gap-1.5">
          {[['all', 'Wszystkie zabiegi (losowo)'], ...ids.map((k) => [k, MODALITY_SHORT[k]])].map(([k, l]) => (
            <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${filter === k ? 'border-teal-600 bg-teal-50 font-semibold' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="flt" className="accent-teal-700" checked={filter === k} onChange={() => setFilter(k)} />
              {l}
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500">W puli: {count} scenariuszy (w tym przypadki z ukrytymi przeciwwskazaniami i wymagające modyfikacji dawki).</p>
      </section>
    </div>
  )
}