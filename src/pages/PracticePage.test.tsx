import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../storage/database'
import { essayRepository } from '../storage/essayRepository'
import PracticePage from './PracticePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <PracticePage />
    </MemoryRouter>,
  )
}

async function startWith(user: ReturnType<typeof userEvent.setup>, name: string) {
  renderPage()
  await user.click(await screen.findByRole('button', { name }))
  await screen.findByRole('heading', { level: 2, name: 'Collect ideas' })
}

const question2026Q7 = 'Choose this question: 2026, question 7'

beforeEach(async () => {
  await db.essays.clear()
  await db.essayVersions.clear()
})

describe('Practice page', () => {
  it('asks the learner to choose a real question first', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Choose a question' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Choose this question/ })).toHaveLength(8)
    expect(screen.getByRole('heading', { level: 3, name: '2023 · additional practice' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('starts the essay with the chosen question at the first step', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)

    expect(
      screen.getByText(/reflect on a moment that was enriching for you/),
    ).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeEmptyDOMElement()
    expect(await essayRepository.getActive()).toMatchObject({
      questionId: '2026-q7',
      step: 'material',
    })
  })

  it('saves what the learner types when the field loses focus', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)

    await user.type(screen.getByRole('textbox'), 'My first job')
    await user.tab()

    await waitFor(async () =>
      expect((await essayRepository.getActive())?.material).toBe('<p>My first job</p>'),
    )
    expect(await screen.findByText('All changes saved on this device.')).toBeInTheDocument()
  })

  it('autosaves after a pause in typing', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)

    await user.type(screen.getByRole('textbox'), 'A summer evening')

    await waitFor(
      async () =>
        expect((await essayRepository.getActive())?.material).toBe('<p>A summer evening</p>'),
      { timeout: 3000 },
    )
  })

  it('moves between steps and keeps the text of each step', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)
    await user.type(screen.getByRole('textbox'), 'Notes about the park')

    await user.click(screen.getByRole('button', { name: 'Next: Choose your focus' }))

    const heading = await screen.findByRole('heading', { level: 2, name: 'Choose your focus' })
    expect(heading).toHaveFocus()
    expect(screen.getByRole('textbox')).toBeEmptyDOMElement()
    expect(
      screen.getByRole('button', { name: 'Choose your focus', current: 'step' }),
    ).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), 'Learning to swim')
    await user.click(screen.getByRole('button', { name: 'Collect ideas' }))
    expect(screen.getByRole('textbox')).toHaveTextContent('Notes about the park')
  })

  it('resumes at the same step with the saved text after a reload', async () => {
    const user = userEvent.setup()
    const first = renderPage()
    await user.click(await screen.findByRole('button', { name: question2026Q7 }))
    await user.click(await screen.findByRole('button', { name: 'Plan your essay' }))
    await user.type(screen.getByRole('textbox'), 'Opening: the first day')
    await user.tab()
    await waitFor(async () =>
      expect((await essayRepository.getActive())?.plan).toBe('<p>Opening: the first day</p>'),
    )
    first.unmount()

    renderPage()

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Plan your essay' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveTextContent('Opening: the first day')
  })

  it('shows the plan from step 3 while writing the essay', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: question2026Q7 }))
    await user.click(await screen.findByRole('button', { name: 'Write your essay' }))
    expect(screen.getByText('You have not written a plan yet.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to step 3 to make a plan' }))
    await user.type(screen.getByRole('textbox'), 'Opening: the first day')
    await user.click(screen.getByRole('button', { name: 'Next: Write your essay' }))

    const plan = screen.getByText('Your plan').closest('details') as HTMLElement
    expect(plan).toHaveTextContent('Opening: the first day')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  it('records a version snapshot when the step changes', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)
    await user.type(screen.getByRole('textbox'), 'Notes')
    await user.click(screen.getByRole('button', { name: 'Next: Choose your focus' }))

    await waitFor(async () => {
      const versions = await essayRepository.listVersions()
      expect(versions).toHaveLength(1)
      expect(versions[0]).toMatchObject({ reason: 'step-change', material: '<p>Notes</p>' })
    })
  })

  it('shows fewer hints as the help level is lowered', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)

    const hints = () => within(screen.getByRole('complementary')).getAllByRole('listitem')
    const full = hints().length

    await user.click(screen.getByRole('radio', { name: 'A little help' }))
    expect(hints().length).toBeLessThan(full)

    await user.click(screen.getByRole('radio', { name: 'No help' }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    await waitFor(async () =>
      expect((await essayRepository.getActive())?.hintLevel).toBe('none'),
      { timeout: 3000 },
    )
  })

  it('counts words only in the writing step', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)
    expect(screen.queryByText(/Word count/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Write your essay/ }))
    await user.type(screen.getByRole('textbox'), 'Looking back, I realise')

    expect(screen.getByText('Word count: 4')).toBeInTheDocument()
  })

  it('changes the question without losing any writing', async () => {
    const user = userEvent.setup()
    await startWith(user, question2026Q7)
    await user.type(screen.getByRole('textbox'), 'Keep this')

    await user.click(screen.getByRole('button', { name: 'Change question' }))
    expect(screen.getByText('Current question')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Choose this question: 2024, question 4' }),
    )

    expect(screen.getByText(/aspects of life you find puzzling/)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveTextContent('Keep this')
    await waitFor(async () => {
      const essay = await essayRepository.getActive()
      expect(essay).toMatchObject({ questionId: '2024-q4', material: '<p>Keep this</p>' })
    })
  })
})
