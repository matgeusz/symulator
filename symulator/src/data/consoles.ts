// Specyfikacje konsol aparatów dla 8 modalności: kontrolki, elementy BHP (w tym pułapki)
// oraz funkcje oceny parametrów względem wzorca z bazy wiedzy (scenarios.ts / PDF).
import type { AnatomicalLocation, ModalityData, PatientScenario, PhaseType } from './scenarios'
import { ANATOMICAL_LOCATIONS, MODALITIES_DB } from './scenarios'
import { US_METHOD_BY_SCENARIO } from './meta'

export type Val = string | number
export type Values = Record<string, Val>

export interface Ctx {
  scenario: PatientScenario
  loc: AnatomicalLocation
  modality: ModalityData
  phase: PhaseType
  ageMod: boolean
}

export function makeCtx(scenario: PatientScenario): Ctx {
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === scenario.locationId)!
  return {
    scenario,
    loc,
    modality: MODALITIES_DB[scenario.modalityId],
    phase: scenario.phase,
    ageMod: !!scenario.requiresDoseModification,
  }
}

export interface Opt {
  value: Val
  label: string
  short?: string
}

export interface Control {
  key: string
  label: string
  unit?: string
  kind: 'number' | 'choice'
  min?: number
  max?: number
  step?: number
  bigStep?: number
  decimals?: number
  options?: Opt[]
  readOnly?: boolean
  display?: string
  hint?: string
}

export interface BhpItem {
  id: string
  label: string
  required?: boolean
  trap?: boolean
  critical?: boolean
  why: string
  when?: (v: Values) => boolean
}

export type CheckGroup = 'Kwalifikacja' | 'Ułożenie i palpacja' | 'Mapa anatomiczna' | 'Parametry aparatu' | 'BHP i przygotowanie'

export interface Check {
  id: string
  group: CheckGroup
  label: string
  ok: boolean
  student: string
  expected: string
  why?: string
  points: number
  critical?: boolean
  info?: boolean
}

export type ThemeKey = 'laser' | 'sonic' | 'magnet' | 'sollux' | 'polar' | 'cryo' | 'thermo' | 'viofor'

export interface ConsoleSpec {
  id: string
  brand: string
  model: string
  theme: ThemeKey
  controls: (ctx: Ctx, v: Values) => Control[]
  defaults: (ctx: Ctx) => Values
  bhp: (ctx: Ctx) => BhpItem[]
  evaluate: (ctx: Ctx, v: Values) => Check[]
  /** krótkie podsumowanie wzorca – używane w protokole */
  applicator: string
}

// ------------------------------------------------------------------ helpers
const EPS = 1e-6
const inR = (x: number, lo: number, hi: number) => x >= lo - EPS && x <= hi + EPS
export const nf = (x: number, d = 1) => Number(x).toLocaleString('pl-PL', { maximumFractionDigits: d, minimumFractionDigits: 0 })
const rng = (lo: number, hi: number, unit = '', d = 2) => (lo === hi ? `${nf(lo, d)} ${unit}`.trim() : `${nf(lo, d)} – ${nf(hi, d)} ${unit}`.trim())
const num = (x: Val | undefined) => (typeof x === 'number' ? x : Number(x))

function C(
  id: string,
  label: string,
  ok: boolean,
  student: string,
  expected: string,
  why?: string,
  opt: { points?: number; critical?: boolean; info?: boolean; group?: CheckGroup } = {},
): Check {
  return {
    id,
    group: opt.group ?? 'Parametry aparatu',
    label,
    ok: opt.info ? true : ok,
    student,
    expected,
    why,
    points: opt.info ? 0 : (opt.points ?? 1),
    critical: opt.critical,
    info: opt.info,
  }
}

const optLabel = (c: Control | undefined, v: Val | undefined) => {
  if (v === undefined || v === '') return '— nie wybrano —'
  const o = c?.options?.find((x) => x.value === v)
  return o ? o.label : String(v)
}

function numCtl(key: string, label: string, unit: string, min: number, max: number, step: number, decimals = 0, bigStep?: number, hint?: string): Control {
  return { key, label, unit, kind: 'number', min, max, step, decimals, bigStep: bigStep ?? step * 5, hint }
}
function choiceCtl(key: string, label: string, options: Opt[], unit?: string, hint?: string): Control {
  return { key, label, unit, kind: 'choice', options, hint }
}

export const ctlOf = (spec: ConsoleSpec, ctx: Ctx, v: Values, key: string) => spec.controls(ctx, v).find((c) => c.key === key)

const isFace = (loc: AnatomicalLocation) => loc.id === 'nerw_twarzowy' || loc.id === 'nerw_trojdzielny'
const isSpine = (loc: AnatomicalLocation) => loc.regionGroup === 'kregoslup'
const isScar = (ctx: Ctx) => ctx.loc.id === 'staw_kolanowy_blizna'
const isHandFoot = (loc: AnatomicalLocation) =>
  ['nadgarstek_reka_dloniowa', 'nadgarstek_reka_grzbietowa', 'staw_skokowy_ostroga', 'staw_skokowy_kostka'].includes(loc.id)

// ================================================================== LASER
const LASER_DOSE: Record<PhaseType, [number, number]> = { ostry: [0.1, 3], podostry: [3, 6], przewlekly: [6, 12] }
const LASER_FREQ = [1, 5, 10, 50, 100, 200, 500, 1000, 2000, 3000, 5000, 10000, 0]
const POINT_AREA_CM2 = 1

export function laserDoseRange(ctx: Ctx): [number, number] {
  const [lo, hi] = LASER_DOSE[ctx.phase]
  return ctx.ageMod ? [Math.round(lo * 0.4 * 100) / 100, Math.round(hi * 0.7 * 100) / 100] : [lo, hi]
}
function laserFreqOk(phase: PhaseType, f: number) {
  if (phase === 'ostry') return f > 0 && f <= 500
  if (phase === 'podostry') return f >= 50 && f <= 3000
  return f === 0 || inR(f, 1000, 5000)
}
const laserFreqText = (phase: PhaseType) =>
  phase === 'ostry' ? '1 – 500 Hz (niższe w stanie ostrym)' : phase === 'podostry' ? '50 – 3000 Hz (pośrednie)' : '1000 – 5000 Hz lub fala ciągła CW (wyższe w stanie przewlekłym)'
const fmtFreq = (f: number) => (f === 0 ? 'CW (constans)' : `${nf(f, 0)} Hz`)
const fmtMin = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

