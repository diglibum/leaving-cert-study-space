import RichTextView from '../../components/RichTextView'
import type { EssayContent } from '../essays/types'
import { steps } from '../practice/steps'

// Read-only view of every step's text.
function EssayContentView({ content }: { content: EssayContent }) {
  return (
    <dl className="content-view">
      {steps.map((step) => (
        <div key={step.id}>
          <dt>{step.title}</dt>
          <dd>
            <RichTextView value={content[step.field]} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default EssayContentView
