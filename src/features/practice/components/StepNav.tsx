import type { EssayStep } from '../../essays/types'
import { steps } from '../steps'

interface StepNavProps {
  current: EssayStep
  onSelect: (step: EssayStep) => void
}

function StepNav({ current, onSelect }: StepNavProps) {
  return (
    <nav aria-label="Essay steps">
      <ol className="step-nav">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              className="step-nav-button"
              aria-current={step.id === current ? 'step' : undefined}
              onClick={() => onSelect(step.id)}
            >
              <span className="step-number" aria-hidden="true">
                {index + 1}
              </span>
              {step.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default StepNav
