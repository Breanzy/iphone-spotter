import { useEffect, useState } from 'react'
import { PHONES } from './catalog/phones'
import { ASSETS, ASSETS_BY_PHONE } from './catalog/assets'
import type { Phone } from './catalog/types'
import { ALLOW_STAND_INS, CHOICES_PER_QUESTION, QUESTIONS_PER_GAME } from './config'
import { buildGame, type Question } from './game/game'
import { PhoneStage, preloadAsset } from './viewer/PhoneStage'

// Dev aids for checking an Asset: `?phone=<id>` shows only that Phone,
// `&finish=<name>` forces that Finish.
const PARAMS = new URLSearchParams(location.search)
const ONLY = PARAMS.get('phone')
const FORCED_FINISH = PARAMS.get('finish')
const SHOWABLE = ONLY
  ? PHONES.filter((p) => p.id === ONLY)
  : ALLOW_STAND_INS
    ? PHONES
    : PHONES.filter((p) => ASSETS_BY_PHONE.has(p.id))

type Screen =
  | { kind: 'start' }
  | { kind: 'credits' }
  | { kind: 'play'; game: Question[]; index: number; picks: string[] }
  | { kind: 'results'; game: Question[]; picks: string[] }

function newGame(): Screen {
  const game = buildGame({
    catalog: PHONES,
    showable: SHOWABLE,
    questionCount: QUESTIONS_PER_GAME,
    choiceCount: CHOICES_PER_QUESTION,
    fixedFinish: (phone) => {
      const asset = ASSETS_BY_PHONE.get(phone.id)
      if (!asset || asset.bodyMaterials.length > 0) return undefined
      return phone.finishes.find((f) => f.name === asset.nativeFinish)
    },
  }).map((q) => ({ ...q, finish: q.phone.finishes.find((f) => f.name === FORCED_FINISH) ?? q.finish }))
  return { kind: 'play', game, index: 0, picks: [] }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: 'start' })

  switch (screen.kind) {
    case 'start':
      return (
        <main className="center">
          <h1>iPhone Spotter</h1>
          <p>Spin the phone. Name the iPhone. {QUESTIONS_PER_GAME} questions.</p>
          {SHOWABLE.length === 0 ? (
            <p className="muted">No phones have a 3D file yet.</p>
          ) : (
            <button className="primary" onClick={() => setScreen(newGame())}>Play</button>
          )}
          <button className="link" onClick={() => setScreen({ kind: 'credits' })}>Credits</button>
        </main>
      )
    case 'credits':
      return <Credits onBack={() => setScreen({ kind: 'start' })} />
    case 'play':
      return (
        <Play
          key={screen.index}
          question={screen.game[screen.index]}
          next={screen.game[screen.index + 1]}
          number={screen.index + 1}
          total={screen.game.length}
          onDone={(pickedId) => {
            const picks = [...screen.picks, pickedId]
            setScreen(
              screen.index + 1 < screen.game.length
                ? { ...screen, index: screen.index + 1, picks }
                : { kind: 'results', game: screen.game, picks },
            )
          }}
        />
      )
    case 'results':
      return <Results game={screen.game} picks={screen.picks} onAgain={() => setScreen(newGame())} />
  }
}

function Play(props: {
  question: Question
  next: Question | undefined
  number: number
  total: number
  onDone: (pickedId: string) => void
}) {
  const { question, next, number, total, onDone } = props
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    if (next) preloadAsset(ASSETS_BY_PHONE.get(next.phone.id))
  }, [next])

  const stateOf = (c: Phone) =>
    picked === null ? '' : c.id === question.phone.id ? 'right' : c.id === picked ? 'wrong' : 'dim'

  return (
    <main className="play">
      <header>
        <span>Question {number} / {total}</span>
        {!ASSETS_BY_PHONE.has(question.phone.id) && <span className="muted">stand-in shape</span>}
      </header>
      <div className="stage">
        <PhoneStage phone={question.phone} finish={question.finish} asset={ASSETS_BY_PHONE.get(question.phone.id)} />
      </div>
      <div className="choices">
        {question.choices.map((c) => (
          <button key={c.id} className={stateOf(c)} disabled={picked !== null} onClick={() => setPicked(c.id)}>
            {c.name}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="reveal">
          <p>
            <strong>{picked === question.phone.id ? 'Correct!' : 'Not quite.'}</strong> It's the{' '}
            {question.phone.name} ({question.phone.year}) in {question.finish.name}.
          </p>
          <p className="muted">Tell: {question.phone.tells[0]}</p>
          <button className="primary" onClick={() => onDone(picked)}>
            {number < total ? 'Next' : 'See score'}
          </button>
        </div>
      )}
    </main>
  )
}

function Results({ game, picks, onAgain }: { game: Question[]; picks: string[]; onAgain: () => void }) {
  const misses = game.filter((q, i) => picks[i] !== q.phone.id)
  return (
    <main className="center">
      <h1>{game.length - misses.length} / {game.length}</h1>
      {misses.length > 0 && (
        <ul className="misses">
          {misses.map((q) => (
            <li key={q.phone.id}>
              <strong>{q.phone.name}</strong>: {q.phone.tells[0]}
            </li>
          ))}
        </ul>
      )}
      <button className="primary" onClick={onAgain}>Play again</button>
    </main>
  )
}

function Credits({ onBack }: { onBack: () => void }) {
  return (
    <main className="center">
      <h1>Credits</h1>
      {ASSETS.length === 0 ? (
        <p className="muted">No 3D files yet. Phones are shown as stand-in shapes.</p>
      ) : (
        <ul className="misses">
          {ASSETS.map((a) => (
            <li key={a.phoneId}>
              {PHONES.find((p) => p.id === a.phoneId)?.name}: <a href={a.credit.sourceUrl}>{a.credit.creator}</a>,{' '}
              {a.credit.license}
            </li>
          ))}
        </ul>
      )}
      <button className="link" onClick={onBack}>Back</button>
    </main>
  )
}
