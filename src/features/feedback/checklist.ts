// Self-check prompts are written in plain words around the four SEC criteria
// (purpose, coherence, language, mechanics). They guide reflection and are not
// exam marks.
export const criteria = ['purpose', 'coherence', 'language', 'mechanics'] as const

export type Criterion = (typeof criteria)[number]

export const ratings = ['not-yet', 'partly', 'yes'] as const

export type Rating = (typeof ratings)[number]

export const ratingLabels: Record<Rating, string> = {
  'not-yet': 'Not yet',
  partly: 'Partly',
  yes: 'Yes',
}

export interface ChecklistItem {
  id: string
  criterion: Criterion
  prompt: string
}

export const criterionLabels: Record<Criterion, { name: string; help: string }> = {
  purpose: {
    name: 'Purpose',
    help: 'Does the essay answer the question and say something of your own?',
  },
  coherence: {
    name: 'Coherence',
    help: 'Do the ideas stay on track and follow a clear order?',
  },
  language: {
    name: 'Language',
    help: 'Is the wording clear, varied and your own?',
  },
  mechanics: {
    name: 'Mechanics',
    help: 'Are spelling, punctuation, grammar and paragraphs accurate?',
  },
}

export const checklistItems: readonly ChecklistItem[] = [
  { id: 'purpose-question', criterion: 'purpose', prompt: 'Every paragraph connects back to the question.' },
  { id: 'purpose-reflection', criterion: 'purpose', prompt: 'I say what I thought, felt or learned, not only what happened.' },
  { id: 'purpose-voice', criterion: 'purpose', prompt: 'It sounds like me and could only be written by me.' },
  { id: 'coherence-opening', criterion: 'coherence', prompt: 'The opening makes the reader want to continue.' },
  { id: 'coherence-order', criterion: 'coherence', prompt: 'My paragraphs follow the order of my plan, or a clear new order.' },
  { id: 'coherence-ending', criterion: 'coherence', prompt: 'The ending returns to my main idea rather than just stopping.' },
  { id: 'language-detail', criterion: 'language', prompt: 'I use specific details instead of general statements.' },
  { id: 'language-variety', criterion: 'language', prompt: 'My sentences vary in length and my words are varied.' },
  { id: 'mechanics-proofread', criterion: 'mechanics', prompt: 'I read it aloud and fixed spelling, punctuation and grammar.' },
  { id: 'mechanics-paragraphs', criterion: 'mechanics', prompt: 'My paragraphs start in sensible places.' },
]

export interface ChecklistAnswer {
  rating: Rating | null
  note: string
}

export type Checklist = Record<string, ChecklistAnswer>

export function emptyChecklist(): Checklist {
  return Object.fromEntries(
    checklistItems.map((item) => [item.id, { rating: null, note: '' }]),
  )
}

// Fills in missing items so data saved before an item existed still works.
export function normalizeChecklist(value: unknown): Checklist {
  const result = emptyChecklist()
  if (typeof value !== 'object' || value === null) return result
  for (const item of checklistItems) {
    const answer = (value as Record<string, unknown>)[item.id]
    if (typeof answer !== 'object' || answer === null) continue
    const { rating, note } = answer as Record<string, unknown>
    result[item.id] = {
      rating: ratings.includes(rating as Rating) ? (rating as Rating) : null,
      note: typeof note === 'string' ? note : '',
    }
  }
  return result
}

export function countAnswered(checklist: Checklist): number {
  return checklistItems.filter((item) => checklist[item.id]?.rating !== null).length
}
