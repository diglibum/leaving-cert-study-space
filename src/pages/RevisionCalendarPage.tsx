import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import CalendarView from '../features/revision/CalendarView'
import { useRevision } from '../features/revision/RevisionContext'
import SetupForm from '../features/revision/SetupForm'
import { revisionSubjects } from '../features/revision/subjects/appliedMaths'
import type { RevisionSetup } from '../features/revision/types'
import { revisionRepository } from '../storage/revisionRepository'

function RevisionCalendarPage() {
  useDocumentTitle('Revision: calendar')
  const { stored, plan, today, saveSetup, runAction } = useRevision()
  const [editing, setEditing] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)

  // After saving, move focus to the heading so keyboard and screen reader users land on the result.
  useEffect(() => {
    if (focusHeading.current && !editing) {
      focusHeading.current = false
      headingRef.current?.focus()
    }
  })

  async function save(setup: RevisionSetup, projectDueDate: string | null) {
    await saveSetup(setup, projectDueDate)
    focusHeading.current = true
    setEditing(false)
  }

  if (editing) {
    return (
      <SetupForm
        initial={{ setup: stored.setup, projectDueDate: stored.projectDueDate }}
        today={today}
        onSubmit={save}
        onCancel={() => setEditing(false)}
      />
    )
  }

  const canReplan = today > stored.setup.startDate && today < stored.setup.examDate

  return (
    <section aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" tabIndex={-1} ref={headingRef}>
        Your revision plan
      </h2>
      <p className="step-actions">
        <button type="button" className="button button-secondary" onClick={() => setEditing(true)}>
          Change setup
        </button>
        {canReplan && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              runAction(
                () => revisionRepository.saveSetup({ ...stored.setup, startDate: today }, stored.projectDueDate),
                'The plan is rebuilt from today. Your topic progress was kept.',
              )
            }
          >
            Re-plan from today
          </button>
        )}
      </p>
      <p className="field-hint">
        Missed some days? Use Re-plan from today. Nothing piles up as a backlog. Your plan is saved only in this
        browser: include it in a backup on the <Link to="/backup">Backup page</Link>.
      </p>
      {plan ? (
        <CalendarView stored={stored} plan={plan} catalog={revisionSubjects} today={today} />
      ) : (
        <p role="alert">This plan could not be built. Use Change setup to check the dates and study days.</p>
      )}
    </section>
  )
}

export default RevisionCalendarPage
