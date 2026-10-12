import { describe, expect, it } from 'vitest'
import { buildCheckPrompt } from './aiCheck'
import { generateProblem, hasProblems, problemTopicIds } from './appliedMathsProblems'
import { checkAnswer, formatAnswer, parseAnswer } from './check'
import { criticalPath, greedyCost, minimumSpanningTree, optimalCost, shortestDistances, type LayeredNetwork } from './graphs'
import { createRng } from './rng'
import { appliedMaths } from '../subjects/appliedMaths'

const numbers = (text: string) => (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)

describe('graph helpers', () => {
  it('finds a minimum spanning tree', () => {
    const edges = [
      { a: 0, b: 1, weight: 4 },
      { a: 0, b: 2, weight: 1 },
      { a: 1, b: 2, weight: 2 },
      { a: 1, b: 3, weight: 5 },
      { a: 2, b: 3, weight: 8 },
    ]
    expect(minimumSpanningTree(4, edges).total).toBe(8)
  })

  it('finds shortest distances with Dijkstra', () => {
    const edges = [
      { a: 0, b: 1, weight: 7 },
      { a: 0, b: 2, weight: 2 },
      { a: 2, b: 1, weight: 3 },
      { a: 1, b: 3, weight: 1 },
      { a: 2, b: 3, weight: 9 },
    ]
    expect(shortestDistances(4, edges, 0)).toEqual([0, 5, 2, 6])
  })

  it('finds the optimal and greedy cost of a layered network', () => {
    const network: LayeredNetwork = {
      layers: [['S'], ['A', 'B'], ['C', 'D'], ['T']],
      cost: { 'S>A': 1, 'S>B': 4, 'A>C': 9, 'A>D': 8, 'B>C': 2, 'B>D': 3, 'C>T': 1, 'D>T': 1 },
    }
    expect(optimalCost(network).total).toBe(7)
    expect(optimalCost(network).path).toEqual(['S', 'B', 'C', 'T'])
    expect(greedyCost(network)).toBe(10)
  })

  it('does critical path analysis', () => {
    const schedule = criticalPath([
      { name: 'A', duration: 3, after: [] },
      { name: 'B', duration: 4, after: ['A'] },
      { name: 'C', duration: 2, after: ['A'] },
      { name: 'D', duration: 5, after: ['B', 'C'] },
    ])
    expect(schedule.duration).toBe(12)
    expect(schedule.float).toEqual({ A: 0, B: 0, C: 2, D: 0 })
  })
})

describe('answer checking', () => {
  const part = { label: '(a)', prompt: '', answer: 12.5, unit: 'm/s', decimals: 2 }

  it('reads numbers with units, commas and minus signs', () => {
    expect(parseAnswer('12.5 m/s')).toBe(12.5)
    expect(parseAnswer(' 12,5')).toBe(12.5)
    expect(parseAnswer('\u22123')).toBe(-3)
    expect(parseAnswer('about twelve')).toBeNull()
  })

  it('accepts rounding differences but not wrong answers', () => {
    expect(checkAnswer(part, '12.5')).toBe('correct')
    expect(checkAnswer(part, '12.46')).toBe('correct')
    expect(checkAnswer(part, '13')).toBe('wrong')
    expect(checkAnswer(part, '')).toBe('empty')
    expect(checkAnswer(part, 'abc')).toBe('invalid')
  })

  it('formats the exact answer with its unit', () => {
    expect(formatAnswer(part)).toBe('12.50 m/s')
  })
})

