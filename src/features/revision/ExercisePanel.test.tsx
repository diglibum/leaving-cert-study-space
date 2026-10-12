import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ExercisePanel } from './ExercisePanel'
import { russian } from './subjects/russian'

const topicId = 'ru-prepositions'
const makeExercise = (seed: string) => russian.exercises?.(topicId, seed)
const round0 = () => {
  const exercise = makeExercise('seed:0')
  if (exercise?.kind !== 'items') throw new Error('missing exercise')
  return exercise
}

describe('ExercisePanel', () => {
  it('checks typed answers and reports how many are right', async () => {
    const user = userEvent.setup()
    const exercise = round0()
    render(<ExercisePanel seed="seed" makeExercise={makeExercise} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(exercise.items.length)
    await user.type(inputs[0], exercise.items[0].answers[0].toUpperCase())
    await user.type(inputs[1], 'zzz')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(screen.getByText('Correct.')).toBeInTheDocument()
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getAllByText('No answer yet.')).toHaveLength(exercise.items.length - 2)
    expect(screen.getByRole('status')).toHaveTextContent(`1 of ${exercise.items.length} answers correct.`)
  })

  it('marks the typing fields with the language and shows the answers with notes on request', async () => {
    const user = userEvent.setup()
    const exercise = round0()
    render(<ExercisePanel seed="seed" makeExercise={makeExercise} />)
    expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('lang', 'ru')

    await user.click(screen.getByRole('button', { name: 'Show answers' }))
    expect(screen.getByRole('heading', { name: 'Answers' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(exercise.items[0].note)
    await user.click(screen.getByRole('button', { name: 'Hide answers' }))
    expect(screen.queryByRole('heading', { name: 'Answers' })).not.toBeInTheDocument()
  })

  it('clears the answers when a new set is requested', async () => {
    const user = userEvent.setup()
    render(<ExercisePanel seed="seed" makeExercise={makeExercise} />)
    await user.type(screen.getAllByRole('textbox')[0], 'x')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    await user.click(screen.getByRole('button', { name: 'New set' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
  })

  it('renders nothing for a topic without exercises', () => {
    const { container } = render(<ExercisePanel seed="seed" makeExercise={() => undefined} />)
    expect(container).toBeEmptyDOMElement()
  })
})
