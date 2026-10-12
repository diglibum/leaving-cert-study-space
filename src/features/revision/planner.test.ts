import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, formatIsoDate, parseIsoDate, startOfWeek } from './dates'
import { apportion, buildRevisionPlan, EXAM_PHASE_DAYS, validateRevisionSetup } from './planner'
import { appliedMaths, revisionSubjects } from './subjects/appliedMaths'
import type { RevisionSetup, RevisionSubject, Weekday } from './types'

const fakeSubject = (id: string): RevisionSubject => ({
  id,
  name: id,
  topics: [
    { id: `${id}-a`, strand: 3, title: 'A', size: 1, higherOnly: false },
    { id: `${id}-b`, strand: 3, title: 'B', size: 3, higherOnly: false },
    { id: `${id}-c`, strand: 4, title: 'C', size: 1, higherOnly: true },
  ],
})

const catalog = [fakeSubject('one'), fakeSubject('two'), fakeSubject('three')]

const weekdays: Partial<Record<Weekday, number>> = { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 120 }

function setupWith(overrides: Partial<RevisionSetup> = {}): RevisionSetup {
  return {
    startDate: '2026-10-12',
    examDate: '2027-06-01',
    subjects: [
      { subjectId: 'one', level: 'higher', confidence: 'okay' },
      { subjectId: 'two', level: 'higher', confidence: 'okay' },
    ],
    minutesByWeekday: weekdays,
    ...overrides,
  }
}

describe('dates', () => {
  it('parses only real calendar dates', () => {
    expect(parseIsoDate('2027-06-01')).not.toBeNull()
    expect(parseIsoDate('2027-02-30')).toBeNull()
    expect(parseIsoDate('1 June 2027')).toBeNull()
  })

  it('moves across daylight saving changes without skipping a day', () => {
    const start = parseIsoDate('2027-03-27') as number
    expect(formatIsoDate(addDays(start, 2))).toBe('2027-03-29')
    expect(daysBetween(start, parseIsoDate('2027-04-03') as number)).toBe(7)
  })

  it('finds the Monday of a week', () => {
    expect(formatIsoDate(startOfWeek(parseIsoDate('2026-10-11') as number))).toBe('2026-10-05')
    expect(formatIsoDate(startOfWeek(parseIsoDate('2026-10-12') as number))).toBe('2026-10-12')
  })
})

describe('apportion', () => {
  it('always adds up to the total and follows the weights', () => {
    const counts = apportion(10, [1.5, 1, 0.7])
    expect(counts.reduce((a, b) => a + b, 0)).toBe(10)
    expect(counts[0]).toBeGreaterThan(counts[2])
  })

  it('gives each item the minimum when there is room', () => {
    expect(apportion(6, [10, 1, 1], 1)).toEqual([4, 1, 1])
    expect(apportion(2, [10, 1, 1], 1).reduce((a, b) => a + b, 0)).toBe(2)
  })

  it('handles empty input', () => {
    expect(apportion(5, [])).toEqual([])
    expect(apportion(0, [1, 2])).toEqual([0, 0])
  })
})

describe('validateRevisionSetup', () => {
  it('accepts a normal setup', () => {
    expect(validateRevisionSetup(setupWith(), catalog)).toEqual([])
  })

  it('reports each kind of problem', () => {
    expect(validateRevisionSetup(setupWith({ startDate: '2027-06-01' }), catalog)).toContain(
      'The start date must be before the exam date.',
    )
    expect(validateRevisionSetup(setupWith({ subjects: [] }), catalog)).toContain('Choose at least one subject.')
    expect(
      validateRevisionSetup(setupWith({ subjects: [{ subjectId: 'nope', level: 'higher', confidence: 'okay' }] }), catalog),
    ).toContain('Unknown subject: nope.')
    expect(validateRevisionSetup(setupWith({ minutesByWeekday: {} }), catalog)).toHaveLength(1)
    expect(validateRevisionSetup(setupWith({ minutesByWeekday: { 1: 9999 } }), catalog)).toHaveLength(1)
  })

  it('throws when building a plan from an invalid setup', () => {
    expect(() => buildRevisionPlan(setupWith({ subjects: [] }), catalog)).toThrow(RangeError)
  })
})