const laser: ConsoleSpec = {
  id: 'laser',
  brand: 'LASERTRONIC',
  model: 'LT-2',
  theme: 'laser',
  applicator: 'Sonda laserowa',
  controls: (_ctx, v) => {
    const probe = v.probe
    const powers = probe === 'IR' ? [50, 100, 200, 300, 400, 500] : probe === 'R' ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] : [10, 30, 50, 100, 200, 300, 400, 500, 600]
    const p = num(v.power) || 0
    const d = num(v.dose) || 0
    const sec = p > 0 ? (d * POINT_AREA_CM2) / (p / 1000) : 0
    return [
      choiceCtl('probe', 'Sonda', [
        { value: 'R', label: 'Sonda czerwona R (500–760 nm)', short: 'R' },
        { value: 'IR', label: 'Sonda podczerwona IR (800–950 nm)', short: 'IR' },
      ]),
      choiceCtl('power', 'Moc P', powers.map((x) => ({ value: x, label: `${x} mW`, short: String(x) })), 'mW'),
      numCtl('dose', 'Dawka (gęstość energii)', 'J/cm²', 0.1, 15, 0.1, 1, 1),
      choiceCtl('freq', 'Częstotliwość impulsów', LASER_FREQ.map((x) => ({ value: x, label: fmtFreq(x), short: x === 0 ? 'CW' : String(x) })), 'Hz'),
      numCtl('points', 'Liczba punktów / pól (S = 1 cm²)', 'pól', 1, 30, 1, 0, 5),
      { key: 'time', label: 'Czas na pole (Ep = P·t / S)', unit: 'min:s', kind: 'number', readOnly: true, display: p && d ? fmtMin(sec) : '--:--', hint: 'Wyliczany automatycznie: t = Ep · S / P (im większa moc, tym krótszy czas).' },
      numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 30, 1, 0, 5),
    ]
  },
  defaults: () => ({ probe: '', power: 100, dose: 1.0, freq: 100, points: 1, series: 10 }),
  bhp: () => [
    { id: 'goggles', label: 'Okulary ochronne z osłonkami bocznymi (zdezynfekowane) dla pacjenta i terapeuty', required: true, why: 'Okulary ochronne z osłonkami bocznymi są niezbędne dla każdego w pomieszczeniu.' },
    { id: 'contact90', label: 'Sonda odtłuszczona i zdezynfekowana, przyłożona kontaktowo pod kątem 90°', required: true, why: 'Kontakt pod kątem 90° ogranicza straty energii (odbicie); sonda musi być odtłuszczona i zdezynfekowana.' },
    { id: 'dry', label: 'Pole zabiegowe czyste i suche', required: true, why: 'W technice stabilnej i labilnej skóra musi być sucha i czysta.' },
    { id: 'jewelry', label: 'Terapeuta bez metalowych ozdób (zegarek, pierścionki)', required: true, why: 'Osoba pracująca z laserem nie może mieć metalowych ozdób (odbicia wiązki).' },
    { id: 'room', label: 'Pracownia wydzielona, ściany matowe i jasne, ostrzeżenie o laserze na drzwiach', required: true, why: 'Wymogi pomieszczenia: ściany matowe, jasne, oznakowanie i znaki ostrzegawcze.' },
    { id: 'overglasses', label: 'Okulary ochronne nałożone na okulary korekcyjne pacjenta', trap: true, why: 'Okularów ochronnych NIE nakładamy na okulary korekcyjne.' },
    { id: 'eyes', label: 'Skierowanie wiązki w okolicę gałki ocznej (np. nerwoból okolicy oka)', trap: true, critical: true, why: 'Naświetlanie gałek ocznych jest bezwzględnie zabronione.' },
    { id: 'gel', label: 'Pole zabiegowe posmarowane żelem lub maścią przed aplikacją', trap: true, why: 'Skóra pod laserem musi być sucha i czysta.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const expectedProbe = isScar(ctx) ? 'R' : 'IR'
    const probeLabel = (p: string) => (p === 'R' ? 'Sonda czerwona R (500–760 nm, 30–60 mW)' : p === 'IR' ? 'Sonda podczerwona IR (800–950 nm, 50–500 mW)' : '— nie wybrano —')
    out.push(C('probe', 'Dobór sondy', v.probe === expectedProbe, probeLabel(String(v.probe)), probeLabel(expectedProbe), expectedProbe === 'IR' ? 'Struktury głębokie (mięśnie, stawy, ścięgna, nerwy) – sonda IR; czerwona penetruje tylko skórę i błony śluzowe.' : 'Skóra / blizna – płytka penetracja, sonda czerwona.'))
    const p = num(v.power)
    const pOk = v.probe === 'R' ? inR(p, 30, 60) : v.probe === 'IR' ? [50, 100, 200, 300, 400, 500].includes(p) : false
    out.push(C('power', 'Moc lasera', pOk, `${p} mW`, v.probe === 'R' ? '30 – 60 mW' : '50 / 100 / 200 / 300 / 400 / 500 mW (w LLLT nie przekraczamy 500 mW)', 'Moc musi mieścić się w zakresie wybranej sondy.'))
    const [lo, hi] = laserDoseRange(ctx)
    const d = num(v.dose)
    out.push(
      C('dose', 'Dawka (J/cm²)', inR(d, lo, hi), `${nf(d, 1)} J/cm²`, `${rng(lo, hi, 'J/cm²', 2)}${ctx.ageMod ? ' (po redukcji o 30–60%)' : ''}`,
        ctx.ageMod ? ctx.scenario.modificationReason : `Stan ${ctx.phase === 'ostry' ? 'ostry: 0,1–3' : ctx.phase === 'podostry' ? 'podostry: 3–6' : 'przewlekły: 6–12'} J/cm².`, { points: 2 }),
    )
    const f = num(v.freq)
    out.push(C('freq', 'Częstotliwość impulsów', laserFreqOk(ctx.phase, f), fmtFreq(f), laserFreqText(ctx.phase), 'W stanach ostrych niższe częstotliwości, w przewlekłych wyższe (do 5000 Hz) lub fala ciągła.'))
    const energy = d * POINT_AREA_CM2 * num(v.points)
    out.push(C('energy', 'Całkowita energia jednorazowa', energy <= 200, `${nf(energy, 1)} J`, '≤ 200 J', 'Ogólna dawka energii nie powinna przekroczyć 200 J.'))
    out.push(C('series', 'Liczba zabiegów w serii', true, `${v.series}`, 'brak wartości w bazie', 'Baza nie podaje długości serii dla laseroterapii.', { info: true }))
    return out
  },
}

// ================================================================== ULTRADŹWIĘKI
const US_MHZ: Record<string, number[]> = {
  nerw_twarzowy: [3], nerw_trojdzielny: [3], kregoslup_szyjny_zwoj: [1], kregoslup_piersiowy: [1], kregoslup_ledzwiowy: [1],
  staw_ramienny_przod: [1], staw_ramienny_bok: [1], staw_ramienny_tyl: [1],
  staw_lokciowy_tenisista: [1, 3], staw_lokciowy_golfista: [1, 3], staw_lokciowy_przykurcz: [1, 3],
  nadgarstek_reka_dloniowa: [3], nadgarstek_reka_grzbietowa: [3],
  staw_biodrowy_bok: [1], staw_biodrowy_przod: [1], staw_biodrowy_tyl: [1],
  staw_kolanowy_szpara: [1], staw_kolanowy_blizna: [3], staw_skokowy_kostka: [3], staw_skokowy_ostroga: [1, 3],
}
const US_WATER_OK = ['nadgarstek_reka_dloniowa', 'nadgarstek_reka_grzbietowa', 'staw_lokciowy_przykurcz', 'staw_skokowy_ostroga']

export function usExpectedMethods(ctx: Ctx): string[] {
  const m = US_METHOD_BY_SCENARIO[ctx.scenario.id]
  if (m) return m
  if (ctx.loc.id === 'kregoslup_szyjny_zwoj') return ['segmentarna', 'odgłowowy']
  if (ctx.loc.id === 'kregoslup_piersiowy') return ['segmentarna', 'lokalna']
  if (ctx.loc.id === 'kregoslup_ledzwiowy') return ['segmentarna', 'odogonowy']
  return []
}

const US_DUTY_OK: Record<PhaseType, string[]> = { ostry: ['1:8', '1:16'], podostry: ['1:2', '1:4', '1:8'], przewlekly: ['1:1', '1:2', '1:4'] }

function usIntRange(ctx: Ctx, v: Values): [number, number] {
  let [lo, hi]: [number, number] = ctx.phase === 'ostry' ? [0.05, 0.4] : ctx.phase === 'podostry' ? [0.2, 0.7] : [0.3, 1.0]
  if (isScar(ctx) || isFace(ctx.loc)) [lo, hi] = [0.05, 0.2]
  if (v.method === 'odgłowowy') [lo, hi] = [0.1, 0.2]
  if (v.tech === 'stabilna') hi = Math.min(hi, 0.5)
  if (lo > hi) lo = hi
  return [lo, hi]
}
function usTimeRange(ctx: Ctx, v: Values): [number, number] {
  let [lo, hi]: [number, number] = ctx.phase === 'ostry' ? [1, 5] : ctx.phase === 'podostry' ? [3, 9] : [5, 15]
  if (isScar(ctx) || isFace(ctx.loc)) [lo, hi] = [1, 5]
  if (v.method === 'segmentarna') [lo, hi] = [2, 2]
  if (v.tech === 'stabilna') hi = Math.min(hi, 5)
  if (lo > hi) lo = hi
  return [lo, hi]
}

