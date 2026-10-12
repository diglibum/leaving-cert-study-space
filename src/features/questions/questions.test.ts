import { describe, expect, it } from 'vitest'
import { questions } from './questions'

const repositoryPapers = Object.keys(
  import.meta.glob('../../../exam-papers/sec/*-paper-1.pdf'),
).map((path) => path.replace('../../../', ''))

describe('question bank', () => {
  it('has unique ids derived from year and question number', () => {
    const ids = questions.map((question) => question.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const question of questions) {
      expect(question.id).toBe(`${question.year}-q${question.questionNumber}`)
    }
  })

  it('has two primary questions for each of 2024, 2025, and 2026', () => {
    for (const year of [2024, 2025, 2026]) {
      const primary = questions.filter(
        (question) => question.year === year && question.tier === 'primary',
      )
      expect(primary).toHaveLength(2)
    }
  })

  it('marks only 2023 questions as additional', () => {
    for (const question of questions) {
      expect(question.tier).toBe(question.year === 2023 ? 'additional' : 'primary')
    }
  })

  it('contains only personal essay tasks in English', () => {
    for (const question of questions) {
      expect(question.task).toMatch(/^Write a personal essay /)
      expect(question.task).toMatch(/\.$/)
      expect(question.task).not.toMatch(/\p{Script=Cyrillic}/u)
      expect(question.theme).not.toBe('')
    }
  })

  it('references an official paper stored in the repository', () => {
    for (const question of questions) {
      expect(repositoryPapers).toContain(question.paper)
    }
  })
})
