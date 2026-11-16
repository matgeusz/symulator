import { useMemo, useState, type ReactNode } from 'react'
import type { BhpItem, Control, Ctx, ConsoleSpec, ThemeKey, Values, Val } from '../data/consoles'
import { nf, visibleBhp } from '../data/consoles'
import { Applicator } from './Applicators'

interface Theme {
  body: string
  bodyEdge: string
  bezel: string
  bezelEdge: string
  lcd: string
  tile: string
  tileText: string
  tileLabel: string
  hi: string
  badge: string
  btn: string
}

const THEMES: Record<ThemeKey, Theme> = {
  laser: { body: '#f4eddc', bodyEdge: '#d8ceb0', bezel: 'linear-gradient(160deg,#dfe2e7,#aab0b8)', bezelEdge: '#8d949d', lcd: '#615d3b', tile: '#d1c37a', tileText: '#1d1b0c', tileLabel: '#5b5424', hi: '#ef8a17', badge: '#fff', btn: 'linear-gradient(#f7f7f7,#d5d7db)' },
  sonic: { body: '#f4eddb', bodyEdge: '#dbd0b2', bezel: 'linear-gradient(160deg,#d8dde4,#a3acb8)', bezelEdge: '#7f8a98', lcd: '#9d8b52', tile: '#e6da92', tileText: '#1b1708', tileLabel: '#5e5326', hi: '#e8590c', badge: '#fff', btn: 'linear-gradient(#f7f7f7,#d5d9de)' },
  magnet: { body: '#f4edd8', bodyEdge: '#d9ceae', bezel: 'linear-gradient(160deg,#9bd24b,#6fa522)', bezelEdge: '#5a8a16', lcd: '#ef8b1d', tile: '#f9cf4a', tileText: '#271a02', tileLabel: '#7a4a05', hi: '#7c2d12', badge: '#fff', btn: 'linear-gradient(#fbfbf4,#dcdccf)' },
  sollux: { body: '#f2e6d8', bodyEdge: '#d6c3ae', bezel: 'linear-gradient(160deg,#c94a3d,#8f2a22)', bezelEdge: '#6f1f19', lcd: '#3d211d', tile: '#ebb560', tileText: '#2a1503', tileLabel: '#7a4a12', hi: '#ffec99', badge: '#fff', btn: 'linear-gradient(#fff4ec,#e3cdbd)' },
  polar: { body: '#eef3f8', bodyEdge: '#cfd9e5', bezel: 'linear-gradient(160deg,#6f97d6,#3d65a8)', bezelEdge: '#2e4f86', lcd: '#1d3a63', tile: '#a6caf5', tileText: '#0b1b33', tileLabel: '#33577f', hi: '#ffd43b', badge: '#fff', btn: 'linear-gradient(#ffffff,#dbe3ee)' },
  cryo: { body: '#e9f3f7', bodyEdge: '#c3d9e2', bezel: 'linear-gradient(160deg,#4fb9d6,#2784a3)', bezelEdge: '#1b6781', lcd: '#0d3b52', tile: '#93dbef', tileText: '#04202e', tileLabel: '#2a6179', hi: '#ffd43b', badge: '#fff', btn: 'linear-gradient(#ffffff,#d6e6ec)' },
  thermo: { body: '#f5e9dc', bodyEdge: '#dcc7b0', bezel: 'linear-gradient(160deg,#e48b3f,#b45a16)', bezelEdge: '#8d4410', lcd: '#4a2a14', tile: '#f2bd80', tileText: '#2b1503', tileLabel: '#7d4a17', hi: '#fff3bf', badge: '#fff', btn: 'linear-gradient(#fff6ec,#e5d1bc)' },
  viofor: { body: '#eef5f2', bodyEdge: '#cadbd4', bezel: 'linear-gradient(160deg,#3bb3a3,#1e7a6f)', bezelEdge: '#175f56', lcd: '#16403b', tile: '#93e2c6', tileText: '#032019', tileLabel: '#2c6a5c', hi: '#ffd43b', badge: '#fff', btn: 'linear-gradient(#ffffff,#d9e7e2)' },
}

