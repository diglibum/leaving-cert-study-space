import { describe, expect, it } from 'vitest'
import { problemTopicIds } from '../revision/problems/appliedMathsProblems'
import { buildAppliedMathsPack, appliedMathsPackFiles, VARIANTS_PER_TOPIC } from './appliedMathsPack'

const built = buildAppliedMathsPack() as Record<string, any>
const problemFiles = [appliedMathsPackFiles.networks, appliedMathsPackFiles.mechanics, appliedMathsPackFiles.difference]

describe('Applied Mathematics AI pack', () => {
  it('has several distinct problems with computed answers for every topic with a generator', () => {
    const all: Record<string, any[]> = Object.assign({}, ...problemFiles.map((file) => built[file].problems))
    expect(Object.keys(all).sort()).toEqual(problemTopicIds().sort())
    for (const [topicId, problems] of Object.entries(all)) {
      expect(problems.length, topicId).toBeGreaterThanOrEqual(Math.min(4, VARIANTS_PER_TOPIC))
      expect(new Set(problems.map((problem) => problem.statement)).size, topicId).toBe(problems.length)
      for (const problem of problems) {
        expect(problem.parts.length, topicId).toBeGreaterThan(0)
        expect(problem.solution.length, topicId).toBeGreaterThan(0)
        for (const part of problem.parts) {
          expect(Number.isFinite(part.answer), `${topicId} ${part.label}`).toBe(true)
          expect(part.expected, `${topicId} ${part.label}`).not.toBe('')
        }
      }
    }
  })

  it('points each topic at the file that holds its problems', () => {
    for (const topic of built[appliedMathsPackFiles.topics].topics) {
      if (topic.problemFile === null) continue
      expect(problemFiles).toContain(topic.problemFile)
      expect(Object.keys(built[topic.problemFile].problems)).toContain(topic.id)
    }
  })

  it('gives every sketch task a checklist and a reference', () => {
    for (const [topicId, sketches] of Object.entries<any[]>(built[appliedMathsPackFiles.sketches].sketches)) {
      expect(sketches.length, topicId).toBeGreaterThan(0)
      for (const sketch of sketches) {
        expect(sketch.checklist.length, topicId).toBeGreaterThan(0)
        expect(sketch.reference.description, topicId).not.toBe('')
      }
    }
  })
})
