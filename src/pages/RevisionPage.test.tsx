import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { beforeEach, describe, expect, it } from 'vitest'
import { addDays, formatIsoDate, parseIsoDate, todayIso } from '../features/revision/dates'
import type { RevisionSetup } from '../features/revision/types'
import { db } from '../storage/database'
import { revisionRepository } from '../storage/revisionRepository'

const daysFromToday = (offset: number) => formatIsoDate(addDays(parseIsoDate(todayIso()) as number, offset))

const setup = (startOffset = 0): RevisionSetup => ({
  startDate: daysFromToday(startOffset),
  examDate: daysFromToday(300),
  subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
  minutesByWeekday: { 0: 60, 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60 },
})

function renderPage(path = '/revision') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await db.revisionPlans.clear()
})

describe('Revision page: setup', () => {
  it('shows the setup form first and explains problems', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Set up your revision' })).toBeInTheDocument()

    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      await user.clear(screen.getByLabelText(day))
      await user.type(screen.getByLabelText(day), '0')
    }
    await user.click(screen.getByRole('button', { name: 'Create my plan' }))

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/at least one study day/)).toBeInTheDocument()
    expect(await revisionRepository.get()).toBeUndefined()
  })

  it('rejects minutes that are not numbers in range', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Set up your revision' })
    await user.clear(screen.getByLabelText('Monday'))
    await user.type(screen.getByLabelText('Monday'), '9999')
    await user.click(screen.getByRole('button', { name: 'Create my plan' }))
    expect(await screen.findByText(/Monday: enter minutes between 0 and 480/)).toBeInTheDocument()
  })

  it('creates a plan, moves focus to it, and saves it', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Set up your revision' })
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      await user.clear(screen.getByLabelText(day))
      await user.type(screen.getByLabelText(day), '60')
    }
    fireEvent.change(screen.getByLabelText('First exam date'), { target: { value: daysFromToday(300) } })
    await user.click(screen.getByRole('button', { name: 'Create my plan' }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Revision' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('status')).toHaveTextContent('Your plan is ready.')
    expect(await screen.findByRole('heading', { name: /^Today,/ })).toBeInTheDocument()
    expect(await revisionRepository.get()).toMatchObject({ setup: { subjects: [{ subjectId: 'applied-maths' }] } })
  })
})

describe('Revision page: Russian', () => {
  it('offers Russian in the setup and shows the project field only with Applied Mathematics', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Set up your revision' })
    expect(screen.getByLabelText('Project due date')).toBeInTheDocument()
    expect(screen.queryByText(/Russian oral exam is held before/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Russian' }))
    expect(screen.getByText(/Russian oral exam is held before/)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Applied Mathematics' }))
    expect(screen.queryByLabelText('Project due date')).not.toBeInTheDocument()
  })

  it('creates a plan for Russian only, with language steps and a writing check', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup({ ...setup(), subjects: [{ subjectId: 'russian', level: 'higher', confidence: 'okay' }] }, null)
    renderPage()

    expect(await screen.findAllByText('Russian')).not.toHaveLength(0)
    const steps = (await screen.findAllByRole('list', { name: /^Steps for Learn: / }))[0]
    expect(within(steps).getByText(/Close your notes\. Answer these aloud or on paper from memory/)).toBeInTheDocument()
    expect(screen.queryByText(/Formulae and Tables/)).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Practice problem' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Exercise set' })).toBeInTheDocument()
    expect(within(steps).getByText(/Do the exercise set below without notes/)).toBeInTheDocument()

    await user.click(screen.getAllByText('Check my own writing with an AI')[0])
    expect(screen.getAllByLabelText('My text').length).toBeGreaterThan(0)
  })

  it('plans Applied Mathematics and Russian together', async () => {
    const both = [
      { subjectId: 'applied-maths', level: 'higher' as const, confidence: 'okay' as const },
      { subjectId: 'russian', level: 'higher' as const, confidence: 'okay' as const },
    ]
    await revisionRepository.saveSetup({ ...setup(), subjects: both }, null)
    renderPage('/revision/calendar')
    expect(await screen.findByText(/Applied Mathematics:/)).toBeInTheDocument()
    expect(screen.getByText(/Russian:/)).toBeInTheDocument()
  })
})

