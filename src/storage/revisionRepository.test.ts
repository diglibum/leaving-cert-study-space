import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { RevisionSetup } from '../features/revision/types'
import { EssayTrainerDatabase } from './database'
import { createEssayRepository } from './essayRepository'
import { createRevisionRepository } from './revisionRepository'

let database: EssayTrainerDatabase
let clock: number

const setup: RevisionSetup = {
  startDate: '2026-10-12',
  examDate: '2027-06-01',
  subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
  minutesByWeekday: { 1: 45, 2: 45 },
}

const revisions = () => createRevisionRepository(database, () => ++clock)
const essays = () => createEssayRepository(database, () => ++clock)

beforeEach(() => {
  clock = 1000
  database = new EssayTrainerDatabase(`test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await database.delete()
})

describe('revision repository', () => {
  it('has nothing stored at first and refuses to update a missing plan', async () => {
    expect(await revisions().get()).toBeUndefined()
    await expect(revisions().completeBlock('2026-10-12', 0)).rejects.toThrow(/no revision plan/)
  })

  it('saves a setup and keeps topic progress when the setup changes', async () => {
    const repository = revisions()
    await repository.saveSetup(setup, null)
    await repository.completeBlock('2026-10-12', 0, { topicId: 'am-kinematics-1d', outcome: 'got-it' })
    const changed = await repository.saveSetup({ ...setup, minutesByWeekday: { 1: 60 } }, '2027-02-01')

    expect(changed.completed).toEqual({})
    expect(changed.projectDueDate).toBe('2027-02-01')
    expect(changed.topicProgress['am-kinematics-1d']).toMatchObject({ outcome: 'got-it', due: '2026-10-13' })
    expect(changed.createdAt).toBeLessThan(changed.updatedAt)
  })

  it('keeps done marks when the same setup is saved again', async () => {
    const repository = revisions()
    await repository.saveSetup(setup, null)
    await repository.completeBlock('2026-10-12', 1)
    const again = await repository.saveSetup({ ...setup, minutesByWeekday: { 2: 45, 1: 45 } }, null)
    expect(again.completed).toEqual({ '2026-10-12': [1] })
  })

  it('completes and reopens blocks without duplicates', async () => {
    const repository = revisions()
    await repository.saveSetup(setup, null)
    await repository.completeBlock('2026-10-12', 1)
    const done = await repository.completeBlock('2026-10-12', 0)
    await repository.completeBlock('2026-10-12', 0)
    expect(done.completed['2026-10-12']).toEqual([0, 1])
    expect((await repository.reopenBlock('2026-10-12', 0)).completed['2026-10-12']).toEqual([1])
    expect((await repository.reopenBlock('2026-10-12', 1)).completed).toEqual({})
  })

  it('records reviews that move topics through the review gaps', async () => {
    const repository = revisions()
    await repository.saveSetup(setup, null)
    await repository.recordReview('am-dijkstra', 'got-it', '2026-10-20')
    const second = await repository.recordReview('am-dijkstra', 'got-it', '2026-10-21')
    expect(second.topicProgress['am-dijkstra']).toMatchObject({ box: 1, due: '2026-10-24' })
    const shaky = await repository.recordReview('am-dijkstra', 'shaky', '2026-10-24')
    expect(shaky.topicProgress['am-dijkstra']).toMatchObject({ box: 0, due: '2026-10-25' })
  })
})

describe('essay repository with revision data', () => {
  it('exports revision data and merges it on import without losing progress', async () => {
    const revision = revisions()
    await revision.saveSetup(setup, null)
    await revision.recordReview('a', 'got-it', '2026-10-20')
    const exported = await essays().exportAll()
    expect(exported.revision?.topicProgress.a).toBeDefined()

    await revision.recordReview('b', 'got-it', '2026-10-22')
    await essays().importAll(exported)
    const after = await revision.get()
    expect(Object.keys(after?.topicProgress ?? {}).sort()).toEqual(['a', 'b'])
  })

  it('leaves existing revision data alone when the backup has none', async () => {
    const revision = revisions()
    await revision.saveSetup(setup, null)
    await essays().importAll({ essay: null, versions: [], archived: [], revision: null })
    expect(await revision.get()).toBeDefined()
  })

  it('imports revision data into an empty device', async () => {
    const source = revisions()
    await source.saveSetup(setup, '2027-02-01')
    const exported = await essays().exportAll()
    await database.revisionPlans.clear()
    await essays().importAll(exported)
    expect((await source.get())?.projectDueDate).toBe('2027-02-01')
  })
})