const ultrasound: ConsoleSpec = {
  id: 'ultrasound',
  brand: 'SONOTRONIC',
  model: 'US-2',
  theme: 'sonic',
  applicator: 'Głowica UD',
  controls: (ctx, v) => {
    const list: Control[] = [
      choiceCtl('mhz', 'Głowica – częstotliwość fali', [
        { value: 1, label: '1 MHz (głęboka penetracja)', short: '1 MHz' },
        { value: 3, label: '3 MHz (płytka penetracja)', short: '3 MHz' },
      ], 'MHz'),
      choiceCtl('tech', 'Technika aplikacji', [
        { value: 'labilna', label: 'Labilna (ruchoma)', short: 'LABIL.' },
        { value: 'stabilna', label: 'Stabilna (punktowa)', short: 'STAB.' },
        { value: 'woda', label: 'Środowisko wodne (podwodna)', short: 'WODA' },
      ]),
    ]
    if (isSpine(ctx.loc)) {
      list.push(
        choiceCtl('method', 'Metoda w kręgosłupie', [
          { value: 'lokalna', label: 'Lokalna (przykręgosłupowo)', short: 'LOK.' },
          { value: 'segmentarna', label: 'Segmentarna (2 cm od wyrostków, 2 min)', short: 'SEGM.' },
          { value: 'odgłowowy', label: 'Schemat odgłowowy (Th8 → C3)', short: 'ODGŁ.' },
          { value: 'odogonowy', label: 'Schemat odogonowy (krzyżowa → Th8)', short: 'ODOG.' },
        ]),
      )
    }
    list.push(
      choiceCtl('coupling', 'Środek sprzęgający / ultrafonoforeza', [
        { value: 'zel', label: 'Żel do UD', short: 'ŻEL' },
        { value: 'olej', label: 'Olej parafinowy', short: 'OLEJ' },
        { value: 'wazelina', label: 'Wazelina', short: 'WAZEL.' },
        { value: 'woda', label: 'Woda (odgazowana)', short: 'WODA' },
        { value: 'masc', label: 'Maść lecznicza (ultrafonoforeza)', short: 'MAŚĆ' },
        { value: 'brak', label: 'Brak środka sprzęgającego', short: 'BRAK' },
      ]),
      numCtl('int', 'Natężenie fali', 'W/cm²', 0.05, 2, 0.05, 2, 0.25),
      choiceCtl('duty', 'Współczynnik wypełnienia impulsu', [
        { value: '1:1', label: '1:1 (fala ciągła, 100%)', short: '1:1' },
        { value: '1:2', label: '1:2 (50%)', short: '1:2' },
        { value: '1:4', label: '1:4 (25%)', short: '1:4' },
        { value: '1:8', label: '1:8 (12,5%)', short: '1:8' },
        { value: '1:16', label: '1:16 (6,25%)', short: '1:16' },
      ]),
      numCtl('time', 'Czas zabiegu', 'min', 1, 20, 1, 0, 5),
    )
    if (v.tech === 'woda') list.push(numCtl('wtemp', 'Temperatura wody', '°C', 25, 45, 1, 0, 5))
    list.push(numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 20, 1, 0, 5))
    return list
  },
  defaults: () => ({ mhz: '', tech: '', method: '', coupling: '', int: 0.5, duty: '', time: 5, wtemp: 30, series: 8 }),
  bhp: () => [
    { id: 'skin', label: 'Skóra w polu zabiegowym obejrzana – ciągłość tkanki zachowana, brak implantów w polu', required: true, why: 'Przerwanie ciągłości tkanki i metalowe implanty w polu zabiegowym są przeciwwskazaniem.' },
    { id: 'coupling', label: 'Środek sprzęgający naniesiony na skórę/głowicę (brak powietrza między głowicą a skórą)', required: true, why: 'Środki sprzęgające zapobiegają odbiciu fali; głowica pracuje wyłącznie z nimi.' },
    { id: 'motion', label: 'Głowica w nieprzerwanym ruchu, mały nacisk', required: true, why: 'Nieprzerwany ruch głowicą ogranicza przegrzanie (zwłaszcza na granicy tkanek).' },
    { id: 'disinfect', label: 'Po zabiegu osuszenie skóry i odkażenie głowicy', required: true, why: 'Zasady BHP: po zabiegu osuszenie skóry i odkażenie głowicy.' },
    { id: 'self', label: 'Pacjent samodzielnie przesuwa głowicę po polu zabiegowym', trap: true, why: 'Bezwzględny zakaz samodzielnej aplikacji przez pacjenta.' },
    { id: 'ointment', label: 'Ultrafonoforeza z maścią leczniczą na polu zabiegowym', trap: true, critical: true, why: 'W ultrafonoforezie ZAKAZ stosowania maści – grozi oparzeniem! Głębokość penetracji leku zależy od czasu, nie od natężenia.' },
    { id: 'dry', label: 'Praca głowicą „na sucho”, aby nie zabrudzić skóry', trap: true, why: 'Bez środka sprzęgającego fala odbija się od powietrza, a głowica ulega przegrzaniu.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const mhzOk = US_MHZ[ctx.loc.id] ?? [1]
    out.push(
      C('mhz', 'Częstotliwość głowicy', mhzOk.includes(num(v.mhz)), v.mhz ? `${v.mhz} MHz` : '— nie wybrano —', mhzOk.map((x) => `${x} MHz`).join(' lub '), '1 MHz – głęboka penetracja (stawy, mięśnie głębokie, kręgosłup); 3 MHz – płytka (skóra, blizny, struktury powierzchowne).', { points: 2 }),
    )
    const waterEligible = US_WATER_OK.includes(ctx.loc.id)
    const techOk = v.tech === 'labilna' || v.tech === 'stabilna' || (v.tech === 'woda' && waterEligible)
    out.push(
      C('tech', 'Technika aplikacji', !!techOk, String(v.tech || '— nie wybrano —'), waterEligible ? 'labilna lub środowisko wodne (ręce, stopy, przykurcz łokcia)' : 'labilna (3 pasy 10–12 cm lub kółka) – stabilna tylko do 5 min, ≤ 0,5 W/cm², impulsowo', 'Środowisko wodne dotyczy rąk, stóp i przykurczu stawu łokciowego. Technika stabilna – tylko punktowo (zwoje, złogi).'),
    )
    if (isSpine(ctx.loc)) {
      const exp = usExpectedMethods(ctx)
      out.push(C('method', 'Metoda w kręgosłupie', exp.includes(String(v.method)), String(v.method || '— nie wybrano —'), exp.join(' lub '), ctx.scenario.diagnosis.includes('schematu') ? `Scenariusz: ${ctx.scenario.diagnosis}` : 'Metoda segmentarna: 2 cm od wyrostków kolczystych, 2 min, do C3.'))
    }
    const coupling = String(v.coupling)
    const couplingOk = v.tech === 'woda' ? coupling === 'woda' : ['zel', 'olej', 'wazelina'].includes(coupling)
    out.push(
      C('coupling', 'Środek sprzęgający', couplingOk, optLabel(ultrasound.controls(ctx, v).find((c) => c.key === 'coupling'), v.coupling), v.tech === 'woda' ? 'woda odgazowana 37°C' : 'żel, olej parafinowy lub wazelina', coupling === 'masc' ? 'ZAKAZ stosowania maści w ultrafonoforezie (grozi oparzeniem)!' : 'Środki sprzęgające: żel, olej parafinowy, wazelina, woda.', { critical: coupling === 'masc', points: 2 }),
    )
    if (v.tech === 'woda') {
      out.push(C('wtemp', 'Temperatura wody w kąpieli', inR(num(v.wtemp), 36, 38), `${v.wtemp} °C`, '37°C (woda odgazowana, naczynie plastikowe/porcelanowe)', 'Zabiegi w środowisku wodnym: odgazowana woda o temperaturze 37°C.'))
    }
    const [ilo, ihi] = usIntRange(ctx, v)
    const it = num(v.int)
    out.push(C('int', 'Natężenie fali', inR(it, ilo, ihi), `${nf(it, 2)} W/cm²`, rng(ilo, ihi, 'W/cm²'), isScar(ctx) ? 'Skóra i blizny: 0,1–0,2 W/cm², obszar maksymalnie rozciągnięty.' : v.method === 'odgłowowy' ? 'Schemat odgłowowy: 0,1–0,2 W/cm².' : ctx.phase === 'ostry' ? 'Stan ostry: natężenia słabe (0,05–0,4 W/cm²).' : 'W praktyce stosuje się niemal wyłącznie natężenia słabe i średnie (do 0,7 W/cm²; Miki–Kasprzak do 1,5).', { points: 2 }))
    let dutyOk = [...US_DUTY_OK[ctx.phase]]
    if (v.tech === 'stabilna') dutyOk = dutyOk.filter((d) => d !== '1:1')
    out.push(C('duty', 'Współczynnik wypełnienia impulsu', dutyOk.includes(String(v.duty)), String(v.duty || '— nie wybrano —'), dutyOk.join(' / '), ctx.phase === 'ostry' ? '1:8 i 1:16 – brak efektu cieplnego (stany ostre!).' : ctx.phase === 'podostry' ? 'Impulsowy 1:2–1:8 – delikatny efekt cieplny.' : '1:1 – głębokie przegrzanie; 1:2 i 1:4 – delikatny efekt cieplny. Metoda stabilna wyłącznie impulsowo.', { points: 2 }))
    const [tlo, thi] = usTimeRange(ctx, v)
    out.push(C('time', 'Czas zabiegu', inR(num(v.time), tlo, thi), `${v.time} min`, rng(tlo, thi, 'min', 0), v.method === 'segmentarna' ? 'Nadźwiękawianie segmentarne: 2 min.' : v.tech === 'stabilna' ? 'Metoda stabilna: maksymalnie 5 min.' : 'Czas krótki 1–3, średni 4–9, długi 10–15 min – dobrany do fazy.'))
    const [slo, shi] = ctx.phase === 'ostry' ? [1, 6] : [8, 12]
    out.push(C('series', 'Liczba zabiegów w serii', inR(num(v.series), slo, shi), `${v.series}`, rng(slo, shi, 'zabiegów', 0), ctx.phase === 'ostry' ? 'Stany ostre: 6 lub mniej zabiegów, codziennie.' : 'Stany przewlekłe: ok. 10 zabiegów z przerwą 1–2 dni.'))
    return out
  },
}

