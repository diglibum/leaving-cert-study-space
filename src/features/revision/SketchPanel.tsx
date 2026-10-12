import { useId, useMemo, useState } from 'react'
import { CopyPrompt } from './CopyPrompt'
import { DiagramView } from './DiagramView'
import { generateSketch } from './problems/appliedMathsSketches'
import { buildCheckPrompt } from './problems/aiCheck'

interface Props {
  topicId: string
  seed: string
}

/** Draw on paper first, then reveal a reference graph and tick the features your sketch has. */
export function SketchPanel({ topicId, seed }: Props) {
  const [round, setRound] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [ticked, setTicked] = useState<boolean[]>([])
  const baseId = useId()
  const task = useMemo(() => generateSketch(topicId, `${seed}:${round}`), [topicId, seed, round])

  if (!task) return null

  const count = ticked.filter(Boolean).length
  const prompt = buildCheckPrompt({
    question: `${task.prompt}\n\nA correct sketch shows:\n${task.checklist.map((item) => `- ${item}`).join('\n')}`,
    working: 'My sketch is on paper. I will attach a photo of it. Please compare it with the list above.',
  })

  function newSketch() {
    setRound((value) => value + 1)
    setRevealed(false)
    setTicked([])
  }

  return (
    <section className="problem-panel sketch-panel" aria-label="Sketch task">
      <h5>Sketch task</h5>
      <p className="problem-statement">{task.prompt}</p>
      <p className="field-hint">Draw it on paper first, with a ruler and labelled axes. Then compare it with the reference.</p>
      <p className="step-actions">
        <button type="button" className="button" aria-expanded={revealed} onClick={() => setRevealed((value) => !value)}>
          {revealed ? 'Hide reference graph' : 'Show reference graph'}
        </button>
        <button type="button" className="button button-secondary" onClick={newSketch}>
          New sketch task
        </button>
      </p>
      {revealed && (
        <div className="sketch-reference">
          <DiagramView diagram={task.reference} />
          <fieldset>
            <legend>My sketch shows:</legend>
            {task.checklist.map((item, index) => (
              <div key={index} className="check-row">
                <input
                  id={`${baseId}-${index}`}
                  type="checkbox"
                  checked={ticked[index] ?? false}
                  onChange={(event) => {
                    const next = task.checklist.map((_, i) => ticked[i] ?? false)
                    next[index] = event.target.checked
                    setTicked(next)
                  }}
                />
                <label htmlFor={`${baseId}-${index}`}>{item}</label>
              </div>
            ))}
          </fieldset>
          <p role="status">
            {count} of {task.checklist.length} features match.{' '}
            {count < task.checklist.length ? 'Fix the missing ones on your paper, then tick them.' : 'Well done.'}
          </p>
          <CopyPrompt text={prompt} label="Copy prompt for an AI check of my sketch" />
        </div>
      )}
    </section>
  )
}
