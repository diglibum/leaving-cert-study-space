import RichTextView from '../../../components/RichTextView'
import { toPlainText } from '../../essays/richText'
import type { EssayStep } from '../../essays/types'

interface PlanReferenceProps {
  plan: string
  onNavigate: (step: EssayStep) => void
}

// Read-only copy of the plan shown while writing. The plan is edited in step 3.
function PlanReference({ plan, onNavigate }: PlanReferenceProps) {
  const isEmpty = toPlainText(plan).trim() === ''

  return (
    <details className="plan-reference" open>
      <summary>Your plan</summary>
      {isEmpty ? (
        <p>You have not written a plan yet.</p>
      ) : (
        <RichTextView value={plan} />
      )}
      <button
        type="button"
        className="button button-secondary"
        onClick={() => onNavigate('plan')}
      >
        {isEmpty ? 'Go to step 3 to make a plan' : 'Edit plan in step 3'}
      </button>
    </details>
  )
}

export default PlanReference