export function normalizeValues(spec: ConsoleSpec, ctx: Ctx, vals: Values): Values {
  let cur = { ...vals }
  for (let pass = 0; pass < 2; pass++) {
    for (const c of spec.controls(ctx, cur)) {
      const x = cur[c.key]
      if (c.kind === 'number' && !c.readOnly) {
        let n = Number(x)
        if (Number.isNaN(n)) n = c.min ?? 0
        n = Math.min(c.max ?? n, Math.max(c.min ?? n, n))
        const step = c.step ?? 1
        n = Math.round(n / step) * step
        const dec = c.decimals ?? 0
        cur[c.key] = Number(n.toFixed(Math.max(dec, 2)))
      } else if (c.kind === 'choice' && c.options && x !== '' && x !== undefined && !c.options.some((o) => o.value === x)) {
        if (typeof x === 'number') {
          const nums = c.options.filter((o) => typeof o.value === 'number') as { value: number }[]
          if (nums.length) cur[c.key] = nums.reduce((a, b) => (Math.abs(b.value - x) < Math.abs(a.value - x) ? b : a)).value
        } else cur[c.key] = ''
      }
    }
  }
  return cur
}

function tileText(c: Control, v: Values): { main: string; unit?: string; empty?: boolean } {
  if (c.readOnly) return { main: c.display ?? '--', unit: c.unit }
  const x = v[c.key]
  if (c.kind === 'choice') {
    if (x === '' || x === undefined) return { main: '---', empty: true }
    const o = c.options?.find((o) => o.value === x)
    return { main: o?.short ?? o?.label ?? String(x), unit: c.unit && typeof x === 'number' ? c.unit : undefined }
  }
  return { main: nf(Number(x), c.decimals ?? 0), unit: c.unit }
}

// ------------------------------------------------------------------ przyciski aparatu
function HwButton({ label, icon, onClick, theme, wide, disabled, title }: { label?: string; icon?: ReactNode; onClick?: () => void; theme: Theme; wide?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`dev-btn flex flex-col items-center justify-center rounded-full border text-[10px] font-semibold tracking-wide text-slate-700 shadow ${wide ? 'h-9 w-[78px]' : 'h-8 w-[60px]'} ${disabled ? 'opacity-60' : ''}`}
      style={{ background: theme.btn, borderColor: 'rgba(0,0,0,0.25)' }}
    >
      {icon && <span className="text-[13px] leading-none">{icon}</span>}
      {label && <span className="leading-none">{label}</span>}
    </button>
  )
}

interface Props {
  spec: ConsoleSpec
  ctx: Ctx
  values: Values
  onChange: (v: Values) => void
  bhpChecked: string[]
  onToggleBhp: (id: string) => void
  onStart: () => void
  /** 0..1 – aktualny postęp symulowanego zabiegu; null = nie uruchomiono */
  progress: number | null
  locked: boolean
  /** tryb nauki: podpowiedź wzorca dla parametru (klucz = id kontrolki) */
  hints?: Record<string, { ok: boolean; expected: string }>
}

