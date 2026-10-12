import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStoredData } from '../hooks/useStoredData'
import { todayIso } from '../features/revision/dates'
import type { PlanActions } from '../features/revision/planActions'
import { buildRevisionPlan } from '../features/revision/planner'
import type { RevisionContextValue } from '../features/revision/RevisionContext'
import SetupForm from '../features/revision/SetupForm'
import { revisionSubjects } from '../features/revision/subjects/appliedMaths'
import type { RevisionSetup } from '../features/revision/types'
import { revisionRepository } from '../storage/revisionRepository'

/** Layout for the revision pages: loads the saved plan once, shows setup the first time, and hosts Today and Calendar. */
function RevisionPage() {
  useDocumentTitle('Revision')
  const load = useCallback(() => revisionRepository.get(), [])
  const { state, reload } = useStoredData(load)
  const { pathname } = useLocation()
  // Notes belong to the page they were created on, so they disappear when the learner moves on.
  const [note, setNote] = useState<{ kind: 'status' | 'error'; text: string; path: string } | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)
  const today = todayIso()

  const stored = state.status === 'ready' ? state.data : undefined
  const plan = useMemo(() => {
    if (!stored) return null
    try {
      return buildRevisionPlan(stored.setup, revisionSubjects)
    } catch {
      return null
    }
  }, [stored])

  // After the first setup, move focus to the page heading so keyboard and screen reader users land on the plan.
  useEffect(() => {
    if (focusHeading.current && stored) {
      focusHeading.current = false
      headingRef.current?.focus()
    }
  })

  const run = useCallback(
    async (action: () => Promise<unknown>, success: string) => {
      try {
        await action()
        setNote({ kind: 'status', text: success, path: pathname })
        reload()
      } catch {
        setNote({ kind: 'error', text: 'That did not work. Your plan was not changed. Please try again.', path: pathname })
      }
    },
    [reload, pathname],
  )

  async function saveSetup(setup: RevisionSetup, projectDueDate: string | null) {
    await revisionRepository.saveSetup(setup, projectDueDate)
    if (!stored) focusHeading.current = true
    setNote({
      kind: 'status',
      text: stored ? 'Your changes are saved and the plan is rebuilt.' : 'Your plan is ready.',
      path: pathname,
    })
    reload()
  }

  const actions: PlanActions = {
    complete: (date, index, review) =>
      void run(
        () => revisionRepository.completeBlock(date, index, review),
        review ? `Block done. ${review.outcome === 'got-it' ? 'Well done.' : 'It will come back for review soon.'}` : 'Block done.',
      ),
    reopen: (date, index) => void run(() => revisionRepository.reopenBlock(date, index), 'Block marked as not done.'),
    review: (topicId, outcome) =>
      void run(
        () => revisionRepository.recordReview(topicId, outcome, today),
        outcome === 'got-it' ? 'Saved: got it.' : 'Saved: shaky. It will come back for review tomorrow.',
      ),
  }

  const onCalendar = pathname.startsWith('/revision/calendar')

  return (
    <section className="page-panel revision" aria-labelledby="page-title">
      <h1 id="page-title" tabIndex={-1} ref={headingRef}>
        Revision
      </h1>

      {state.status === 'loading' && <p role="status">Loading your plan…</p>}
      {state.status === 'error' && (
        <p role="alert">
          Your plan could not be loaded from this browser. Reload the page to try again.
        </p>
      )}
      {note && note.path === pathname && (
        <p role={note.kind === 'error' ? 'alert' : 'status'} className="revision-status">
          {note.text}
        </p>
      )}

      {state.status === 'ready' && !stored && (
        <>
          <p>
            Daily revision means <strong>recalling</strong> what you know, not rereading notes: close
            the book and test yourself, come back to topics after a few days, and practise on past
            paper questions as the exam gets closer. This page builds a plan that does that for you.
            Past papers stay in your own copy: the plan only tells you what to look at.
          </p>
          <SetupForm initial={null} today={today} onSubmit={saveSetup} />
        </>
      )}

      {stored && (
        <>
          <nav aria-label="Revision pages" className="revision-tabs">
            <Link to="/revision" aria-current={onCalendar ? undefined : 'page'}>
              Today
            </Link>
            <Link to="/revision/calendar" aria-current={onCalendar ? 'page' : undefined}>
              Calendar
            </Link>
          </nav>
          <Outlet context={{ stored, plan, today, actions, saveSetup, runAction: (a, s) => void run(a, s) } satisfies RevisionContextValue} />
        </>
      )}
    </section>
  )
}

export default RevisionPage
