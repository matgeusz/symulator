import { ALL_SCENARIOS } from '../src/data/extraScenarios'
import { ANATOMICAL_LOCATIONS } from '../src/data/scenarios'
for (const s of ALL_SCENARIOS) {
  console.log(s.id.padEnd(8), s.modalityId.padEnd(19), s.locationId.padEnd(28), s.phase.padEnd(10), s.age + s.gender, s.isContraindicated ? 'CON' : s.requiresDoseModification ? 'MOD' : 'ok ', '|', s.diagnosis.slice(0, 50))
}
const used = new Set(ALL_SCENARIOS.map((s) => s.locationId))
console.log('\nunused locations:', ANATOMICAL_LOCATIONS.filter((l) => !used.has(l.id)).map((l) => l.id).join(', '))
const byMod: Record<string, Set<string>> = {}
for (const s of ALL_SCENARIOS) (byMod[s.modalityId] ??= new Set()).add(s.phase)
console.log(Object.fromEntries(Object.entries(byMod).map(([k, v]) => [k, [...v]])))
