import { QUIZ, evaluateColumn } from '../src/lib/quizEngine'
import { MODALITIES_DB } from '../src/data/scenarios'

// rozbij pozycje DB na pojęcia (przecinki, średniki, nawiasy, dwukropki, " i ") i sprawdź, które nie są rozpoznane
for (const m of QUIZ) {
  const db = MODALITIES_DB[m.id]
  for (const col of ['ind', 'con'] as const) {
    const rows = col === 'ind' ? db.indications : db.contraindications
    rows.forEach((row, i) => {
      const frags = row
        .replace(/\(([^)]*)\)/g, ', $1')
        .split(/[,;:]| – | i |\//)
        .map((x) => x.trim())
        .filter((x) => x.length > 2)
      for (const fr of frags) {
        const r = evaluateColumn([fr], col, m)
        const bad = r.results.filter((x) => x.verdict !== 'ok' && x.verdict !== 'dup')
        if (bad.length) console.log(`${m.id} ${col}[${i}] "${fr}" ->`, bad.map((b) => b.part + ':' + b.verdict).join(' | '))
      }
    })
  }
}
