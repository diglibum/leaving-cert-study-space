import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EssayTrainerDatabase } from './database'
import { createEssayRepository } from './essayRepository'

let database: EssayTrainerDatabase
let clock: number

function createRepository() {
  return createEssayRepository(database, () => ++clock)
}

beforeEach(() => {
  clock = 1000
  database = new EssayTrainerDatabase(`test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await database.delete()
})

describe('essay repository', () => {
  it('has no essay before one is started', async () => {
    expect(await createRepository().getActive()).toBeUndefined()
  })

  it('starts a blank essay at the first step', async () => {
    const essay = await createRepository().start('question-1')

    expect(essay).toMatchObject({
      id: 'active',
      questionId: 'question-1',
      step: 'material',
      hintLevel: 'full',
      material: '',
      direction: '',
      plan: '',
      draft: '',
      selfCheck: '',
    })
    expect(await createRepository().getActive()).toEqual(essay)
  })

  it('never overwrites an existing essay when started again', async () => {
    const repository = createRepository()
    await repository.start('question-1')
    await repository.update({ draft: 'My first sentence.' })

    const again = await repository.start('question-2')

    expect(again.questionId).toBe('question-1')
    expect(again.draft).toBe('My first sentence.')
  })

  it('persists updates across repository instances', async () => {
    const repository = createRepository()
    const started = await repository.start()

    const updated = await repository.update({
      step: 'draft',
      material: 'Summer at my grandmother’s house',
    })

    expect(updated.step).toBe('draft')
    expect(updated.updatedAt).toBeGreaterThan(started.updatedAt)
    expect(updated.createdAt).toBe(started.createdAt)
    expect(await createRepository().getActive()).toEqual(updated)
  })

  it('stores the help level and self-check notes', async () => {
    const repository = createRepository()
    await repository.start()

    await repository.update({ hintLevel: 'none', selfCheck: 'I liked my opening.' })

    expect(await repository.getActive()).toMatchObject({
      hintLevel: 'none',
      selfCheck: 'I liked my opening.',
    })
  })

  it('rejects updates when there is no essay', async () => {
    await expect(createRepository().update({ draft: 'Text' })).rejects.toThrow(
      'no active essay',
    )
  })

  it('records versions as independent snapshots, newest first', async () => {
    const repository = createRepository()
    await repository.start()
    await repository.update({ draft: 'First draft' })
    const first = await repository.recordVersion('manual')
    await repository.update({ draft: 'Second draft', step: 'self-check' })
    const second = await repository.recordVersion('step-change')

    const versions = await repository.listVersions()

    expect(versions.map((version) => version.id)).toEqual([second?.id, first?.id])
    expect(versions[1]).toMatchObject({
      draft: 'First draft',
      step: 'material',
      reason: 'manual',
    })
    expect(versions[0]).toMatchObject({
      draft: 'Second draft',
      step: 'self-check',
      reason: 'step-change',
    })
    expect(await repository.listVersions()).toHaveLength(2)
  })

  it('refuses to record a version without an essay', async () => {
    await expect(createRepository().recordVersion('autosave')).rejects.toThrow(
      'no active essay',
    )
    expect(await createRepository().listVersions()).toEqual([])
  })
})
