import { MODALITIES_DB, ANATOMICAL_LOCATIONS } from '../src/data/scenarios'
import { ALL_SCENARIOS } from '../src/data/extraScenarios'
import { CONSOLES, makeCtx } from '../src/data/consoles'
import { MODALITY_SHORT, MID_LOCATIONS, correctContraOptions } from '../src/data/meta'
import { QUIZ } from '../src/data/quizData'
import { hasSideView, resolveViewGeom, resolveGeom, ZOOM_PRESETS, getPositionChoices, getLandmarkChoices, getBaseGeom } from '../src/data/anatomy'

const problems: string[] = []
const P = (m: string) => problems.push(m)

const empty = (v: unknown, path: string) => {
  if (v === undefined || v === null) P(`EMPTY ${path}`)
  else if (typeof v === 'string') {
    if (!v.trim()) P(`EMPTY ${path}`)
    else if (/\b(TODO|TBD|placeholder|lorem|XXX|\.\.\.)\b/i.test(v) || /^(brak|n\/a|-)$/i.test(v.trim())) P(`PLACEHOLDER ${path}: ${v}`)
  } else if (Array.isArray(v)) {
    if (!v.length) P(`EMPTY ARRAY ${path}`)
    v.forEach((x, i) => empty(x, `${path}[${i}]`))
  } else if (typeof v === 'object') {
    for (const [k, x] of Object.entries(v as object)) empty(x, `${path}.${k}`)
  }
}

console.log('== MODALITIES_DB ==')
for (const [k, m] of Object.entries(MODALITIES_DB)) {
  if (m.id !== k) P(`MOD id mismatch ${k} vs ${m.id}`)
  empty({ ...m }, `MOD ${k}`)
  console.log(k.padEnd(20), 'law', m.mechanismsAndLaws.length, 'par', m.parameters.length, 'meth', m.methodology.length, 'ind', m.indications.length, 'con', m.contraindications.length, 'spec', m.specialRules?.length ?? 0)
  if (!MODALITY_SHORT[k]) P(`MODALITY_SHORT missing ${k}`)
  if (!CONSOLES[k]) P(`CONSOLE missing ${k}`)
  if (!QUIZ.find((q) => q.id === k)) P(`QUIZ missing ${k}`)
}
for (const k of Object.keys(CONSOLES)) if (!MODALITIES_DB[k]) P(`CONSOLE dead key ${k}`)
for (const q of QUIZ) if (!MODALITIES_DB[q.id]) P(`QUIZ dead key ${q.id}`)

console.log('== LOCATIONS ==')
const locIds = new Set<string>()
for (const l of ANATOMICAL_LOCATIONS) {
  locIds.add(l.id)
  empty(l, `LOC ${l.id}`)
  try { getBaseGeom(l.id) } catch { P(`GEOM missing ${l.id}`) }
  if (getPositionChoices(l.id).length < 2) P(`POSITION choices <2 ${l.id}`)
  if (getLandmarkChoices(l.id).length < 2) P(`LANDMARK choices <2 ${l.id}`)
  for (const side of ['L', 'P'] as const) {
    try {
      const g = resolveGeom(l.id, side)
      if (!g) P(`resolveGeom null ${l.id}/${side}`)
      else {
        if (!g.targets?.length && !g.paths?.length) P(`GEOM no targets/paths ${l.id}`)
        if (!g.marks?.length) P(`GEOM no palpation marks ${l.id}`)
        if (!g.avoid?.length) P(`GEOM no avoid zones ${l.id}`)
        if (!g.paths?.length) P(`GEOM no paths (T) ${l.id}`)
      }
    } catch (e) {
      P(`resolveGeom throws ${l.id}/${side}: ${e}`)
    }
    if (hasSideView(l.id) && !resolveViewGeom(l.id, side, 'side')) P(`side view geom null ${l.id}`)
  }
  if (!l.commonPathologies.length) P(`LOC no pathologies ${l.id}`)
}
console.log('locations', ANATOMICAL_LOCATIONS.length)
for (const z of ZOOM_PRESETS) for (const v of ['front', 'back', 'side'] as const) if (!z[v] || !z[v].w) P(`ZOOM ${z.id} missing ${v}`)

