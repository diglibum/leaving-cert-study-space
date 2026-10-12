import { describe, expect, it } from 'vitest'
import { chemistry } from './chemistry'
import { chemistryPaperParts } from './chemistryPapers'
import { chemistryRecall } from './chemistryRecall'

describe('Chemistry subject', () => {
  const ids = new Set(chemistry.topics.map((topic) => topic.id))

  it('has unique topics with titles, areas and recall prompts', () => {
    expect(ids.size).toBe(chemistry.topics.length)
    for (const topic of chemistry.topics) {
      expect(topic.title.length, topic.id).toBeGreaterThan(5)
      expect(topic.area?.length, topic.id).toBeGreaterThan(3)
      expect(topic.recall?.length, topic.id).toBeGreaterThanOrEqual(4)
    }
    expect(Object.keys(chemistryRecall).sort()).toEqual([...ids].sort())
  })

  it('uses the specification strand names as topic areas', () => {
    const areas = [...new Set(chemistry.topics.map((topic) => topic.area))]
    expect(areas).toEqual([
      'Nature of Matter',
      'Behaviour of Matter',
      'Interactions of Matter',
      'Matter in our World',
      'Nature of science',
    ])
  })

  it('maps every sample paper part to known topics', () => {
    const covered = new Set<string>()
    for (const part of chemistryPaperParts) {
      expect(part.year).toBe(2027)
      expect(part.label).toMatch(/^Sample paper [12]$/)
      expect(part.topics.length).toBeGreaterThan(0)
      for (const id of part.topics) {
        expect(ids.has(id), id).toBe(true)
        covered.add(id)
      }
    }
    // Only the kinetic theory unit does not appear in either sample paper.
    expect([...ids].filter((id) => !covered.has(id))).toEqual(['ch-matter'])
  })

  it('lists questions 1 to 7 of both sample papers, each part once', () => {
    const keys = chemistryPaperParts.map((part) => `${part.paper}-${part.question}-${part.part}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const paper of [1, 2]) {
      const questions = new Set(chemistryPaperParts.filter((p) => p.paper === paper).map((p) => p.question))
      expect([...questions].sort((a, b) => a - b), `sample ${paper}`).toEqual([1, 2, 3, 4, 5, 6, 7])
    }
  })
})
