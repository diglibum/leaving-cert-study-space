import { useState } from 'react'
import { hasContent } from '../../essays/content'
import type { Essay, EssayStep } from '../../essays/types'
import { findQuestion } from '../../questions/questions'
import type { EssayUpdate } from '../../../storage/essayRepository'
import { getStep } from '../steps'
import type { SaveStatus as SaveStatusValue } from '../useActiveEssay'
import QuestionPicker from './QuestionPicker'
import SaveStatus from './SaveStatus'
import StepEditor from './StepEditor'
import StepNav from './StepNav'
import BackupReminder from './BackupReminder'
import Checklist from './Checklist'
import PlanReference from './PlanReference'
import ParagraphReview from './ParagraphReview'

interface EssayWorkspaceProps {
  essay: Essay
  saveStatus: SaveStatusValue
  onChange: (patch: EssayUpdate) => void
  onChangeStep: (step: EssayStep) => void
  onSaveNow: () => void
}

function EssayWorkspace({
  essay,
  saveStatus,
  onChange,
  onChangeStep,
  onSaveNow,
}: EssayWorkspaceProps) {
  const [changingQuestion, setChangingQuestion] = useState(false)
  const question = findQuestion(essay.questionId)
  const step = getStep(essay.step)

  return (
    <>
      <section className="current-question" aria-labelledby="question-heading">
        <h2 id="question-heading">Your question</h2>
        {question ? (
          <>
            <p className="question-task">{question.task}</p>
            <p className="question-meta">
              Leaving Certificate {question.year}, Paper 1, question{' '}
              {question.questionNumber} · theme: {question.theme}
            </p>
          </>
        ) : (
          <p>No question is selected. Choose one below.</p>
        )}
        {question && (
          <button
            type="button"
            className="button button-secondary"
            aria-expanded={changingQuestion}
            onClick={() => setChangingQuestion((open) => !open)}
          >
            {changingQuestion ? 'Keep this question' : 'Change question'}
          </button>
        )}
        {(changingQuestion || !question) && (
          <>
            <p>Your notes and writing are kept when you change the question.</p>
            <QuestionPicker
              currentId={essay.questionId}
              onSelect={(chosen) => {
                onChange({ questionId: chosen.id })
                onSaveNow()
                setChangingQuestion(false)
              }}
            />
          </>
        )}
      </section>

      <StepNav current={essay.step} onSelect={onChangeStep} />

      <StepEditor
        step={step}
        value={essay[step.field]}
        hintLevel={essay.hintLevel}
        onChange={(value) => onChange({ [step.field]: value })}
        onBlur={onSaveNow}
        onHintLevelChange={(hintLevel) => onChange({ hintLevel })}
        onNavigate={onChangeStep}
      >
        {step.id === 'draft' && (
          <PlanReference plan={essay.plan} onNavigate={onChangeStep} />
        )}
        {step.id === 'self-check' && (
          <>
            <ParagraphReview
              draft={essay.draft}
              tags={essay.paragraphTags}
              onChange={(paragraphTags) => {
                onChange({ paragraphTags })
                onSaveNow()
              }}
            />
            <Checklist
              checklist={essay.checklist}
              onChange={(checklist) => onChange({ checklist })}
              onBlur={onSaveNow}
            />
            <h3 className="notes-heading">3. Your own notes</h3>
          </>
        )}
      </StepEditor>

      <SaveStatus status={saveStatus} onRetry={onSaveNow} />
      {hasContent(essay) && <BackupReminder />}
    </>
  )
}

export default EssayWorkspace
