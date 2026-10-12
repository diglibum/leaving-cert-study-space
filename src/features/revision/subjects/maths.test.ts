import { describe, expect, it } from 'vitest'
import { maths } from './maths'
import { mathsPaperParts } from './mathsPapers'
import { mathsRecall } from './mathsRecall'

describe('Mathematics subject', () => {
  const ids = new Set(maths.topics.map((topic) => topic.id))

  it('has unique topics with titles, recall prompts and a paper area', () => {
    expect(ids.size).toBe(maths.topics.length)
    for (const topic of maths.topics) {
      expect(topic.title.length, topic.id).toBeGreaterThan(5)
      expect(['Paper 1', 'Paper 2']).toContain(topic.area)
      expect(topic.recall?.length, topic.id).toBeGreaterThanOrEqual(4)
    }
    expect(Object.keys(mathsRecall).sort()).toEqual([...ids].sort())
  })

  it('maps every paper question to known topics and covers every topic', () => {
    const covered = new Set<string>()
    for (const part of mathsPaperParts) {
      expect(part.paper === 1 || part.paper === 2).toBe(true)
      expect(part.topics.length).toBeGreaterThan(0)
      for (const topic of part.topics) {
        expect(ids.has(topic), topic).toBe(true)
        covered.add(topic)
      }
    }
    expect([...covered].sort()).toEqual([...ids].sort())
  })

  it('lists each part of each paper question once', () => {
    const keys = mathsPaperParts.map((part) => `${part.year}-${part.paper}-${part.question}-${part.part}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const year of [2023, 2024, 2025, 2026]) {
      for (const paper of [1, 2]) {
        const questions = new Set(mathsPaperParts.filter((p) => p.year === year && p.paper === paper).map((p) => p.question))
        expect([...questions].sort((a, b) => a - b), `${year} paper ${paper}`).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      }
    }
  })
})
