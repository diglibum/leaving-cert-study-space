import { describe, expect, it } from 'vitest'
import { stringifyCompact } from './format'
import { buildRussianPack, renderPack, russianPackFiles } from './russianPack'

const committed = import.meta.glob('/ai-pack/leaving-cert-tutor/data/*.json', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>
const skill = import.meta.glob('/ai-pack/leaving-cert-tutor/SKILL.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const built = buildRussianPack() as Record<string, any>

describe('Russian AI pack', () => {
  it('matches the committed files (run npm run build:ai-pack after changing Russian data)', () => {
    const rendered = renderPack(built)
    for (const [name, text] of Object.entries(rendered)) {
      expect(committed[`/ai-pack/leaving-cert-tutor/data/${name}`], name).toBe(text)
    }
    expect(Object.keys(committed)).toHaveLength(Object.keys(rendered).length)
  })

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

  it('keeps every file small enough to upload to a chat tool', () => {
    for (const [name, text] of Object.entries(renderPack(built))) expect(text.length, name).toBeLessThan(100_000)
  })

  it('has a skill file that names every data file', () => {
    const text = Object.values(skill)[0]
    expect(text).toMatch(/^---\nname: leaving-cert-tutor\n/)
    for (const name of Object.values(russianPackFiles)) expect(text, name).toContain(name)
  })

  it('formats one array element per line', () => {
    expect(stringifyCompact({ a: [{ b: 1 }, { b: 2 }] }, 2)).toBe('{\n  "a": [\n    {"b":1},\n    {"b":2}\n  ]\n}')
  })
})
