import { useId, useState } from 'react'
import type { MatchExercise } from '../problems/types'

interface Props {
  exercise: MatchExercise
  onNewSet: () => void
}

/** Short texts to match to headings, such as the exam's newspaper sections. */
export function MatchPanel({ exercise, onNewSet }: Props) {
  const [choices, setChoices] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const baseId = useId()

  const correct = exercise.items.filter((item, index) => choices[index] === String(item.section)).length

  return (
    <>
      <p className="problem-statement">{exercise.instruction}</p>
      <ol className="match-sections" lang="ru" aria-label="Sections">
        {exercise.sections.map((section) => (
          <li key={section.name}>{section.name}</li>
        ))}
      </ol>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setChecked(true)
        }}
      >
        {exercise.items.map((item, index) => {
          const id = `${baseId}-${index}`
          const chosen = choices[index] ?? ''
          const result = !checked ? undefined : chosen === '' ? 'empty' : chosen === String(item.section) ? 'correct' : 'wrong'
          return (
            <div key={index} className="problem-part">
              <label htmlFor={id}>
                {index + 1}. <span lang="ru">{item.text}</span>
              </label>
              <select
                id={id}
                value={chosen}
                aria-describedby={result ? `${id}-result` : undefined}
                onChange={(event) => {
                  const next = [...choices]
                  next[index] = event.target.value
                  setChoices(next)
                  setChecked(false)
                }}
              >
                <option value="">Choose a section</option>
                {exercise.sections.map((section, sectionIndex) => (
                  <option key={section.name} value={String(sectionIndex)} lang="ru">
                    {`${sectionIndex + 1}. ${section.name}`}
                  </option>
                ))}
              </select>
              {result && (
                <span id={`${id}-result`} className={result === 'correct' ? 'result-ok' : 'result-bad'}>
                  <span aria-hidden="true">{result === 'correct' ? '\u2713 ' : '\u2717 '}</span>
                  {result === 'correct' ? 'Correct.' : result === 'empty' ? 'No answer yet.' : 'Not quite. Look for the key words.'}
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
            {showAnswers ? 'Hide answers' : 'Show answers'}
          </button>
          <button type="button" className="button button-secondary" onClick={onNewSet}>
            New set
          </button>
        </p>
      </form>
      {checked && <p role="status">{`${correct} of ${exercise.items.length} answers correct.`}</p>}
      {showAnswers && (
        <div className="problem-solution">
          <h6>Answers</h6>
          <ol>
            {exercise.items.map((item, index) => {
              const section = exercise.sections[item.section]
              return (
                <li key={index}>
                  <span lang="ru">{`${item.section + 1}. ${section.name}`}</span> ({section.gloss}). {item.note}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </>
  )
}
