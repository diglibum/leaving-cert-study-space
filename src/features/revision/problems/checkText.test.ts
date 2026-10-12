import { describe, expect, it } from 'vitest'
import { checkText, normaliseText } from './checkText'
import { generateLanguageExercise } from './languageExercise'
import type { LanguageItem, LanguagePool } from './types'

const item: LanguageItem = { prompt: 'Они ___ (идти).', answers: ['идут', 'идёт'], note: 'test' }

describe('checkText', () => {
  it('accepts any listed answer and ignores case, spaces and final punctuation', () => {
    expect(checkText(item, 'идут')).toBe('correct')
    expect(checkText(item, '  Идут. ')).toBe('correct')
    expect(checkText(item, 'идёт')).toBe('correct')
  })

  it('treats ё and е as the same letter and ignores stress marks', () => {
    expect(checkText(item, 'идет')).toBe('correct')
    expect(checkText({ ...item, answers: ['мама'] }, 'ма\u0301ма')).toBe('correct')
    expect(normaliseText('Ёлка')).toBe(normaliseText('елка'))
  })

  it('separates empty and wrong answers', () => {
    expect(checkText(item, '')).toBe('empty')
    expect(checkText(item, '   ')).toBe('empty')
    expect(checkText(item, 'идти')).toBe('wrong')
    expect(checkText(item, 'run')).toBe('wrong')
  })
})

describe('generateLanguageExercise', () => {
  const pool: LanguagePool = {
    lang: 'ru',
    promptLang: 'ru',
    instruction: 'Fill the gaps.',
    items: Array.from({ length: 10 }, (_, n) => ({ prompt: `item ${n} ___`, answers: [`a${n}`], note: 'n' })),
  }
  const pools = { topic: pool }

  it('gives six different items, the same set for the same seed', () => {
    const first = generateLanguageExercise(pools, 'topic', 'seed')
    const second = generateLanguageExercise(pools, 'topic', 'seed')
    expect(first?.items).toHaveLength(6)
    expect(new Set(first?.items.map((entry) => entry.prompt)).size).toBe(6)
    expect(second).toEqual(first)
  })

  it('gives different sets for different seeds and nothing for an unknown topic', () => {
    const sets = new Set(Array.from({ length: 8 }, (_, n) => JSON.stringify(generateLanguageExercise(pools, 'topic', `s${n}`)?.items)))
    expect(sets.size).toBeGreaterThan(1)
    expect(generateLanguageExercise(pools, 'other', 'seed')).toBeUndefined()
  })
})
