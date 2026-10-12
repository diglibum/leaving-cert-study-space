import { useMemo } from 'react'
import { Link } from 'react-router'
import { daysBetween, formatIsoDate, formatPlanDate, parseIsoDate, startOfWeek } from './dates'
import { blockTitle, phaseInfo } from './labels'
import { summariseProgress } from './progress'
import type { StoredRevision } from './stored'
import type { PlanDay, RevisionPhase, RevisionPlan, RevisionSubject } from './types'

interface Props {
  stored: StoredRevision
  plan: RevisionPlan
  catalog: readonly RevisionSubject[]
  today: string
}

const phaseOrder: RevisionPhase[] = ['build', 'practise', 'exam', 'light']

function weekKey(date: string): string {
  return formatIsoDate(startOfWeek(parseIsoDate(date) as number))
}

/** The whole plan at a glance: progress, phases, and every week. Studying happens on the Today page. */
function CalendarView({ stored, plan, catalog, today }: Props) {
  const subjectById = useMemo(() => new Map(catalog.map((subject) => [subject.id, subject])), [catalog])
  const weeks = useMemo(() => {
    const grouped = new Map<string, PlanDay[]>()
    for (const day of plan.days) grouped.set(weekKey(day.date), [...(grouped.get(weekKey(day.date)) ?? []), day])
    return [...grouped.entries()]
  }, [plan])
  const currentWeek = weekKey(today)

  const progress = stored.setup.subjects.flatMap((entry) => {
    const subject = subjectById.get(entry.subjectId)
    if (!subject) return []
    const ids = subject.topics.filter((topic) => entry.level === 'higher' || !topic.higherOnly).map((topic) => topic.id)
    return [{ subject, summary: summariseProgress(ids, stored.topicProgress, today) }]
  })

  const projectDays =
    stored.projectDueDate && parseIsoDate(stored.projectDueDate) !== null
      ? daysBetween(parseIsoDate(today) as number, parseIsoDate(stored.projectDueDate) as number)
      : null

  return (
    <>
      <section aria-labelledby="progress-heading">
        <h3 id="progress-heading">Where you are</h3>
        <ul>
          {progress.map(({ subject, summary }) => (
            <li key={subject.id}>
              <strong>{subject.name}:</strong> {summary.reviewed} of {summary.total} topics checked, {summary.shaky}{' '}
              shaky, {summary.due} due for review today
            </li>
          ))}
          {projectDays !== null && (
            <li>
              <strong>Modelling project:</strong> due {formatPlanDate(stored.projectDueDate as string, true)}
              {projectDays > 0 ? ` (${projectDays} days left)` : projectDays === 0 ? ' (today)' : ' (date has passed)'}
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="phases-heading">
        <h3 id="phases-heading">Phases</h3>
        <ul>
          {phaseOrder.flatMap((phase) => {
            const start = plan.phaseStarts[phase]
            return start
              ? [
                  <li key={phase}>
                    <strong>{phaseInfo[phase].label}</strong> from {formatPlanDate(start, true)}.{' '}
                    {phaseInfo[phase].description}
                  </li>,
                ]
              : []
          })}
        </ul>
      </section>

      <section aria-labelledby="full-plan">
        <h3 id="full-plan">Full plan by week</h3>
        {weeks.map(([week, days]) => {
          const studyDays = days.filter((day) => day.blocks.length > 0)
          const total = studyDays.reduce((sum, day) => sum + day.blocks.length, 0)
          const done = studyDays.reduce((sum, day) => sum + (stored.completed[day.date]?.length ?? 0), 0)
          return (
            <details key={week} open={week === currentWeek} className="plan-week">
              <summary>
                Week of {formatPlanDate(week)}: {total} blocks, {done} done
              </summary>
              {studyDays.length === 0 ? (
                <p>No study days this week.</p>
              ) : (
                <ul>
                  {studyDays.map((day) => (
                    <li key={day.date}>
                      <strong>{formatPlanDate(day.date)}</strong> ({phaseInfo[day.phase].label}){' '}
                      <Link
                        to={day.date === today ? '/revision' : `/revision/day/${day.date}`}
                        aria-label={`Open steps for ${formatPlanDate(day.date)}`}
                      >
                        Open steps
                      </Link>
                      <ul>
                        {day.blocks.map((block, index) => {
                          const isDone = (stored.completed[day.date] ?? []).includes(index)
                          return (
                            <li key={index}>
                              {subjectById.get(block.subjectId)?.name ?? block.subjectId}, {block.minutes} min:{' '}
                              {blockTitle(block, subjectById.get(block.subjectId))}
                              {isDone ? ' (done)' : ''}
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          )
        })}
      </section>
    </>
  )
}

export default CalendarView
