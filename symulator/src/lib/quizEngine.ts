import { QUIZ, QUIZ_BY_ID, type Atom, type QuizModality } from '../data/quizData'

export type Column = 'ind' | 'con'

export type Verdict = 'ok' | 'dup' | 'swapped' | 'foreign' | 'unknown'

export interface EntryResult {
  /** oryginalny wpis użytkownika (cały wiersz) */
  raw: string
  /** fragment wiersza po rozdzieleniu (np. „rozrusznik”) */
  part: string
  verdict: Verdict
  atom?: Atom
  /** zaliczono mimo literówki */
  fuzzy?: boolean
  /** zabiegi, do których pasuje wpis (verdict = foreign) */
  otherModalities?: string[]
  note: string
}

export interface ColumnResult {
  results: EntryResult[]
  hits: number
  total: number
  missing: Atom[]
  errors: number
}

/** Słowa-wypełniacze pomijane przy porównywaniu (po normalizacji znaków). */
const FILLERS = new Set([
  'choroba', 'choroby', 'chorobie', 'chorobami', 'chorob', 'chorobowe', 'choroba',
  'stany', 'stanie', 'stanow', 'stanach',
  'obrebie', 'okolica', 'okolicy', 'okolice', 'okolicach', 'okolic',
  'w', 'we', 'z', 'ze', 'na', 'po', 'u', 'o', 'od', 'do', 'dla', 'przy', 'przez', 'sie', 'a', 'i',
  'oraz', 'lub', 'albo', 'np', 'tzw', 'typu', 'ewentualnie', 'tez', 'jest', 'sa', 'wystepowanie', 'obecnosc', 'zwiazane', 'zwiazany',
])

/**
 * Normalizacja tekstu: małe litery, brak polskich znaków (ą→a, ć→c, ę→e, ł→l, ń→n, ó→o, ś→s, ź/ż→z),
 * brak interpunkcji, usunięte słowa-wypełniacze (np. „choroba”, „stany”, „w obrębie”, „okolica”).
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w && !FILLERS.has(w))
    .join(' ')
}
/** zgodność wsteczna */
export const normalize = normalizeText

/** rozbija wiersz na pojedyncze pojęcia: przecinki, średniki, „i”, „oraz”, „lub” */
export function splitParts(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[,;/\n]+|\s+(?:i|oraz|lub|albo|bądź|a także)\s+/)
    .map((p) => p.trim())
    .filter((p) => normalizeText(p).length >= 2)
}

/** odległość Damerau–Levenshteina (z transpozycją), z odcięciem */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const d: number[][] = []
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i]
    for (let j = 1; j <= b.length; j++) d[i][j] = i === 0 ? j : 0
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/** 0 = brak, 1 = literówka, 2 = trafienie dokładne */
function stemHit(tokens: string[], stem: string, allowFuzzy = true): 0 | 1 | 2 {
  const L = stem.length
  if (L <= 3) return tokens.some((t) => t.startsWith(stem) && t.length <= L + 3) ? 2 : 0
  if (tokens.some((t) => t.startsWith(stem))) return 2
  if (!allowFuzzy || L < 5) return 0
  const maxd = L >= 11 ? 2 : 1
  for (const t of tokens) {
    if (t.length < L - 1) continue
    for (const len of [L - 1, L, L + 1]) {
      if (t.length < len) continue
      if (editDistance(t.slice(0, len), stem, maxd) <= maxd) return 1
    }
  }
  return 0
}

/** automatyczny wzorzec z pełnej nazwy pozycji (przepuszczonej przez normalizeText) */
const autoCache = new WeakMap<Atom, string>()
function autoPattern(atom: Atom): string {
  let p = autoCache.get(atom)
  if (p === undefined) {
    const stems = [...new Set(normalizeText(atom.label).split(' ').filter((w) => w.length >= 3))].map((w) => w.slice(0, 5))
    p = stems.length >= 2 ? stems.join('+') : ''
    autoCache.set(atom, p)
  }
  return p
}

interface Score {
  score: number
  fuzzy: boolean
}

function scorePattern(tokens: string[], pattern: string): Score | null {
  let score = 0
  let fuzzy = false
  const stems = pattern.split('+')
  for (const st of stems) {
    if (st.startsWith('!')) {
      if (stemHit(tokens, st.slice(1), false)) return null
    } else {
      const h = stemHit(tokens, st)
      if (!h) return null
      if (h === 1) {
        fuzzy = true
        score += st.length - 0.6
      } else score += st.length
    }
  }
  return { score: score + stems.length * 0.1, fuzzy }
}

function scoreAtom(tokens: string[], atom: Atom): Score | null {
  let best: Score | null = null
  const auto = autoPattern(atom)
  for (const pattern of auto ? [...atom.k, auto] : atom.k) {
    const s = scorePattern(tokens, pattern)
    if (s && (!best || s.score > best.score)) best = s
  }
  return best
}

function bestAtom(part: string, atoms: Atom[]): { atom: Atom; score: number; fuzzy: boolean } | null {
  const tokens = normalizeText(part).split(' ').filter(Boolean)
  if (!tokens.length) return null
  let best: { atom: Atom; score: number; fuzzy: boolean } | null = null
  for (const atom of atoms) {
    const s = scoreAtom(tokens, atom)
    if (s && (!best || s.score > best.score)) best = { atom, ...s }
  }
  return best
}

export function evaluateColumn(entries: string[], column: Column, mod: QuizModality): ColumnResult {
  const other: Column = column === 'ind' ? 'con' : 'ind'
  const atoms = mod[column]
  const hit = new Set<string>()
  const results: EntryResult[] = []

  for (const raw of entries) {
    for (const part of splitParts(raw)) {
      const same = bestAtom(part, mod[column])
      const opp = bestAtom(part, mod[other])
      if (same && (!opp || same.score >= opp.score)) {
        if (hit.has(same.atom.id)) {
          results.push({ raw, part, verdict: 'dup', atom: same.atom, note: 'Już wpisano wcześniej – liczy się raz.' })
        } else {
          hit.add(same.atom.id)
          results.push({ raw, part, verdict: 'ok', atom: same.atom, fuzzy: same.fuzzy, note: 'Zgodne z bazą.' })
        }
        continue
      }
      if (opp) {
        results.push({
          raw,
          part,
          verdict: 'swapped',
          atom: opp.atom,
          note:
            column === 'ind'
              ? 'To jest PRZECIWWSKAZANIE tego zabiegu, a nie wskazanie!'
              : 'To jest WSKAZANIE tego zabiegu, a nie przeciwwskazanie!',
        })
        continue
      }
      // sprawdź inne zabiegi (obie kolumny)
      const foreign = QUIZ.filter((m) => m.id !== mod.id && (bestAtom(part, m.ind) || bestAtom(part, m.con)))
      if (foreign.length) {
        results.push({
          raw,
          part,
          verdict: 'foreign',
          otherModalities: foreign.map((m) => m.id),
          note: 'Nie dotyczy tego zabiegu – to pozycja z listy innej metody.',
        })
        continue
      }
      results.push({ raw, part, verdict: 'unknown', note: 'Nie rozpoznano w bazie dla tego zabiegu.' })
    }
  }

  const missing = atoms.filter((a) => !hit.has(a.id))
  return {
    results,
    hits: hit.size,
    total: atoms.length,
    missing,
    errors: results.filter((r) => r.verdict === 'swapped' || r.verdict === 'foreign' || r.verdict === 'unknown').length,
  }
}

export { QUIZ, QUIZ_BY_ID }
