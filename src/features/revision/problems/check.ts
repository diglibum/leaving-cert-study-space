import type { ProblemPart } from './types'

export type AnswerResult = 'correct' | 'wrong' | 'empty' | 'invalid'

/** Reads the leading number of a typed answer. A comma counts as a decimal point; units after it are ignored. */
export function parseAnswer(text: string): number | null {
  const match = /^\s*([-+\u2212]?\s*(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[-+]?\d+)?)/i.exec(text)
  if (!match) return null
  const value = Number(match[1].replace(/\s+/g, '').replace('\u2212', '-').replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

/** Accepts answers within 1% of the exact value, or within the last rounding place. */
export function checkAnswer(part: ProblemPart, text: string): AnswerResult {
  if (text.trim() === '') return 'empty'
  const value = parseAnswer(text)
  if (value === null) return 'invalid'
  const tolerance = Math.max(10 ** -part.decimals, Math.abs(part.answer) * 0.01)
  return Math.abs(value - part.answer) <= tolerance + 1e-9 ? 'correct' : 'wrong'
}

export function formatAnswer(part: ProblemPart): string {
  return `${part.answer.toFixed(part.decimals)}${part.unit ? ` ${part.unit}` : ''}`
}
