import { useState } from 'react'
import type { PatientScenario } from '../data/scenarios'
import { MODALITIES_DB } from '../data/scenarios'
import { QUAL_LABEL, correctQualification, type Qualification, type TriageAnswer } from '../lib/exam'
import { correctContraOptions } from '../data/meta'
import { Card, Modal, btnDanger, btnGhost, btnPrimary } from './ui'

interface Props {
  scenario: PatientScenario
  initial: TriageAnswer | null
  /** next: 'stage2' – kontynuacja; 'protocol' – zakończenie egzaminu */
  onSubmit: (a: TriageAnswer, next: 'stage2' | 'protocol') => void
}

const OPTIONS: { key: Qualification; title: string; sub: string; style: string }[] = [
  { key: 'bez', title: QUAL_LABEL.bez, sub: 'Brak przeciwwskazań, standardowa dawka', style: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  { key: 'mod', title: QUAL_LABEL.mod, sub: 'Brak przeciwwskazań, ale dawka wymaga redukcji / progresji', style: 'border-amber-400 bg-amber-50 text-amber-900' },
  { key: 'odstap', title: QUAL_LABEL.odstap, sub: 'Wskaż konkretne przeciwwskazanie z wywiadu', style: 'border-red-400 bg-red-50 text-red-900' },
]

export function Stage1Triage({ scenario, initial, onSubmit }: Props) {
  const [choice, setChoice] = useState<Qualification | null>(initial?.choice ?? null)
  const [reason, setReason] = useState<string | null>(initial?.reason ?? null)
  const [alert, setAlert] = useState<null | { tone: 'danger' | 'warn' | 'ok'; title: string; body: React.ReactNode; answer: TriageAnswer; kind: 'fatal' | 'unjust' | 'dose' | 'refuse-ok' }>(null)
  const mod = MODALITIES_DB[scenario.modalityId]

  const submit = () => {
    if (!choice) return
    const answer: TriageAnswer = { choice, reason: choice === 'odstap' ? reason : null }
    const exp = correctQualification(scenario)

    if (scenario.isContraindicated && choice !== 'odstap') {
      setAlert({
        tone: 'danger',
        kind: 'fatal',
        title: 'ALERT EGZAMINACYJNY – BŁĄD KRYTYCZNY',
        answer,
        body: (
          <>
            <p className="font-semibold">Zakwalifikowano pacjenta z bezwzględnym przeciwwskazaniem do zabiegu!</p>
            <div className="rounded-lg bg-red-50 p-3 ring-1 ring-red-200">
              <div className="text-xs font-bold uppercase text-red-700">Wywiad pacjenta</div>
              <p>{scenario.medicalHistory}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500">Wyjaśnienie z bazy wiedzy</div>
              <p>{scenario.contraindicationReason}</p>
              <p className="mt-2 text-sm text-slate-600">Przeciwwskazanie z listy dla zabiegu „{mod.name}”: <strong>{correctContraOptions(scenario).join(' | ')}</strong></p>
            </div>
            <p className="text-sm text-slate-600">W prawdziwym egzaminie praktycznym kończy to egzamin wynikiem negatywnym.</p>
          </>
        ),
      })
      return
    }
    if (!scenario.isContraindicated && choice === 'odstap') {
      setAlert({
        tone: 'warn',
        kind: 'unjust',
        title: 'Nieuzasadnione odstąpienie od zabiegu',
        answer,
        body: (
          <>
            <p>Pacjent <strong>nie ma</strong> przeciwwskazania do tego zabiegu. Odstąpienie pozbawia go leczenia zleconego przez lekarza.</p>
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-bold uppercase text-slate-500">Wywiad pacjenta</div>
              <p>{scenario.medicalHistory}</p>
            </div>
            <p className="text-sm text-slate-600">Wskazana kwalifikacja: <strong>{QUAL_LABEL[exp]}</strong>.</p>
          </>
        ),
      })
      return
    }
    if (choice !== exp) {
      setAlert({
        tone: 'warn',
        kind: 'dose',
        title: exp === 'mod' ? 'Pominięto konieczność modyfikacji dawki' : 'Niepotrzebna modyfikacja dawki',
        answer,
        body: (
          <>
            <p>{exp === 'mod' ? scenario.modificationReason : 'W wywiadzie nie ma wskazań do modyfikacji dawki – obowiązują standardowe parametry z bazy.'}</p>
            <p className="text-sm text-slate-600">Wskazana kwalifikacja: <strong>{QUAL_LABEL[exp]}</strong>. Możesz kontynuować – w etapie 3 pamiętaj o właściwej dawce.</p>
          </>
        ),
      })
      return
    }
    if (choice === 'odstap') {
      const ok = reason !== null && correctContraOptions(scenario).includes(reason)
      setAlert({
        tone: ok ? 'ok' : 'warn',
        kind: 'refuse-ok',
        title: ok ? 'Prawidłowa decyzja – odstąpienie od zabiegu' : 'Słusznie odstępujesz, ale wskazano złe przeciwwskazanie',
        answer,
        body: (
          <>
            <p>{scenario.contraindicationReason}</p>
            {!ok && (
              <p className="text-sm text-slate-600">
                Właściwe przeciwwskazanie: <strong>{correctContraOptions(scenario).join(' | ')}</strong>
              </p>
            )}
            <p className="text-sm text-slate-600">Egzamin kończy się na etapie kwalifikacji – przejdź do protokołu.</p>
          </>
        ),
      })
      return
    }
    onSubmit(answer, 'stage2')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card title="Etap 1 · Kwalifikacja kliniczna (triage i przeciwwskazania)">
        <p className="mb-4 text-sm text-slate-600">
          Przeanalizuj wywiad i fazę choroby pacjenta, a następnie podejmij decyzję o zabiegu <strong>{mod.name}</strong>.
        </p>
        <div className="space-y-3">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setChoice(o.key)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${choice === o.key ? `${o.style} shadow-md ring-2 ring-offset-1 ring-teal-500` : 'border-slate-200 bg-white hover:bg-slate-50'}`}
            >
              <div className="font-bold">[{o.title}]</div>
              <div className="text-sm opacity-80">{o.sub}</div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button className={btnPrimary} disabled={!choice || (choice === 'odstap' && !reason)} onClick={submit}>
            Zatwierdź kwalifikację →
          </button>
        </div>
      </Card>

      <Card title={choice === 'odstap' ? `Wskaż przeciwwskazanie: ${mod.name}` : 'Jak podjąć decyzję?'} right={<span className="text-xs text-slate-400">baza wiedzy</span>}>
        {choice === 'odstap' ? (
          <ul className="space-y-1.5">
            {mod.contraindications.map((c) => (
              <li key={c}>
                <label className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${reason === c ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="contra" className="mt-1 accent-red-700" checked={reason === c} onChange={() => setReason(c)} />
                  <span>{c}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            <p className="mb-2 font-semibold text-slate-700">Wskazówka</p>
            <p>Wybierz opcję <em>„ODSTĘPUJĘ OD ZABIEGU”</em>, aby wskazać konkretne przeciwwskazanie z wywiadu pacjenta. Lista przeciwwskazań dla tej modalności jest ukryta do czasu podjęcia decyzji, tak jak na prawdziwym egzaminie.</p>
            <p className="mt-2">Zwróć uwagę na: wiek, fazę (ostry / podostry / przewlekły), choroby współistniejące, leki, implanty oraz ciążę.</p>
          </div>
        )}
      </Card>

      {alert && (
        <Modal
          tone={alert.tone}
          title={alert.title}
          actions={
            alert.kind === 'fatal' || alert.kind === 'unjust' ? (
              <>
                <button className={btnGhost} onClick={() => onSubmit(alert.answer, 'protocol')}>
                  Zakończ egzamin i zobacz protokół
                </button>
                <button className={btnDanger} onClick={() => onSubmit(alert.answer, 'stage2')}>
                  Kontynuuj mimo błędu (tryb treningowy)
                </button>
              </>
            ) : alert.kind === 'refuse-ok' ? (
              <button className={btnPrimary} onClick={() => onSubmit(alert.answer, 'protocol')}>
                Przejdź do protokołu →
              </button>
            ) : (
              <>
                <button className={btnGhost} onClick={() => setAlert(null)}>
                  Zmień decyzję
                </button>
                <button className={btnPrimary} onClick={() => onSubmit(alert.answer, 'stage2')}>
                  Kontynuuj do etapu 2 →
                </button>
              </>
            )
          }
        >
          {alert.body}
        </Modal>
      )}
    </div>
  )
}
