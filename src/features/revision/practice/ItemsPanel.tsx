import { useId, useState } from 'react'
import { checkText } from '../problems/checkText'
import type { AnswerResult } from '../problems/check'
import type { LanguageExercise } from '../problems/types'
import { resultText } from './shared'

interface Props {
  exercise: LanguageExercise
  onNewSet: () => void
}

/** Typed gap-fill and translation items, checked in the browser. */
export function ItemsPanel({ exercise, onNewSet }: Props) {
  const [answers, setAnswers] = useState<string[]>([])
  const [results, setResults] = useState<AnswerResult[] | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const baseId = useId()

  const correctCount = results?.filter((result) => result === 'correct').length ?? 0
  const promptLang = exercise.promptLang

  function check() {
    setResults(exercise.items.map((item, index) => checkText(item, answers[index] ?? '')))
  }

  return (
    <>
      <p className="problem-statement">{exercise.instruction}</p>
      <p className="field-hint">
        Switch your keyboard to the language you are practising. Capital letters and stress marks do not matter, and
        for Russian neither does the difference between {'\u0451'} and {'\u0435'}.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          check()
        }}
      >
        {exercise.items.map((item, index) => {
          const id = `${baseId}-${index}`
          const result = results?.[index]
          return (
            <div key={index} className="problem-part">
              <label htmlFor={id}>
                {index + 1}. <span lang={promptLang}>{item.prompt}</span>
              </label>
              <input
                id={id}
                type="text"
                lang={item.answerLang ?? exercise.lang}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={answers[index] ?? ''}
                aria-describedby={result ? `${id}-result` : undefined}
                onChange={(event) => {
                  const next = [...answers]
                  next[index] = event.target.value
                  setAnswers(next)
                  setResults(null)
                }}
              />
              {result && (
                <span id={`${id}-result`} className={result === 'correct' ? 'result-ok' : 'result-bad'}>
                  <span aria-hidden="true">{result === 'correct' ? '\u2713 ' : '\u2717 '}</span>
                  {resultText[result]}
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
      {results && <p role="status">{`${correctCount} of ${exercise.items.length} answers correct.`}</p>}
      {showAnswers && (
        <div className="problem-solution">
          <h6>Answers</h6>
          <ol>
            {exercise.items.map((item, index) => (
              <li key={index}>
                <span lang={item.answerLang ?? exercise.lang}>{item.answers[0]}</span>. {item.note}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