// ================================================================== MAGNETOTERAPIA
const SOLENOID_MAX: Record<string, number> = { '500': 2.5, '315': 5, '200': 10 }
const MAG_IND: Record<PhaseType, [number, number]> = { ostry: [0.5, 3], podostry: [3, 5], przewlekly: [6, 10] }
const MAG_FREQ: Record<PhaseType, [number, number]> = { ostry: [1, 5], podostry: [5, 20], przewlekly: [20, 50] }

export function magSolenoid(loc: AnatomicalLocation): number {
  if (loc.regionGroup === 'kregoslup') return 500
  if (loc.regionGroup === 'konczyna_dolna') return 315
  return 200
}
export function magShape(ctx: Ctx): 'rect' | 'tri' | 'sin' {
  const t = `${ctx.scenario.diagnosis} ${ctx.scenario.medicalHistory}`.toLowerCase()
  if (/złam|osteopor|kości łódecz|staw rzekomy/.test(t)) return 'rect'
  if (/zwyrodnien|ścięg|więzad|chrząst|entezo|gonartroz|tendin|skręcen/.test(t) && !isSpine(ctx.loc)) return 'tri'
  return 'sin'
}
const SHAPE_LABEL = { rect: 'Prostokątny', tri: 'Trójkątny', sin: 'Sinusoidalny' }

const magnetotherapy: ConsoleSpec = {
  id: 'magnetotherapy',
  brand: 'MAGNETRONIC',
  model: 'MF-12',
  theme: 'magnet',
  applicator: 'Solenoid',
  controls: (_ctx, v) => {
    const bmax = v.solenoid ? SOLENOID_MAX[String(v.solenoid)] : 10
    return [
      choiceCtl('solenoid', 'Solenoid (średnica)', [
        { value: 500, label: 'Ø 500 mm – tułów (100% = 2,5 mT)', short: '500 mm' },
        { value: 315, label: 'Ø 315 mm – kończyny dolne (100% = 5,0 mT)', short: '315 mm' },
        { value: 200, label: 'Ø 200 mm – kończyny górne (100% = 10 mT)', short: '200 mm' },
      ], 'mm'),
      choiceCtl('shape', 'Kształt impulsu', [
        { value: 'rect', label: 'Prostokąt', short: '⊓' },
        { value: 'tri', label: 'Trójkąt', short: '△' },
        { value: 'sin', label: 'Sinusoida', short: '∿' },
      ]),
      numCtl('freq', 'Częstotliwość', 'Hz', 1, 100, 1, 0, 5),
      numCtl('ind', 'Indukcja magnetyczna (pełna dawka)', 'mT', 0.5, bmax, 0.5, 1, 1, v.solenoid ? `Maksimum dla wybranego solenoidu: ${nf(bmax, 1)} mT` : 'Najpierw wybierz solenoid'),
      choiceCtl('mode', 'Tryb', [
        { value: 'imp', label: 'Impulsowy', short: 'IMP.' },
        { value: 'ciag', label: 'Ciągły', short: 'CIĄG.' },
      ]),
      numCtl('pause', 'Przerwa (puls)', 's', 0.5, 5, 0.5, 1, 0.5),
      numCtl('p1', 'Intensywność – 1. zabieg', '%', 10, 100, 10, 0, 30),
      numCtl('p2', 'Intensywność – 2. zabieg', '%', 10, 100, 10, 0, 30),
      numCtl('p3', 'Intensywność – 3. i kolejne', '%', 10, 100, 10, 0, 30),
      numCtl('time', 'Czas zabiegu', 'min', 5, 45, 5, 0, 10),
      numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 30, 1, 0, 5),
      numCtl('daily', 'Zabiegi codziennie (początek serii)', 'zab.', 1, 15, 1, 0, 5),
    ]
  },
  defaults: () => ({ solenoid: '', shape: '', freq: 10, ind: 2, mode: 'imp', pause: 3, p1: 100, p2: 100, p3: 100, time: 20, series: 10, daily: 3 }),
  bhp: () => [
    { id: 'metal', label: 'Pacjent odłożył zegarek, telefon komórkowy, aparat słuchowy i przedmioty metalowe', required: true, why: 'Pole magnetyczne zakłóca działanie urządzeń – pacjent zdejmuje zegarek, telefon, aparat słuchowy i luźne przedmioty metalowe.' },
    { id: 'magnet', label: 'Sprawdzono sprawność aparatu: magnes włożony do cewki drga po włączeniu', required: true, why: 'Przed zabiegiem sprawdzamy sprawność aparatu, wkładając magnes do wnętrza cewki.' },
    { id: 'implants', label: 'Potwierdzono brak ELEKTRONICZNYCH implantów (rozrusznik, pompa insulinowa, implant ślimakowy)', required: true, why: 'Elektroniczne implanty to przeciwwskazanie; metalowe implanty nieelektroniczne nie przeszkadzają.' },
    { id: 'time', label: 'Zabieg zaplanowany o stałej porze dnia, nie wieczorem', required: true, why: 'Zabiegi wykonujemy o tej samej porze, unikamy godzin wieczornych (bezsenność, zwłaszcza u starszych).' },
    { id: 'evening', label: 'Zabieg zaplanowany na godzinę 21:00 (pacjent zdąży po pracy)', trap: true, why: 'Nie w godzinach wieczornych – ryzyko bezsenności.' },
    { id: 'cast', label: 'Zdjęcie opatrunku gipsowego i odzieży przed zabiegiem, aby pole przeniknęło', trap: true, why: 'Pole przenika przez gips, bandaż i odzież – nie zdejmujemy opatrunku.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const sol = magSolenoid(ctx.loc)
    out.push(C('solenoid', 'Dobór solenoidu', num(v.solenoid) === sol, v.solenoid ? `Ø ${v.solenoid} mm` : '— nie wybrano —', `Ø ${sol} mm`, '500 mm – tułów, 315 mm – kończyny dolne, 200 mm – kończyny górne.', { points: 2 }))
    const shape = magShape(ctx)
    const sOk = v.shape === shape || v.shape === 'sin'
    out.push(C('shape', 'Kształt impulsu', sOk, SHAPE_LABEL[v.shape as keyof typeof SHAPE_LABEL] ?? '— nie wybrano —', `${SHAPE_LABEL[shape]}${shape !== 'sin' ? ' (sinusoida dopuszczalna jako uniwersalna)' : ''}`, 'Prostokątny – kości; trójkątny – chrząstka, ścięgna, więzadła; sinusoidalny – tkanka nerwowa i mięśniowa (najbardziej uniwersalny).'))
    const [flo, fhi] = MAG_FREQ[ctx.phase]
    out.push(C('freq', 'Częstotliwość', inR(num(v.freq), flo, fhi), `${v.freq} Hz`, rng(flo, fhi, 'Hz', 0), 'Stan ostry 1–5 Hz, podostry 5–20 Hz, przewlekły 20–50 Hz.'))
    const bmax = v.solenoid ? SOLENOID_MAX[String(v.solenoid)] : SOLENOID_MAX[String(sol)]
    const [ilo0, ihi0] = MAG_IND[ctx.phase]
    const ilo = Math.min(ilo0, bmax)
    const ihi = Math.min(ihi0, bmax)
    out.push(C('ind', 'Indukcja magnetyczna', inR(num(v.ind), ilo, ihi), `${nf(num(v.ind), 1)} mT`, rng(ilo, ihi, 'mT', 1), `Stan ${ctx.phase === 'ostry' ? 'ostry 0,5–3' : ctx.phase === 'podostry' ? 'podostry 3–5' : 'przewlekły 6–10'} mT, ograniczone zakresem solenoidu (100% = ${nf(bmax, 1)} mT).`, { points: 2 }))
    out.push(C('prog', 'Progresja dawki w serii (1. → 2. → 3. zabieg)', num(v.p1) === 40 && num(v.p2) === 70 && num(v.p3) === 100, `${v.p1}% → ${v.p2}% → ${v.p3}%`, '40% → 70% → 100%', '1. zabieg: 40% przyjętej dawki, 2. zabieg: 70%, od 3. zabiegu pełna dawka.', { points: 2 }))
    out.push(C('time', 'Czas zabiegu', inR(num(v.time), 15, 30), `${v.time} min`, '15 – 30 min', 'Czas zabiegu: 15–30 min.'))
    out.push(C('series', 'Liczba zabiegów w serii', inR(num(v.series), 5, 15), `${v.series}`, 'do 15 zabiegów', 'Seria do 15 zabiegów.'))
    out.push(C('daily', 'Zabiegi codzienne na początku serii', inR(num(v.daily), 5, 10), `${v.daily}`, '5 – 10 (potem co 2–3 dni)', 'Pierwsze 5–10 zabiegów codziennie, następnie co 2–3 dni.'))
    out.push(C('pause', 'Tryb i przerwa (puls)', true, `${v.mode === 'imp' ? 'impulsowy' : 'ciągły'}, przerwa ${nf(num(v.pause), 1)} s`, 'przerwa od 3 s, skracana do 0,5 s', 'Zabiegi rozpoczynamy od przerwy 3 s i stopniowo skracamy do 0,5 s.', { info: true }))
    return out
  },
}

