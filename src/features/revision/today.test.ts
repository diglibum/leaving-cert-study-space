import { describe, expect, it } from 'vitest'
import { buildRevisionPlan } from './planner'
import type { StoredRevision } from './stored'
import { appliedMaths } from './subjects/appliedMaths'
import { summariseToday } from './today'
import type { RevisionSetup } from './types'

const setup: RevisionSetup = {
  startDate: '2026-10-12',
  examDate: '2027-06-01',
  subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
  minutesByWeekday: { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 120 },
}
const plan = buildRevisionPlan(setup, [appliedMaths])

function stored(overrides: Partial<StoredRevision> = {}): StoredRevision {
  return { id: 'active', setup, projectDueDate: null, completed: {}, topicProgress: {}, createdAt: 0, updatedAt: 0, ...overrides }
}

describe('summariseToday', () => {
  it('lists the blocks of a study day with minutes and done marks', () => {
    const summary = summariseToday(stored({ completed: { '2026-10-12': [0] } }), plan, [appliedMaths], '2026-10-12')
    expect(summary.isToday).toBe(true)
    expect(summary.date).toBe('2026-10-12')
    expect(summary.blocks.length).toBeGreaterThan(0)
    expect(summary.blocks[0]).toMatchObject({ done: true, subjectName: 'Applied Mathematics' })
    expect(summary.blocks[0].title).toMatch(/^Learn: Motion in a straight line/)
    expect(summary.doneCount).toBe(1)
    expect(summary.totalMinutes).toBe(60)
  })

  it('shows the next study day on a rest day (Sunday)', () => {
    const summary = summariseToday(stored(), plan, [appliedMaths], '2026-10-11')
    expect(summary.isToday).toBe(false)
    expect(summary.date).toBe('2026-10-12')
    expect(summary.blocks.length).toBeGreaterThan(0)
  })

  it('counts topics due for recall', () => {
    const summary = summariseToday(
      stored({ topicProgress: { 'am-dijkstra': { outcome: 'shaky', box: 0, lastReviewed: '2026-10-10', due: '2026-10-11' } } }),
      plan,
      [appliedMaths],
      '2026-10-12',
    )
    expect(summary.dueCount).toBe(1)
  })

  it('reports a finished plan', () => {
    const summary = summariseToday(stored(), plan, [appliedMaths], '2027-06-05')
    expect(summary.finished).toBe(true)
    expect(summary.date).toBeNull()
    expect(summary.blocks).toEqual([])
  })
})
