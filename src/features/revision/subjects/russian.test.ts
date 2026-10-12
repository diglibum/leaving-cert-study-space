import { describe, expect, it } from 'vitest'
import { buildRevisionPlan } from '../planner'
import { buildWritingCheckPrompt } from '../problems/aiCheck'
import { blockTasks } from '../tasks'
import type { BlockKind, RevisionSetup } from '../types'
import { revisionSubjects } from './appliedMaths'
import { russian } from './russian'

const setup = (level: 'higher' | 'ordinary' = 'higher'): RevisionSetup => ({
  startDate: '2026-10-12',
  examDate: '2027-06-01',
  subjects: [{ subjectId: 'russian', level, confidence: 'okay' }],
  minutesByWeekday: { 1: 45, 2: 45, 3: 45, 4: 45, 6: 90 },
})

const plan = buildRevisionPlan(setup(), revisionSubjects)
const blocks = plan.days.flatMap((day) => day.blocks.map((block, index) => ({ day, block, index })))
const tasksFor = (date: string, index: number, topicProgress = {}) =>
  blockTasks({ plan, date, index, subject: russian, topicProgress })

describe('Russian content', () => {
  it('is registered and has unique topic ids with at least three recall prompts each', () => {
    expect(revisionSubjects).toContain(russian)
    const ids = russian.topics.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const topic of russian.topics) {
      expect(topic.id.startsWith('ru-')).toBe(true)
      expect(topic.recall?.length ?? 0, topic.id).toBeGreaterThanOrEqual(3)
      expect(topic.area, topic.id).toBeDefined()
    }
  })

  it('covers every part of the Higher Level exam named in the 2027 arrangements', () => {
    const titles = russian.topics.map((topic) => topic.title).join('\n')
    for (const part of [
      /general conversation about yourself/i,
      /everyday life in Ireland/i,
      /aspects of culture/i,
      /contemporary life/i,
      /the project/i,
      /Aural/,
      /Reading comprehension/,
      /Structuring discourse/,
      /Written expression/,
      /Short essay on Russian culture/,
      /Guided writing/,
    ]) {
      expect(titles).toMatch(part)
    }
  })

  it('keeps topics, steps and help in English: Cyrillic lives only in the exercise data', () => {
    const json = JSON.stringify({ russian, tasks: blocks.map(({ day, index }) => tasksFor(day.date, index)) })
    expect(json).not.toMatch(/[\u0400-\u04FF]/)
  })

  it('marks only guided writing as Higher only and drops it for Ordinary', () => {
    expect(russian.topics.filter((topic) => topic.higherOnly).map((topic) => topic.id)).toEqual(['ru-guided-writing'])
    const ordinary = buildRevisionPlan(setup('ordinary'), revisionSubjects)
    const topicIds = ordinary.days.flatMap((day) => day.blocks.map((block) => block.topicId))
    expect(topicIds).not.toContain('ru-guided-writing')
    expect(topicIds).toContain('ru-cases-nouns')
  })

  it('puts the oral topics before the written-only topics', () => {
    const order = russian.topics.map((topic) => topic.id)
    expect(order.indexOf('ru-oral-narrative')).toBeLessThan(order.indexOf('ru-guided-writing'))
    expect(order.indexOf('ru-oral-project')).toBeLessThan(order.indexOf('ru-guided-writing'))
  })

  it('plans every topic as a learn block within 7 months', () => {
    const learned = new Set(blocks.filter(({ block }) => block.kind === 'learn-topic').map(({ block }) => block.topicId))
    expect(learned.size).toBe(russian.topics.length)
  })
})

