import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AiCheckBox } from './AiCheckBox'
import { ProblemPanel } from './ProblemPanel'
import { generateProblem } from './problems/appliedMathsProblems'

const topicId = 'am-kinematics-1d'
const seed = 'test-seed'
const round0 = () => {
  const problem = generateProblem(topicId, `${seed}:0`)
  if (!problem) throw new Error('missing problem')
  return problem
}

describe('ProblemPanel', () => {
  it('shows the statement and checks typed answers against the computed ones', async () => {
    const user = userEvent.setup()
    const problem = round0()
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    expect(screen.getByText(problem.statement)).toBeInTheDocument()

    const inputs = screen.getAllByRole('textbox').slice(0, problem.parts.length)
    await user.type(inputs[0], String(problem.parts[0].answer).replace('.', ','))
    await user.type(inputs[1], String(problem.parts[1].answer + 50))
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(screen.getByText('Correct.')).toBeInTheDocument()
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`1 of ${problem.parts.length} answers correct.`)
  })

  it('asks for a number when the answer is not one', async () => {
    const user = userEvent.setup()
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    await user.type(screen.getAllByRole('textbox')[0], 'lots')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    expect(screen.getByText('Type a number, for example 12.5.')).toBeInTheDocument()
  })

  it('shows and hides the worked solution', async () => {
    const user = userEvent.setup()
    const problem = round0()
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    await user.click(screen.getByRole('button', { name: 'Show worked solution' }))
    expect(screen.getByText(problem.solution[0])).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide worked solution' }))
    expect(screen.queryByText(problem.solution[0])).not.toBeInTheDocument()
  })

  it('gives a different problem and clears the answers on New problem', async () => {
    const user = userEvent.setup()
    const first = round0()
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    await user.type(screen.getAllByRole('textbox')[0], '5')
    await user.click(screen.getByRole('button', { name: 'New problem' }))
    expect(screen.queryByText(first.statement)).not.toBeInTheDocument()
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
  })

  it('copies a prompt with the question, working, answers and computed reference', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    const problem = round0()
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    await user.type(screen.getByLabelText(/Your working/), 'v = u + at')
    await user.click(screen.getByRole('button', { name: /Copy working and answers/ }))

    const text = writeText.mock.calls[0][0]
    expect(text).toContain(problem.statement)
    expect(text).toContain('v = u + at')
    expect(text).toContain('Correct answers calculated by my study app')
    expect(text).toContain('Do not give a mark or a grade.')
    expect(await screen.findByText(/^Copied\./)).toBeInTheDocument()
  })

  it('selects the text when copying is blocked', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'))
    render(<ProblemPanel topicId={topicId} seed={seed} />)
    await user.click(screen.getByRole('button', { name: /Copy working and answers/ }))
    expect(await screen.findByText(/Copying was blocked/)).toBeInTheDocument()
    expect(screen.getByLabelText('Prompt text')).toHaveAttribute('readonly')
  })

  it('renders nothing for a topic without problems', () => {
    const { container } = render(<ProblemPanel topicId="unknown" seed={seed} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('AiCheckBox', () => {
  it('builds a prompt from the typed question and working', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<AiCheckBox />)
    await user.click(screen.getByText('Check my own working with an AI'))
    await user.type(screen.getByLabelText('Question'), 'Find x.')
    await user.type(screen.getByLabelText('My working and answer'), 'x = 4')
    await user.click(within(screen.getByRole('group')).getByRole('button', { name: 'Copy prompt for an AI check' }))
    expect(writeText.mock.calls[0][0]).toContain('## Question\nFind x.')
    expect(writeText.mock.calls[0][0]).toContain('## My working\nx = 4')
  })

  it('builds a writing prompt for language subjects', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<AiCheckBox kind="writing" subjectName="Russian" />)
    await user.click(screen.getByText('Check my own writing with an AI'))
    await user.type(screen.getByLabelText('Task'), 'Write a letter.')
    await user.type(screen.getByLabelText('My text'), 'Hello')
    await user.click(within(screen.getByRole('group')).getByRole('button', { name: 'Copy prompt for an AI check' }))
    const prompt = writeText.mock.calls[writeText.mock.calls.length - 1][0]
    expect(prompt).toContain('Leaving Certificate Russian exam')
    expect(prompt).toContain('## My text\nHello')
  })

  it('follows a task profile and counts the words', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    const profiles = [{ id: 'essay', label: 'Short essay', words: 50, criteria: ['There is a title.'] }]
    render(<AiCheckBox kind="writing" subjectName="Russian" profiles={profiles} />)
    await user.click(screen.getByText('Check my own writing with an AI'))
    await user.selectOptions(screen.getByLabelText('Kind of task'), 'Short essay')
    await user.type(screen.getByLabelText('My text'), 'one two three')
    expect(screen.getByRole('status')).toHaveTextContent('3 words, target about 50')
    await user.click(within(screen.getByRole('group')).getByRole('button', { name: 'Copy prompt for an AI check' }))
    const prompt = writeText.mock.calls[writeText.mock.calls.length - 1][0]
    expect(prompt).toContain('What this task looks for (Short essay)')
    expect(prompt).toContain('Target length: about 50 words. My text has 3.')
    expect(prompt).toContain('- There is a title.')
    expect(prompt).toContain('checklist, not an exam mark')
  })
})