describe('Revision page: plan', () => {
  it('keeps the calendar off the study page and the steps off the calendar page', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    expect(await screen.findByRole('heading', { name: /^Today,/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Full plan by week' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Phases' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('link', { name: 'Calendar' }))
    expect(await screen.findByRole('heading', { name: 'Full plan by week' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('list', { name: /^Steps for / })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^Today,/ })).not.toBeInTheDocument()
  })

  it('opens only the next unfinished block and lets the learner open or hide the others', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    const steps = await screen.findAllByRole('list', { name: /^Steps for / })
    expect(steps).toHaveLength(1)
    const buttons = screen.getAllByRole('button', { name: /^(Show|Hide) steps, / })
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')

    await user.click(buttons[1])
    expect(screen.getAllByRole('list', { name: /^Steps for / })).toHaveLength(2)
    await user.click(screen.getAllByRole('button', { name: /^Hide steps, / })[1])
    expect(screen.getAllByRole('list', { name: /^Steps for / })).toHaveLength(1)
  })

  it('opens the next block when one is finished', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    await user.click((await screen.findAllByRole('button', { name: /^Done: got it, Learn: / }))[0])
    await screen.findByText('Block done. Well done.')
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /^(Show|Hide) steps, / })
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
    })
  })

  it('lets the learner open later study days and mark them done', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    await user.click(await screen.findByRole('link', { name: /^Next study day:/ }))
    expect(await screen.findByRole('heading', { name: /^Study day:/ })).toBeInTheDocument()
    expect(screen.getByText('You are studying ahead.', { exact: false })).toBeInTheDocument()

    await user.click((await screen.findAllByRole('button', { name: /^Done: got it, Learn: / }))[0])
    await waitFor(async () => expect((await revisionRepository.get())?.completed[daysFromToday(1)]).toEqual([0]))

    await user.click(await screen.findByRole('link', { name: 'Back to today' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: /^Study day:/ })).not.toBeInTheDocument())

    await user.click(screen.getByRole('link', { name: 'Calendar' }))
    const openLinks = await screen.findAllByRole('link', { name: /^Open steps for / })
    await user.click(openLinks[2])
    expect(await screen.findByRole('heading', { name: /^Study day:/ })).toBeInTheDocument()
  })

  it('lets the learner start early on the next study day when the plan has not begun', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(1), null)
    renderPage()

    expect(await screen.findByRole('heading', { name: /^Next study day:/ })).toBeInTheDocument()
    expect(screen.getByText(/You can begin early/)).toBeInTheDocument()
    const steps = (await screen.findAllByRole('list', { name: /^Steps for Learn: / }))[0]
    expect(within(steps).getByText(/Close your notes\./)).toBeInTheDocument()

    await user.click((await screen.findAllByRole('button', { name: /^Done: got it, Learn: / }))[0])
    await waitFor(async () => expect((await revisionRepository.get())?.completed[daysFromToday(1)]).toEqual([0]))
  })

  it('lists concrete steps for today, with recall prompts and a named past paper part', async () => {
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    const steps = (await screen.findAllByRole('list', { name: /^Steps for Learn: / }))[0]
    expect(within(steps).getByText(/Close your notes\. Answer these on paper from memory/)).toBeInTheDocument()
    expect(within(steps).getByText(/constant-acceleration equations/)).toBeInTheDocument()
    expect(within(steps).getByText(/^20(23|24|25|26) question \d+/)).toBeInTheDocument()
    expect(screen.getAllByText(/Past papers and marking schemes are on examinations\.ie/).length).toBeGreaterThan(0)
  })

  it('does not move focus on first load, even in strict mode', async () => {
    await revisionRepository.saveSetup(setup(), null)
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/revision']}>
          <App />
        </MemoryRouter>
      </StrictMode>,
    )
    await screen.findByRole('heading', { name: /^Today,/ })
    expect(screen.getByRole('heading', { name: /^Today,/ })).not.toHaveFocus()
  })

  it('shows a practice problem in today\'s blocks and checks the answer', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    const panels = await screen.findAllByRole('region', { name: 'Practice problem' })
    expect(panels.length).toBeGreaterThan(0)
    await user.type(within(panels[0]).getAllByRole('textbox')[0], '99999')
    await user.click(within(panels[0]).getByRole('button', { name: 'Check answers' }))
    expect(within(panels[0]).getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getAllByText('Check my own working with an AI').length).toBeGreaterThan(0)
  })

  it('marks today\'s first block done, schedules the topic, and can undo the mark', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage()

    const doneButton = await screen.findAllByRole('button', { name: /^Done: got it, Learn: / })
    await user.click(doneButton[0])

    expect(await screen.findByText('Block done. Well done.')).toBeInTheDocument()
    const stored = await revisionRepository.get()
    expect(stored?.completed[todayIso()]).toEqual([0])
    expect(stored?.topicProgress['am-kinematics-1d']).toMatchObject({ outcome: 'got-it', box: 0 })

    await screen.findByText('Done')
    await user.click(await screen.findByRole('button', { name: /^Show steps, Learn: / }))
    await user.click(await screen.findByRole('button', { name: /^Mark as not done, / }))
    expect(await screen.findByText('Block marked as not done.')).toBeInTheDocument()
    expect((await revisionRepository.get())?.completed).toEqual({})
  })

  it('offers topics that are due for recall and records the answer', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    await revisionRepository.recordReview('am-dijkstra', 'got-it', '2020-01-01')
    renderPage()

    expect(await screen.findByRole('heading', { name: /Recall first/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Shaky, Dijkstra/ }))

    expect(await screen.findByText(/Saved: shaky/)).toBeInTheDocument()
    expect((await revisionRepository.get())?.topicProgress['am-dijkstra']).toMatchObject({
      outcome: 'shaky',
      due: daysFromToday(1),
    })
    await waitFor(() => expect(screen.queryByRole('heading', { name: /Recall first/ })).not.toBeInTheDocument())
  })

  it('lists phases and weeks, and opens the current week', async () => {
    await revisionRepository.saveSetup(setup(), '2027-02-01')
    renderPage('/revision/calendar')
    expect(await screen.findByRole('heading', { name: 'Phases' })).toBeInTheDocument()
    expect(screen.getByText(/Modelling project:/)).toBeInTheDocument()
    expect(screen.getByText(/0 of 25 topics checked/)).toBeInTheDocument()
    const weeks = document.querySelectorAll('details.plan-week')
    expect(weeks.length).toBeGreaterThan(30)
    expect(weeks[0]).toHaveAttribute('open')
  })

  it('re-plans from today and keeps topic progress', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(-10), null)
    await revisionRepository.recordReview('am-dijkstra', 'got-it', daysFromToday(-9))
    renderPage('/revision/calendar')

    await user.click(await screen.findByRole('button', { name: 'Re-plan from today' }))
    expect(await screen.findByText(/rebuilt from today/)).toBeInTheDocument()
    const stored = await revisionRepository.get()
    expect(stored?.setup.startDate).toBe(todayIso())
    expect(stored?.topicProgress['am-dijkstra']).toBeDefined()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Re-plan from today' })).not.toBeInTheDocument())
  })

  it('changes the setup from the plan and can cancel', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(setup(), null)
    renderPage('/revision/calendar')

    await user.click(await screen.findByRole('button', { name: 'Change setup' }))
    expect(screen.getByRole('heading', { name: 'Change your setup' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Your revision plan' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change setup' }))
    await user.selectOptions(screen.getByLabelText(/How confident/), 'weak')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText(/changes are saved/)).toBeInTheDocument()
    expect((await revisionRepository.get())?.setup.subjects[0].confidence).toBe('weak')
  })

  it('explains when a saved plan can no longer be built', async () => {
    await db.revisionPlans.put({
      id: 'active',
      setup: { ...setup(), examDate: daysFromToday(-5) },
      projectDueDate: null,
      completed: {},
      topicProgress: {},
      createdAt: 1,
      updatedAt: 1,
    })
    renderPage()
    expect(await screen.findByText(/could not be built/)).toBeInTheDocument()
  })
})
