import { describe, expect, it } from 'vitest'
import { generateProblem } from './appliedMathsProblems'
import { generateSketch, hasSketch, sketchTopicIds } from './appliedMathsSketches'
import { circleNetwork, layeredDiagram, niceScale, sampleCurve } from './diagrams'
import type { Diagram, NetworkDiagram } from './types'

function checkNetwork(diagram: NetworkDiagram) {
  const ids = new Set(diagram.nodes.map((node) => node.id))
  expect(ids.size).toBe(diagram.nodes.length)
  for (const edge of diagram.edges) {
    expect(ids.has(edge.from)).toBe(true)
    expect(ids.has(edge.to)).toBe(true)
    expect(edge.label).toMatch(/^\d+$/)
  }
  for (const node of diagram.nodes) {
    expect(node.x).toBeGreaterThanOrEqual(14)
    expect(node.x).toBeLessThanOrEqual(326)
    expect(node.y).toBeGreaterThanOrEqual(14)
    expect(node.y).toBeLessThanOrEqual(226)
  }
}

function checkGraph(diagram: Diagram) {
  if (diagram.kind !== 'graph') throw new Error('not a graph')
  expect(diagram.description.length).toBeGreaterThan(20)
  for (const line of diagram.lines) {
    for (const [x, y] of line.points) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      expect(x).toBeGreaterThanOrEqual(-1e-9)
      expect(x).toBeLessThanOrEqual(diagram.xMax + 1e-9)
      expect(y).toBeGreaterThanOrEqual(-1e-9)
      expect(y).toBeLessThanOrEqual(diagram.yMax + 1e-9)
    }
  }
  for (const mark of diagram.marks ?? []) {
    expect(mark.x).toBeLessThanOrEqual(diagram.xMax + 1e-9)
    expect(mark.y).toBeLessThanOrEqual(diagram.yMax + 1e-9)
  }
}

describe('diagram helpers', () => {
  it('rounds axis lengths up to tidy steps', () => {
    expect(niceScale(23, 6)).toEqual({ max: 25, step: 5 })
    expect(niceScale(12, 5)).toEqual({ max: 15, step: 5 })
    expect(niceScale(0.9, 5)).toEqual({ max: 1, step: 0.2 })
  })

  it('samples a curve including both ends', () => {
    const points = sampleCurve((x) => x * 2, 0, 4, 4)
    expect(points).toEqual([[0, 0], [1, 2], [2, 4], [3, 6], [4, 8]])
  })

  it('lays out a circle network and a layered network', () => {
    const names = ['A', 'B', 'C']
    const edges = [
      { a: 0, b: 1, weight: 3 },
      { a: 1, b: 2, weight: 4 },
    ]
    const circle = circleNetwork(names, edges, [edges[1]])
    expect(circle.edges.map((edge) => edge.highlight)).toEqual([false, true])
    checkNetwork(circle)
    const layered = layeredDiagram({ layers: [['S'], ['A', 'B'], ['T']], cost: { 'S>A': 1, 'S>B': 2, 'A>T': 3, 'B>T': 4 } }, ['S', 'B', 'T'])
    expect(layered.edges.filter((edge) => edge.highlight).map((edge) => `${edge.from}>${edge.to}`)).toEqual(['S>B', 'B>T'])
    checkNetwork(layered)
  })
})

describe('diagrams in practice problems', () => {
  it('draws networks that match the question and highlight the minimum spanning tree', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const problem = generateProblem('am-spanning-trees', `d${seed}`)
      if (!problem?.diagram || problem.diagram.kind !== 'network' || problem.solutionDiagram?.kind !== 'network') throw new Error('missing diagram')
      checkNetwork(problem.diagram)
      expect(problem.diagram.edges).toHaveLength(15)
      expect(problem.solutionDiagram.edges).toHaveLength(5)
      expect(problem.solutionDiagram.edges.every((edge) => edge.highlight)).toBe(true)
      const sum = problem.solutionDiagram.edges.reduce((total, edge) => total + Number(edge.label), 0)
      expect(sum).toBe(problem.parts[0].answer)
    }
  })

  it('draws the Dijkstra and staged networks', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      for (const id of ['am-dijkstra', 'am-dynamic-programming', 'am-greedy-vs-dp']) {
        const problem = generateProblem(id, `n${seed}`)
        if (problem?.diagram?.kind !== 'network') throw new Error(id)
        checkNetwork(problem.diagram)
      }
    }
  })

  it('highlights the cheapest staged route', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const problem = generateProblem('am-dynamic-programming', `r${seed}`)
      if (problem?.solutionDiagram?.kind !== 'network') throw new Error('missing')
      const route = problem.solutionDiagram.edges.filter((edge) => edge.highlight)
      expect(route).toHaveLength(3)
      expect(route.reduce((total, edge) => total + Number(edge.label), 0)).toBe(problem.parts[1].answer)
    }
  })

  it('reads a velocity-time graph consistently', () => {
    let seen = 0
    for (let seed = 0; seed < 200; seed += 1) {
      const problem = generateProblem('am-kinematics-1d', `vt${seed}`)
      if (problem?.diagram?.kind !== 'graph') continue
      seen += 1
      checkGraph(problem.diagram)
      const [[, ], [t1, v], [t2], [total]] = problem.diagram.lines[0].points
      const [a, distance, average] = problem.parts.map((part) => part.answer)
      expect(a).toBeCloseTo(v / t1, 2)
      expect(distance).toBeCloseTo((v * t1) / 2 + v * (t2 - t1) + (v * (total - t2)) / 2, 2)
      expect(average).toBeCloseTo(distance / total, 1)
    }
    expect(seen).toBeGreaterThan(30)
  })
})

describe('sketch tasks', () => {
  it('covers only known topics', () => {
    expect(sketchTopicIds().length).toBeGreaterThanOrEqual(3)
    expect(hasSketch('am-projectiles')).toBe(true)
    expect(hasSketch('am-dijkstra')).toBe(false)
    expect(generateSketch('am-dijkstra', 'x')).toBeUndefined()
  })

  it('gives repeatable tasks with a valid reference graph and a checklist', () => {
    for (const id of sketchTopicIds()) {
      expect(generateSketch(id, 'same')).toEqual(generateSketch(id, 'same'))
      for (let seed = 0; seed < 100; seed += 1) {
        const task = generateSketch(id, `s${seed}`)
        if (!task) throw new Error(id)
        checkGraph(task.reference)
        expect(task.checklist.length).toBeGreaterThanOrEqual(4)
        expect(`${task.prompt} ${task.checklist.join(' ')}`).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
  })

  it('draws a projectile that lands at the computed range and peaks halfway', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const task = generateSketch('am-projectiles', `p${seed}`)
      if (task?.reference.kind !== 'graph') throw new Error('missing')
      const points = task.reference.lines[0].points
      const top = points.reduce((best, point) => (point[1] > best[1] ? point : best))
      const last = points[points.length - 1]
      expect(Math.abs(last[1])).toBeLessThan(0.01)
      expect(top[0]).toBeCloseTo(last[0] / 2, 0)
    }
  })
})
