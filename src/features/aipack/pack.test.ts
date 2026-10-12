import { describe, expect, it } from 'vitest'
import { buildPack, renderPack } from './pack'

const committed = import.meta.glob('/ai-pack/leaving-cert-tutor/data/*.json', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>
const skill = import.meta.glob('/ai-pack/leaving-cert-tutor/SKILL.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const rendered = renderPack(buildPack())

describe('AI pack', () => {
  it('matches the committed files (run npm run build:ai-pack after changing exercise data)', () => {
    for (const [name, text] of Object.entries(rendered)) {
      expect(committed[`/ai-pack/leaving-cert-tutor/data/${name}`], name).toBe(text)
    }
    expect(Object.keys(committed)).toHaveLength(Object.keys(rendered).length)
  })

  it('keeps every file small enough to upload to a chat tool', () => {
    for (const [name, text] of Object.entries(rendered)) expect(text.length, name).toBeLessThan(100_000)
  })

  it('has a skill file that names every data file', () => {
    const text = Object.values(skill)[0]
    expect(text).toMatch(/^---\nname: leaving-cert-tutor\n/)
    for (const name of Object.keys(rendered)) {
      // Problem files are found through the topics file, so the skill only needs the topics file and shared files.
      if (name.startsWith('applied-maths-problems-')) continue
      expect(text, name).toContain(name)
    }
    expect(text).toContain('problemFile')
  })
})
