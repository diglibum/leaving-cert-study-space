import { useId, useState } from 'react'
import { normaliseText } from '../problems/checkText'
import type { ListExercise } from '../problems/types'
import { keyboardHint } from './shared'

interface Props {
  exercise: ListExercise
  onNewSet: () => void
}

type Mark = 'correct' | 'wrong' | 'duplicate' | 'empty'

const markText: Record<Mark, string> = {
  correct: 'Correct.',
  wrong: 'Not on my list. It may still be right: check a dictionary.',
  duplicate: 'You already gave this word.',
  empty: 'No answer yet.',
}

/** Name several words on a theme, like the exam's semantic field task. */
export function ListPanel({ exercise, onNewSet }: Props) {
  const [answers, setAnswers] = useState<string[]>([])
  const [marks, setMarks] = useState<Mark[] | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const baseId = useId()
  const accepted = new Set(exercise.accepted.map(normaliseText))

  function check() {
    const seen = new Set<string>()
    setMarks(
      Array.from({ length: exercise.count }, (_, index) => {
        const word = normaliseText(answers[index] ?? '')
        if (word === '') return 'empty'
        if (seen.has(word)) return 'duplicate'
        seen.add(word)
        return accepted.has(word) ? 'correct' : 'wrong'
      }),
    )
  }

  const correct = marks?.filter((mark) => mark === 'correct').length ?? 0

  return (
    <>
      <p className="problem-statement">{exercise.instruction}</p>
      <p className="field-hint">
        Theme: <strong>{exercise.theme}</strong>. {keyboardHint} The check knows many common words but not every
        possible one.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          check()
        }}
      >
        {Array.from({ length: exercise.count }, (_, index) => {
          const id = `${baseId}-${index}`
          const mark = marks?.[index]
          return (
            <div key={index} className="problem-part">
              <label htmlFor={id}>Word {index + 1}</label>
              <input
                id={id}
                type="text"
                lang={exercise.lang}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={answers[index] ?? ''}
                aria-describedby={mark ? `${id}-result` : undefined}
                onChange={(event) => {
                  const next = [...answers]
                  next[index] = event.target.value
                  setAnswers(next)
                  setMarks(null)
                }}
              />
              {mark && (
                <span id={`${id}-result`} className={mark === 'correct' ? 'result-ok' : 'result-bad'}>
                  <span aria-hidden="true">{mark === 'correct' ? '\u2713 ' : '\u2717 '}</span>
                  {markText[mark]}
                </span>
              )}
            </div>
          )
        })}
        <p className="step-actions">
          <button type="submit" className="button">
            Check answers
          </button>
          <button type="button" className="button button-secondary" onClick={() => setShowAnswers((value) => !value)}>
            {showAnswers ? 'Hide words' : 'Show words'}
          </button>
          <button type="button" className="button button-secondary" onClick={onNewSet}>
            New set
          </button>
        </p>
      </form>
      {marks && <p role="status">{`${correct} of ${exercise.count} words correct.`}</p>}
      {showAnswers && (
        <div className="problem-solution">
          <h6>Words on my list</h6>
          <p lang={exercise.lang}>{exercise.accepted.join(', ')}</p>
          <p>{exercise.note}</p>
        </div>
      )}
    </>
  )
}
