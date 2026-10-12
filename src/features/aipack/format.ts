/** JSON with one array element or object entry per line down to `depth` levels, and compact below that. */
export function stringifyCompact(value: unknown, depth = 2, level = 0): string {
  if (level >= depth || value === null || typeof value !== 'object') return JSON.stringify(value)
  const pad = '  '.repeat(level + 1)
  const end = '  '.repeat(level)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[\n${value.map((item) => pad + stringifyCompact(item, depth, level + 1)).join(',\n')}\n${end}]`
  }
  const entries = Object.entries(value)
  if (entries.length === 0) return '{}'
  return `{\n${entries.map(([key, item]) => `${pad}${JSON.stringify(key)}: ${stringifyCompact(item, depth, level + 1)}`).join(',\n')}\n${end}}`
}
