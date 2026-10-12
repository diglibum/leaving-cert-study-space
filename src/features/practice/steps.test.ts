import { describe, expect, it } from 'vitest'
import { essaySteps } from '../essays/types'
import { getStep, hintsFor, steps } from './steps'
import { countWords } from './text'

describe('steps', () => {
  it('covers every essay step once, in order', () => {
    expect(steps.map((step) => step.id)).toEqual([...essaySteps])
    expect(new Set(steps.map((step) => step.field)).size).toBe(steps.length)
  })

  it('has English-only text for every step', () => {
    for (const step of steps) {
      const text = JSON.stringify(step)
      expect(text).not.toMatch(/\p{Script=Cyrillic}/u)
      expect(step.hints.light.length).toBeGreaterThan(0)
    }
  })

  it('reduces hints as the help level drops', () => {
    for (const step of steps) {
      const counts = (['full', 'some', 'light', 'none'] as const).map(
        (level) => hintsFor(step, level).length,
      )

      expect(counts[3]).toBe(0)
      expect(counts[2]).toBeGreaterThan(0)
      expect(counts[1]).toBeGreaterThan(counts[2])
      expect(counts[0]).toBeGreaterThan(counts[1])
    }
  })

  it('keeps the lighter hints inside the fuller levels', () => {
    const step = getStep('draft')

    expect(hintsFor(step, 'full')).toEqual(
      expect.arrayContaining(hintsFor(step, 'some')),
    )
    expect(hintsFor(step, 'some')).toEqual(
      expect.arrayContaining(hintsFor(step, 'light')),
    )
  })
})

describe('countWords', () => {
  it('counts words regardless of spacing', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   \n ')).toBe(0)
    expect(countWords('One')).toBe(1)
    expect(countWords('  Looking back,\nI   realise  ')).toBe(4)
  })
})
