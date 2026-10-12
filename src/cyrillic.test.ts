import { describe, expect, it } from 'vitest'

/*
 * The app is English only, with one exception: Russian exercises have to be
 * written in Russian (see AGENTS.md). Cyrillic may appear only in these files.
 */
const allowed = [
  '/src/features/revision/subjects/russianExercises.ts',
  '/src/features/revision/subjects/russianExercises.test.ts',
  '/src/features/revision/subjects/russianCloze.ts',
  '/src/features/revision/subjects/russianCulture.ts',
  '/src/features/revision/subjects/russianLists.ts',
  '/src/features/revision/subjects/russianMatching.ts',
  '/src/features/revision/subjects/russianOral.ts',
  '/src/features/revision/problems/checkText.test.ts',
]

describe('Cyrillic exception', () => {
  it('keeps Cyrillic out of every source file except the Russian exercise data files', () => {
    const files = import.meta.glob('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
    const paths = Object.keys(files)
    expect(paths.length).toBeGreaterThan(50)
    const offenders = paths.filter((path) => /[\u0400-\u04FF]/.test(files[path]) && !allowed.includes(path))
    expect(offenders).toEqual([])
    for (const path of allowed) expect(files[path], path).toBeDefined()
  })
})
