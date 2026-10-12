import { describe, expect, it } from 'vitest'
import { checkText } from '../problems/checkText'
import type { ClozeGap } from '../problems/types'
import { russian } from './russian'
import { russianCloze } from './russianCloze'
import { russianCulture } from './russianCulture'
import { listThemes } from './russianLists'
import { newsSections } from './russianMatching'
import { oralBanks } from './russianOral'
import { russianExerciseTopics } from './russianSources'

const cyrillic = /[\u0400-\u04FF]/

describe('Russian practice sources', () => {
  it('flag exactly the topics that have sets, and every one makes a set for several seeds', () => {
    const ids = russian.topics.map((topic) => topic.id)
    for (const id of russianExerciseTopics) expect(ids, id).toContain(id)
    for (const topic of russian.topics) {
      expect(Boolean(topic.hasExercises), topic.id).toBe(russianExerciseTopics.includes(topic.id))
      for (const seed of ['a:0', 'a:1', 'b:0', 'c:3']) {
        const set = russian.exercises?.(topic.id, seed)
        expect(set !== undefined, `${topic.id} ${seed}`).toBe(Boolean(topic.hasExercises))
        if (set) expect(set.topicId).toBe(topic.id)
      }
    }
  })

  it('offer every kind of practice somewhere', () => {
    const kinds = new Set<string>()
    for (const id of russianExerciseTopics) for (let n = 0; n < 12; n += 1) kinds.add(russian.exercises?.(id, `k:${n}`)?.kind ?? '')
    expect([...kinds].sort()).toEqual(['cloze', 'items', 'list', 'match', 'speak'])
  })

  it('give the same set for the same seed', () => {
    expect(russian.exercises?.('ru-written-expression', 'x:1')).toEqual(russian.exercises?.('ru-written-expression', 'x:1'))
  })
})

describe('Russian grammar texts', () => {
  const gaps = (index: number) =>
    russianCloze[index].paragraphs.flat().filter((part): part is ClozeGap => typeof part !== 'string')

  it('have enough texts, each with a title, a summary and enough gaps', () => {
    expect(russianCloze.length).toBeGreaterThanOrEqual(12)
    expect(new Set(russianCloze.map((text) => text.title)).size).toBe(russianCloze.length)
    russianCloze.forEach((text, index) => {
      expect(text.title, text.title).toMatch(cyrillic)
      expect(text.summary, text.title).not.toMatch(cyrillic)
      expect(gaps(index).length, text.title).toBeGreaterThanOrEqual(8)
    })
  })

  it('have gaps with Russian answers, an English note, and an answer that changes the word or is justified', () => {
    russianCloze.forEach((text, index) => {
      for (const gap of gaps(index)) {
        const label = `${text.title}: ${gap.base}`
        expect(gap.answers.length, label).toBeGreaterThan(0)
        expect(gap.answers.every((answer) => /^[\u0400-\u04FF -]+$/.test(answer)), label).toBe(true)
        expect(gap.note.length, label).toBeGreaterThan(10)
        expect(checkText({ prompt: gap.base, answers: gap.answers, note: gap.note }, gap.answers[0]), label).toBe('correct')
      }
    })
  })
})

describe('Russian matching items', () => {
  it('have enough sections and items, each fitting its section', () => {
    expect(newsSections.length).toBeGreaterThanOrEqual(12)
    expect(new Set(newsSections.map((section) => section.name)).size).toBe(newsSections.length)
    const texts = new Set<string>()
    for (const section of newsSections) {
      expect(section.name).toMatch(cyrillic)
      expect(section.gloss).not.toMatch(cyrillic)
      expect(section.items.length, section.name).toBeGreaterThanOrEqual(3)
      for (const item of section.items) {
        expect(item.text).toMatch(cyrillic)
        expect(item.note.length).toBeGreaterThan(10)
        texts.add(item.text)
      }
    }
    expect(texts.size).toBe(newsSections.reduce((sum, section) => sum + section.items.length, 0))
  })

  it('make a set of ten sections and ten items that each point to a valid section once', () => {
    for (const seed of ['m:0', 'm:1', 'm:2']) {
      const set = russian.exercises?.('ru-structuring-discourse', seed)
      if (set?.kind !== 'match') throw new Error('expected a matching set')
      expect(set.sections).toHaveLength(10)
      expect(set.items).toHaveLength(10)
      expect(set.items.map((item) => item.section).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    }
  })
})

describe('Russian word lists, culture quizzes and oral banks', () => {
  it('give each theme enough accepted words, in Russian and without repeats', () => {
    expect(listThemes.length).toBeGreaterThanOrEqual(12)
    for (const theme of listThemes) {
      expect(theme.theme).not.toMatch(cyrillic)
      expect(theme.accepted.length, theme.theme).toBeGreaterThanOrEqual(15)
      expect(new Set(theme.accepted).size, theme.theme).toBe(theme.accepted.length)
      expect(theme.accepted.every((word) => cyrillic.test(word)), theme.theme).toBe(true)
    }
  })

  it('give each culture quiz enough items with Russian answers and an English note', () => {
    for (const [topicId, pool] of Object.entries(russianCulture)) {
      expect(russian.topics.some((topic) => topic.id === topicId), topicId).toBe(true)
      expect(pool.items.length, topicId).toBeGreaterThanOrEqual(10)
      expect(new Set(pool.items.map((item) => item.prompt)).size, topicId).toBe(pool.items.length)
      expect(pool.instruction).not.toMatch(cyrillic)
      for (const item of pool.items) {
        expect(item.answers.every((answer) => cyrillic.test(answer)), `${topicId} ${item.prompt}`).toBe(true)
        expect(item.note.length, `${topicId} ${item.prompt}`).toBeGreaterThan(10)
      }
    }
  })

  it('give every oral topic Russian questions with an English meaning, tips and a self-check', () => {
    for (const [topicId, bank] of Object.entries(oralBanks)) {
      expect(russian.topics.find((topic) => topic.id === topicId)?.area, topicId).toBe('oral')
      expect(bank.prompts.length, topicId).toBeGreaterThanOrEqual(8)
      for (const prompt of bank.prompts) {
        expect(prompt.text).toMatch(cyrillic)
        expect(prompt.gloss).not.toMatch(cyrillic)
      }
      expect(bank.instruction).not.toMatch(cyrillic)
      expect(bank.tips.length).toBeGreaterThanOrEqual(3)
      expect(bank.selfCheck.length).toBeGreaterThanOrEqual(3)
    }
  })
})
