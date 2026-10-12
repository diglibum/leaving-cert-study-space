import { describe, expect, it } from 'vitest'
import { checkText, normaliseText } from '../problems/checkText'
import { russian } from './russian'
import { russianPools } from './russianExercises'

describe('Russian exercise pools', () => {
  const entries = Object.entries(russianPools)

  it('belong to real Russian topics, and those topics are flagged', () => {
    for (const [topicId] of entries) {
      const topic = russian.topics.find((entry) => entry.id === topicId)
      expect(topic, topicId).toBeDefined()
      expect(topic?.hasExercises, topicId).toBe(true)
    }
    expect(entries.length).toBeGreaterThanOrEqual(11)
  })

  it('have enough items for several sets, each with answers and an English note', () => {
    for (const [topicId, pool] of entries) {
      expect(pool.items.length, topicId).toBeGreaterThanOrEqual(10)
      for (const item of pool.items) {
        expect(item.answers.length, `${topicId} ${item.prompt}`).toBeGreaterThan(0)
        const expected = (item.answerLang ?? pool.lang) === 'ru' ? /^[\u0400-\u04FF ]+$/ : /^[a-z\u0400-\u04FF ]+$/
        expect(item.answers.every((answer) => expected.test(answer)), `${topicId} ${item.prompt}`).toBe(true)
        expect(item.note.length, `${topicId} ${item.prompt}`).toBeGreaterThan(10)
        if (pool.promptLang === 'ru') expect(item.prompt, topicId).toContain('___')
        else if (topicId.startsWith('ru-vocab')) expect(item.prompt, topicId).not.toMatch(/[\u0400-\u04FF]/)
      }
      expect(new Set(pool.items.map((item) => item.prompt)).size, topicId).toBe(pool.items.length)
      expect(pool.instruction, topicId).not.toMatch(/[\u0400-\u04FF]/)
    }
  })

  it('never leaks the answer into a gap sentence', () => {
    for (const [topicId, pool] of entries) {
      if (pool.promptLang !== 'ru') continue
      for (const item of pool.items) {
        const prompt = normaliseText(item.prompt.replace(/\([^)]*\)/g, ' '))
        expect(item.answers.some((answer) => prompt.split(/[\s()/,.!?-]+/).includes(normaliseText(answer))), `${topicId} ${item.prompt}`).toBe(false)
      }
    }
  })

  it('makes a set through the subject, and the model answers check as correct', () => {
    const exercise = russian.exercises?.('ru-cases-nouns', 'seed')
    if (exercise?.kind !== 'items') throw new Error('expected an items set')
    expect(exercise.items).toHaveLength(6)
    for (const item of exercise.items) expect(checkText(item, item.answers[0])).toBe('correct')
    expect(russian.exercises?.('ru-accuracy', 'seed')).toBeUndefined()
  })
})
