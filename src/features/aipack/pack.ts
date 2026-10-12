import { buildAppliedMathsPack } from './appliedMathsPack'
import { stringifyCompact } from './format'
import { buildRussianPack } from './russianPack'

/** Every data file of the AI pack, by file name. */
export function buildPack(): Record<string, unknown> {
  return { ...buildAppliedMathsPack(), ...buildRussianPack() }
}

export function renderPack(files: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(files).map(([name, data]) => [name, `${stringifyCompact(data, 4)}\n`]))
}
