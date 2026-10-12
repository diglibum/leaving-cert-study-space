import type { EssayQuestion } from './types'

// Official SEC Leaving Certificate English, Higher Level, Paper 1, Section II
// personal essay tasks, checked against the papers in `exam-papers/sec/`.
// Add a question only after checking it against the official paper.
function paperPath(year: number) {
  return `exam-papers/sec/${year}-english-higher-paper-1.pdf`
}

export const questions: readonly EssayQuestion[] = [
  {
    id: '2026-q2',
    year: 2026,
    questionNumber: 2,
    theme: 'Influence',
    task: 'Write a personal essay in which you reflect on how being creative has a role to play in many aspects of your life.',
    paper: paperPath(2026),
    tier: 'primary',
  },
  {
    id: '2026-q7',
    year: 2026,
    questionNumber: 7,
    theme: 'Influence',
    task: 'Write a personal essay in which you reflect on a moment that was enriching for you, in a variety of ways.',
    paper: paperPath(2026),
    tier: 'primary',
  },
  {
    id: '2025-q4',
    year: 2025,
    questionNumber: 4,
    theme: 'Perspectives',
    task: 'Write a personal essay in which you reflect on some of the disappointments you have experienced and the impact they have had on you.',
    paper: paperPath(2025),
    tier: 'primary',
  },
  {
    id: '2025-q6',
    year: 2025,
    questionNumber: 6,
    theme: 'Perspectives',
    task: 'Write a personal essay in which you reflect on some of the factors that would influence your voting intentions in future elections.',
    paper: paperPath(2025),
    tier: 'primary',
  },
  {
    id: '2024-q4',
    year: 2024,
    questionNumber: 4,
    theme: 'Connections',
    task: 'Write a personal essay in which you reflect on some of the aspects of life you find puzzling.',
    paper: paperPath(2024),
    tier: 'primary',
  },
  {
    id: '2024-q7',
    year: 2024,
    questionNumber: 7,
    theme: 'Connections',
    task: 'Write a personal essay in which you reflect on your relationship with the natural world.',
    paper: paperPath(2024),
    tier: 'primary',
  },
  {
    id: '2023-q3',
    year: 2023,
    questionNumber: 3,
    theme: 'Between Two Worlds',
    task: 'Write a personal essay in which you reflect on an occasion or occasions when you made a resolution and refused to be discouraged.',
    paper: paperPath(2023),
    tier: 'additional',
  },
  {
    id: '2023-q6',
    year: 2023,
    questionNumber: 6,
    theme: 'Between Two Worlds',
    task: 'Write a personal essay in which you describe and reflect on some of the things that bring excitement and wonder into your life.',
    paper: paperPath(2023),
    tier: 'additional',
  },
]

export function findQuestion(id: string | null): EssayQuestion | undefined {
  return questions.find((question) => question.id === id)
}

// Short label such as "2026, question 7" for lists and summaries.
export function questionLabel(id: string | null): string {
  const question = findQuestion(id)
  return question ? `${question.year}, question ${question.questionNumber}` : 'no question'
}
