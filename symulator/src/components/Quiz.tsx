import { useEffect, useMemo, useRef, useState } from 'react'
import { MODALITIES_DB } from '../data/scenarios'
import { MODALITY_SHORT } from '../data/meta'
import { QUIZ, QUIZ_BY_ID } from '../data/quizData'
import { evaluateColumn, type Column, type ColumnResult, type EntryResult, type Verdict } from '../lib/quizEngine'
import { btnGhost, btnPrimary } from './ui'

type Mode = 'both' | 'con'

const COL_META: Record<Column, { title: string; placeholder: string; noun: string; accent: string; ring: string }> = {
  ind: {
    title: 'WSKAZANIA',
    placeholder: 'Wpisz WSKAZANIA… (np. ostroga piętowa)',
    noun: 'wskazań',
    accent: 'text-teal-800',
    ring: 'focus:border-teal-600 focus:ring-teal-200',
  },
  con: {
    title: 'PRZECIWWSKAZANIA',
    placeholder: 'Wpisz PRZECIWWSKAZANIA… (np. rozrusznik)',
    noun: 'przeciwwskazań',
    accent: 'text-red-800',
    ring: 'focus:border-red-500 focus:ring-red-200',
  },
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

export function Quiz() {
  const ids = useMemo(() => QUIZ.map((m) => m.id), [])
  const [modId, setModId] = useState<string>(() => ids[Math.floor(Math.random() * ids.length)])
  const [mode, setMode] = useState<Mode>('both')
  const [answers, setAnswers] = useState<Record<Column, string[]>>({ ind: [''], con: [''] })
  const [checked, setChecked] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [focusReq, setFocusReq] = useState<{ col: Column; idx: number } | null>(null)

  const mod = QUIZ_BY_ID[modId]
  const db = MODALITIES_DB[modId]
  const columns: Column[] = mode === 'con' ? ['con'] : ['ind', 'con']

  useEffect(() => {
    if (!focusReq) return
    const el = rootRef.current?.querySelector<HTMLInputElement>(`input[data-col="${focusReq.col}"][data-idx="${focusReq.idx}"]`)
    el?.focus()
    setFocusReq(null)
  }, [focusReq])

  const results = useMemo(() => {
    if (!checked) return null
    return Object.fromEntries(columns.map((c) => [c, evaluateColumn(answers[c], c, mod)])) as Partial<Record<Column, ColumnResult>>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, answers, mod, mode])

  const reset = () => {
    setAnswers({ ind: [''], con: [''] })
    setChecked(false)
    setShowModel(false)
  }
  const pick = (id: string) => {
    setModId(id)
    reset()
  }
  const randomPick = () => {
    const pool = ids.filter((i) => i !== modId)
    pick(pool[Math.floor(Math.random() * pool.length)])
  }

  const setCol = (c: Column, v: string[]) => setAnswers((a) => ({ ...a, [c]: v }))
  const filled = columns.reduce((n, c) => n + answers[c].filter((x) => x.trim()).length, 0)

  const total = results ? columns.reduce((n, c) => n + (results[c]?.total ?? 0), 0) : 0
  const hits = results ? columns.reduce((n, c) => n + (results[c]?.hits ?? 0), 0) : 0
  const errs = results ? columns.reduce((n, c) => n + (results[c]?.errors ?? 0), 0) : 0

  return (
    <div ref={rootRef} className="mx-auto max-w-6xl space-y-4">
      <div className="rounded-3xl bg-linear-to-br from-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">Aktywne przypominanie · odpowiedzi otwarte</div>
        <h2 className="mt-1 text-2xl font-black">Quiz: Wskazania i Przeciwwskazania (Wpisywanie z pamięci)</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Wybierz zabieg albo go wylosuj, a następnie wpisz z pamięci wskazania i przeciwwskazania – pojedynczo (Enter lub „+”). Aplikacja rozpoznaje skróty i synonimy
          (np. „rozrusznik”, „metal”, „sterydy”, „ostry stan”), więc nie musisz przepisywać całych zdań.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={randomPick} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow hover:bg-teal-800" title="Losuj inny zabieg">
            🎲 Losuj zabieg
          </button>
          <span className="mx-1 text-xs font-semibold uppercase tracking-wide text-slate-400">lub wybierz:</span>
          {ids.map((id) => (
            <button
              key={id}
              onClick={() => pick(id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${modId === id ? 'border-teal-700 bg-teal-50 font-bold text-teal-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {MODALITY_SHORT[id]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tryb:</span>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(
              [
                ['both', 'Wskazania + Przeciwwskazania'],
                ['con', 'Tylko Przeciwwskazania (Szybka powtórka)'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => {
                  setMode(k)
                  setChecked(false)
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${mode === k ? 'bg-white text-teal-800 shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-500">Ctrl + Enter = Sprawdź</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" onKeyDown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !checked && setChecked(true)}>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Zabieg do omówienia</div>
        <div className="text-2xl font-black text-slate-900">{db.name}</div>

        <div className={`mt-4 grid gap-5 ${columns.length === 2 ? 'lg:grid-cols-2' : ''}`}>
          {columns.map((c) => (
            <ColumnPanel
              key={c}
              col={c}
              values={answers[c]}
              onChange={(v) => setCol(c, v)}
              onFocusReq={(idx) => setFocusReq({ col: c, idx })}
              result={results?.[c]}
              locked={checked}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          {!checked ? (
            <button onClick={() => setChecked(true)} className={btnPrimary}>
              [ Sprawdź moje odpowiedzi ]
            </button>
          ) : (
            <>
              <button onClick={() => setChecked(false)} className={btnGhost}>
                ✏️ Popraw odpowiedzi
              </button>
              <button onClick={reset} className={btnGhost}>
                ↺ Od nowa (ten sam zabieg)
              </button>
              <button onClick={randomPick} className={btnPrimary}>
                🎲 Następny zabieg
              </button>
            </>
          )}
          {!checked && <span className="text-xs text-slate-500">Wpisano pozycji: {filled}</span>}
        </div>
      </div>

      {results && (
        <div className="space-y-3">
          <div className={`rounded-2xl p-4 shadow-sm ring-1 ${pct(hits, total) >= 80 ? 'bg-emerald-50 ring-emerald-300' : pct(hits, total) >= 50 ? 'bg-amber-50 ring-amber-300' : 'bg-red-50 ring-red-300'}`}>
            <div className="text-lg font-extrabold text-slate-900">
              Wynik: {hits}/{total} pozycji ({pct(hits, total)}%)
              {errs > 0 && <span className="ml-3 text-base font-bold text-red-700">· błędnych wpisów: {errs}</span>}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {pct(hits, total) >= 90 && errs === 0
                ? 'Znakomicie – pełna lista w głowie.'
                : pct(hits, total) >= 60
                  ? 'Dobrze, ale uzupełnij pominięte pozycje (żółte pole poniżej listy).'
                  : 'Powtórz ten zabieg – zacznij od pozycji pominiętych.'}
            </div>
          </div>
          <div>
            <button onClick={() => setShowModel((v) => !v)} className={btnGhost}>
              {showModel ? 'Ukryj' : 'Pokaż'} pełną listę wzorcową z bazy
            </button>
            {showModel && (
              <div className={`mt-3 grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 ${columns.length === 2 ? 'md:grid-cols-2' : ''}`}>
                {columns.map((c) => (
                  <div key={c}>
                    <div className={`text-sm font-extrabold ${COL_META[c].accent}`}>{COL_META[c].title}</div>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {(c === 'ind' ? db.indications : db.contraindications).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ColumnPanel({
  col,
  values,
  onChange,
  onFocusReq,
  result,
  locked,
}: {
  col: Column
  values: string[]
  onChange: (v: string[]) => void
  onFocusReq: (idx: number) => void
  result?: ColumnResult
  locked: boolean
}) {
  const meta = COL_META[col]
  const nonEmpty = values.filter((v) => v.trim()).length

  const add = (after: number) => {
    const next = [...values]
    next.splice(after + 1, 0, '')
    onChange(next)
    onFocusReq(after + 1)
  }
  const remove = (i: number) => {
    const next = values.filter((_, k) => k !== i)
    onChange(next.length ? next : [''])
  }

  return (
    <section>
      <h3 className={`mb-2 text-sm font-extrabold tracking-wide ${meta.accent}`}>
        {meta.title} <span className="font-semibold text-slate-400">({nonEmpty})</span>
      </h3>

      {!locked && (
        <div className="space-y-2">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs font-semibold text-slate-400">{i + 1}.</span>
              <input
                data-col={col}
                data-idx={i}
                value={v}
                onChange={(e) => onChange(values.map((x, k) => (k === i ? e.target.value : x)))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault()
                    if (!v.trim()) return
                    if (i === values.length - 1 || values[i + 1].trim()) add(i)
                    else onFocusReq(i + 1)
                  }
                  if (e.key === 'Backspace' && !v && values.length > 1) {
                    e.preventDefault()
                    remove(i)
                    onFocusReq(Math.max(0, i - 1))
                  }
                }}
                placeholder={meta.placeholder}
                className={`min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${meta.ring}`}
              />
              <button
                onClick={() => (i === values.length - 1 ? (v.trim() ? add(i) : undefined) : remove(i))}
                disabled={i === values.length - 1 && !v.trim()}
                className={`h-9 w-9 shrink-0 rounded-lg text-lg font-bold transition disabled:opacity-30 ${i === values.length - 1 ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700'}`}
                title={i === values.length - 1 ? 'Dodaj kolejną pozycję (Enter)' : 'Usuń pozycję'}
              >
                {i === values.length - 1 ? '+' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}

      {locked && result && <ResultList col={col} result={result} />}
    </section>
  )
}

const V_STYLE: Record<Verdict, { box: string; icon: string; label: string }> = {
  ok: { box: 'border-emerald-400 bg-emerald-50 text-emerald-900', icon: '✔', label: 'Trafione' },
  dup: { box: 'border-amber-300 bg-amber-50 text-amber-900', icon: '↺', label: 'Powtórzenie' },
  swapped: { box: 'border-red-400 bg-red-50 text-red-900', icon: '✘', label: 'Zła kolumna' },
  foreign: { box: 'border-red-400 bg-red-50 text-red-900', icon: '✘', label: 'Inny zabieg' },
  unknown: { box: 'border-red-300 bg-red-50 text-red-900', icon: '?', label: 'Nie rozpoznano' },
}

function ResultList({ col, result }: { col: Column; result: ColumnResult }) {
  const meta = COL_META[col]
  const p = pct(result.hits, result.total)
  const bar = p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between text-sm font-bold text-slate-800">
          <span>
            Trafiono {result.hits}/{result.total} {meta.noun}
          </span>
          <span>{p}%</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${p}%` }} />
        </div>
      </div>

      {result.results.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">Nic nie wpisano w tej kolumnie.</div>}

      <ul className="space-y-1.5">
        {result.results.map((r, i) => (
          <EntryRow key={i} r={r} />
        ))}
      </ul>

      {result.missing.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
          <div className="text-sm font-extrabold text-amber-900">
            ⚠ Pominięte {meta.noun} ({result.missing.length})
          </div>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-amber-950">
            {result.missing.map((a) => (
              <li key={a.id}>{a.label}</li>
            ))}
          </ul>
        </div>
      )}
      {result.missing.length === 0 && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">✔ Komplet – nic nie pominięto.</div>}
    </div>
  )
}

function EntryRow({ r }: { r: EntryResult }) {
  const st = V_STYLE[r.verdict]
  return (
    <li className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${st.box}`}>
      <span className="mt-px font-black">{st.icon}</span>
      <div className="min-w-0">
        <div className="font-semibold">„{r.part}”</div>
        {r.verdict === 'ok' && r.atom && (
          <div className="text-xs opacity-80">
            → {r.atom.label}
            {r.fuzzy && <span className="ml-1 rounded bg-emerald-200/70 px-1 font-semibold">literówka – zaliczono</span>}
          </div>
        )}
        {r.verdict === 'dup' && r.atom && <div className="text-xs opacity-80">{r.note} ({r.atom.label})</div>}
        {r.verdict === 'swapped' && r.atom && (
          <div className="text-xs">
            {r.note} <span className="opacity-80">({r.atom.label})</span>
          </div>
        )}
        {r.verdict === 'foreign' && (
          <div className="text-xs">
            {r.note} <span className="opacity-80">Pasuje do: {r.otherModalities?.map((m) => MODALITY_SHORT[m]).join(', ')}.</span>
          </div>
        )}
        {r.verdict === 'unknown' && <div className="text-xs">{r.note} Sprawdź pisownię lub użyj innego sformułowania.</div>}
      </div>
    </li>
  )
}
