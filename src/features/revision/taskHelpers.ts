/** Splits minutes in proportion to the weights; the last step takes the rounding remainder. */
export function splitMinutes(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  const parts = weights.map((weight) => Math.round((total * weight) / sum))
  parts[parts.length - 1] += total - parts.reduce((a, b) => a + b, 0)
  return parts
}

/** Takes `count` items starting at `offset`, wrapping around, without repeating an item. */
export function rotate<T>(items: readonly T[], offset: number, count: number): T[] {
  if (items.length === 0) return []
  const size = Math.min(count, items.length)
  const start = offset % items.length
  return Array.from({ length: size }, (_, step) => items[(start + step) % items.length])
}