// ================================================================== MAGNETOSTYMULACJA
export function viEffectiveProgram(ctx: Ctx): string {
  const t = `${ctx.scenario.medicalHistory} ${ctx.scenario.daysSinceOnset}`.toLowerCase()
  if (/nadwrażliw/.test(t)) return 'P1'
  if (/niska wrażliwo|słabe efekty|słabe\b/.test(t)) return 'P3'
  return 'P2'
}
const VI_WEEK: Record<number, { m: string; i: number }> = { 1: { m: 'M2', i: 6 }, 2: { m: 'M3', i: 9 }, 3: { m: 'M1', i: 12 } }

const magnetostimulation: ConsoleSpec = {
  id: 'magnetostimulation',
  brand: 'VIOFOR',
  model: 'JPS-SIM',
  theme: 'viofor',
  applicator: 'Aplikator Viofor',
  controls: () => [
    choiceCtl('prog', 'Program (P)', [
      { value: 'P1', label: 'P1 – dla osób nadwrażliwych', short: 'P1' },
      { value: 'P2', label: 'P2 – podstawowy program terapeutyczny', short: 'P2' },
      { value: 'P3', label: 'P3 – niska wrażliwość / słabe efekty', short: 'P3' },
    ]),
    choiceCtl('week', 'Tydzień terapii', [
      { value: 1, label: '1. tydzień', short: '1' },
      { value: 2, label: '2. tydzień', short: '2' },
      { value: 3, label: '3. tydzień', short: '3' },
    ]),
    choiceCtl('m', 'Sposób aplikacji (M)', [
      { value: 'M1', label: 'M1', short: 'M1' },
      { value: 'M2', label: 'M2', short: 'M2' },
      { value: 'M3', label: 'M3', short: 'M3' },
    ]),
    numCtl('i', 'Intensywność (I)', '1–12', 1, 12, 1, 0, 3),
    choiceCtl('time', 'Czas zabiegu (fabryczny)', [
      { value: 8, label: '8 min', short: '8' },
      { value: 10, label: '10 min', short: '10' },
      { value: 12, label: '12 min', short: '12' },
    ], 'min'),
    choiceCtl('appl', 'Aplikator', [
      { value: 'mata', label: 'Mata (całe ciało)', short: 'MATA' },
      { value: 'klin', label: 'Aplikator kliniczny (całe ciało)', short: 'KLIN.' },
      { value: 'pierscien', label: 'Aplikator pierścieniowy', short: 'PIERŚC.' },
      { value: 'elips', label: 'Aplikator eliptyczny', short: 'ELIPT.' },
      { value: 'poduszka', label: 'Poduszka', short: 'PODUSZ.' },
    ]),
    numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 30, 1, 0, 5),
  ],
  defaults: () => ({ prog: '', week: 1, m: '', i: 3, time: '', appl: '', series: 15 }),
  bhp: () => [
    { id: 'implants', label: 'Potwierdzono brak implantów elektronicznych, ciąży, nadczynności tarczycy i nowotworu', required: true, why: 'Przeciwwskazania: ciąża, nowotwór, nadczynność tarczycy, krwawienia z przewodu pokarmowego, stany po przeszczepach, implanty elektroniczne, infekcje.' },
    { id: 'local', label: 'Dobrano aplikator do zakresu zabiegu (miejscowy – pierścieniowy/eliptyczny/poduszka)', required: true, why: 'Całe ciało: mata, aplikator kliniczny; wybrane części ciała: aplikatory pierścieniowe, eliptyczne, poduszka.' },
    { id: 'progress', label: 'Zaplanowano stopniowanie M i I w kolejnych tygodniach terapii', required: true, why: '1. tydzień: M2, I do 6; 2. tydzień: M3, I do 9; 3. tydzień: M1, I do 12.' },
    { id: 'manualtime', label: 'Czas zabiegu ustawiony ręcznie na 30 min', trap: true, why: 'Czas zabiegu jest ustawiony fabrycznie: 8, 10 lub 12 min.' },
    { id: 'maxI', label: 'Intensywność I = 12 od pierwszego zabiegu (maksymalny efekt)', trap: true, why: 'Intensywność narasta tygodniami: w 1. tygodniu do 6.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const exp = viEffectiveProgram(ctx)
    out.push(C('prog', 'Dobór programu (P)', v.prog === exp, String(v.prog || '— nie wybrano —'), exp, exp === 'P1' ? 'Pacjent nadwrażliwy na pole magnetyczne → P1.' : exp === 'P3' ? 'Niska wrażliwość / słabe efekty → P3.' : 'Podstawowy program terapeutyczny → P2.', { points: 2 }))
    const w = VI_WEEK[num(v.week)]
    out.push(C('m', `Sposób aplikacji (M) – ${v.week}. tydzień`, v.m === w.m, String(v.m || '— nie wybrano —'), w.m, '1. tydzień M2, 2. tydzień M3, 3. tydzień M1.'))
    out.push(C('i', `Intensywność (I) – ${v.week}. tydzień`, num(v.i) <= w.i, `${v.i}`, `do ${w.i}`, '1. tydzień do 6, 2. tydzień do 9, 3. tydzień do 12.'))
    out.push(C('time', 'Czas zabiegu', [8, 10, 12].includes(num(v.time)), v.time ? `${v.time} min` : '— nie wybrano —', '8, 10 lub 12 min', 'Czas ustawiony fabrycznie: 8, 10 lub 12 min.'))
    const local = ['pierscien', 'elips', 'poduszka']
    out.push(C('appl', 'Aplikator', local.includes(String(v.appl)), optLabel(magnetostimulation.controls(ctx, v).find((c) => c.key === 'appl'), v.appl), 'aplikator pierścieniowy / eliptyczny / poduszka', 'Zmiany miejscowe (okolica kręgosłupa, staw) – aplikatory miejscowe; mata i aplikator kliniczny – schorzenia ogólnoustrojowe.'))
    out.push(C('series', 'Liczba zabiegów w serii', true, `${v.series}`, 'brak wartości w bazie', 'Baza podaje schemat tygodniowy (3 tygodnie), ale nie liczbę zabiegów.', { info: true }))
    return out
  },
}

// ================================================================== SOLLUX
type SolMode = 'miejscowo' | 'ogolnie' | 'twarz'
const SOL: Record<SolMode, { dist: [number, number]; time: [number, number]; label: string }> = {
  miejscowo: { dist: [30, 60], time: [10, 15], label: 'Naświetlanie miejscowe' },
  ogolnie: { dist: [100, 120], time: [20, 30], label: 'Naświetlanie ogólne' },
  twarz: { dist: [10, 20], time: [10, 15], label: 'Twarz (porażenie n. VII)' },
}
export function solluxFilter(ctx: Ctx): 'niebieski' | 'czerwony' {
  if (/okres II\b/.test(ctx.scenario.diagnosis)) return 'czerwony'
  if (/okres I\b/.test(ctx.scenario.diagnosis)) return 'niebieski'
  return ctx.phase === 'przewlekly' ? 'czerwony' : 'niebieski'
}
const solluxEyes = (loc: AnatomicalLocation) => isFace(loc) || ['kregoslup_szyjny_zwoj', 'staw_ramienny_przod', 'staw_ramienny_bok', 'staw_ramienny_tyl'].includes(loc.id)

