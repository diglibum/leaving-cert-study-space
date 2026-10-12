import { describe, expect, it } from 'vitest'
import { buildRevisionPlan } from './planner'
import { appliedMaths } from './subjects/appliedMaths'
import { blockTasks, describePart, splitMinutes } from './tasks'
import type { RevisionPlan, RevisionSetup } from './types'

const setup: RevisionSetup = {
  startDate: '2026-10-12',
  examDate: '2027-06-01',
  subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
  minutesByWeekday: { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 120 },
}

const plan = buildRevisionPlan(setup, [appliedMaths])

function allBlocks(current: RevisionPlan) {
  return current.days.flatMap((day) => day.blocks.map((block, index) => ({ day, block, index })))
}

function tasksFor(date: string, index: number, topicProgress = {}) {
  return blockTasks({ plan, date, index, subject: appliedMaths, topicProgress })
}

describe('Applied Mathematics content', () => {
  const parts = appliedMaths.paperParts ?? []
  const topicIds = new Set(appliedMaths.topics.map((topic) => topic.id))

  it('gives every topic recall prompts and at least one past paper part', () => {
    for (const topic of appliedMaths.topics) {
      expect(topic.recall?.length ?? 0, topic.id).toBeGreaterThanOrEqual(3)
      expect(parts.some((part) => part.topics.includes(topic.id)), topic.id).toBe(true)
    }
  })

  it('maps every part to known topics and covers questions 1 to 10 for 2023 to 2026', () => {
    for (const part of parts) {
      expect(part.topics.length).toBeGreaterThan(0)
      for (const id of part.topics) expect(topicIds.has(id), id).toBe(true)
    }
    for (const year of [2023, 2024, 2025, 2026]) {
      const questions = new Set(parts.filter((part) => part.year === year).map((part) => part.question))
      expect([...questions].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    }
  })
})

describe('splitMinutes', () => {
  it('always adds up to the total', () => {
    for (const total of [25, 30, 45, 60, 90, 120]) {
      const steps = splitMinutes(total, [45, 25, 30])
      expect(steps.reduce((a, b) => a + b, 0)).toBe(total)
      expect(steps.every((minutes) => minutes > 0)).toBe(true)
    }
  })
})

describe('blockTasks with practice problems', () => {
  it('points learn and practise blocks to the problem panel', () => {
    const learn = allBlocks(plan).find(({ block }) => block.kind === 'learn-topic')
    const practise = allBlocks(plan).find(({ block }) => block.kind === 'practise-topic')
    if (!learn || !practise) throw new Error('missing blocks')
    expect(tasksFor(learn.day.date, learn.index).map((task) => task.text).join(' ')).toMatch(/practice problem below/)
    expect(tasksFor(practise.day.date, practise.index).map((task) => task.text).join(' ')).toMatch(/practice problems below/)
  })
})

describe('blockTasks', () => {
  it('gives every block steps that add up to its minutes', () => {
    for (const { day, block, index } of allBlocks(plan)) {
      const tasks = tasksFor(day.date, index)
      expect(tasks.length, `${day.date} ${block.kind}`).toBeGreaterThan(0)
      expect(tasks.reduce((sum, task) => sum + task.minutes, 0), `${day.date} ${block.kind}`).toBe(block.minutes)
      expect(tasks.every((task) => task.text.length > 0 && task.minutes > 0)).toBe(true)
    }
  })

  it('starts a learn block with reading, recall prompts and one past paper part on the topic', () => {
    const found = allBlocks(plan).find(({ block }) => block.kind === 'learn-topic')
    if (!found) throw new Error('No learn block')
    const [, recall, attempt] = tasksFor(found.day.date, found.index)
    const topic = appliedMaths.topics.find((entry) => entry.id === found.block.topicId)
    expect(recall.items.length).toBeGreaterThanOrEqual(2)
    for (const item of recall.items) expect(topic?.recall).toContain(item)
    expect(attempt.items).toHaveLength(1)
    const part = appliedMaths.paperParts?.find((entry) => describePart(entry) === attempt.items[0])
    expect(part?.topics).toContain(found.block.topicId)
  })

  it('suggests different questions each time a topic is practised', () => {
    const practise = allBlocks(plan).filter(({ block }) => block.kind === 'practise-topic')
    const byTopic = new Map<string, string[][]>()
    for (const { day, block, index } of practise) {
      const solve = tasksFor(day.date, index)[1]
      byTopic.set(block.topicId as string, [...(byTopic.get(block.topicId as string) ?? []), solve.items])
    }
    const repeated = [...byTopic.values()].find((rounds) => rounds.length >= 2)
    if (!repeated) throw new Error('No topic practised twice')
    expect(repeated[0].length).toBeGreaterThan(0)
    expect(repeated[0]).not.toEqual(repeated[1])
  })

  it('puts questions with shaky topics first in timed work', () => {
    const found = allBlocks(plan).find(({ block }) => block.kind === 'timed-questions')
    if (!found) throw new Error('No timed block')
    const progress = {
      'am-dynamic-programming': { outcome: 'shaky' as const, box: 0, lastReviewed: '2027-04-01', due: '2027-04-02' },
    }
    const [task] = tasksFor(found.day.date, found.index, progress)
    expect(task.items.length).toBeGreaterThan(0)
    const dpQuestions = (appliedMaths.paperParts ?? []).filter((part) => part.topics.includes('am-dynamic-programming'))
    expect(
      dpQuestions.some((part) => task.items[0].startsWith(`${part.year} question ${part.question}:`)),
    ).toBe(true)
  })

  it('returns nothing for an unknown block', () => {
    expect(tasksFor('2020-01-01', 0)).toEqual([])
  })
})
