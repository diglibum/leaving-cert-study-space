import { hasContent, normalizeContent, sameContent } from '../features/essays/content'
import {
  ACTIVE_ESSAY_ID,
  type ArchivedEssay,
  type Essay,
  type EssayContent,
  type EssayStep,
  type EssayVersion,
  type EssayVersionReason,
  type HintLevel,
} from '../features/essays/types'
import { ACTIVE_REVISION_ID, mergeRevision, type StoredRevision } from '../features/revision/stored'
import { db, type EssayTrainerDatabase } from './database'

export type EssayUpdate = Partial<EssayContent> & {
  step?: EssayStep
  hintLevel?: HintLevel
  questionId?: string | null
}

// Everything stored on this device, in the shape used by backups.
export interface StoredData {
  essay: Essay | null
  versions: EssayVersion[]
  archived: ArchivedEssay[]
  revision: StoredRevision | null
}

function normalizeEssay(essay: Essay): Essay {
  return { ...essay, ...normalizeContent(essay) }
}

function normalizeVersion(version: EssayVersion): EssayVersion {
  return { ...version, ...normalizeContent(version) }
}

function archiveKey(entry: Pick<ArchivedEssay, 'archivedAt' | 'essay'>): string {
  return `${entry.archivedAt}:${entry.essay.createdAt}:${entry.essay.questionId}`
}

