import { useId } from 'react'
import { AiCheckBox } from './AiCheckBox'
import { blockHelp, blockTitle } from './labels'
import { ExercisePanel } from './ExercisePanel'
import { ProblemPanel } from './ProblemPanel'
import { hasSketch } from './problems/appliedMathsSketches'
import { SketchPanel } from './SketchPanel'
import type { PlanActions } from './planActions'
import type { TopicProgress } from './progress'
import { blockTasks } from './tasks'
import type { PlanBlock, RevisionPlan, RevisionSubject } from './types'

interface Props {
  plan: RevisionPlan
  date: string
  index: number
  block: PlanBlock
  subject: RevisionSubject | undefined
  topicProgress: Readonly<Record<string, TopicProgress>>
  done: boolean
  open: boolean
  onToggle: () => void
  actions: PlanActions
}

/** One problem in a learn block; practise blocks get roughly one per half hour. */
function problemCount(block: PlanBlock): number {
  return block.kind === 'practise-topic' ? Math.min(3, Math.max(1, Math.round(block.minutes / 30))) : 1
}

export function BlockCard({ plan, date, index, block, subject, topicProgress, done, open, onToggle, actions }: Props) {
  const title = blockTitle(block, subject)
  const topic = subject?.topics.find((entry) => entry.id === block.topicId)
  const tasks = blockTasks({ plan, date, index, subject, topicProgress })
  const bodyId = useId()

  return (
    <li className={`block-card${done ? ' block-card-done' : ''}${open ? '' : ' block-card-collapsed'}`}>
      <header className="block-header">
        <div>
          <p className="block-subject">{subject?.name ?? block.subjectId}</p>
          <h4>{title}</h4>
        </div>
        <p className="block-chips">
          <span className="chip">{block.minutes} min</span>
          {done && <span className="chip chip-done">Done</span>}
          <button
            type="button"
            className="button button-secondary button-small"
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={`${open ? 'Hide' : 'Show'} steps, ${title}`}
            onClick={onToggle}
          >
            {open ? 'Hide' : done ? 'Review' : 'Start'}
          </button>
        </p>
      </header>

      <div id={bodyId} className="block-body" hidden={!open}>
        <p className="field-hint">{blockHelp(block, subject)}</p>

        <ol className="task-list" aria-label={`Steps for ${title}`}>
          {tasks.map((task, taskIndex) => (
            <li key={taskIndex}>
              <p>
                <strong className="task-minutes">{task.minutes} min.</strong> {task.text}
              </p>
              {task.items.length > 0 && (
                <ul>
                  {task.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {subject?.paperParts && block.kind !== 'light-review' && (
          <p className="field-hint">
            Past papers and marking schemes are on examinations.ie. Question numbers refer to the Higher Level paper
            of that year.
          </p>
        )}

        {topic?.hasProblems &&
          Array.from({ length: problemCount(block) }, (_, n) => (
            <ProblemPanel key={n} topicId={topic.id} seed={`${date}:${index}:${n}`} />
          ))}
        {topic?.hasExercises &&
          subject?.exercises &&
          Array.from({ length: problemCount(block) }, (_, n) => (
            <ExercisePanel
              key={n}
              seed={`${date}:${index}:${n}`}
              makeExercise={(exerciseSeed) => subject.exercises?.(topic.id, exerciseSeed)}
            />
          ))}
        {topic && hasSketch(topic.id) && <SketchPanel topicId={topic.id} seed={`${date}:${index}`} />}
        <AiCheckBox kind={subject?.checkKind} subjectName={subject?.name} profiles={subject?.checkProfiles} />

        {block.topicId && !done && (
          <p className="field-hint">At the end, write down what you could not remember. It comes back for review.</p>
        )}

        <div className="block-footer">
          {done ? (
            <p>
              <button
                type="button"
                className="button button-link"
                aria-label={`Mark as not done, ${title}`}
                onClick={() => actions.reopen(date, index)}
              >
                Mark as not done
              </button>
            </p>
          ) : block.topicId ? (
            <p className="step-actions">
              <button
                type="button"
                className="button"
                aria-label={`Done: got it, ${title}`}
                onClick={() => actions.complete(date, index, { topicId: block.topicId as string, outcome: 'got-it' })}
              >
                Done: got it
              </button>
              <button
                type="button"
                className="button button-secondary"
                aria-label={`Done: still shaky, ${title}`}
                onClick={() => actions.complete(date, index, { topicId: block.topicId as string, outcome: 'shaky' })}
              >
                Done: still shaky
              </button>
            </p>
          ) : (
            <p className="step-actions">
              <button
                type="button"
                className="button"
                aria-label={`Mark as done, ${title}`}
                onClick={() => actions.complete(date, index)}
              >
                Mark as done
              </button>
            </p>
          )}
        </div>
      </div>
    </li>
  )
}
