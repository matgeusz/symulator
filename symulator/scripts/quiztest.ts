import { QUIZ, evaluateColumn, normalizeText, normalize } from '../src/lib/quizEngine'
import { MODALITIES_DB } from '../src/data/scenarios'

let bad = 0
// 1. etykieta każdego atomu musi trafiać we własny atom
for (const m of QUIZ) {
  for (const col of ['ind', 'con'] as const) {
    for (const atom of m[col]) {
      const r = evaluateColumn([atom.label], col, m)
      const ok = r.results.some((x) => x.verdict === 'ok' && x.atom?.id === atom.id)
      if (!ok) {
        bad++
        console.log('LABEL MISS', m.id, col, atom.id, '=>', r.results.map((x) => x.part + ':' + x.verdict + ':' + (x.atom?.id ?? '')).join(' | '))
      }
    }
  }
}
// 2. każda pozycja DB ma co najmniej jeden atom (src)
for (const m of QUIZ) {
  const db = MODALITIES_DB[m.id]
  for (const col of ['ind', 'con'] as const) {
    const list = col === 'ind' ? db.indications : db.contraindications
    list.forEach((_, i) => {
      if (!m[col].some((a) => a.src === i)) {
        bad++
        console.log('NO ATOM FOR DB ITEM', m.id, col, i)
      }
    })
    if (m[col].some((a) => a.src >= list.length)) {
      bad++
      console.log('SRC OOR', m.id, col)
    }
  }
}// 3. przykłady użytkownika
const us = QUIZ.find((m) => m.id === 'ultrasound')!
const cases: [string, string, 'ind' | 'con', string][] = [
  ['ultrasound', 'rozrusznik', 'con', 'c-rozruszn'],
  ['ultrasound', 'ciąża', 'con', 'c-ciaza'],
  ['ultrasound', 'nowotwór', 'con', 'c-nowotw'],
  ['ultrasound', 'metal', 'con', 'c-metal'],
  ['sollux', 'ostry stan', 'con', 'c-ostry'],
  ['laser', 'sterydy', 'con', 'c-steryd'],
  ['laser', 'leki steroidowe', 'con', 'c-steryd'],
  ['ultrasound', 'żylaki, zakrzepica', 'con', 'c-zylaki'],
  ['ultrasound', 'ostroga', 'ind', 'i-ostroga'],
  ['sollux', 'zatoki', 'ind', 'i-zatoki'],
  ['sollux', 'stan zapalny przewlekły', 'ind', 'i-zapal'],
  ['sollux', 'nadciśnienie', 'con', 'c-nadcisn'],
  ['magnetotherapy', 'rozrusznik', 'con', 'c-implant'],
  ['magnetotherapy', 'gips', 'ind', 'i-zlaman'],
  ['cryotherapy', 'zimno', 'con', 'c-zimno'],
  ['thermotherapy', 'wiek podeszły', 'con', 'c-wiek'],
]
for (const [mid, text, col, expect] of cases) {
  const m = QUIZ.find((x) => x.id === mid)!
  const r = evaluateColumn([text], col, m)
  const got = r.results.map((x) => x.verdict + ':' + (x.atom?.id ?? '-')).join(',')
  const pass = r.results.some((x) => x.verdict === 'ok' && x.atom?.id === expect)
  if (!pass) bad++
  console.log(pass ? 'PASS' : 'FAIL', mid, JSON.stringify(text), '=>', got)
}
// 3b. synonimy z polecenia, bez ogonków, literówki
const syn: [string, 'ind' | 'con', string, string[]][] = [
  ['ultrasound', 'con', 'c-ciaza', ['ciaza', 'w ciazy', 'ciezarna', 'ciaza ']],
  ['laser', 'con', 'c-nowotw', ['nowotwor', 'nowotwory', 'rak', 'guz', 'choroba nowotworowa', 'choroby nowotworowe', 'nowotwr', 'nowotwurr']],
  ['ultrasound', 'con', 'c-rozruszn', ['rozrusznik', 'kardiostymulator', 'implant elektroniczny', 'pompa insulinowa', 'rozrusznik serca', 'rozrusnik', 'kardiostymulatr']],
  ['magnetotherapy', 'con', 'c-implant', ['rozrusznik', 'kardiostymulator', 'implant elektroniczny', 'pompa insulinowa']],
  ['ultrasound', 'con', 'c-metal', ['metal', 'implanty', 'endoproteza', 'sruby', 'zespolenie', 'metalowe implanty', 'endoprotez']],
  ['sollux', 'con', 'c-ostry', ['ostry stan', 'ostre zapalenie', 'stan ostry', 'faza ostra', 'ostry stan zapalny', 'ostre stany zapalne']],
  ['sollux', 'con', 'c-obrzek', ['obrzek', 'obrzeki', 'opuchlizna', 'obrzeki']],
  ['laser', 'con', 'c-gorac', ['goraczka', 'podwyzszona temperatura', 'stan podgoraczkowy', 'gorączka', 'goraczke']],
  ['laser', 'con', 'c-tarczyca', ['tarczyca', 'nadczynnosc tarczycy', 'hipertyreoza', 'nadczynnosc']],
  ['laser', 'con', 'c-steryd', ['sterydy', 'leki sterydowe', 'glikokortykosteroidy', 'blokada sterydowa', 'sterydy']],
  ['sollux', 'con', 'c-zylaki', ['zylaki', 'zylaki konczyn']],
  ['ultrasound', 'con', 'c-zakrzepica', ['zakrzepica', 'zakrzep', 'zator']],
  ['sollux', 'con', 'c-zakrzep', ['zakrzepowe zapalenie zyl', 'zapalenie zyl', 'zakrzep', 'zator']],
  ['sollux', 'con', 'c-krwaw', ['krwawienia', 'sklonnosc do krwawien', 'krwotok', 'zaburzenia krzepniecia']],
  ['ultrasound', 'con', 'c-krzep', ['zaburzenia krzepniecia', 'krzepniecie']],
  ['ultrasound', 'con', 'c-nasady', ['nasady kosci', 'chrzastka wzrostowa', 'dzieci nasady', 'nasady']],
  ['ultrasound', 'con', 'c-ciaglosc', ['przerwanie ciaglosci', 'rana otwarta', 'uszkodzenie skory', 'otwarta rana']],
  ['cryotherapy', 'con', 'c-skora', ['uszkodzenie skory', 'rana otwarta', 'otwarta rana']],
  ['thermotherapy', 'con', 'c-wiek', ['wiek starczy', 'starosc', 'podeszly wiek']],
  ['cryotherapy', 'ind', 'i-rzs', ['rzs', 'reumatoidalne zapalenie stawow']],
  ['ultrasound', 'ind', 'i-zwyrod', ['zwyrodnienie', 'choroba zwyrodnieniowa', 'artroza', 'gonartroza', 'koksartroza']],
  ['cryotherapy', 'ind', 'i-zwyrod', ['zwyrodnienie', 'choroba zwyrodnieniowa', 'artroza', 'gonartroza', 'koksartroza']],
  ['ultrasound', 'ind', 'i-bol', ['rwa', 'rwa kulszowa', 'rwa ramienna', 'dyskopatia', 'korzonki']],
  ['polarized_light', 'ind', 'i-korzenie', ['rwa', 'rwa kulszowa', 'korzonki']],
  ['polarized_light', 'ind', 'i-dysk', ['dyskopatia']],
  ['ultrasound', 'ind', 'i-blizny', ['blizna', 'blizny', 'bliznowce', 'keloid']],
  ['ultrasound', 'ind', 'i-dupuytren', ['przykurcz', 'przykurcze', 'dupuytren']],
  ['thermotherapy', 'ind', 'i-przykurcz', ['przykurcz', 'przykurcze']],
]
for (const [mid, col, id, texts] of syn) {
  const m = QUIZ.find((x) => x.id === mid)!
  for (const text of texts) {
    const r = evaluateColumn([text], col, m)
    const pass = r.results.length === 1 && r.results[0].verdict === 'ok' && r.results[0].atom?.id === id
    if (!pass) {
      bad++
      console.log('SYN FAIL', mid, id, JSON.stringify(text), '=>', r.results.map((x) => x.verdict + ':' + (x.atom?.id ?? '-')).join(','))
    }
  }
}
console.log('normalizeText:', normalizeText('Choroba Nowotworowa, W obrębie Łydki; Stany po ŻÓŁĆ!'))
// 4. błędy: przeciwwskazanie wpisane jako wskazanie / obce
const checks: [string, string, 'ind' | 'con', string][] = [
  ['ultrasound', 'ciąża', 'ind', 'swapped'],
  ['ultrasound', 'migrena', 'con', 'foreign'],
  ['ultrasound', 'bzdura xyz', 'con', 'unknown'],
  ['ultrasound', 'ostroga piętowa', 'con', 'swapped'],
  ['laser', 'rozrusznik', 'con', 'foreign'],
]
for (const [mid, text, col, v] of checks) {
  const m = QUIZ.find((x) => x.id === mid)!
  const r = evaluateColumn([text], col, m)
  const pass = r.results[0]?.verdict === v
  if (!pass) bad++
  console.log(pass ? 'PASS' : 'FAIL', mid, col, JSON.stringify(text), '=>', r.results.map((x) => x.verdict + ':' + (x.atom?.id ?? '-')).join(','), 'expected', v)
}
console.log(normalize('Łódź, żółć – ĄĘ'), 'bad =', bad, us.con.length)
