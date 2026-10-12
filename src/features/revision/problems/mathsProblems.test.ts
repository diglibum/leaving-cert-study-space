import { describe, expect, it } from 'vitest'
import { checkAnswer } from './check'
import { generateMathsProblem, hasMathsProblems, mathsProblemTopicIds } from './mathsProblems'
import { generatePracticeProblem, hasPracticeProblems } from './registry'
import { maths } from '../subjects/maths'

describe('Mathematics practice problems', () => {
  it('has a generator for every topic, and only for known topics', () => {
    const ids = maths.topics.map((topic) => topic.id)
    expect(mathsProblemTopicIds().sort()).toEqual([...ids].sort())
    for (const id of ids) expect(hasMathsProblems(id)).toBe(true)
    expect(generateMathsProblem('unknown', 'x')).toBeUndefined()
  })

  it('gives the same problem for the same seed and varied problems across seeds', () => {
    for (const id of mathsProblemTopicIds()) {
      expect(generateMathsProblem(id, 'seed')).toEqual(generateMathsProblem(id, 'seed'))
      const statements = new Set(Array.from({ length: 30 }, (_, index) => generateMathsProblem(id, `s${index}`)?.statement))
      expect(statements.size, id).toBeGreaterThan(3)
    }
  })

  it('always produces complete problems with finite, correctly rounded answers', () => {
    for (const id of mathsProblemTopicIds()) {
      for (let seed = 0; seed < 150; seed += 1) {
        const problem = generateMathsProblem(id, `check-${seed}`)
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

  it('is reachable through the combined registry next to Applied Mathematics', () => {
    expect(hasPracticeProblems('mt-calc-applications')).toBe(true)
    expect(hasPracticeProblems('am-projectiles')).toBe(true)
    expect(generatePracticeProblem('mt-calc-applications', 's')?.topicId).toBe('mt-calc-applications')
    expect(generatePracticeProblem('am-projectiles', 's')?.topicId).toBe('am-projectiles')
    expect(generatePracticeProblem('nothing', 's')).toBeUndefined()
  })
})
