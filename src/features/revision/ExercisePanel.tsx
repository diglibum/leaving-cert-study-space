import { useMemo, useState } from 'react'
import type { PracticeSet } from './problems/types'
import { ClozePanel } from './practice/ClozePanel'
import { ItemsPanel } from './practice/ItemsPanel'
import { ListPanel } from './practice/ListPanel'
import { MatchPanel } from './practice/MatchPanel'
import { SpeakPanel } from './practice/SpeakPanel'

interface Props {
  /** Same seed, same set: use the date and block so a set stays put during the day. */
  seed: string
  makeExercise: (seed: string) => PracticeSet | undefined
}

const titles: Record<PracticeSet['kind'], string> = {
  items: 'Exercise set',
  cloze: 'Grammar text',
  match: 'Matching exercise',
  list: 'Word list exercise',
  speak: 'Speaking practice',
}

/** Typed language practice of several kinds, checked in the browser. */
export function ExercisePanel({ seed, makeExercise }: Props) {
  const [round, setRound] = useState(0)
  const exercise = useMemo(() => makeExercise(`${seed}:${round}`), [makeExercise, seed, round])

  if (!exercise) return null
  const onNewSet = () => setRound((value) => value + 1)
  const title = titles[exercise.kind]

  return (
    <section className="problem-panel" aria-label={title}>
      <h5>{title}</h5>
      {exercise.kind === 'items' && <ItemsPanel key={round} exercise={exercise} onNewSet={onNewSet} />}
      {exercise.kind === 'cloze' && <ClozePanel key={round} exercise={exercise} onNewSet={onNewSet} />}
      {exercise.kind === 'match' && <MatchPanel key={round} exercise={exercise} onNewSet={onNewSet} />}
      {exercise.kind === 'list' && <ListPanel key={round} exercise={exercise} onNewSet={onNewSet} />}
      {exercise.kind === 'speak' && <SpeakPanel key={round} exercise={exercise} onNewSet={onNewSet} />}
    </section>
  )
}
