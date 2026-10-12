import { describe, expect, it } from 'vitest'
import { physics } from './physics'
import { physicsPaperParts } from './physicsPapers'
import { physicsRecall } from './physicsRecall'

describe('Physics subject', () => {
  const ids = new Set(physics.topics.map((topic) => topic.id))

  it('has unique topics with titles, areas and recall prompts', () => {
    expect(ids.size).toBe(physics.topics.length)
    for (const topic of physics.topics) {
      expect(topic.title.length, topic.id).toBeGreaterThan(5)
      expect(topic.area?.length, topic.id).toBeGreaterThan(3)
      expect(topic.recall?.length, topic.id).toBeGreaterThanOrEqual(4)
    }
    expect(Object.keys(physicsRecall).sort()).toEqual([...ids].sort())
  })

  it('maps every sample paper part to known topics', () => {
    const covered = new Set<string>()
    for (const part of physicsPaperParts) {
      expect(part.year).toBe(2027)
      expect(part.label).toMatch(/^Sample paper [12]$/)
      expect(part.topics.length).toBeGreaterThan(0)
      for (const id of part.topics) {
        expect(ids.has(id), id).toBe(true)
        covered.add(id)
      }
    }
    // Every topic appears in at least one sample paper.
    expect([...ids].filter((id) => !covered.has(id))).toEqual([])
  })

  it('lists questions 1 to 7 of both sample papers, each part once', () => {
    const keys = physicsPaperParts.map((part) => `${part.paper}-${part.question}-${part.part}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const paper of [1, 2]) {
      const questions = new Set(physicsPaperParts.filter((p) => p.paper === paper).map((p) => p.question))
      expect([...questions].sort((a, b) => a - b), `sample ${paper}`).toEqual([1, 2, 3, 4, 5, 6, 7])
    }
  })
})