export function DeviceConsole({ spec, ctx, values, onChange, bhpChecked, onToggleBhp, onStart, progress, locked, hints }: Props) {
  const th = THEMES[spec.theme]
  const controls = useMemo(() => spec.controls(ctx, values), [spec, ctx, values])
  const [focusKey, setFocusKey] = useState<string>(controls[0]?.key ?? '')
  const focus = controls.find((c) => c.key === focusKey) ?? controls[0]
  const bhp = visibleBhp(spec, ctx, values)

  const set = (key: string, val: Val) => {
    if (locked) return
    onChange(normalizeValues(spec, ctx, { ...values, [key]: val }))
  }

  const editable = controls.filter((c) => !c.readOnly)

  const move = (dir: 1 | -1) => {
    const idx = controls.findIndex((c) => c.key === focus?.key)
    const n = controls.length
    setFocusKey(controls[(idx + dir + n) % n].key)
  }

  const bump = (c: Control, dir: 1 | -1, big = false) => {
    if (c.readOnly) return
    if (c.kind === 'number') {
      const step = big ? (c.bigStep ?? (c.step ?? 1) * 5) : (c.step ?? 1)
      set(c.key, Number(values[c.key]) + dir * step)
    } else {
      const opts = c.options ?? []
      const i = opts.findIndex((o) => o.value === values[c.key])
      const ni = i < 0 ? (dir === 1 ? 0 : opts.length - 1) : Math.min(opts.length - 1, Math.max(0, i + dir))
      set(c.key, opts[ni].value)
    }
  }

  const total = useMemo(() => {
    // czas całkowity zabiegu do odliczania na wyświetlaczu (sek.)
    if (spec.id === 'laser') {
      const p = Number(values.power) || 0
      const d = Number(values.dose) || 0
      return p ? (d * 1 * Number(values.points || 1)) / (p / 1000) : 0
    }
    if (spec.id === 'magnetostimulation') return (Number(values.time) || 10) * 60
    if (spec.id === 'polarized_light') return (Number(values.time) || 5) * 60
    return (Number(values.time) || 10) * 60
  }, [spec.id, values])

  const running = progress !== null && progress < 1
  const finished = progress !== null && progress >= 1
  const remaining = Math.max(0, total * (1 - (progress ?? 0)))
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        {/* ============ KORPUS APARATU ============ */}
        <div className="relative rounded-[30px] p-5 shadow-2xl ring-1 ring-black/10" style={{ background: `linear-gradient(180deg, ${th.body}, ${th.bodyEdge})` }}>
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Fizykoterapia · stanowisko egzaminacyjne</span>
            <span className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${running ? 'bg-green-500 pulse' : finished ? 'bg-sky-500' : 'bg-red-500'}`} />
              {running ? 'ZABIEG TRWA' : finished ? 'KONIEC' : 'GOTOWY'}
            </span>
          </div>
          <div className="rounded-[22px] p-4 shadow-inner" style={{ background: th.bezel, boxShadow: `inset 0 2px 6px rgba(255,255,255,.45), inset 0 -3px 8px rgba(0,0,0,.3), 0 0 0 2px ${th.bezelEdge}` }}>
            <div className="grid grid-cols-[72px_minmax(0,1fr)_88px] items-start gap-3">
              {/* lewe przyciski */}
              <div className="flex flex-col items-center gap-3 pt-3">
                <div className="mb-1 h-3.5 w-3.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" title="Zasilanie" />
                <HwButton theme={th} label="PROGRAM" icon="☰" title="Przywróć ustawienia domyślne programu" onClick={() => !locked && onChange(normalizeValues(spec, ctx, spec.defaults(ctx)))} />
                <HwButton theme={th} label="MEMORY" icon="⌁" disabled title="Pamięć – niedostępna w symulacji" />
              </div>

              {/* WYŚWIETLACZ LCD */}
              <div>
                <div className="mx-auto mb-2 w-fit rounded bg-white px-4 py-0.5 text-[12px] font-bold tracking-wider text-slate-800 shadow">
                  {spec.brand} {spec.model}
                </div>
                <div className="rounded-lg p-2.5 shadow-[inset_0_2px_10px_rgba(0,0,0,.55)] ring-2 ring-black/30" style={{ background: th.lcd }}>
                  {running || finished ? (
                    <div className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-md p-4 text-center font-lcd" style={{ background: th.tile, color: th.tileText }}>
                      <div className="text-xs font-bold tracking-[0.3em]">{finished ? 'ZABIEG ZAKOŃCZONY' : 'ZABIEG W TOKU'}</div>
                      <div className="text-6xl font-black tabular-nums">{mmss(remaining)}</div>
                      <div className="h-3 w-4/5 overflow-hidden rounded-full bg-black/20">
                        <div className="h-full rounded-full" style={{ width: `${Math.round((progress ?? 0) * 100)}%`, background: th.hi }} />
                      </div>
                      <div className="text-xs opacity-80">{spec.applicator}: {summaryLine(spec, values)}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {controls.map((c) => {
                        const t = tileText(c, values)
                        const active = focus?.key === c.key
                        const wide = spec.theme === 'magnet' && c.key === 'shape'
                        return (
                          <button
                            type="button"
                            key={c.key}
                            onClick={() => setFocusKey(c.key)}
                            className={`dev-btn relative flex min-h-[64px] flex-col justify-between rounded-md px-2 py-1.5 text-left font-lcd ${wide ? 'col-span-1' : ''}`}
                            style={{
                              background: th.tile,
                              color: th.tileText,
                              outline: active ? `3px solid ${th.hi}` : '1px solid rgba(0,0,0,.35)',
                              outlineOffset: active ? '1px' : '0',
                              boxShadow: active ? '0 0 12px rgba(255,255,255,.4)' : undefined,
                            }}
                          >
                            <span className="text-[9.5px] font-bold uppercase leading-tight" style={{ color: th.tileLabel }}>
                              {c.label.length > 34 ? c.label.slice(0, 32) + '…' : c.label}
                            </span>
                            <span className="flex items-baseline justify-end gap-1">
                              <span className={`font-black tabular-nums ${t.main.length > 7 ? 'text-base' : 'text-2xl'} ${t.empty ? 'opacity-40' : ''}`}>{t.main}</span>
                              {t.unit && <span className="text-[10px] font-bold opacity-70">{t.unit}</span>}
                            </span>
                            {spec.theme === 'sonic' && c.key === 'int' && <IntensityBar value={Number(values.int)} />}
                            {spec.id === 'magnetotherapy' && c.key === 'shape' && <WaveGlyph shape={String(values.shape)} />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* prawe przyciski */}
              <div className="flex flex-col items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onStart}
                  disabled={running}
                  className="dev-btn flex h-10 w-[84px] flex-col items-center justify-center rounded-full border text-[11px] font-black leading-none tracking-wide text-slate-800 shadow-md disabled:opacity-60"
                  style={{ background: th.btn, borderColor: 'rgba(0,0,0,.3)' }}
                  title="START / STOP"
                >
                  START
                  <span>STOP</span>
                </button>
                <div className="grid grid-cols-1 gap-2">
                  <HwButton theme={th} wide label="SELECT" icon="⇢" onClick={() => move(1)} />
                  <HwButton theme={th} wide label="NEXT" icon="→" onClick={() => move(1)} />
                  <HwButton theme={th} wide label="BACK" icon="←" onClick={() => move(-1)} />
                  <HwButton theme={th} wide label="ENTER" icon="↵" onClick={() => move(1)} />
                </div>
                <div className="mt-1 flex gap-3">
                  <button type="button" className="dev-btn h-10 w-8 rounded-full border text-lg font-black text-slate-700 shadow" style={{ background: th.btn, borderColor: 'rgba(0,0,0,.3)' }} onClick={() => focus && bump(focus, 1)} title="Zwiększ (▲)">
                    ▲
                  </button>
                  <button type="button" className="dev-btn h-10 w-8 rounded-full border text-lg font-black text-slate-700 shadow" style={{ background: th.btn, borderColor: 'rgba(0,0,0,.3)' }} onClick={() => focus && bump(focus, -1)} title="Zmniejsz (▼)">
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* gniazda */}
          <div className="mt-3 flex justify-center gap-24">
            {[0, 1].map((i) => (
              <div key={i} className="h-7 w-7 rounded-full border-4 border-slate-500 bg-slate-300 shadow-inner ring-2 ring-slate-400" style={{ borderColor: i === 1 ? '#d4a20a' : '#64748b' }} />
            ))}
          </div>
        </div>

        {/* ============ PANEL STROJENIA ============ */}
        {focus && <TuningPanel c={focus} values={values} set={set} bump={bump} locked={locked || running} hint={hints?.[focus.key]} />}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onStart}
            disabled={running}
            className="rounded-xl bg-linear-to-b from-emerald-500 to-emerald-700 px-8 py-4 text-lg font-extrabold tracking-wide text-white shadow-lg ring-1 ring-emerald-900/30 transition hover:brightness-110 active:translate-y-px disabled:opacity-60"
          >
            [ URUCHOM ZABIEG (START) ]
          </button>
          {editable.length > 0 && <span className="text-sm text-slate-500">Kliknij kafelek na ekranie, aby edytować parametr; ▲▼ / +/- / suwak zmieniają wartość.</span>}
        </div>
      </div>

      {/* ============ PRAWA KOLUMNA: APLIKATOR + BHP ============ */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">Aplikator – {spec.applicator}</h4>
            {running && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">emisja</span>}
          </div>
          <Applicator spec={spec} values={values} running={running} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h4 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600">BHP i przygotowanie stanowiska</h4>
          <p className="mb-3 text-xs text-slate-500">Zaznacz czynności, które wykonujesz przed zabiegiem. Uwaga – nie wszystkie opcje są prawidłowe.</p>
          <ul className="space-y-1.5">
            {bhp.map((b) => (
              <BhpRow key={b.id} b={b} checked={bhpChecked.includes(b.id)} onToggle={() => !locked && !running && onToggleBhp(b.id)} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function BhpRow({ b, checked, onToggle }: { b: BhpItem; checked: boolean; onToggle: () => void }) {
  return (
    <li>
      <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
        <input type="checkbox" className="mt-1 h-4 w-4 accent-teal-700" checked={checked} onChange={onToggle} />
        <span className="leading-snug text-slate-800">{b.label}</span>
      </label>
    </li>
  )
}

function summaryLine(spec: ConsoleSpec, v: Values): string {
  const parts: string[] = []
  for (const k of ['probe', 'mhz', 'filter', 'method', 'solenoid', 'prog']) if (v[k] !== undefined && v[k] !== '') parts.push(String(v[k]))
  void spec
  return parts.join(' · ') || 'zabieg'
}

function IntensityBar({ value }: { value: number }) {
  const segs = 10
  const lit = Math.min(segs, Math.round((value / 2) * segs))
  const cols = ['#dc2626', '#ea580c', '#f59e0b', '#eab308', '#a3e635', '#84cc16', '#65a30d', '#22c55e', '#16a34a', '#15803d']
  return (
    <span className="mt-0.5 flex gap-px">
      {Array.from({ length: segs }).map((_, i) => (
        <span key={i} className="h-1.5 flex-1 rounded-[1px]" style={{ background: i < lit ? cols[i] : 'rgba(0,0,0,.18)' }} />
      ))}
    </span>
  )
}

function WaveGlyph({ shape }: { shape: string }) {
  const d =
    shape === 'rect'
      ? 'M2,22 L2,6 L18,6 L18,22 L34,22 L34,6 L50,6 L50,22 L58,22'
      : shape === 'tri'
        ? 'M2,22 L14,6 L26,22 L38,6 L50,22 L58,14'
        : shape === 'sin'
          ? 'M2,14 C10,-2 18,-2 26,14 S42,30 50,14 S56,6 58,14'
          : 'M2,14 L58,14'
  return (
    <svg viewBox="0 0 60 28" className="absolute right-1.5 top-1 h-5 w-12 opacity-80">
      <path d={d} fill="none" stroke="#7c2d12" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  )
}

function TuningPanel({ c, values, set, bump, locked, hint }: { c: Control; values: Values; set: (k: string, v: Val) => void; bump: (c: Control, d: 1 | -1, big?: boolean) => void; locked: boolean; hint?: { ok: boolean; expected: string } }) {
  const x = values[c.key]
  const opts = c.options ?? []
  const longLabels = opts.some((o) => o.label.length > 26)
  const chips = c.kind === 'choice' && opts.length <= 4 && !longLabels
  const radio = c.kind === 'choice' && !chips && longLabels
  const stepperChoice = c.kind === 'choice' && !chips && !radio
  const idx = Math.max(0, opts.findIndex((o) => o.value === x))

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-base font-bold text-slate-800">{c.label}</h4>
        {c.unit && !c.readOnly && <span className="text-sm font-semibold text-slate-500">[{c.unit}]</span>}
      </div>
      {c.hint && <p className="mb-2 text-xs text-slate-500">{c.hint}</p>}
      {hint && (
        <p className={`mb-2 rounded-md px-2 py-1 text-xs font-medium ${hint.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          Tryb nauki: {hint.ok ? '✔ wartość zgodna z wzorcem' : '✘ poza wzorcem'} – wzorzec: {hint.expected}
        </p>
      )}
      {c.readOnly && <div className="rounded-lg bg-slate-100 px-4 py-3 font-lcd text-2xl font-bold text-slate-700">{c.display}</div>}
      {c.kind === 'number' && !c.readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-xs font-black text-slate-700" disabled={locked} onClick={() => bump(c, -1, true)} title="Duży krok −">
            ««
          </button>
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-2xl font-black text-slate-700" disabled={locked} onClick={() => bump(c, -1)}>
            −
          </button>
          <div className="min-w-[110px] rounded-lg bg-slate-900 px-4 py-2 text-center font-lcd text-3xl font-black tabular-nums text-emerald-300">{nf(Number(x), c.decimals ?? 0)}</div>
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-2xl font-black text-slate-700" disabled={locked} onClick={() => bump(c, 1)}>
            +
          </button>
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-xs font-black text-slate-700" disabled={locked} onClick={() => bump(c, 1, true)} title="Duży krok +">
            »»
          </button>
          <input type="range" disabled={locked} className="min-w-[160px] flex-1" min={c.min} max={c.max} step={c.step} value={Number(x)} onChange={(e) => set(c.key, Number(e.target.value))} />
        </div>
      )}
      {chips && (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => (
            <button key={String(o.value)} disabled={locked} onClick={() => set(c.key, o.value)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${x === o.value ? 'bg-teal-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
      {radio && (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {opts.map((o) => (
            <button key={String(o.value)} disabled={locked} onClick={() => set(c.key, o.value)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${x === o.value ? 'border-teal-600 bg-teal-50 font-semibold text-teal-900' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
      {stepperChoice && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-2xl font-black text-slate-700" disabled={locked} onClick={() => bump(c, -1)}>
            −
          </button>
          <div className="min-w-[130px] rounded-lg bg-slate-900 px-4 py-2 text-center font-lcd text-2xl font-black text-emerald-300">{opts.find((o) => o.value === x)?.label ?? '---'}</div>
          <button className="dev-btn h-11 w-11 rounded-lg bg-slate-200 text-2xl font-black text-slate-700" disabled={locked} onClick={() => bump(c, 1)}>
            +
          </button>
          <input type="range" disabled={locked} className="min-w-[160px] flex-1" min={0} max={opts.length - 1} step={1} value={idx} onChange={(e) => set(c.key, opts[Number(e.target.value)].value)} />
        </div>
      )}
    </div>
  )
}