describe('Applied Mathematics practice problems', () => {
  it('has a generator for every topic, and only for known topics', () => {
    const ids = appliedMaths.topics.map((topic) => topic.id)
    expect(problemTopicIds().sort()).toEqual([...ids].sort())
    for (const id of ids) expect(hasProblems(id)).toBe(true)
    expect(generateProblem('unknown', 'x')).toBeUndefined()
  })

  it('gives the same problem for the same seed and varied problems across seeds', () => {
    for (const id of problemTopicIds()) {
      expect(generateProblem(id, 'seed')).toEqual(generateProblem(id, 'seed'))
      const statements = new Set(Array.from({ length: 30 }, (_, index) => generateProblem(id, `s${index}`)?.statement))
      expect(statements.size, id).toBeGreaterThan(3)
    }
  })

  it('always produces complete problems with finite, correctly rounded answers', () => {
    for (const id of problemTopicIds()) {
      for (let seed = 0; seed < 150; seed += 1) {
        const problem = generateProblem(id, `check-${seed}`)
        if (!problem) throw new Error(id)
        const text = [problem.statement, ...problem.parts.map((part) => part.prompt), ...problem.solution].join('\n')
        expect(text, `${id} ${seed}`).not.toMatch(/NaN|undefined|Infinity|\[object/)
        expect(problem.parts.length).toBeGreaterThanOrEqual(2)
        expect(problem.solution.length).toBeGreaterThanOrEqual(2)
        for (const part of problem.parts) {
          expect(Number.isFinite(part.answer), `${id} ${seed}`).toBe(true)
          expect(Number(part.answer.toFixed(part.decimals))).toBe(part.answer)
          expect(checkAnswer(part, String(part.answer))).toBe('correct')
        }
      }
    }
  })

  it('keeps related answers consistent (projectiles)', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-projectiles', `p${seed}`)
      if (!problem) throw new Error('missing')
      const [u, angle] = numbers(problem.statement)
      const [time, height, range] = problem.parts.map((part) => part.answer)
      const a = (angle * Math.PI) / 180
      expect(range).toBeCloseTo(u * Math.cos(a) * time, 0)
      expect(height).toBeCloseTo((u * Math.sin(a) * time) / 2 - (9.8 * time * time) / 8, 0)
    }
  })

  it('keeps related answers consistent (collisions conserve momentum)', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-collisions', `c${seed}`)
      if (!problem) throw new Error('missing')
      const [m1, u1, m2, e] = [...problem.statement.matchAll(/mass (\d+) kg moving at (\d+) m\/s[\s\S]*?mass (\d+) kg at rest[\s\S]*?is ([\d.]+)\./g)][0].slice(1).map(Number)
      const [v1, v2] = problem.parts.map((part) => part.answer)
      expect(m1 * v1 + m2 * v2).toBeCloseTo(m1 * u1, 1)
      expect(v2 - v1).toBeCloseTo(e * u1, 1)
    }
  })

  it('keeps related answers consistent (inclined plane forces balance)', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-planes-friction', `f${seed}`)
      if (!problem) throw new Error('missing')
      const [m, theta, mu] = numbers(problem.statement)
      const [R, F, a] = problem.parts.map((part) => part.answer)
      expect(F).toBeCloseTo(mu * R, 1)
      expect(m * 9.8 * Math.sin((theta * Math.PI) / 180) - F).toBeCloseTo(m * a, 1)
    }
  })

  it('keeps related answers consistent (connected particles)', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-connected-masses', `m${seed}`)
      if (!problem) throw new Error('missing')
      const [a, T] = problem.parts.map((part) => part.answer)
      if (problem.statement.includes('over a smooth fixed pulley')) {
        const [m1, m2] = numbers(problem.statement)
        expect(m1 * 9.8 - T).toBeCloseTo(m1 * a, 0)
        expect(T - m2 * 9.8).toBeCloseTo(m2 * a, 0)
      } else {
        const [m1, m2] = numbers(problem.statement)
        expect(T).toBeCloseTo(m1 * a, 0)
        expect(m2 * 9.8 - T).toBeCloseTo(m2 * a, 0)
      }
    }
  })

  it('keeps related answers consistent (greedy never beats the optimum)', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-greedy-vs-dp', `g${seed}`)
      if (!problem) throw new Error('missing')
      const [greedy, best, difference] = problem.parts.map((part) => part.answer)
      expect(greedy).toBeGreaterThanOrEqual(best)
      expect(difference).toBe(greedy - best)
    }
  })

  it('solves the difference equation exactly', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateProblem('am-difference-solving', `d${seed}`)
      if (!problem) throw new Error('missing')
      const match = /U\(n\+2\) = (\d+)U\(n\+1\) ([+-]) (\d+)U\(n\), with U\(0\) = (-?\d+) and U\(1\) = (-?\d+)/.exec(problem.statement)
      if (!match) throw new Error(problem.statement)
      const p = Number(match[1])
      const q = (match[2] === '-' ? -1 : 1) * Number(match[3])
      const terms = [Number(match[4]), Number(match[5])]
      for (let n = 2; n <= 5; n += 1) terms.push(p * terms[n - 1] + q * terms[n - 2])
      expect(problem.parts[2].answer).toBe(terms[5])
    }
  })
})

describe('seeded random generator', () => {
  it('repeats for the same seed and differs for another', () => {
    const a = createRng('x')
    const b = createRng('x')
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
    expect(createRng('y')()).not.toBe(createRng('x')())
  })
})

describe('AI check prompt', () => {
  const prompt = buildCheckPrompt({
    question: 'Find the speed.',
    working: 'v = u + at',
    answers: ['(a) 12'],
    reference: ['(a) 12.00 m/s'],
  })

  it('includes the question, working, answers and the rules', () => {
    expect(prompt).toContain('## Question\nFind the speed.')
    expect(prompt).toContain('## My working\nv = u + at')
    expect(prompt).toContain('## My answers\n(a) 12')
    expect(prompt).toContain('## Correct answers calculated by my study app\n(a) 12.00 m/s')
    expect(prompt).toContain('Do not give a mark or a grade.')
    expect(prompt).toContain('If I attach a photo of my handwritten working or sketch')
    expect(prompt).toContain('Quote the exact words or lines from my working')
  })

  it('marks empty sections and leaves out missing ones', () => {
    const bare = buildCheckPrompt({ question: '', working: '' })
    expect(bare).toContain('## Question\n(empty)')
    expect(bare).not.toContain('## My answers')
    expect(bare).not.toContain('Correct answers calculated')
  })
})
