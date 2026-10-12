import { useId, useState } from 'react'
import type { SpeakExercise } from '../problems/types'

interface Props {
  exercise: SpeakExercise
  onNewSet: () => void
}

/** Questions to answer aloud and record, with a short self-check. The app cannot hear you, so you judge your own answers. */
export function SpeakPanel({ exercise, onNewSet }: Props) {
  const [done, setDone] = useState<boolean[]>([])
  const [checks, setChecks] = useState<boolean[]>([])
  const [showEnglish, setShowEnglish] = useState(false)
  const baseId = useId()
  const answered = done.filter(Boolean).length

  return (
    <>
      <p className="problem-statement">{exercise.instruction}</p>
      <p className="field-hint">
        Record yourself on your phone, or say each answer aloud. The app cannot hear you, so tick each question when
        you have answered it.
      </p>
      <ol className="speak-prompts">
        {exercise.prompts.map((prompt, index) => {
          const id = `${baseId}-p${index}`
          return (
            <li key={prompt.text}>
              <label htmlFor={id}>
                <span lang={exercise.lang}>{prompt.text}</span>
                {showEnglish && <span className="field-hint"> ({prompt.gloss})</span>}
              </label>{' '}
              <input
                id={id}
                type="checkbox"
                aria-label={`Answered aloud: ${prompt.gloss}`}
                checked={done[index] ?? false}
                onChange={(event) => {
                  const next = [...done]
                  next[index] = event.target.checked
                  setDone(next)
                }}
              />
            </li>
          )
        })}
      </ol>
      <p role="status">{`${answered} of ${exercise.prompts.length} questions answered aloud.`}</p>
      <p className="step-actions">
        <button type="button" className="button button-secondary" aria-pressed={showEnglish} onClick={() => setShowEnglish((value) => !value)}>
          {showEnglish ? 'Hide English' : 'Show English'}
        </button>
        <button type="button" className="button button-secondary" onClick={onNewSet}>
          New questions
        </button>
      </p>
      <h6>How to answer</h6>
      <ul>
        {exercise.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <fieldset className="speak-check">
        <legend>Listen back and tick what is true</legend>
        {exercise.selfCheck.map((line, index) => {
          const id = `${baseId}-c${index}`
          return (
            <p key={line}>
              <input
                id={id}
                type="checkbox"
                checked={checks[index] ?? false}
                onChange={(event) => {
                  const next = [...checks]
                  next[index] = event.target.checked
                  setChecks(next)
                }}
              />{' '}
              <label htmlFor={id}>{line}</label>
            </p>
          )
        })}
      </fieldset>
    </>
  )
}
