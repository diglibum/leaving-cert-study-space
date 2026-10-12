import { describe, expect, it } from 'vitest'
import { checkAnswer } from './check'
import { generatePhysicsProblem, hasPhysicsProblems, physicsProblemTopicIds } from './physicsProblems'
import { generatePracticeProblem, hasPracticeProblems } from './registry'
import { physics } from '../subjects/physics'

describe('Physics practice problems', () => {
  it('has a generator for every topic, and only for known topics', () => {
    const ids = physics.topics.map((topic) => topic.id)
    expect(physicsProblemTopicIds().sort()).toEqual([...ids].sort())
    for (const id of ids) expect(hasPhysicsProblems(id)).toBe(true)
    expect(generatePhysicsProblem('unknown', 'x')).toBeUndefined()
  })

  it('gives the same problem for the same seed and varied problems across seeds', () => {
    for (const id of physicsProblemTopicIds()) {
      expect(generatePhysicsProblem(id, 'seed')).toEqual(generatePhysicsProblem(id, 'seed'))
      const statements = new Set(Array.from({ length: 30 }, (_, index) => generatePhysicsProblem(id, `s${index}`)?.statement))
      expect(statements.size, id).toBeGreaterThan(3)
    }
  })

  it('always produces complete problems with finite, correctly rounded answers', () => {
    for (const id of physicsProblemTopicIds()) {
      for (let seed = 0; seed < 150; seed += 1) {
        const problem = generatePhysicsProblem(id, `check-${seed}`)
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

  it('is reachable through the combined registry next to Applied Physics', () => {
    expect(hasPracticeProblems('ph-circuits')).toBe(true)
    expect(hasPracticeProblems('am-projectiles')).toBe(true)
    expect(generatePracticeProblem('ph-circuits', 's')?.topicId).toBe('ph-circuits')
    expect(generatePracticeProblem('am-projectiles', 's')?.topicId).toBe('am-projectiles')
    expect(generatePracticeProblem('nothing', 's')).toBeUndefined()
  })
})
