import { describe, expect, it } from 'vitest'
import {
  checklistItems,
  countAnswered,
  emptyChecklist,
  normalizeChecklist,
} from './checklist'
import { splitParagraphs, summariseParagraphs } from './paragraphs'

describe('paragraphs', () => {
  it('splits text into paragraphs and ignores empty ones', () => {
    expect(splitParagraphs('First one.\nSame paragraph.\n\n\n  Second.  \n\n...')).toEqual([
      'First one.\nSame paragraph.',
      'Second.',
    ])
    expect(splitParagraphs('  ...  ')).toEqual([])
  })

  it('counts marked and unmarked paragraphs', () => {
    const summary = summariseParagraphs(['A.', 'B.', 'C.'], { 'A.': 'happened', 'B.': 'felt', 'X.': 'learned' })
    expect(summary).toEqual({
      total: 3,
      counts: { happened: 1, felt: 1, learned: 0 },
      untagged: 1,
    })
  })
})

describe('checklist', () => {
  it('covers all four criteria with unique ids', () => {
    expect(new Set(checklistItems.map((item) => item.id)).size).toBe(checklistItems.length)
    expect(new Set(checklistItems.map((item) => item.criterion))).toEqual(
      new Set(['purpose', 'coherence', 'language', 'mechanics']),
    )
  })

  it('normalises unknown or damaged data', () => {
    const checklist = normalizeChecklist({
      'purpose-question': { rating: 'yes', note: 'See paragraph 2' },
      'purpose-voice': { rating: 'amazing', note: 5 },
      unknown: { rating: 'yes' },
    })
    expect(checklist['purpose-question']).toEqual({ rating: 'yes', note: 'See paragraph 2' })
    expect(checklist['purpose-voice']).toEqual({ rating: null, note: '' })
    expect(checklist).not.toHaveProperty('unknown')
    expect(countAnswered(checklist)).toBe(1)
    expect(countAnswered(emptyChecklist())).toBe(0)
    expect(normalizeChecklist(null)).toEqual(emptyChecklist())
  })
})