describe('buildRevisionPlan', () => {
  const plan = buildRevisionPlan(setupWith(), catalog)

  it('covers every day from the start up to the day before the exam', () => {
    expect(plan.days[0].date).toBe('2026-10-12')
    expect(plan.days[plan.days.length - 1].date).toBe('2027-05-31')
    expect(plan.days).toHaveLength(daysBetween(parseIsoDate('2026-10-12') as number, parseIsoDate('2027-06-01') as number))
  })

  it('leaves rest days empty and respects the minutes per day', () => {
    for (const day of plan.days) {
      const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay() as Weekday
      const minutes = day.blocks.reduce((sum, block) => sum + block.minutes, 0)
      const allowed = weekdays[weekday] ?? 0
      if (allowed === 0) expect(day.blocks).toEqual([])
      else expect(Math.abs(minutes - allowed)).toBeLessThanOrEqual(5)
    }
  })

  it('moves through build, practise, exam and light phases in order', () => {
    const order = ['build', 'practise', 'exam', 'light']
    const seen = plan.days.map((day) => order.indexOf(day.phase))
    expect([...seen].sort((a, b) => a - b)).toEqual(seen)
    expect(new Set(seen).size).toBe(4)
    expect(plan.phaseStarts.exam).toBe(formatIsoDate(addDays(parseIsoDate('2027-06-01') as number, -EXAM_PHASE_DAYS)))
    expect(plan.phaseStarts.light).toBe('2027-05-30')
  })

  it('covers every topic during the build phase when there is room', () => {
    const topicIds = new Set(
      plan.days.flatMap((day) => day.blocks.filter((block) => block.subjectId === 'one' && block.topicId).map((b) => b.topicId)),
    )
    expect(topicIds).toEqual(new Set(['one-a', 'one-b', 'one-c']))
  })

  it('studies topics in the listed order during the build phase', () => {
    const buildTopics = plan.days
      .filter((day) => day.phase === 'build')
      .flatMap((day) => day.blocks.filter((block) => block.subjectId === 'two').map((block) => block.topicId))
    const firstSeen = ['two-a', 'two-b', 'two-c'].map((id) => buildTopics.indexOf(id))
    expect([...firstSeen].sort((a, b) => a - b)).toEqual(firstSeen)
  })

  it('uses the right block kind for each phase', () => {
    const kindsFor = (phase: string) =>
      new Set(plan.days.filter((day) => day.phase === phase).flatMap((day) => day.blocks.map((block) => block.kind)))
    expect(kindsFor('build')).toEqual(new Set(['learn-topic']))
    expect(kindsFor('practise')).toEqual(new Set(['practise-topic']))
    expect(kindsFor('exam')).toEqual(new Set(['choose-questions', 'timed-questions', 'review-mistakes']))
    expect(kindsFor('light')).toEqual(new Set(['light-review']))
  })

  it('gives weak subjects more time than strong ones', () => {
    const weighted = buildRevisionPlan(
      setupWith({
        subjects: [
          { subjectId: 'one', level: 'higher', confidence: 'weak' },
          { subjectId: 'two', level: 'higher', confidence: 'okay' },
          { subjectId: 'three', level: 'higher', confidence: 'strong' },
        ],
      }),
      catalog,
    )
    const minutes = (id: string) =>
      weighted.days.flatMap((day) => day.blocks).filter((block) => block.subjectId === id).reduce((sum, block) => sum + block.minutes, 0)
    expect(minutes('one')).toBeGreaterThan(minutes('two'))
    expect(minutes('two')).toBeGreaterThan(minutes('three'))
  })

  it('touches every subject at least twice in a full week', () => {
    const subjects = ['one', 'two', 'three'].map((subjectId) => ({ subjectId, level: 'higher' as const, confidence: 'strong' as const }))
    const week = buildRevisionPlan(setupWith({ subjects: [{ ...subjects[0], confidence: 'weak' }, ...subjects.slice(1)] }), catalog)
    const days = week.days.slice(0, 7)
    for (const id of ['one', 'two', 'three']) {
      expect(days.flatMap((day) => day.blocks).filter((block) => block.subjectId === id).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('avoids the same subject twice in a row when other subjects are planned', () => {
    const blocks = plan.days.flatMap((day) => day.blocks)
    const repeats = blocks.filter((block, index) => index > 0 && block.subjectId === blocks[index - 1].subjectId)
    expect(repeats.length).toBeLessThan(blocks.length * 0.05)
  })

  it('leaves out Higher-only topics for Ordinary level', () => {
    const ordinary = buildRevisionPlan(
      setupWith({ subjects: [{ subjectId: 'one', level: 'ordinary', confidence: 'okay' }] }),
      catalog,
    )
    const ids = ordinary.days.flatMap((day) => day.blocks.map((block) => block.topicId))
    expect(ids).not.toContain('one-c')
  })

  it('shortens the build and practise phases for a short plan but keeps exam mode', () => {
    const short = buildRevisionPlan(setupWith({ startDate: '2027-04-10' }), catalog)
    expect(short.phaseStarts.build).toBe('2027-04-10')
    expect(short.phaseStarts.exam).toBe('2027-04-20')
    const veryShort = buildRevisionPlan(setupWith({ startDate: '2027-05-20' }), catalog)
    expect(veryShort.phaseStarts.build).toBeUndefined()
    expect(veryShort.phaseStarts.exam).toBe('2027-05-20')
  })

  it('works for a single subject and a plan that starts mid-week', () => {
    const solo = buildRevisionPlan(
      setupWith({ startDate: '2026-10-15', subjects: [{ subjectId: 'one', level: 'higher', confidence: 'okay' }] }),
      catalog,
    )
    expect(solo.days[0].date).toBe('2026-10-15')
    expect(solo.days.some((day) => day.blocks.length > 0)).toBe(true)
  })

  it('splits long days into several blocks and keeps short days to one', () => {
    const custom = buildRevisionPlan(setupWith({ minutesByWeekday: { 1: 20, 2: 40, 3: 90, 4: 240 } }), catalog)
    const byWeekday = (weekday: number) =>
      custom.days.find((day) => new Date(`${day.date}T00:00:00Z`).getUTCDay() === weekday)?.blocks.map((block) => block.minutes)
    expect(byWeekday(1)).toEqual([20])
    expect(byWeekday(2)).toEqual([40])
    expect(byWeekday(3)).toEqual([30, 30, 30])
    expect(byWeekday(4)).toEqual([60, 60, 60, 60])
  })
})

describe('Applied Mathematics topics', () => {
  it('has unique ids and only strands 2 to 4', () => {
    const ids = appliedMaths.topics.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(appliedMaths.topics.map((topic) => topic.strand))).toEqual(new Set([2, 3, 4]))
  })

  it('marks exactly the Higher-only topics from the specification', () => {
    expect(appliedMaths.topics.filter((topic) => topic.higherOnly).map((topic) => topic.id)).toEqual([
      'am-greedy-vs-dp',
      'am-differential-modelling',
      'am-differential-solving',
    ])
  })

  it('is registered in the subject catalogue and plans for 7 months', () => {
    expect(revisionSubjects).toContain(appliedMaths)
    const plan = buildRevisionPlan(
      {
        startDate: '2026-10-12',
        examDate: '2027-06-01',
        subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
        minutesByWeekday: { 1: 45, 2: 45, 3: 45, 4: 45, 6: 90 },
      },
      revisionSubjects,
    )
    const learned = new Set(plan.days.flatMap((day) => day.blocks.filter((b) => b.kind === 'learn-topic').map((b) => b.topicId)))
    expect(learned.size).toBe(appliedMaths.topics.length)
  })
})