console.log('== SCENARIOS ==')
const perMod: Record<string, { ok: number; mod: number; con: number }> = {}
const ids = new Set<string>()
for (const s of ALL_SCENARIOS) {
  if (ids.has(s.id)) P(`dup scenario id ${s.id}`)
  ids.add(s.id)
  empty(s as never, `SCEN ${s.id}`)
  if (!MODALITIES_DB[s.modalityId]) P(`SCEN ${s.id} dead modalityId ${s.modalityId}`)
  if (!locIds.has(s.locationId)) P(`SCEN ${s.id} dead locationId ${s.locationId}`)
  const c = (perMod[s.modalityId] ??= { ok: 0, mod: 0, con: 0 })
  if (s.isContraindicated) {
    c.con++
    if (!s.contraindicationReason) P(`SCEN ${s.id} contraindicated w/o reason`)
    if (!correctContraOptions(s).length) P(`SCEN ${s.id} contraindicated but CONTRA_KEYS maps to no DB item`)
  } else if (s.requiresDoseModification) {
    c.mod++
    if (!s.modificationReason) P(`SCEN ${s.id} modification w/o reason`)
  } else c.ok++
  // phase validity
  const loc = ANATOMICAL_LOCATIONS.find((l) => l.id === s.locationId)
  if (!MID_LOCATIONS || !(MID_LOCATIONS instanceof Set)) P('MID_LOCATIONS not a Set')
  try {
    const spec = CONSOLES[s.modalityId]
    const ctx = makeCtx(s)
    if (!ctx.loc) P(`CTX no loc ${s.id}`)
    const d = spec.defaults(ctx)
    const ctl = spec.controls(ctx, d)
    if (!ctl.length) P(`CONSOLE ${s.modalityId} no controls (${s.id})`)
    for (const c of ctl) {
      if (c.kind === 'choice' && !c.options?.length) P(`CONSOLE ${s.modalityId}/${c.key} empty options (${s.id})`)
      if (!c.label) P(`CONSOLE ${s.modalityId}/${c.key} no label`)
    }
    if (!spec.bhp(ctx).length) P(`CONSOLE ${s.modalityId} no BHP (${s.id})`)
    if (!spec.evaluate(ctx, d).length) P(`CONSOLE ${s.modalityId} evaluate empty (${s.id})`)
  } catch (e) {
    P(`CONSOLE throws for ${s.id}: ${e}`)
  }
  void loc
}
for (const k of Object.keys(MODALITIES_DB)) {
  const c = perMod[k] ?? { ok: 0, mod: 0, con: 0 }
  console.log(k.padEnd(20), JSON.stringify(c))
  if (c.ok + c.mod + c.con < 3) P(`SCENARIOS <3 for ${k}`)
  if (!c.ok) P(`no qualifying scenario for ${k}`)
  if (!c.mod) P(`no dose-modification scenario for ${k}`)
  if (!c.con) P(`no contraindicated scenario for ${k}`)
}
console.log('scenarios total', ALL_SCENARIOS.length)

console.log('== QUIZ coverage ==')
for (const q of QUIZ) {
  const db = MODALITIES_DB[q.id]
  if (!q.ind.length || !q.con.length) P(`QUIZ ${q.id} empty list`)
  db.indications.forEach((_, i) => !q.ind.some((a) => a.src === i) && P(`QUIZ ${q.id} ind[${i}] has no atom`))
  db.contraindications.forEach((_, i) => !q.con.some((a) => a.src === i) && P(`QUIZ ${q.id} con[${i}] has no atom`))
}

console.log('\n== PROBLEMS (' + problems.length + ') ==')
problems.forEach((p) => console.log(p))
