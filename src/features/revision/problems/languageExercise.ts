import { createRng, shuffled } from './rng'
import type { LanguageExercise, LanguagePool } from './types'

export const EXERCISE_SIZE = 6

/** A deterministic sample without repeats: the same seed always gives the same set. */
export function generateLanguageExercise(
  pools: Readonly<Record<string, LanguagePool>>,
  topicId: string,
  seed: string,
  size = EXERCISE_SIZE,
): LanguageExercise | undefined {
  const pool = pools[topicId]
  if (!pool) return undefined
  const rng = createRng(`${topicId}:${seed}`)
  const items = shuffled(rng, pool.items)
  return {
    kind: 'items',
    topicId,
    lang: pool.lang,
    promptLang: pool.promptLang,
    instruction: pool.instruction,
    items: items.slice(0, Math.min(size, items.length)),
  }
}
