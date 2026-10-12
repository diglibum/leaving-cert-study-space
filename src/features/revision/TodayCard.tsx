import { useCallback, useMemo } from 'react'
import { Link } from 'react-router'
import { useStoredData } from '../../hooks/useStoredData'
import { revisionRepository } from '../../storage/revisionRepository'
import { formatPlanDate, todayIso } from './dates'
import { buildRevisionPlan } from './planner'
import { revisionSubjects } from './subjects/appliedMaths'
import { summariseToday } from './today'

/** Home page card: today's revision blocks with links to the steps and to the full calendar. */
function TodayCard() {
  const load = useCallback(() => revisionRepository.get(), [])
  const { state } = useStoredData(load)
  const today = todayIso()

  const summary = useMemo(() => {
    if (state.status !== 'ready' || !state.data) return null
    try {
      return summariseToday(state.data, buildRevisionPlan(state.data.setup, revisionSubjects), revisionSubjects, today)
    } catch {
      return 'broken' as const
    }
  }, [state, today])

  if (state.status === 'loading') return <p role="status">Loading your revision plan…</p>
  if (state.status === 'error') return <p role="alert">Your revision plan could not be loaded from this browser.</p>

  if (!summary) {
    return (
      <section className="practice-overview today-card" aria-labelledby="today-card-title">
        <div className="section-heading">
          <p className="eyebrow">Revision planner</p>
          <h2 id="today-card-title">Know what to revise each day</h2>
          <p>
            Choose your subjects, your exam date, and the days and minutes you can study. The planner
            builds a daily plan that mixes learning, recall, and past paper practice, and brings topics
            back for review at the right time.
          </p>
        </div>
        <p className="home-action">
          <Link className="button" to="/revision">
            Set up your revision
          </Link>
        </p>
      </section>
    )
  }

  if (summary === 'broken') {
    return (
      <section className="practice-overview today-card" aria-labelledby="today-card-title">
        <h2 id="today-card-title">Your revision plan</h2>
        <p>Your saved settings no longer make a plan. Open the revision page to change them.</p>
        <p className="home-action">
          <Link className="button" to="/revision">
            Open revision
          </Link>
        </p>
      </section>
    )
  }

  const heading = summary.isToday
    ? `Today, ${formatPlanDate(today)}`
    : summary.date
      ? `Next study day, ${formatPlanDate(summary.date)}`
      : 'Revision'

  return (
    <section className="practice-overview today-card" aria-labelledby="today-card-title">
      <div className="section-heading">
        <p className="eyebrow">Your revision</p>
        <h2 id="today-card-title">{heading}</h2>
        {summary.finished && <p>Your plan has finished. Good luck in the exam!</p>}
        {!summary.isToday && !summary.finished && summary.date && (
          <p>Nothing is planned for today. You can start on the next study day now.</p>
        )}
        {summary.blocks.length > 0 && (
          <p>
            {summary.doneCount} of {summary.blocks.length} blocks done, {summary.totalMinutes} minutes in total.
          </p>
        )}
        {summary.dueCount > 0 && (
          <p>
            <strong>{summary.dueCount}</strong> {summary.dueCount === 1 ? 'topic is' : 'topics are'} due for recall.
          </p>
        )}
      </div>
      {summary.blocks.length > 0 && (
        <ol className="today-blocks">
          {summary.blocks.map((block) => (
            <li key={block.index} className="today-block">
              <span className="today-minutes">{block.minutes} min</span> {block.subjectName}: {block.title}
              {block.done && <span className="done-mark"> (done)</span>}
            </li>
          ))}
        </ol>
      )}
      <p className="home-action step-actions">
        <Link className="button" to="/revision">
          {summary.blocks.length > 0 ? 'Open today\u2019s steps' : 'Open revision'}
        </Link>
        <Link className="button button-secondary" to="/revision/calendar">
          Full calendar
        </Link>
      </p>
    </section>
  )
}

export default TodayCard