describe('Russian block tasks', () => {
  it('gives every block steps that add up to its minutes', () => {
    for (const { day, block, index } of blocks) {
      const tasks = tasksFor(day.date, index)
      expect(tasks.length, `${day.date} ${block.kind}`).toBeGreaterThan(0)
      expect(tasks.reduce((sum, task) => sum + task.minutes, 0), `${day.date} ${block.kind}`).toBe(block.minutes)
      expect(tasks.every((task) => task.text.length > 0 && task.minutes > 0)).toBe(true)
    }
  })

  it('has a task writer and a help text for every block kind', () => {
    const kinds: BlockKind[] = ['learn-topic', 'practise-topic', 'choose-questions', 'timed-questions', 'review-mistakes', 'light-review']
    for (const kind of kinds) {
      expect(russian.tasks?.[kind], kind).toBeTypeOf('function')
      expect(russian.help?.[kind], kind).toBeTruthy()
    }
    expect(new Set(blocks.map(({ block }) => block.kind))).toEqual(new Set(kinds))
  })

  it('never uses maths wording', () => {
    const text = blocks
      .flatMap(({ day, index }) => tasksFor(day.date, index))
      .flatMap((task) => [task.text, ...task.items])
      .join('\n')
    expect(text).not.toMatch(/Formulae and Tables|marking scheme and the Formulae|solve one example|textbook exercises/i)
  })

  it('tailors a learn block to the skill of its topic', () => {
    const find = (topicId: string) => blocks.find(({ block }) => block.kind === 'learn-topic' && block.topicId === topicId)
    const grammar = find('ru-cases-nouns')
    const oral = find('ru-oral-narrative')
    if (!grammar || !oral) throw new Error('missing blocks')
    expect(tasksFor(grammar.day.date, grammar.index)[0].text).toMatch(/grammar book/)
    expect(tasksFor(oral.day.date, oral.index)[2].text).toMatch(/recording it on your phone/)
  })

  it('points to real past papers in timed work, with their files and marking schemes', () => {
    const text = blocks
      .filter(({ block }) => block.kind === 'timed-questions')
      .flatMap(({ day, index }) => tasksFor(day.date, index))
      .flatMap((task) => [task.text, ...task.items])
      .join('\n')
    expect(text).toMatch(/exam-papers\/sec\/20\d\d-russian-higher-paper\.pdf/)
    expect(text).toMatch(/exam-papers\/sec\/20\d\d-russian-higher-marking-scheme\.pdf/)
    expect(text).toMatch(/exam-papers\/sec\/audio\/20\d\d-russian-aural-recording\.mp3/)
    expect(text).toMatch(/about 50 words/)
    expect(text).toMatch(/140 words/)
  })

  it('does not ask for Russian answers to comprehension questions', () => {
    const text = blocks
      .flatMap(({ day, index }) => tasksFor(day.date, index))
      .flatMap((task) => [task.text, ...task.items])
      .join('\n')
    expect(text).not.toMatch(/full Russian sentences/)
  })

  it('names exam parts in timed work and puts shaky ones first', () => {
    const found = blocks.find(({ block }) => block.kind === 'timed-questions')
    if (!found) throw new Error('No timed block')
    const progress = {
      'ru-aural': { outcome: 'shaky' as const, box: 0, lastReviewed: '2027-04-01', due: '2027-04-02' },
    }
    const tasks = tasksFor(found.day.date, found.index, progress)
    expect(tasks[0].items[0]).toMatch(/Aural/)
    const others = tasksFor(found.day.date, found.index)
    expect(others.every((task) => task.items.length >= 1 && task.items.length <= 3)).toBe(true)
  })
})

describe('Russian at Ordinary Level', () => {
  const ordinary = buildRevisionPlan(setup('ordinary'), revisionSubjects)
  const ordinaryBlocks = ordinary.days.flatMap((day) => day.blocks.map((block, index) => ({ day, block, index })))
  const tasksOf = (kind: BlockKind) =>
    ordinaryBlocks
      .filter(({ block }) => block.kind === kind)
      .flatMap(({ day, index }) => blockTasks({ plan: ordinary, date: day.date, index, subject: russian, topicProgress: {} }))

  it('records the chosen level in the plan', () => {
    expect(ordinary.levels).toEqual({ russian: 'ordinary' })
    expect(plan.levels).toEqual({ russian: 'higher' })
  })

  it('names the Ordinary exam parts in timed work and never guided writing', () => {
    const text = tasksOf('timed-questions').flatMap((task) => task.items).join('\n')
    expect(text).toMatch(/Mix and match|Extended writing|Short answers/)
    expect(text).not.toMatch(/Guided writing/)
    expect(text).toMatch(/Aural|Mock oral/)
  })

  it('uses short answers and extended writing in choose blocks', () => {
    const text = tasksOf('choose-questions').map((task) => task.text).join('\n')
    expect(text).toMatch(/extended writing/)
    expect(text).not.toMatch(/guided writing|two letters/)
  })

  it('keeps the Higher timed parts for Higher', () => {
    const text = blocks
      .filter(({ block }) => block.kind === 'timed-questions')
      .flatMap(({ day, index }) => tasksFor(day.date, index))
      .flatMap((task) => task.items)
      .join('\n')
    expect(text).toMatch(/Guided writing|Structuring discourse/)
    expect(text).not.toMatch(/Mix and match/)
  })
})

describe('writing check prompt', () => {
  const prompt = buildWritingCheckPrompt({ task: 'Write a letter to a friend.', text: 'Dear friend' }, 'Russian')

  it('asks for quotes, grouped improvements and no rewrite or mark', () => {
    expect(prompt).toContain('Leaving Certificate Russian exam')
    expect(prompt).toContain('## Task\nWrite a letter to a friend.')
    expect(prompt).toContain('## My text\nDear friend')
    expect(prompt).toContain('Quote the exact words from my text')
    expect(prompt).toContain('Do not rewrite my text.')
    expect(prompt).toContain('Do not give a mark or a grade.')
  })

  it('marks empty sections', () => {
    expect(buildWritingCheckPrompt({ task: '', text: '' }, 'Russian')).toContain('## My text\n(empty)')
  })
})
