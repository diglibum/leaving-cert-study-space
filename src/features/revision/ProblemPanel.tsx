import { useId, useMemo, useState } from 'react'
import { CopyPrompt } from './CopyPrompt'
import { DiagramView } from './DiagramView'
import { buildCheckPrompt } from './problems/aiCheck'
import { generatePracticeProblem } from './problems/registry'
import { checkAnswer, formatAnswer, type AnswerResult } from './problems/check'

interface Props {
  topicId: string
  /** Same seed, same problem: use the date and block so a problem stays put during the day. */
  seed: string
}

const resultText: Record<AnswerResult, string> = {
  correct: 'Correct.',
  wrong: 'Not quite. Check your method and try again.',
  empty: 'No answer yet.',
  invalid: 'Type a number, for example 12.5.',
}

export function ProblemPanel({ topicId, seed }: Props) {
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [results, setResults] = useState<AnswerResult[] | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [working, setWorking] = useState('')
  const baseId = useId()
  const problem = useMemo(() => generatePracticeProblem(topicId, `${seed}:${round}`), [topicId, seed, round])

  if (!problem) return null

  const typed = problem.parts.map((part, index) => `${part.label} ${answers[index] ?? ''}`.trim())
  const prompt = buildCheckPrompt({
    question: [problem.statement, ...(problem.diagram ? [`Diagram: ${problem.diagram.description}`] : []), ...problem.parts.map((part) => `${part.label} ${part.prompt}`)].join('\n'),
    working,
    answers: typed,
    reference: problem.parts.map((part) => `${part.label} ${formatAnswer(part)}`),
  })
  const correctCount = results?.filter((result) => result === 'correct').length ?? 0

  function check() {
    if (!problem) return
    setResults(problem.parts.map((part, index) => checkAnswer(part, answers[index] ?? '')))
  }

  function newProblem() {
    setRound((value) => value + 1)
    setAnswers([])
    setResults(null)
    setShowSolution(false)
    setWorking('')
  }

  return (
    <section className="problem-panel" aria-label="Practice problem">
      <h5>Practice problem</h5>
      <p className="problem-statement">{problem.statement}</p>
      {problem.diagram && <DiagramView diagram={problem.diagram} />}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          check()
        }}
      >
        {problem.parts.map((part, index) => {
          const id = `${baseId}-${index}`
          const result = results?.[index]
          return (
            <div key={index} className="problem-part">
              <label htmlFor={id}>
                {part.label} {part.prompt}
                {part.unit ? ` (${part.unit})` : ''}
              </label>
              <input
                id={id}
                type="text"
                inputMode="decimal"
                autoComplete="off"
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
          <button type="button" className="button button-secondary" onClick={() => setShowSolution((value) => !value)}>
            {showSolution ? 'Hide worked solution' : 'Show worked solution'}
          </button>
          <button type="button" className="button button-secondary" onClick={newProblem}>
            New problem
          </button>
        </p>
      </form>
      {results && <p role="status">{`${correctCount} of ${problem.parts.length} answers correct.`}</p>}
      {showSolution && (
        <div className="problem-solution">
          <h6>Worked solution</h6>
          {problem.solutionDiagram && <DiagramView diagram={problem.solutionDiagram} />}
          <ol>
            {problem.solution.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ol>
          <p>
            Answers: {problem.parts.map((part) => `${part.label} ${formatAnswer(part)}`).join('; ')}
          </p>
        </div>
      )}
      <details className="problem-ai">
        <summary>Ask an AI to check my working</summary>
        <label htmlFor={`${baseId}-working`}>Your working (optional, for the AI check)</label>
        <p className="field-hint">
          Solve on paper first. Type the key steps here, or leave this empty and attach a photo of your page
          when you paste the prompt into the AI tool.
        </p>
        <textarea id={`${baseId}-working`} rows={5} value={working} onChange={(event) => setWorking(event.target.value)} />
        <CopyPrompt text={prompt} label="Copy working and answers for an AI check" />
      </details>
    </section>
  )
}
