import { describe, expect, it } from 'vitest'
import { dueTopicIds, reviewTopic, summariseProgress, type TopicProgress } from './progress'
import { mergeRevision, sameSetup, type StoredRevision } from './stored'
import type { RevisionSetup } from './types'

describe('reviewTopic', () => {
  it('schedules the first review for the next day', () => {
    expect(reviewTopic(undefined, 'got-it', '2026-10-12')).toEqual({
      outcome: 'got-it',
      box: 0,
      lastReviewed: '2026-10-12',
      due: '2026-10-13',
    })
  })

  it('widens the gap after each successful recall and stops at 45 days', () => {
    let progress: TopicProgress | undefined
    const gaps: string[] = []
    for (let i = 0; i < 7; i += 1) {
      progress = reviewTopic(progress, 'got-it', '2026-10-01')
      gaps.push(progress.due)
    }
    expect(gaps).toEqual([
      '2026-10-02',
      '2026-10-04',
      '2026-10-08',
      '2026-10-22',
      '2026-11-15',
      '2026-11-15',
      '2026-11-15',
    ])
  })

  it('sends a shaky topic back to the shortest gap', () => {
    const steady = reviewTopic(reviewTopic(undefined, 'got-it', '2026-10-01'), 'got-it', '2026-10-02')
    expect(steady.box).toBe(1)
    expect(reviewTopic(steady, 'shaky', '2026-10-05')).toMatchObject({ box: 0, due: '2026-10-06', outcome: 'shaky' })
  })

  it('rejects an invalid date', () => {
    expect(() => reviewTopic(undefined, 'got-it', 'soon')).toThrow(RangeError)
  })
})

describe('due topics and summary', () => {
  const progress: Record<string, TopicProgress> = {
    a: { outcome: 'got-it', box: 2, lastReviewed: '2026-10-01', due: '2026-10-08' },
    b: { outcome: 'shaky', box: 0, lastReviewed: '2026-10-08', due: '2026-10-09' },
    c: { outcome: 'got-it', box: 0, lastReviewed: '2026-10-09', due: '2026-10-09' },
    d: { outcome: 'got-it', box: 1, lastReviewed: '2026-10-09', due: '2026-10-20' },
  }

  it('lists overdue topics first, then lower boxes, and skips future ones', () => {
    expect(dueTopicIds(progress, '2026-10-09')).toEqual(['a', 'b', 'c'])
    expect(dueTopicIds(progress, '2026-10-07')).toEqual([])
  })

  it('counts reviewed, shaky and due topics among the given ids', () => {
    expect(summariseProgress(['a', 'b', 'x', 'y'], progress, '2026-10-09')).toEqual({
      total: 4,
      reviewed: 2,
      shaky: 1,
      due: 2,
    })
  })
})

describe('stored revision helpers', () => {
  const setup: RevisionSetup = {
    startDate: '2026-10-12',
    examDate: '2027-06-01',
    subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
    minutesByWeekday: { 1: 45, 6: 90 },
  }
  const stored = (changes: Partial<StoredRevision>): StoredRevision => ({
    id: 'active',
    setup,
    projectDueDate: null,
    completed: {},
    topicProgress: {},
    createdAt: 10,
    updatedAt: 10,
    ...changes,
  })

  it('compares setups ignoring key order and zero-minute days', () => {
    expect(sameSetup(setup, { ...setup, minutesByWeekday: { 6: 90, 1: 45, 0: 0 } })).toBe(true)
    expect(sameSetup(setup, { ...setup, minutesByWeekday: { 1: 45 } })).toBe(false)
    expect(sameSetup(setup, { ...setup, subjects: [{ ...setup.subjects[0], confidence: 'weak' }] })).toBe(false)
  })

  it('merges backup data without losing newer progress on either side', () => {
    const current = stored({
      updatedAt: 20,
      projectDueDate: '2027-02-01',
      topicProgress: {
        a: { outcome: 'got-it', box: 1, lastReviewed: '2026-11-02', due: '2026-11-05' },
        b: { outcome: 'shaky', box: 0, lastReviewed: '2026-11-01', due: '2026-11-02' },
      },
    })
    const incoming = stored({
      updatedAt: 15,
      createdAt: 5,
      projectDueDate: null,
      topicProgress: {
        a: { outcome: 'shaky', box: 0, lastReviewed: '2026-10-20', due: '2026-10-21' },
        b: { outcome: 'got-it', box: 3, lastReviewed: '2026-11-10', due: '2026-12-01' },
        c: { outcome: 'got-it', box: 0, lastReviewed: '2026-10-05', due: '2026-10-06' },
      },
    })
    const merged = mergeRevision(current, incoming)
    expect(merged.projectDueDate).toBe('2027-02-01')
    expect(merged.createdAt).toBe(5)
    expect(merged.updatedAt).toBe(20)
    expect(Object.keys(merged.topicProgress).sort()).toEqual(['a', 'b', 'c'])
    expect(merged.topicProgress.a.lastReviewed).toBe('2026-11-02')
    expect(merged.topicProgress.b.lastReviewed).toBe('2026-11-10')
  })

  it('takes the incoming data when nothing is stored yet, and its setup when it is newer', () => {
    const incoming = stored({ updatedAt: 30, projectDueDate: '2027-03-01' })
    expect(mergeRevision(undefined, incoming)).toBe(incoming)
    expect(mergeRevision(stored({ updatedAt: 20 }), incoming).projectDueDate).toBe('2027-03-01')
  })
})
