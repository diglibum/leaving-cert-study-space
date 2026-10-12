import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { addDays, formatIsoDate, parseIsoDate, todayIso } from '../features/revision/dates'
import type { RevisionSetup } from '../features/revision/types'
import { db } from '../storage/database'
import { revisionRepository } from '../storage/revisionRepository'
import HomePage from './HomePage'

const daysFromToday = (offset: number) => formatIsoDate(addDays(parseIsoDate(todayIso()) as number, offset))

const setup: RevisionSetup = {
  startDate: daysFromToday(0),
  examDate: daysFromToday(300),
  subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
  minutesByWeekday: { 0: 60, 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60 },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await db.revisionPlans.clear()
})

describe('Home page: revision card', () => {
  it('invites the learner to set up revision when there is no plan', async () => {
    renderPage()
    const link = await screen.findByRole('link', { name: 'Set up your revision' })
    expect(link).toHaveAttribute('href', '/revision')
  })

  it("shows today's blocks and links to the steps and the full calendar", async () => {
    await revisionRepository.saveSetup(setup, null)
    renderPage()

    const card = (await screen.findByRole('heading', { name: /^Today,/ })).closest('section') as HTMLElement
    expect(within(card).getAllByText(/Learn: Motion in a straight line/).length).toBeGreaterThan(0)
    expect(within(card).getByText(/0 of \d+ blocks done/)).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /Open today.s steps/ })).toHaveAttribute('href', '/revision')
    expect(within(card).getByRole('link', { name: 'Full calendar' })).toHaveAttribute('href', '/revision/calendar')
  })

  it('shows done blocks and due topics', async () => {
    await revisionRepository.saveSetup(setup, null)
    await revisionRepository.completeBlock(todayIso(), 0, { topicId: 'am-kinematics-1d', outcome: 'shaky' })
    await revisionRepository.recordReview('am-dijkstra', 'shaky', daysFromToday(-3))
    renderPage()

    expect(await screen.findByText(/1 of \d+ blocks done/)).toBeInTheDocument()
    expect(screen.getByText('(done)')).toBeInTheDocument()
    expect(screen.getByText(/topic is due for recall|topics are due for recall/)).toBeInTheDocument()
  })
})
