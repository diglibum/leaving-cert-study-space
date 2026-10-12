import { describe, expect, it } from 'vitest'
import { checkAnswer } from './check'
import { biologyProblemTopicIds, generateBiologyProblem, hasBiologyProblems } from './biologyProblems'
import { generatePracticeProblem, hasPracticeProblems } from './registry'
import { biology } from '../subjects/biology'

describe('Biology practice problems', () => {
  it('has generators only for known topics, and for the numerical ones', () => {
    const ids = new Set(biology.topics.map((topic) => topic.id))
    for (const id of biologyProblemTopicIds()) expect(ids.has(id), id).toBe(true)
    expect(biologyProblemTopicIds().length).toBeGreaterThanOrEqual(12)
    for (const topic of biology.topics) expect(topic.hasProblems, topic.id).toBe(hasBiologyProblems(topic.id))
    expect(generateBiologyProblem('unknown', 'x')).toBeUndefined()
  })

  it('gives the same problem for the same seed and varied problems across seeds', () => {
    for (const id of biologyProblemTopicIds()) {
      expect(generateBiologyProblem(id, 'seed')).toEqual(generateBiologyProblem(id, 'seed'))
      const statements = new Set(Array.from({ length: 30 }, (_, index) => generateBiologyProblem(id, `s${index}`)?.statement))
      expect(statements.size, id).toBeGreaterThan(3)
    }
  })

  it('always produces complete problems with finite, correctly rounded answers', () => {
    for (const id of biologyProblemTopicIds()) {
      for (let seed = 0; seed < 150; seed += 1) {
        const problem = generateBiologyProblem(id, `check-${seed}`)
        if (!problem) throw new Error(id)
        const text = [problem.statement, ...problem.parts.map((part) => part.prompt), ...problem.solution].join('\n')
        expect(text, `${id} ${seed}`).not.toMatch(/NaN|undefined|Infinity|\[object/)
        expect(problem.parts.length).toBeGreaterThanOrEqual(1)
        expect(problem.solution.length).toBeGreaterThanOrEqual(2)
        for (const part of problem.parts) {
          expect(Number.isFinite(part.answer), `${id} ${seed}`).toBe(true)
          expect(Number(part.answer.toFixed(part.decimals))).toBe(part.answer)
          expect(checkAnswer(part, String(part.answer))).toBe('correct')
        }
      }
    }
  })

  it('is reachable through the combined registry next to Applied Biology', () => {
    expect(hasPracticeProblems('bi-enzymes')).toBe(true)
    expect(hasPracticeProblems('am-projectiles')).toBe(true)
    expect(generatePracticeProblem('bi-enzymes', 's')?.topicId).toBe('bi-enzymes')
    expect(generatePracticeProblem('am-projectiles', 's')?.topicId).toBe('am-projectiles')
    expect(generatePracticeProblem('nothing', 's')).toBeUndefined()
  })
})
