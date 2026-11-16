import type { ReactNode } from 'react'
import type { PatientScenario } from '../data/scenarios'
import { ANATOMICAL_LOCATIONS, MODALITIES_DB } from '../data/scenarios'
import { PHASE_LABEL, SIDE_LABEL } from '../data/meta'
import type { Side } from '../data/anatomy'
import { MID_LOCATIONS } from '../data/meta'

export function Card({ children, className = '', title, right }: { children: ReactNode; className?: string; title?: ReactNode; right?: ReactNode }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

const PHASE_STYLE = {
  ostry: 'bg-red-100 text-red-800 ring-red-200',
  podostry: 'bg-amber-100 text-amber-800 ring-amber-200',
  przewlekly: 'bg-sky-100 text-sky-800 ring-sky-200',
} as const

export function PatientCard({ s, side, compact }: { s: PatientScenario; side: Side; compact?: boolean }) {
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === s.locationId)!
  const mod = MODALITIES_DB[s.modalityId]
  const mid = MID_LOCATIONS.has(s.locationId)
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-4 bg-linear-to-r from-teal-800 to-teal-600 px-5 py-3 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">{s.gender === 'K' ? '👩' : '👨'}</div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-teal-100">Karta pacjenta egzaminacyjnego</div>
          <div className="truncate text-xl font-bold">
            {s.patientName}, {s.age} {s.age === 1 ? 'rok' : s.age < 5 ? 'lata' : 'lat'} · {s.gender === 'K' ? 'kobieta' : 'mężczyzna'}
          </div>
        </div>
        <div className="ml-auto hidden text-right text-sm sm:block">
          <div className="text-teal-100">Zlecony zabieg</div>
          <div className="font-semibold">{mod.name}</div>
        </div>
      </div>
      <div className={`grid gap-x-8 gap-y-2 px-5 py-4 text-sm ${compact ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2'}`}>
        <Field label="Zlecony zabieg" className="sm:hidden">
          {mod.name}
        </Field>
        <Field label="Okolica zabiegowa">
          <span className="font-semibold">{loc.name}</span>
          {!mid && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">strona {SIDE_LABEL[side]}</span>}
        </Field>
        <Field label="Rozpoznanie">{s.diagnosis}</Field>
        <Field label="Czas od urazu / faza choroby">
          <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${PHASE_STYLE[s.phase]}`}>{PHASE_LABEL[s.phase]}</span>
          {s.daysSinceOnset}
        </Field>
        <Field label="Wywiad internistyczny" className={compact ? 'md:col-span-2 xl:col-span-4' : 'md:col-span-2'}>
          <span className="mt-1 inline-block rounded-md bg-amber-50 px-2 py-1 text-slate-800 ring-1 ring-amber-200">{s.medicalHistory}</span>
        </Field>
      </div>
    </section>
  )
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-slate-800">{children}</div>
    </div>
  )
}

export function StageBar({ stage, done, onGo, maxReached }: { stage: 1 | 2 | 3 | 4; done: boolean[]; onGo?: (n: 1 | 2 | 3 | 4) => void; maxReached: number }) {
  const items = ['Kwalifikacja kliniczna', 'Ułożenie · palpacja · mapa', 'Konsola aparatu', 'Protokół i wizualizacja']
  return (
    <ol className="flex flex-wrap gap-2">
      {items.map((t, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4
        const active = stage === n
        const can = n <= maxReached && !!onGo
        return (
          <li key={t}>
            <button
              disabled={!can}
              onClick={() => onGo?.(n)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-teal-700 text-white shadow' : done[i] ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100' : 'bg-white text-slate-500 ring-1 ring-slate-200'} ${can ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-white text-teal-800' : done[i] ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{done[i] && !active ? '✓' : n}</span>
              {t}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function Modal({ tone, title, children, actions }: { tone: 'danger' | 'warn' | 'ok'; title: string; children: ReactNode; actions: ReactNode }) {
  const head = tone === 'danger' ? 'bg-red-700' : tone === 'warn' ? 'bg-amber-600' : 'bg-emerald-700'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={`${head} flex items-center gap-3 px-6 py-4 text-white`}>
          <span className="text-3xl">{tone === 'danger' ? '🚨' : tone === 'warn' ? '⚠️' : '✅'}</span>
          <h3 className="text-xl font-extrabold tracking-wide">{title}</h3>
        </div>
        <div className="space-y-3 px-6 py-5 text-slate-800">{children}</div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">{actions}</div>
      </div>
    </div>
  )
}

export const btnPrimary = 'rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow transition hover:bg-teal-800 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40'
export const btnGhost = 'rounded-xl bg-white px-5 py-3 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50'
export const btnDanger = 'rounded-xl bg-red-700 px-6 py-3 font-bold text-white shadow transition hover:bg-red-800'