export function createEssayRepository(
  database: EssayTrainerDatabase,
  now: () => number = Date.now,
) {
  async function getRequiredEssay(): Promise<Essay> {
    const essay = await database.essays.get(ACTIVE_ESSAY_ID)
    if (!essay) throw new Error('There is no active essay yet.')
    return normalizeEssay(essay)
  }

  async function listVersionsInTransaction(): Promise<EssayVersion[]> {
    const versions = await database.essayVersions
      .where('essayId')
      .equals(ACTIVE_ESSAY_ID)
      .sortBy('id')
    return versions.map(normalizeVersion).reverse()
  }

  async function addVersion(
    essay: Essay,
    reason: EssayVersionReason,
  ): Promise<EssayVersion | null> {
    const [latest] = await listVersionsInTransaction()
    // Skip snapshots that would repeat the latest one, except explicit saves.
    if (
      reason !== 'manual' &&
      latest &&
      latest.step === essay.step &&
      sameContent(latest, essay)
    ) {
      return null
    }
    const version: Omit<EssayVersion, 'id'> = {
      essayId: ACTIVE_ESSAY_ID,
      step: essay.step,
      ...normalizeContent(essay),
      reason,
      createdAt: now(),
    }
    const id = await database.essayVersions.add(version)
    return { ...version, id }
  }

  // Moves the current essay and its versions into the archive.
  async function archiveActive(): Promise<void> {
    const essay = await database.essays.get(ACTIVE_ESSAY_ID)
    if (essay && hasContent(normalizeContent(essay))) {
      await database.archivedEssays.add({
        archivedAt: now(),
        essay: normalizeEssay(essay),
        versions: await listVersionsInTransaction(),
      } as ArchivedEssay)
    }
    await database.essays.delete(ACTIVE_ESSAY_ID)
    await database.essayVersions.where('essayId').equals(ACTIVE_ESSAY_ID).delete()
  }

  return {
    async getActive(): Promise<Essay | undefined> {
      const essay = await database.essays.get(ACTIVE_ESSAY_ID)
      return essay && normalizeEssay(essay)
    },

    // Returns the existing essay instead of overwriting it.
    start(questionId: string | null = null): Promise<Essay> {
      return database.transaction('rw', database.essays, async () => {
        const existing = await database.essays.get(ACTIVE_ESSAY_ID)
        if (existing) return normalizeEssay(existing)

        const timestamp = now()
        const essay: Essay = {
          id: ACTIVE_ESSAY_ID,
          questionId,
          step: 'material',
          hintLevel: 'full',
          ...normalizeContent({}),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        await database.essays.add(essay)
        return essay
      })
    },

    update(changes: EssayUpdate): Promise<Essay> {
      return database.transaction('rw', database.essays, async () => {
        const essay = await getRequiredEssay()
        const updated: Essay = { ...essay, ...changes, updatedAt: now() }
        await database.essays.put(updated)
        return updated
      })
    },

    // Returns null when nothing changed since the latest version.
    recordVersion(reason: EssayVersionReason): Promise<EssayVersion | null> {
      return database.transaction(
        'rw',
        database.essays,
        database.essayVersions,
        async () => addVersion(await getRequiredEssay(), reason),
      )
    },

    listVersions(): Promise<EssayVersion[]> {
      return database.transaction('r', database.essayVersions, listVersionsInTransaction)
    },

    // Keeps the current text as a version first, so a restore can be undone.
    restoreVersion(versionId: number): Promise<Essay> {
      return database.transaction(
        'rw',
        database.essays,
        database.essayVersions,
        async () => {
          const version = await database.essayVersions.get(versionId)
          if (!version) throw new Error('That version no longer exists.')
          const essay = await getRequiredEssay()
          await addVersion(essay, 'restore-point')
          const restored: Essay = {
            ...essay,
            ...normalizeContent(version),
            step: version.step,
            updatedAt: now(),
          }
          await database.essays.put(restored)
          return restored
        },
      )
    },

    // The old essay is archived, never deleted.
    startNew(): Promise<void> {
      return database.transaction(
        'rw',
        database.essays,
        database.essayVersions,
        database.archivedEssays,
        archiveActive,
      )
    },

    async listArchived(): Promise<ArchivedEssay[]> {
      const archived = await database.archivedEssays.orderBy('archivedAt').toArray()
      return archived.reverse()
    },

    exportAll(): Promise<StoredData> {
      return database.transaction(
        'r',
        database.essays,
        database.essayVersions,
        database.archivedEssays,
        database.revisionPlans,
        async () => {
          const essay = await database.essays.get(ACTIVE_ESSAY_ID)
          return {
            essay: essay ? normalizeEssay(essay) : null,
            versions: (await listVersionsInTransaction()).reverse(),
            archived: await database.archivedEssays.orderBy('archivedAt').toArray(),
            revision: (await database.revisionPlans.get(ACTIVE_REVISION_ID)) ?? null,
          }
        },
      )
    },

    // Replaces the active essay with the backup. Different current work is
    // archived first, and archived essays are merged without duplicates.
    // Revision data is merged, never replaced, so no progress is lost.
    importAll(data: StoredData): Promise<void> {
      return database.transaction(
        'rw',
        database.essays,
        database.essayVersions,
        database.archivedEssays,
        database.revisionPlans,
        async () => {
          const current = await database.essays.get(ACTIVE_ESSAY_ID)
          const unchanged =
            current && data.essay && sameContent(current, data.essay)
          if (!unchanged) await archiveActive()
          else {
            await database.essays.delete(ACTIVE_ESSAY_ID)
            await database.essayVersions.where('essayId').equals(ACTIVE_ESSAY_ID).delete()
          }

          if (data.essay) {
            await database.essays.put(data.essay)
            for (const { id: _id, ...version } of data.versions) {
              await database.essayVersions.add(version as EssayVersion)
            }
          }

          const known = new Set(
            (await database.archivedEssays.toArray()).map(archiveKey),
          )
          for (const { id: _id, ...entry } of data.archived) {
            if (known.has(archiveKey(entry))) continue
            await database.archivedEssays.add(entry as ArchivedEssay)
          }

          if (data.revision) {
            const currentRevision = await database.revisionPlans.get(ACTIVE_REVISION_ID)
            await database.revisionPlans.put(mergeRevision(currentRevision, data.revision))
          }
        },
      )
    },
  }
}

export type EssayRepository = ReturnType<typeof createEssayRepository>

export const essayRepository = createEssayRepository(db)
