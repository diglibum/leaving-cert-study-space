import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ExercisePanel } from '../ExercisePanel'
import type { PracticeSet } from '../problems/types'

const show = (set: PracticeSet) => render(<ExercisePanel seed="s" makeExercise={() => set} />)

describe('grammar text panel', () => {
  const cloze: PracticeSet = {
    kind: 'cloze',
    topicId: 't',
    instruction: 'Fill the gaps.',
    text: {
      title: 'Title',
      summary: 'About a town.',
      paragraphs: [
        ['One ', { base: 'town', answers: ['towns'], note: 'Plural after the number.' }, ' and ', { base: 'house', answers: ['houses'], note: 'Plural again.' }, '.'],
        ['Two ', { base: 'dog', answers: ['dogs'], note: 'Plural.' }, '.'],
      ],
    },
  }

  it('numbers the gaps across paragraphs, checks them and reports the count', async () => {
    const user = userEvent.setup()
    show(cloze)
    expect(screen.getByRole('region', { name: 'Grammar text' })).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Gap 1, word in brackets: town' }), 'TOWNS')
    await user.type(screen.getByRole('textbox', { name: 'Gap 3, word in brackets: dog' }), 'cat')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 answers correct.')
    await user.click(screen.getByRole('button', { name: 'Show answers' }))
    expect(screen.getByText(/Plural again\./)).toBeInTheDocument()
  })
})

describe('matching panel', () => {
  const match: PracticeSet = {
    kind: 'match',
    topicId: 't',
    instruction: 'Match.',
    sections: [
      { name: 'Sport', gloss: 'Sport' },
      { name: 'Weather', gloss: 'Weather' },
    ],
    items: [
      { text: 'Rain tomorrow', section: 1, note: 'Rain points to weather.' },
      { text: 'Team wins', section: 0, note: 'Team points to sport.' },
    ],
  }

  it('checks each choice against its section', async () => {
    const user = userEvent.setup()
    show(match)
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], '2. Weather')
    await user.selectOptions(selects[1], '2. Weather')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 answers correct.')
    expect(screen.getByText('Correct.')).toBeInTheDocument()
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
  })
})

describe('word list panel', () => {
  const list: PracticeSet = {
    kind: 'list',
    topicId: 't',
    lang: 'ru',
    instruction: 'Name words.',
    theme: 'winter',
    count: 3,
    accepted: ['snow', 'ice', 'cold'],
    note: 'Some words.',
  }

  it('accepts listed words, flags repeats and unknown words', async () => {
    const user = userEvent.setup()
    show(list)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(3)
    await user.type(inputs[0], 'Snow')
    await user.type(inputs[1], 'snow')
    await user.type(inputs[2], 'zebra')
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    expect(screen.getByText('Correct.')).toBeInTheDocument()
    expect(screen.getByText('You already gave this word.')).toBeInTheDocument()
    expect(screen.getByText(/Not on my list/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3')
  })
})

describe('speaking panel', () => {
  const speak: PracticeSet = {
    kind: 'speak',
    topicId: 't',
    lang: 'ru',
    instruction: 'Answer aloud.',
    prompts: [
      { text: 'First question', gloss: 'What is your name?' },
      { text: 'Second question', gloss: 'Where do you live?' },
    ],
    tips: ['Give a reason.'],
    selfCheck: ['Did I use the past tense?'],
  }

  it('counts the questions answered aloud and toggles the English meaning', async () => {
    const user = userEvent.setup()
    show(speak)
    expect(screen.queryByText(/What is your name\?/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show English' }))
    expect(screen.getByText(/What is your name\?/)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Answered aloud: What is your name?' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 questions answered aloud.')
  })
})
