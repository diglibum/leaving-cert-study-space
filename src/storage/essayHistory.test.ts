import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EssayTrainerDatabase } from './database'
import { createEssayRepository } from './essayRepository'

let database: EssayTrainerDatabase
let clock: number

function createRepository(db = database) {
  return createEssayRepository(db, () => ++clock)
}

beforeEach(() => {
  clock = 1000
  database = new EssayTrainerDatabase(`test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await database.delete()
})

describe('versions', () => {
  it('does not record a repeated snapshot unless the learner asks for it', async () => {
    const repository = createRepository()
    await repository.start('2026-q7')
    await repository.update({ draft: 'Hello' })

    expect(await repository.recordVersion('step-change')).not.toBeNull()
    expect(await repository.recordVersion('step-change')).toBeNull()
    expect(await repository.recordVersion('manual')).not.toBeNull()
    expect(await repository.listVersions()).toHaveLength(2)
  })

  it('restores an older version and keeps the current text as a restore point', async () => {
    const repository = createRepository()
    await repository.start('2026-q7')
    await repository.update({ draft: 'Old text', step: 'draft' })
    const old = await repository.recordVersion('manual')
    await repository.update({ draft: 'New text', step: 'self-check' })

    const restored = await repository.restoreVersion(old?.id ?? -1)

    expect(restored).toMatchObject({ draft: 'Old text', step: 'draft' })
    const versions = await repository.listVersions()
    expect(versions[0]).toMatchObject({ reason: 'restore-point', draft: 'New text' })
  })

  it('refuses to restore a missing version', async () => {
    const repository = createRepository()
    await repository.start()
    await expect(repository.restoreVersion(999)).rejects.toThrow(/no longer exists/)
  })
})

describe('starting a new essay', () => {
  it('archives the old essay with its versions and clears the active one', async () => {
    const repository = createRepository()
    await repository.start('2026-q7')
    await repository.update({ draft: 'My story' })
    await repository.recordVersion('manual')

    await repository.startNew()

    expect(await repository.getActive()).toBeUndefined()
    expect(await repository.listVersions()).toEqual([])
    const [archived] = await repository.listArchived()
    expect(archived.essay.draft).toBe('My story')
    expect(archived.versions).toHaveLength(1)
  })

  it('does not archive an essay with no writing', async () => {
    const repository = createRepository()
    await repository.start('2026-q7')

    await repository.startNew()

    expect(await repository.getActive()).toBeUndefined()
    expect(await repository.listArchived()).toEqual([])
  })
})

describe('export and import', () => {
  it('round-trips everything into another database', async () => {
    const repository = createRepository()
    await repository.start('2025-q4')
    await repository.update({ draft: 'Archived one' })
    await repository.startNew()
    await repository.start('2026-q7')
    await repository.update({ draft: 'Current', step: 'draft' })
    await repository.recordVersion('manual')
    const data = await repository.exportAll()

    const other = new EssayTrainerDatabase(`test-${crypto.randomUUID()}`)
    try {
      const target = createRepository(other)
      await target.importAll(data)

      expect(await target.getActive()).toMatchObject({ draft: 'Current', questionId: '2026-q7' })
      expect(await target.listVersions()).toHaveLength(1)
      expect((await target.listArchived()).map((entry) => entry.essay.draft)).toEqual([
        'Archived one',
      ])
    } finally {
      await other.delete()
    }
  })

  it('archives different current work when restoring, and merges without duplicates', async () => {
    const repository = createRepository()
    await repository.start('2026-q7')
    await repository.update({ draft: 'From the backup' })
    const backup = await repository.exportAll()

    await repository.update({ draft: 'Newer work' })
    await repository.importAll(backup)
    await repository.importAll(backup)

    expect(await repository.getActive()).toMatchObject({ draft: 'From the backup' })
    const archived = await repository.listArchived()
    expect(archived).toHaveLength(1)
    expect(archived[0].essay.draft).toBe('Newer work')
  })

  it('upgrades essays saved before the checklist existed', async () => {
    await database.essays.put({
      id: 'active',
      questionId: null,
      step: 'draft',
      hintLevel: 'full',
      material: 'Old',
      direction: '',
      plan: '',
      draft: '',
      createdAt: 1,
      updatedAt: 1,
    } as never)

    const essay = await createRepository().getActive()

    expect(essay?.selfCheck).toBe('')
    expect(essay?.paragraphTags).toEqual({})
    expect(essay?.checklist['purpose-question']).toEqual({ rating: null, note: '' })
  })
})
