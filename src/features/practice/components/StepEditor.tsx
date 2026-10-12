import { useEffect, useRef, type ReactNode } from 'react'
import RichTextEditor from '../../../components/RichTextEditor'
import { toPlainText } from '../../essays/richText'
import { hintLevels, type EssayStep, type HintLevel } from '../../essays/types'
import { hintLevelLabels, hintsFor, steps, type StepDefinition } from '../steps'
import { countWords } from '../text'

interface StepEditorProps {
  step: StepDefinition
  value: string
  hintLevel: HintLevel
  onChange: (value: string) => void
  onBlur: () => void
  onHintLevelChange: (level: HintLevel) => void
  onNavigate: (step: EssayStep) => void
  // Extra tools shown between the hints and the notes field.
  children?: ReactNode
}

function StepEditor({
  step,
  value,
  hintLevel,
  onChange,
  onBlur,
  onHintLevelChange,
  onNavigate,
  children,
}: StepEditorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step.id)
  const index = steps.findIndex((candidate) => candidate.id === step.id)
  const previous = steps[index - 1]
  const next = steps[index + 1]
  const hints = hintsFor(step, hintLevel)

  // Move focus to the new step's heading so keyboard and screen reader users
  // know the content changed.
  useEffect(() => {
    if (previousStep.current === step.id) return
    previousStep.current = step.id
    headingRef.current?.focus()
  }, [step.id])

  return (
    <section className="step-editor" aria-labelledby="step-heading">
      <p className="eyebrow">
        Step {index + 1} of {steps.length}
      </p>
      <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
        {step.title}
      </h2>
      <p id="step-instruction">{step.instruction}</p>

      <fieldset className="hint-level">
        <legend>Help level</legend>
        {hintLevels.map((level) => (
          <label key={level}>
            <input
              type="radio"
              name="hint-level"
              value={level}
              checked={hintLevel === level}
              onChange={() => onHintLevelChange(level)}
            />
            {hintLevelLabels[level]}
          </label>
        ))}
      </fieldset>

      {hints.length > 0 && (
        <aside className="hints" aria-labelledby="hints-heading">
          <h3 id="hints-heading">Hints</h3>
          <ul>
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </aside>
      )}

      {children}

      <p className="field-label" id="step-text-label">
        Your notes for “{step.title}”
      </p>
      <RichTextEditor
        key={step.id}
        value={value}
        placeholder={step.placeholder}
        labelledBy="step-text-label"
        describedBy="step-instruction"
        onChange={onChange}
        onBlur={onBlur}
      />
      {step.id === 'draft' && (
        <p className="word-count">Word count: {countWords(toPlainText(value))}</p>
      )}

      <div className="step-actions">
        {previous ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => onNavigate(previous.id)}
          >
            Back: {previous.title}
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            type="button"
            className="button"
            onClick={() => onNavigate(next.id)}
          >
            Next: {next.title}
          </button>
        )}
      </div>
    </section>
  )
}

export default StepEditor
