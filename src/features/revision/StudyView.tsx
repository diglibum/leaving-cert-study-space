import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BlockCard } from './BlockCard'
import { formatPlanDate } from './dates'
import { phaseInfo } from './labels'
import type { PlanActions } from './planActions'
import { dueTopicIds } from './progress'
import type { StoredRevision } from './stored'
import type { PlanDay, RevisionPlan, RevisionSubject } from './types'

interface Props {
  stored: StoredRevision
  plan: RevisionPlan
  catalog: readonly RevisionSubject[]
  today: string
  actions: PlanActions
  /** A study day chosen from the calendar. Without it the page shows today, or the next study day. */
  date?: string
}

function findTopic(catalog: readonly RevisionSubject[], topicId: string) {
  for (const subject of catalog) {
    const topic = subject.topics.find((entry) => entry.id === topicId)
    if (topic) return { subject, topic }
  }
  return undefined
}

function DayBlocks({
  day,
  plan,
  stored,
  catalog,
  actions,
}: Pick<Props, 'plan' | 'stored' | 'catalog' | 'actions'> & { day: PlanDay }) {
  const subjectById = useMemo(() => new Map(catalog.map((subject) => [subject.id, subject])), [catalog])
  const doneIndexes = (stored.completed[day.date] ?? []).filter((index) => index < day.blocks.length)
  const firstOpen = day.blocks.findIndex((_, index) => !doneIndexes.includes(index))
  // The learner's own show or hide choices; every other card follows the default: only the next unfinished block is open.
  const [manual, setManual] = useState<Record<number, boolean>>({})

  const completing: PlanActions = {
    ...actions,
    complete: (date, index, review) => {
      setManual((current) => {
        const { [index]: _removed, ...rest } = current
        return rest
      })
      actions.complete(date, index, review)
    },
  }

  return (
    <>
      <div className="day-progress">
        <progress aria-label="Blocks done" max={day.blocks.length} value={doneIndexes.length} />
        <span>
          {doneIndexes.length} of {day.blocks.length} blocks done, {day.blocks.reduce((sum, block) => sum + block.minutes, 0)}{' '}
          minutes planned
        </span>
      </div>
      <ol className="block-cards">
        {day.blocks.map((block, index) => {
          const open = manual[index] ?? index === firstOpen
          return (
            <BlockCard
              key={`${day.date}-${index}`}
              plan={plan}
              date={day.date}
              index={index}
              block={block}
              subject={subjectById.get(block.subjectId)}
              topicProgress={stored.topicProgress}
              done={doneIndexes.includes(index)}
              open={open}
              onToggle={() => setManual((current) => ({ ...current, [index]: !open }))}
              actions={completing}
            />
          )
        })}
      </ol>
    </>
  )
}

/** The page for studying: one day, with only the work that day needs. */
function StudyView({ stored, plan, catalog, today, actions, date }: Props) {
  const lastDate = plan.days[plan.days.length - 1]?.date
  const firstDate = plan.days[0]?.date
  const todayPlan = plan.days.find((day) => day.date === today)
  const todayHasBlocks = (todayPlan?.blocks.length ?? 0) > 0
  const afterEnd = lastDate !== undefined && today > lastDate
  const beforeStart = firstDate !== undefined && today < firstDate
  const chosen = date && date !== today ? plan.days.find((day) => day.date === date && day.blocks.length > 0) : undefined
  const nextDay = todayHasBlocks || afterEnd ? undefined : plan.days.find((day) => day.date > today && day.blocks.length > 0)
  const focusDay = chosen ?? (date && date !== today ? undefined : todayHasBlocks ? todayPlan : nextDay)
  const followingDay = focusDay ? plan.days.find((day) => day.date > focusDay.date && day.blocks.length > 0) : undefined

  const due = dueTopicIds(stored.topicProgress, today).flatMap((id) => {
    const found = findTopic(catalog, id)
    return found ? [{ id, title: found.topic.title, subject: found.subject.name }] : []
  })

  if (date && date !== today && !chosen) {
    return (
      <section aria-labelledby="today-heading">
        <h2 id="today-heading">No study blocks on {formatPlanDate(date)}</h2>
        <p>That day has nothing planned, or it is outside your plan.</p>
        <p className="step-actions">
          <Link className="button" to="/revision">
            Back to today
          </Link>
        </p>
      </section>
    )
  }

  const heading = !focusDay
    ? `Today, ${formatPlanDate(today)}`
    : chosen
      ? `Study day: ${formatPlanDate(focusDay.date)}`
      : focusDay.date === today
        ? `Today, ${formatPlanDate(today)}`
        : `Next study day: ${formatPlanDate(focusDay.date)}`

  return (
    <section aria-labelledby="today-heading">
      <div className="study-heading">
        <h2 id="today-heading">{heading}</h2>
        {focusDay && <span className="chip">{phaseInfo[focusDay.phase].label} phase</span>}
      </div>

      {beforeStart && (
        <p>
          Your plan starts on {formatPlanDate(firstDate as string, true)}. You can begin early: the first study day is
          below, and its blocks can be marked done now.
        </p>
      )}
      {afterEnd && <p>Your plan has finished. Good luck in the exam!</p>}
      {todayPlan && todayPlan.blocks.length === 0 && !chosen && <p>Rest day. Nothing is planned for today.</p>}
      {chosen && <p className="field-hint">You are studying ahead. Blocks you finish are saved for that day.</p>}
      {focusDay && !chosen && focusDay.date !== today && !beforeStart && (
        <p className="field-hint">Nothing is due today, but you can start now. Blocks you finish are saved for that day.</p>
      )}

      {due.length > 0 && (
        <div className="recall-box">
          <h3>Recall first (5 to 10 minutes)</h3>
          <p>
            Close your notes and try to explain each topic or solve a question on it. Then be honest with yourself:{' '}
            <strong>Got it</strong> means you managed without notes, <strong>Shaky</strong> means you need to come back
            soon.
          </p>
          <ul className="block-list">
            {due.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.title}</strong> ({item.subject})
                </p>
                <p className="step-actions">
                  <button
                    type="button"
                    className="button"
                    aria-label={`Got it, ${item.title}`}
                    onClick={() => actions.review(item.id, 'got-it')}
                  >
                    Got it
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Shaky, ${item.title}`}
                    onClick={() => actions.review(item.id, 'shaky')}
                  >
                    Shaky
                  </button>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {focusDay && (
        <DayBlocks key={focusDay.date} day={focusDay} plan={plan} stored={stored} catalog={catalog} actions={actions} />
      )}

      <p className="step-actions study-footer">
        {chosen && (
          <Link className="button button-secondary" to="/revision">
            Back to today
          </Link>
        )}
        {followingDay && (
          <Link className="button button-secondary" to={`/revision/day/${followingDay.date}`}>
            Next study day: {formatPlanDate(followingDay.date)}
          </Link>
        )}
      </p>
    </section>
  )
}

export default StudyView
