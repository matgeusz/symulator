import { useEffect, useMemo, useRef, useState } from 'react'
import type { PatientScenario } from '../data/scenarios'
import { CONSOLES, makeCtx } from '../data/consoles'
import type { ConsoleAnswer } from '../lib/exam'
import { DeviceConsole, normalizeValues } from './DeviceConsole'
import { btnPrimary } from './ui'

interface Props {
  scenario: PatientScenario
  answer: ConsoleAnswer
  onChange: (a: ConsoleAnswer) => void
  onFinish: () => void
  learn: boolean
}

export function Stage3Console({ scenario, answer, onChange, onFinish, learn }: Props) {
  const ctx = useMemo(() => makeCtx(scenario), [scenario])
  const spec = CONSOLES[scenario.modalityId]
  const [progress, setProgress] = useState<number | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current)
    },
    [],
  )

  const start = () => {
    if (progress !== null && progress < 1) return
    setProgress(0)
    const t0 = performance.now()
    const dur = 5000
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / dur)
      setProgress(p)
      if (p >= 1 && timer.current) {
        window.clearInterval(timer.current)
        timer.current = null
      }
    }, 60)
  }

  const hints = useMemo(() => {
    if (!learn) return undefined
    const out: Record<string, { ok: boolean; expected: string }> = {}
    for (const c of spec.evaluate(ctx, answer.values)) out[c.id] = { ok: c.ok, expected: c.expected }
    return out
  }, [learn, spec, ctx, answer.values])

  const finished = progress !== null && progress >= 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Etap 3 · Konsola aparatu: {spec.brand} {spec.model}</h2>
          <p className="text-sm text-slate-600">Dobierz aplikator i parametry zabiegu, wykonaj czynności BHP, a następnie uruchom zabieg.</p>
        </div>
        {finished && (
          <button className={btnPrimary} onClick={onFinish}>
            Zabieg zakończony – przejdź do protokołu →
          </button>
        )}
      </div>
      <DeviceConsole
        spec={spec}
        ctx={ctx}
        values={answer.values}
        onChange={(values) => onChange({ ...answer, values: normalizeValues(spec, ctx, values) })}
        bhpChecked={answer.bhp}
        onToggleBhp={(id) => onChange({ ...answer, bhp: answer.bhp.includes(id) ? answer.bhp.filter((x) => x !== id) : [...answer.bhp, id] })}
        onStart={start}
        progress={progress}
        locked={finished}
        hints={hints}
      />
      {finished && (
        <div className="flex justify-end">
          <button className={btnPrimary} onClick={onFinish}>
            Przejdź do protokołu egzaminacyjnego →
          </button>
        </div>
      )}
    </div>
  )
}
