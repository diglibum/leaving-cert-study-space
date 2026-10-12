import { Fragment, useId, useState } from 'react'
import { checkText } from '../problems/checkText'
import type { AnswerResult } from '../problems/check'
import type { ClozeExercise, ClozeGap } from '../problems/types'
import { keyboardHint } from './shared'

interface Props {
  exercise: ClozeExercise
  onNewSet: () => void
}

/** A connected text with words in brackets to put into the right form, like the exam's grammar question. */
export function ClozePanel({ exercise, onNewSet }: Props) {
  const { text } = exercise
  const gaps: ClozeGap[] = text.paragraphs.flat().filter((part): part is ClozeGap => typeof part !== 'string')
  const [answers, setAnswers] = useState<string[]>([])
  const [results, setResults] = useState<AnswerResult[] | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const baseId = useId()
  const gapStart = text.paragraphs.map((_, i) =>
    text.paragraphs.slice(0, i).flat().filter((part) => typeof part !== 'string').length,
  )

  const correctCount = results?.filter((result) => result === 'correct').length ?? 0

  return (
    <>
      <p className="problem-statement">{exercise.instruction}</p>
      <p className="field-hint">{keyboardHint} A misspelled word earns nothing in the exam, so check every letter.</p>
      <h6 lang="ru">{text.title}</h6>
      <p className="field-hint">{text.summary}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setResults(gaps.map((gap, index) => checkText({ prompt: gap.base, answers: gap.answers, note: gap.note }, answers[index] ?? '')))
        }}
      >
        <div className="cloze-text" lang="ru">
          {text.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>
              {paragraph.map((part, partIndex) => {
                if (typeof part === 'string') return <Fragment key={partIndex}>{part}</Fragment>
                const index = gapStart[paragraphIndex] + paragraph.slice(0, partIndex).filter((other) => typeof other !== 'string').length
                const id = `${baseId}-${index}`
                const result = results?.[index]
                return (
                  <span key={partIndex} className="cloze-gap">
                    <input
                      id={id}
                      type="text"
                      lang="ru"
                      aria-label={`Gap ${index + 1}, word in brackets: ${part.base}`}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      size={Math.max(8, part.answers[0].length + 2)}
                      value={answers[index] ?? ''}
                      aria-invalid={result === 'wrong' ? true : undefined}
                      className={result === 'correct' ? 'cloze-ok' : result === 'wrong' ? 'cloze-bad' : undefined}
                      onChange={(event) => {
                        const next = [...answers]
                        next[index] = event.target.value
                        setAnswers(next)
                        setResults(null)
                      }}
                    />
                    <span className="cloze-base">({part.base})</span>
                    {result && result !== 'empty' && (
                      <span className={result === 'correct' ? 'result-ok' : 'result-bad'}>
                        <span aria-hidden="true">{result === 'correct' ? '\u2713' : '\u2717'}</span>
                        <span className="visually-hidden">{result === 'correct' ? ' Correct.' : ' Not quite.'}</span>
                      </span>
                    )}
                  </span>
                )
              })}
            </p>
          ))}
        </div>
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
      {results && <p role="status">{`${correctCount} of ${gaps.length} answers correct.`}</p>}
      {showAnswers && (
        <div className="problem-solution">
          <h6>Answers</h6>
          <ol>
            {gaps.map((gap, index) => (
              <li key={index}>
                <span lang="ru">{gap.answers[0]}</span>. {gap.note}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