const sollux: ConsoleSpec = {
  id: 'sollux',
  brand: 'SOLLUX',
  model: 'IR-300',
  theme: 'sollux',
  applicator: 'Lampa Sollux',
  controls: () => [
    choiceCtl('filter', 'Filtr', [
      { value: 'niebieski', label: 'Filtr niebieski', short: 'NIEB.' },
      { value: 'czerwony', label: 'Filtr czerwony', short: 'CZERW.' },
    ]),
    choiceCtl('mode', 'Rodzaj naświetlania', [
      { value: 'miejscowo', label: 'Miejscowe', short: 'MIEJSC.' },
      { value: 'ogolnie', label: 'Ogólne', short: 'OGÓLNE' },
      { value: 'twarz', label: 'Twarz (porażenie n. VII)', short: 'TWARZ' },
    ]),
    numCtl('dist', 'Odległość lampy od ciała', 'cm', 5, 130, 5, 0, 20),
    numCtl('time', 'Czas naświetlania', 'min', 5, 40, 1, 0, 5),
    numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 30, 1, 0, 5),
  ],
  defaults: () => ({ filter: '', mode: '', dist: 80, time: 20, series: 5 }),
  bhp: (ctx) => [
    { id: 'goggles', label: 'Okulary ochronne dla pacjenta (twarz, szyja z przodu, bark, górna część klatki piersiowej)', required: solluxEyes(ctx.loc), why: 'Przy naświetlaniu twarzy, górnej części klatki piersiowej, barku i szyi z przodu obowiązkowe są okulary ochronne.' },
    { id: 'angle', label: 'Promienie padają pod kątem 90° do pola zabiegowego', required: true, why: 'Promieniowanie padające pod kątem 90° ma maksymalne natężenie.' },
    { id: 'clean', label: 'Skóra czysta, bez maści i zanieczyszczeń; okolica całkowicie odsłonięta', required: true, why: 'Skóra czysta, bez maści; okolica naświetlana całkowicie odsłonięta.' },
    { id: 'report', label: 'Pacjent w wygodnej pozycji, poinstruowany, by zgłaszać każdy dyskomfort (oparzenie)', required: true, why: 'Dawkę określamy subiektywnie (przyjemne ciepło); pacjent musi zgłaszać wszelkie dolegliwości.' },
    { id: 'ointment', label: 'Naświetlanie skóry posmarowanej maścią rozgrzewającą', trap: true, why: 'Skóra musi być czysta, bez maści – ryzyko oparzenia.' },
    { id: 'angle45', label: 'Lampa ustawiona skośnie pod kątem 45° (łagodniejsze działanie)', trap: true, why: 'Pod kątem innym niż 90° natężenie maleje – dawka nieprzewidywalna.' },
    { id: 'jcm', label: 'Dawka ustalona pomiarem w J/cm²', trap: true, why: 'W Solluxie dawkę określamy subiektywnie (odczucie przyjemnego ciepła).' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const expMode: SolMode = isFace(ctx.loc) ? 'twarz' : 'miejscowo'
    const ef = solluxFilter(ctx)
    out.push(C('filter', 'Dobór filtra', v.filter === ef, String(v.filter || '— nie wybrano —'), ef, ef === 'niebieski' ? 'Filtr niebieski: obkurcza naczynia, płytka penetracja, łagodzi ból – okres I porażenia n. VII, stany ostre/pourazowe.' : 'Filtr czerwony: ogranicza skutek biologiczny, rozgrzewa – okres II porażenia n. VII, przewlekłe stany zapalne, przed kinezyterapią.', { points: 2 }))
    out.push(C('mode', 'Rodzaj naświetlania', v.mode === expMode, SOL[v.mode as SolMode]?.label ?? '— nie wybrano —', SOL[expMode].label, 'Twarz (porażenie n. VII): 10–20 cm; miejscowo: 30–60 cm; ogólnie: 100–120 cm.'))
    const e = SOL[expMode]
    out.push(C('dist', 'Odległość lampy', inR(num(v.dist), e.dist[0], e.dist[1]), `${v.dist} cm`, rng(e.dist[0], e.dist[1], 'cm', 0), 'Odległość zależy od rodzaju naświetlania.', { points: 2 }))
    out.push(C('time', 'Czas naświetlania', inR(num(v.time), e.time[0], e.time[1]), `${v.time} min`, rng(e.time[0], e.time[1], 'min', 0), 'Czas naświetlania miejscowego 10–15 min, ogólnego 20–30 min.'))
    if (expMode === 'twarz') out.push(C('series', 'Liczba zabiegów w serii', inR(num(v.series), 10, 20), `${v.series}`, '10 – 20 (codziennie)', 'Porażenie n. VII: seria 10–20 zabiegów codziennie.'))
    else out.push(C('series', 'Liczba zabiegów w serii', true, `${v.series}`, 'zabiegi codziennie', 'Baza podaje częstotliwość (codziennie), nie liczbę zabiegów.', { info: true }))
    return out
  },
}

// ================================================================== ŚWIATŁO SPOLARYZOWANE
const polarLarge = (loc: AnatomicalLocation) => isSpine(loc) || loc.id === 'staw_biodrowy_tyl'

