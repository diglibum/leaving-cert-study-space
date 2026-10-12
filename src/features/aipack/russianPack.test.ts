import { describe, expect, it } from 'vitest'
import { stringifyCompact } from './format'
import { buildRussianPack, russianPackFiles } from './russianPack'

const built = buildRussianPack() as Record<string, any>

describe('Russian AI pack', () => {
  it('gives every drill item an answer and a note', () => {
    const pools = built[russianPackFiles.drills].pools
    expect(Object.keys(pools).length).toBeGreaterThan(10)
    for (const [id, pool] of Object.entries<any>(pools)) {
      expect(pool.items.length, id).toBeGreaterThan(0)
      for (const item of pool.items) {
        expect(item.answers.length, `${id}: ${item.prompt}`).toBeGreaterThan(0)
        expect(item.note, `${id}: ${item.prompt}`).not.toBe('')
      }
    }
  })

  it('numbers every cloze gap and keeps the answers', () => {
    const texts = built[russianPackFiles.cloze].texts
    expect(texts.length).toBeGreaterThan(5)
    for (const text of texts) {
      const marks = text.paragraphs.join(' ').match(/\(\d+\) ___ \[/g) ?? []
      expect(marks.length, text.id).toBe(text.gaps.length)
      text.gaps.forEach((gap: any, index: number) => {
        expect(gap.gap).toBe(index + 1)
        expect(gap.answers.length).toBeGreaterThan(0)
      })
    }
  })

  it('points every topic practice file at a file that exists', () => {
    const names = Object.values(russianPackFiles)
    for (const topic of built[russianPackFiles.topics].topics) {
      for (const file of topic.practiceFiles) expect(names).toContain(file)
    }
  })

  it('formats one array element per line', () => {
    expect(stringifyCompact({ a: [{ b: 1 }, { b: 2 }] }, 2)).toBe('{\n  "a": [\n    {"b":1},\n    {"b":2}\n  ]\n}')
  })
})
