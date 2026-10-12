import type { TextField } from '../essays/content'
import type { EssayStep, HintLevel } from '../essays/types'

export interface StepDefinition {
  id: EssayStep
  field: TextField
  title: string
  instruction: string
  placeholder: string
  // Hints are cumulative: "full" shows light + some + full, "some" shows
  // light + some, and "light" shows only the light hints.
  hints: { light: string[]; some: string[]; full: string[] }
}

export const steps: readonly StepDefinition[] = [
  {
    id: 'material',
    field: 'material',
    title: 'Collect ideas',
    instruction:
      'Write down anything that comes to mind for this question. Short notes, single words and half-sentences are fine. You are not writing the essay yet.',
    placeholder: 'Moments, people, places, details…',
    hints: {
      light: ['Which moments, people or places does the question remind you of?'],
      some: [
        'What did you see, hear or feel in those moments?',
        'Is there a small detail you still remember clearly?',
      ],
      full: [
        'Try these: a person who mattered, a place you remember, something that surprised you, something that changed your mind.',
        'Not sure where to start? Write down three moments from the last few years, even small ones.',
      ],
    },
  },
  {
    id: 'direction',
    field: 'direction',
    title: 'Choose your focus',
    instruction:
      'Look at your notes and pick the one or two moments that fit the question best. Then say what your essay will be about.',
    placeholder: 'My essay is about…',
    hints: {
      light: ['In one sentence: what is this essay really about?'],
      some: [
        'Which moment from your notes could you describe in the most detail?',
        'What do you think or feel differently now because of it?',
      ],
      full: [
        'Try: “This essay is about … and what it taught me is …”',
        'Check: does your choice answer the exact words of the question?',
      ],
    },
  },
  {
    id: 'plan',
    field: 'plan',
    title: 'Plan your essay',
    instruction:
      'Decide what goes where, using short bullet points. A good personal essay moves from a moment to what it means to you.',
    placeholder: 'Opening, what happened, what I thought and felt, what it means now, ending…',
    hints: {
      light: [
        'A simple shape: opening, what happened, what you thought and felt, what it means now, ending.',
      ],
      some: [
        'Opening: start with a specific moment or detail.',
        'What happened: the key events, briefly.',
        'What you thought and felt: during the moment and afterwards.',
      ],
      full: [
        'What it means now: what you understand today that you did not before.',
        'Ending: link back to your opening or to the question.',
        'Tip: give more of your plan to thoughts and feelings than to events.',
      ],
    },
  },
  {
    id: 'draft',
    field: 'draft',
    title: 'Write your essay',
    instruction:
      'Write your essay, following your plan. Keep going. You can improve it in the next step.',
    placeholder: 'Start writing…',
    hints: {
      light: [
        'Move from what happened to what it means: “Looking back, I realise …”',
      ],
      some: [
        'After each event, add a sentence about what you thought or felt.',
        'Use one specific detail (a sound, an object, a word someone said) in each paragraph.',
      ],
      full: [
        'Sentence starters: “At the time, I thought … but now I see …”',
        '“What I did not expect was …”',
        '“This matters to me because …”',
        '“Since then, I have …”',
      ],
    },
  },
  {
    id: 'self-check',
    field: 'selfCheck',
    title: 'Check your essay',
    instruction:
      'Read your essay aloud, slowly. Then use the tools below: review your paragraphs, answer the checklist, and write your own notes. This is your own check, not an exam mark.',
    placeholder: 'My notes on my essay…',
    hints: {
      light: [
        'Copy one sentence where you move from what happened to what it means to you.',
      ],
      some: [
        'Does your opening show a specific moment?',
        'Does every paragraph help to answer the question?',
        'Copy one sentence you are proud of.',
      ],
      full: [
        'Find one place that has only facts. What did you think or feel there? Write it down.',
        'Write one thing you will change, then change it in your essay.',
      ],
    },
  },
]

export function getStep(id: EssayStep): StepDefinition {
  const step = steps.find((candidate) => candidate.id === id)
  if (!step) throw new Error(`Unknown step: ${id}`)
  return step
}

export function hintsFor(step: StepDefinition, level: HintLevel): string[] {
  switch (level) {
    case 'none':
      return []
    case 'light':
      return step.hints.light
    case 'some':
      return [...step.hints.light, ...step.hints.some]
    case 'full':
      return [...step.hints.light, ...step.hints.some, ...step.hints.full]
  }
}

export const hintLevelLabels: Record<HintLevel, string> = {
  full: 'Full help',
  some: 'Some help',
  light: 'A little help',
  none: 'No help',
}
