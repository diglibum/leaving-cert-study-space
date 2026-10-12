import Dexie, { type EntityTable } from 'dexie'
import type { ArchivedEssay, Essay, EssayVersion } from '../features/essays/types'
import type { StoredRevision } from '../features/revision/stored'

export const DATABASE_NAME = 'personal-essay-trainer'

export class EssayTrainerDatabase extends Dexie {
  declare essays: EntityTable<Essay, 'id'>
  declare essayVersions: EntityTable<EssayVersion, 'id'>
  declare archivedEssays: EntityTable<ArchivedEssay, 'id'>
  declare revisionPlans: EntityTable<StoredRevision, 'id'>

  constructor(name: string = DATABASE_NAME) {
    super(name)

    // Never edit a released version: add `this.version(n + 1)` with the new
    // schema and an `upgrade` callback so existing local data is migrated.
    this.version(1).stores({
      essays: 'id',
      essayVersions: '++id, essayId, createdAt',
    })

    // Essays that were replaced or finished are kept here with their versions.
    this.version(2).stores({
      essays: 'id',
      essayVersions: '++id, essayId, createdAt',
      archivedEssays: '++id, archivedAt',
    })

    // One row with the revision plan settings and progress; existing data is untouched.
    this.version(3).stores({
      essays: 'id',
      essayVersions: '++id, essayId, createdAt',
      archivedEssays: '++id, archivedAt',
      revisionPlans: 'id',
    })
  }
}

export const db = new EssayTrainerDatabase()
