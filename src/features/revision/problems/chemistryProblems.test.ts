import { describe, expect, it } from 'vitest'
import { checkAnswer } from './check'
import { generateChemistryProblem, hasChemistryProblems, chemistryProblemTopicIds } from './chemistryProblems'
import { generatePracticeProblem, hasPracticeProblems } from './registry'
import { chemistry } from '../subjects/chemistry'

describe('Chemistry practice problems', () => {
  it('has a generator for every topic, and only for known topics', () => {
    const ids = chemistry.topics.map((topic) => topic.id)
    expect(chemistryProblemTopicIds().sort()).toEqual([...ids].sort())
    for (const id of ids) expect(hasChemistryProblems(id)).toBe(true)
    expect(generateChemistryProblem('unknown', 'x')).toBeUndefined()
  })

  it('gives the same problem for the same seed and varied problems across seeds', () => {
    for (const id of chemistryProblemTopicIds()) {
      expect(generateChemistryProblem(id, 'seed')).toEqual(generateChemistryProblem(id, 'seed'))
      const statements = new Set(Array.from({ length: 30 }, (_, index) => generateChemistryProblem(id, `s${index}`)?.statement))
      expect(statements.size, id).toBeGreaterThan(3)
    }
  })

  it('always produces complete problems with finite, correctly rounded answers', () => {
    for (const id of chemistryProblemTopicIds()) {
      for (let seed = 0; seed < 150; seed += 1) {
        const problem = generateChemistryProblem(id, `check-${seed}`)
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

  it('keeps hydrocarbon bond counts chemically correct', () => {
    let seen = 0
    for (let seed = 0; seed < 120; seed += 1) {
      const problem = generateChemistryProblem('ch-hydrocarbons', `hydrocarbon-${seed}`)
      if (!problem || !problem.statement.startsWith('Consider the alkene with ')) continue
      const match = /Consider the alkene with (\d+) carbon atoms/.exec(problem.statement)
      expect(match).not.toBeNull()
      const n = Number(match?.[1])
      expect(problem.parts[1]?.answer).toBe(3 * n - 1)
      expect(problem.parts[2]?.answer).toBe(3 * n + 1)
      seen += 1
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('uses negative enthalpy changes for combustion questions', () => {
    let seen = 0
    for (let seed = 0; seed < 150; seed += 1) {
      const problem = generateChemistryProblem('ch-thermochemistry', `combustion-${seed}`)
      if (!problem || !problem.statement.includes('is burned and all the heat warms')) continue
      expect(problem.parts[2]?.answer).toBeLessThan(0)
      seen += 1
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('keeps vinegar concentrations in a realistic household range', () => {
    let seen = 0
    for (let seed = 0; seed < 150; seed += 1) {
      const problem = generateChemistryProblem('ch-volumetric', `vinegar-${seed}`)
      if (!problem || !problem.statement.startsWith('A vinegar sample is diluted')) continue
      expect(problem.parts[1]?.answer).toBeGreaterThanOrEqual(0.6)
      expect(problem.parts[1]?.answer).toBeLessThanOrEqual(1)
      seen += 1
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('is reachable through the combined registry next to Applied Chemistry', () => {
    expect(hasPracticeProblems('ch-rates')).toBe(true)
    expect(hasPracticeProblems('am-projectiles')).toBe(true)
    expect(generatePracticeProblem('ch-rates', 's')?.topicId).toBe('ch-rates')
    expect(generatePracticeProblem('am-projectiles', 's')?.topicId).toBe('am-projectiles')
    expect(generatePracticeProblem('nothing', 's')).toBeUndefined()
  })
})
