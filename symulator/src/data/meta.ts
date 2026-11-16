// Metadane do oceny: mapowanie scenariusz → właściwe przeciwwskazanie, strona zabiegowa, itp.
import type { PatientScenario, PhaseType } from './scenarios'
import { ANATOMICAL_LOCATIONS, MODALITIES_DB } from './scenarios'
import type { Side } from './anatomy'

export const PHASE_LABEL: Record<PhaseType, string> = {
  ostry: 'Stan ostry (do 3–4 dni)',
  podostry: 'Stan podostry',
  przewlekly: 'Stan przewlekły',
}

export const SIDE_LABEL: Record<Side, string> = { P: 'prawa', L: 'lewa' }

/** Słowa kluczowe pozycji z listy przeciwwskazań modalności, które odpowiadają przeciwwskazaniu w scenariuszu. */
export const CONTRA_KEYS: Record<string, string[]> = {
  scen_02: ['Ciąża'],
  scen_05: ['rozrusznik'],
  scen_07: ['Ostry stan zapalny', 'obrzęki'],
  scen_09: ['Raynauda'],
  scen_12: ['Niewydolność krążenia', 'wiek starczy'],
  scen_15: ['nasad kości'],
  scen_17: ['sterydow'],
  ext_02: ['implanty', 'Elektroniczne'],
  ext_04: ['Ciąża'],
  ext_06: ['Gorączka'],
  ext_08: ['Sudecka'],
  ext_13: ['Żylaki', 'żylaki'],
  ext_16: ['Metalowe implanty'],
  ext_17: ['Nadczynność tarczycy'],
}

export function matchesContra(scenarioId: string, option: string): boolean {
  const keys = CONTRA_KEYS[scenarioId] ?? []
  const lo = option.toLowerCase()
  return keys.some((k) => lo.includes(k.toLowerCase()))
}

export function correctContraOptions(scenario: PatientScenario): string[] {
  const list = MODALITIES_DB[scenario.modalityId].contraindications
  return list.filter((c) => matchesContra(scenario.id, c))
}

/** Metoda UD w kręgosłupie wskazana w scenariuszu (jeśli jest). */
export const US_METHOD_BY_SCENARIO: Record<string, string[]> = {
  scen_13: ['odgłowowy'],
  ext_14: ['odogonowy'],
}

export function deriveSide(s: PatientScenario): Side {
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === s.locationId)
  const t = s.diagnosis.toLowerCase()
  if (/prawe|prawy|prawa|prawej|prawego|prawym|prawą/.test(t)) return 'P'
  if (/lewe|lewy|lewa|lewej|lewego|lewym|lewą/.test(t)) return 'L'
  void loc
  return Math.random() < 0.5 ? 'P' : 'L'
}

export const MID_LOCATIONS = new Set(['kregoslup_szyjny_zwoj', 'kregoslup_piersiowy', 'kregoslup_ledzwiowy'])

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr]
  let s = seed ?? Math.floor(Math.random() * 1e9)
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

export const MODALITY_SHORT: Record<string, string> = {
  sollux: 'Sollux (IR)',
  laser: 'Laseroterapia',
  polarized_light: 'Światło spolaryzowane',
  cryotherapy: 'Krioterapia',
  thermotherapy: 'Ciepłolecznictwo',
  ultrasound: 'Ultradźwięki / UF',
  magnetotherapy: 'Magnetoterapia',
  magnetostimulation: 'Magnetostymulacja',
}
