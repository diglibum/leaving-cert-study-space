import type { LanguageItem } from './types'
import type { AnswerResult } from './check'

/**
 * Compares typed text loosely: case, surrounding spaces, final punctuation,
 * stress marks and the difference between "\u0451" and "\u0435" do not count.
 */
export function normaliseText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\u0301/g, '')
    .toLowerCase()
    .replace(/\u0451/g, '\u0435')
    .replace(/\s+/g, ' ')
    .replace(/[\s.,;:!?\u2026]+$/, '')
    .trim()
}

export function checkText(item: LanguageItem, typed: string): AnswerResult {
  const text = normaliseText(typed)
  if (text === '') return 'empty'
  return item.answers.some((answer) => normaliseText(answer) === text) ? 'correct' : 'wrong'
}
