import { describe, expect, it } from 'vitest'
import { emptyContent } from '../essays/content'
import type { Essay } from '../essays/types'
import { findQuestion } from '../questions/questions'
import { buildAiExport } from './aiExport'

const essay: Essay = {
  id: 'active',
  questionId: '2026-q7',
  step: 'self-check',
  hintLevel: 'none',
  ...emptyContent(),
  draft: 'I walked home.\n\nI felt proud.',
  paragraphTags: { 'I felt proud.': 'felt' },
  createdAt: 1,
  updatedAt: 2,
}

describe('AI export', () => {
  const text = buildAiExport(
    {
      ...essay,
      checklist: {
        ...emptyContent().checklist,
        'purpose-question': { rating: 'partly', note: 'Paragraph 2 drifts' },
      },
    },
    findQuestion(essay.questionId),
  )

  it('includes the exact question, the essay and no exam mark request', () => {
    expect(text).toContain(findQuestion('2026-q7')?.task)
    expect(text).toContain('## My essay\nI walked home.\n\nI felt proud.')
    expect(text).toContain('Do not rewrite my essay and do not give a mark or a grade.')
  })

  it('marks empty sections and includes the learner’s own review', () => {
    expect(text).toContain('## Ideas I collected\n(empty)')
    expect(text).toContain('- [Mostly what I thought or felt] I felt proud.')
    expect(text).toContain('Partly (Paragraph 2 drifts)')
  })

  it('handles a missing question', () => {
    expect(buildAiExport(essay, undefined)).toContain('No question selected.')
  })
})