const polarized: ConsoleSpec = {
  id: 'polarized_light',
  brand: 'POLARIS',
  model: 'BP-1',
  theme: 'polar',
  applicator: 'Lampa światła spolaryzowanego',
  controls: () => [
    numCtl('dist', 'Odległość lampy od ciała', 'cm', 1, 40, 1, 0, 5),
    choiceCtl('angle', 'Kąt padania strumienia', [
      { value: 30, label: '30°', short: '30°' },
      { value: 45, label: '45°', short: '45°' },
      { value: 60, label: '60°', short: '60°' },
      { value: 90, label: '90° (prostopadle)', short: '90°' },
    ], '°'),
    numCtl('time', 'Czas na punkt', 'min', 1, 20, 1, 0, 5),
    choiceCtl('method', 'Sposób naświetlania', [
      { value: 'jeden', label: 'Jedno pole', short: 'POLE' },
      { value: 'punkty', label: 'Punkt po punkcie (duża powierzchnia)', short: 'PKT/PKT' },
    ]),
    numCtl('points', 'Liczba naświetlanych punktów', 'pkt', 1, 15, 1, 0, 3),
    choiceCtl('perday', 'Zabiegów dziennie', [
      { value: 1, label: '1× dziennie', short: '1×' },
      { value: 2, label: '2× dziennie', short: '2×' },
      { value: 3, label: '3× dziennie', short: '3×' },
    ]),
  ],
  defaults: () => ({ dist: 20, angle: '', time: 3, method: '', points: 1, perday: 1 }),
  bhp: () => [
    { id: 'clean', label: 'Skóra w polu zabiegowym dokładnie oczyszczona', required: true, why: 'Skóra oczyszczona przed zabiegiem.' },
    { id: 'perp', label: 'Strumień światła ustawiony prostopadle (90°) do pola zabiegowego', required: true, why: 'Strumień padający pod kątem 90° do pola zabiegowego.' },
    { id: 'fever', label: 'Wykluczono gorączkę i chorobę nowotworową', required: true, why: 'Przeciwwskazania: gorączka, choroba nowotworowa.' },
    { id: 'cream', label: 'Naświetlanie skóry z warstwą kremu / maści', trap: true, why: 'Skóra musi być oczyszczona.' },
    { id: 'near', label: 'Lampa dociśnięta do skóry (kontakt)', trap: true, why: 'Zalecana odległość lampy to 10 cm.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    out.push(C('dist', 'Odległość lampy od ciała', inR(num(v.dist), 9, 11), `${v.dist} cm`, '10 cm', 'Lampa ustawiona w odległości 10 cm.', { points: 2 }))
    out.push(C('angle', 'Kąt padania', num(v.angle) === 90, v.angle ? `${v.angle}°` : '— nie wybrano —', '90°', 'Strumień padający prostopadle (90°) do pola zabiegowego.'))
    out.push(C('time', 'Czas na punkt', inR(num(v.time), 4, 10), `${v.time} min`, '4 – 10 min', 'Czas 4–10 min na punkt.', { points: 2 }))
    out.push(C('perday', 'Zabiegów dziennie', num(v.perday) <= 2, `${v.perday}×`, '1× lub 2× dziennie', 'Częstotliwość: 1–2 razy dziennie.'))
    if (polarLarge(ctx.loc)) {
      out.push(C('method', 'Sposób naświetlania dużej powierzchni', v.method === 'punkty' && num(v.points) >= 3, v.method === 'punkty' ? `punkt po punkcie (${v.points})` : v.method ? 'jedno pole' : '— nie wybrano —', 'punkt po punkcie, ≥ 3 punkty', 'Duże powierzchnie naświetlamy punkt po punkcie aż do pokrycia całej powierzchni.'))
    } else out.push(C('method', 'Sposób naświetlania', true, v.method ? String(v.method) : '—', 'małe pole – jeden lub kilka punktów', 'Dla niewielkiej okolicy dowolna liczba punktów.', { info: true }))
    return out
  },
}

// ================================================================== KRIOTERAPIA
interface CryoM {
  label: string
  nozzle?: boolean
  temp?: [number, number]
  dist?: [number, number]
  time?: [number, number]
  whole?: boolean
  why: string
}
export const CRYO_METHODS: Record<string, CryoM> = {
  azot: { label: 'Nawiew par ciekłego azotu (−100…−180°C)', nozzle: true, temp: [-180, -100], dist: [10, 15], time: [0.5, 3], why: 'Azot: temp. par −100…−180°C, dysza 10–15 cm, ruchy okrężne/omiatające, 30 s – 3 min.' },
  powietrze: { label: 'Nawiew zimnego powietrza (−30°C)', nozzle: true, temp: [-35, -25], dist: [5, 20], time: [1, 6], why: 'Nawiew zimnego powietrza: −30°C, dysza 5–20 cm, ciągły ruch, czas nieco dłuższy niż przy azocie.' },
  co2: { label: 'Nawiew ciekłego CO₂ (−70°C)', nozzle: true, temp: [-75, -65], dist: [10, 15], time: [0.5, 3], why: 'CO₂: temp. wylotu dyszy −70°C, zasady jak przy azocie.' },
  woreczek: { label: 'Woreczek z lodem (na podkładzie bawełnianym)', time: [1, 20], why: 'Woreczki z lodem zawsze na bawełnianym podkładzie, od 1 min do rozpuszczenia lodu.' },
  masaz: { label: 'Masaż lodem', time: [3, 5], why: 'Masaż lodem: 3–5 min.' },
  kapiel: { label: 'Częściowa kąpiel w wodzie z lodem', time: [1, 3], why: 'Kąpiel w wodzie z lodem: 1–3 min.' },
  polewanie: { label: 'Polewanie zimną wodą (15–20°C)', temp: [15, 20], time: [3, 5], why: 'Polewanie wodą 15–20°C: 3–5 min.' },
  komora: { label: 'Kriokomora (krioterapia całego ciała)', temp: [-110, -70], whole: true, why: 'Kriokomora: −70…−110°C, krioterapia ogólna – nie do pojedynczych okolic.' },
}

const cryotherapy: ConsoleSpec = {
  id: 'cryotherapy',
  brand: 'CRYOTRONIC',
  model: 'KR-1',
  theme: 'cryo',
  applicator: 'Dysza / aplikator zimna',
  controls: (_ctx, v) => {
    const m = CRYO_METHODS[String(v.method)]
    const list: Control[] = [
      choiceCtl('method', 'Rodzaj zabiegu', Object.entries(CRYO_METHODS).map(([k, x]) => ({ value: k, label: x.label, short: k.toUpperCase() }))),
    ]
    if (!m || m.temp) list.push(numCtl('temp', 'Temperatura czynnika', '°C', -190, 25, 1, 0, 10))
    if (!m || m.nozzle) list.push(numCtl('dist', 'Odległość dyszy od skóry', 'cm', 0, 30, 1, 0, 5))
    list.push(numCtl('time', 'Czas zabiegu', 'min', 0.5, 20, 0.5, 1, 2))
    list.push(numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 15, 1, 0, 5))
    return list
  },
  defaults: () => ({ method: '', temp: -30, dist: 10, time: 2, series: 5 }),
  bhp: () => [
    { id: 'room', label: 'Pacjent niezziębnięty, w dobrym samopoczuciu; w gabinecie temperatura pokojowa', required: true, why: 'Nie wykonujemy zabiegu u pacjenta zziębniętego ani ze złym samopoczuciem.' },
    { id: 'bone', label: 'Aplikacja omija miejsca bezpośrednio nad wystającymi elementami kostnymi', required: true, why: 'Unikamy aplikacji bezpośrednio nad wystającymi elementami kostnymi.' },
    { id: 'stop', label: 'Znane objawy przerwania zabiegu: zblednięcie, silne plamy, „pomarańczowa skórka”, zaszronienie, ból/pieczenie', required: true, why: 'Natychmiast przerywamy zabieg przy zblednięciu skóry, plamach, „pomarańczowej skórce”, zaszronieniu i skargach na ból/pieczenie.' },
    { id: 'cotton', label: 'Woreczek z lodem na bawełnianym podkładzie', required: true, when: (v) => v.method === 'woreczek', why: 'Woreczki z lodem zawsze na bawełnianym podkładzie.' },
    { id: 'direct', label: 'Lód przyłożony bezpośrednio do skóry (bez podkładu)', trap: true, critical: true, when: (v) => v.method === 'woreczek', why: 'Lód bez podkładu grozi odmrożeniem.' },
    { id: 'motion', label: 'Dysza w ciągłym ruchu okrężnym / omiatającym', required: true, when: (v) => ['azot', 'powietrze', 'co2'].includes(String(v.method)), why: 'Nie wolno zatrzymywać dyszy w jednym miejscu.' },
    { id: 'stay', label: 'Dysza zatrzymana nad najbardziej bolesnym punktem', trap: true, critical: true, when: (v) => ['azot', 'powietrze', 'co2'].includes(String(v.method)), why: 'Zatrzymanie dyszy w jednym miejscu grozi odmrożeniem.' },
    { id: 'doc', label: 'Kwalifikacja lekarska i ubiór ochronny (trepy, strój bawełniany, skarpety, czapka, rękawice, maska)', required: true, when: (v) => v.method === 'komora', why: 'Kriokomora: kwalifikacja lekarska i pełny ubiór ochronny.' },
    { id: 'kine', label: 'Po wyjściu z komory 30 min ćwiczeń (kinezyterapia)', required: true, when: (v) => v.method === 'komora', why: 'Obowiązkowe postępowanie pozabiegowe: 30 min ćwiczeń na sali gimnastycznej.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const m = CRYO_METHODS[String(v.method)]
    out.push(C('method', 'Rodzaj zabiegu krioterapii', !!m && !m.whole, m?.label ?? '— nie wybrano —', 'zabieg miejscowy: azot, powietrze, CO₂, lód lub zimna woda', m?.whole ? 'Kriokomora to krioterapia całego ciała – nie do miejscowego urazu.' : 'Do okolicy miejscowej stosujemy metody miejscowe.' + (/RZS/.test(ctx.scenario.diagnosis) ? ' W RZS szczególnie korzystne suche zimno – ciekły azot.' : ''), { points: 2 }))
    if (m) {
      if (m.temp) out.push(C('temp', 'Temperatura czynnika', inR(num(v.temp), m.temp[0], m.temp[1]), `${v.temp} °C`, rng(m.temp[0], m.temp[1], '°C', 0), m.why, { points: 2 }))
      if (m.nozzle && m.dist) out.push(C('dist', 'Odległość dyszy', inR(num(v.dist), m.dist[0], m.dist[1]), `${v.dist} cm`, rng(m.dist[0], m.dist[1], 'cm', 0), m.why))
      if (m.time) out.push(C('time', 'Czas zabiegu', inR(num(v.time), m.time[0], m.time[1]), `${nf(num(v.time), 1)} min`, rng(m.time[0], m.time[1], 'min', 1), m.why))
      else out.push(C('time', 'Czas zabiegu', true, `${nf(num(v.time), 1)} min`, 'brak wartości w bazie', 'Baza nie podaje czasu pobytu w kriokomorze.', { info: true }))
    }
    out.push(C('series', 'Liczba zabiegów w serii', true, `${v.series}`, 'brak wartości w bazie', 'Baza nie podaje długości serii krioterapii.', { info: true }))
    return out
  },
}

// ================================================================== CIEPŁOLECZNICTWO
interface ThM {
  label: string
  temp?: [number, number]
  time?: [number, number]
  why: string
}
export const THERMO_METHODS: Record<string, ThM> = {
  kapiel: { label: 'Parafina – częściowa kąpiel (ręce/stopy)', temp: [52, 55], time: [30, 40], why: 'Kąpiel częściowa: ok. 53–54°C, 30–40 min, pacjent cały czas porusza kończyną.' },
  oklad: { label: 'Parafina – okład pędzlem (warstwy 1–2 cm)', temp: [55, 60], time: [20, 30], why: 'Okłady pędzlem: do 60°C, grubość 1–2 cm, cerata + flanela, 20–30 min.' },
  zawijanie: { label: 'Parafina – zawijanie (gaza 12×50 cm)', temp: [55, 60], time: [20, 30], why: 'Zawijania: do 60°C, 2–3 warstwy gazy, cerata + flanela, 20–30 min.' },
  rekawiczki: { label: 'Parafina – rękawiczki / skarpety', temp: [52, 55], time: [25, 35], why: 'Rękawiczki/skarpety: 54°C, zanurzanie 0,5–1 s do grubości 2 cm, 30 min.' },
  maseczka: { label: 'Maseczka parafinowa (twarz)', temp: [35, 45], why: 'Maseczka: parafina < 45°C na kilku warstwach gazy; oczy i uszy zabezpieczone.' },
  piasek: { label: 'Gorący piasek (woreczek)', temp: [40, 46], why: 'Piasek: podgrzany do 40–46°C, w woreczku na pole zabiegowe.' },
  fango: { label: 'Fango / parafango (okład częściowy)', why: 'Fango (szlam wulkaniczny) i parafango (parafina + sproszkowane fango): okłady częściowe lub kąpiele – baza nie podaje temperatury ani czasu.' },
  sauna: { label: 'Sauna (ciepło wilgotne – całe ciało)', why: 'Sauna to zabieg na całe ciało (poziomy 40–50 / 60 / 70–80°C) – nie do pojedynczej okolicy.' },
  termofor: { label: 'Termofor', why: 'Termofor: woda do 2/3 objętości, odpowietrzony, kontrola na policzku, ręcznik bawełniany + wełna.' },
}
export function thermoEligible(loc: AnatomicalLocation): string[] {
  if (isFace(loc)) return ['maseczka']
  if (isHandFoot(loc)) return ['kapiel', 'rekawiczki', 'zawijanie']
  return ['oklad', 'zawijanie', 'piasek', 'termofor', 'fango']
}

const thermotherapy: ConsoleSpec = {
  id: 'thermotherapy',
  brand: 'THERMOTRONIC',
  model: 'TP-2',
  theme: 'thermo',
  applicator: 'Aplikator cieplny',
  controls: (_ctx, v) => {
    const list: Control[] = [choiceCtl('method', 'Rodzaj zabiegu', Object.entries(THERMO_METHODS).map(([k, x]) => ({ value: k, label: x.label, short: k.toUpperCase() })))]
    if (v.method !== 'termofor') list.push(numCtl('temp', 'Temperatura czynnika', '°C', 30, 75, 1, 0, 5))
    list.push(numCtl('time', 'Czas zabiegu', 'min', 5, 60, 5, 0, 10))
    list.push(numCtl('series', 'Liczba zabiegów w serii', 'zab.', 1, 20, 1, 0, 5))
    return list
  },
  defaults: () => ({ method: '', temp: 45, time: 20, series: 10 }),
  bhp: () => [
    { id: 'sens', label: 'Zbadano czucie powierzchowne (temperatura) u pacjenta', required: true, why: 'Przed zabiegiem zawsze sprawdzamy czucie powierzchowne!' },
    { id: 'skin', label: 'Skóra umyta i osuszona', required: true, why: 'Skóra umyta i osuszona.' },
    { id: 'vas', label: 'Miejsca owłosione posmarowane wazeliną', required: true, why: 'Miejsca owłosione smarujemy wazeliną.' },
    { id: 'liquid', label: 'Parafina przygotowana: 20–40 g parafiny płynnej na 1 kg białej parafiny stałej', required: true, when: (v) => ['kapiel', 'oklad', 'zawijanie', 'rekawiczki', 'maseczka'].includes(String(v.method)), why: 'Parafinę zabiegową przygotowujemy dodając 20–40 g parafiny płynnej na 1 kg stałej.' },
    { id: 'move', label: 'Pacjent cały czas porusza kończyną w kąpieli', required: true, when: (v) => v.method === 'kapiel', why: 'W kąpieli częściowej pacjent cały czas porusza kończyną.' },
    { id: 'eyes', label: 'Oczy i uszy zabezpieczone grubą warstwą gazy', required: true, when: (v) => v.method === 'maseczka', why: 'W maseczce gruba warstwa gazy zabezpiecza oczy i uszy.' },
    { id: 'cheek', label: 'Termofor: odpowietrzony, kontrola temperatury na policzku, ręcznik bawełniany + wełna', required: true, when: (v) => v.method === 'termofor', why: 'Termofor: do 2/3 objętości, usunięte powietrze, kontrola na policzku, bawełna + wełna.' },
    { id: 'skipsens', label: 'Pominięcie badania czucia – pacjent sam zgłosi dyskomfort', trap: true, critical: true, why: 'Badanie czucia jest obowiązkowe (ryzyko oparzenia).' },
    { id: 'hot70', label: 'Nałożenie parafiny o temperaturze 70°C dla silniejszego efektu', trap: true, why: 'Parafina max 60°C (na twarz <45°C).' },
    { id: 'direct', label: 'Termofor przyłożony bezpośrednio do skóry', trap: true, when: (v) => v.method === 'termofor', why: 'Termofor przez suchy bawełniany ręcznik i wełnę.' },
  ],
  evaluate: (ctx, v) => {
    const out: Check[] = []
    const elig = thermoEligible(ctx.loc)
    const m = THERMO_METHODS[String(v.method)]
    out.push(C('method', 'Rodzaj zabiegu cieplnego', elig.includes(String(v.method)), m?.label ?? '— nie wybrano —', elig.map((k) => THERMO_METHODS[k].label).join(' | '), isFace(ctx.loc) ? 'Porażenie n. VII – maseczka parafinowa.' : isHandFoot(ctx.loc) ? 'Ręce i stopy – kąpiel częściowa, rękawiczki/skarpety lub zawijanie.' : 'Stawy i kręgosłup – okłady, zawijania, piasek, termofor.', { points: 2 }))
    if (m) {
      if (m.temp) out.push(C('temp', 'Temperatura czynnika', inR(num(v.temp), m.temp[0], m.temp[1]), `${v.temp} °C`, rng(m.temp[0], m.temp[1], '°C', 0), m.why, { points: 2 }))
      if (m.time) out.push(C('time', 'Czas zabiegu', inR(num(v.time), m.time[0], m.time[1]), `${v.time} min`, rng(m.time[0], m.time[1], 'min', 0), m.why))
      else out.push(C('time', 'Czas zabiegu', true, `${v.time} min`, 'brak wartości w bazie', 'Baza nie podaje czasu dla tej metody.', { info: true }))
    }
    out.push(C('series', 'Liczba zabiegów w serii', true, `${v.series}`, 'brak wartości w bazie', 'Baza nie podaje długości serii ciepłolecznictwa.', { info: true }))
    return out
  },
}

// ------------------------------------------------------------------ rejestr
export const CONSOLES: Record<string, ConsoleSpec> = {
  laser,
  ultrasound,
  magnetotherapy,
  magnetostimulation,
  sollux,
  polarized_light: polarized,
  cryotherapy,
  thermotherapy,
}

export function visibleBhp(spec: ConsoleSpec, ctx: Ctx, v: Values): BhpItem[] {
  return spec.bhp(ctx).filter((b) => !b.when || b.when(v))
}

/** Pełna ocena stanowiska: parametry + BHP. */
export function evaluateConsole(ctx: Ctx, v: Values, bhpChecked: string[]): Check[] {
  const spec = CONSOLES[ctx.scenario.modalityId]
  const out = spec.evaluate(ctx, v)
  for (const b of visibleBhp(spec, ctx, v)) {
    const on = bhpChecked.includes(b.id)
    if (b.required) {
      out.push(C(`bhp-${b.id}`, b.label, on, on ? 'wykonano' : 'pominięto', 'wymagane', b.why, { group: 'BHP i przygotowanie', critical: false }))
    } else if (b.trap) {
      out.push(C(`bhp-${b.id}`, b.label, !on, on ? 'zaznaczono (błąd!)' : 'poprawnie pominięto', 'NIE wykonywać', b.why, { group: 'BHP i przygotowanie', critical: on && b.critical, points: 1 }))
    }
  }
  return out
}

export function maxScore(checks: Check[]) {
  return checks.reduce((a, c) => a + c.points, 0)
}
export function gotScore(checks: Check[]) {
  return checks.reduce((a, c) => a + (c.ok ? c.points : 0), 0)
}
