import { reviewTopic, type ReviewOutcome } from '../features/revision/progress'
import { ACTIVE_REVISION_ID, sameSetup, type StoredRevision } from '../features/revision/stored'
import type { RevisionSetup } from '../features/revision/types'
import { db, type EssayTrainerDatabase } from './database'

export function createRevisionRepository(database: EssayTrainerDatabase, now: () => number = Date.now) {
  async function getRequired(): Promise<StoredRevision> {
    const stored = await database.revisionPlans.get(ACTIVE_REVISION_ID)
    if (!stored) throw new Error('There is no revision plan yet.')
    return stored
  }

  return {
    get(): Promise<StoredRevision | undefined> {
      return database.revisionPlans.get(ACTIVE_REVISION_ID)
    },

    // Topic progress is kept. Done marks belong to one plan, so they are cleared when the plan changes.
    saveSetup(setup: RevisionSetup, projectDueDate: string | null): Promise<StoredRevision> {
      return database.transaction('rw', database.revisionPlans, async () => {
        const existing = await database.revisionPlans.get(ACTIVE_REVISION_ID)
        const timestamp = now()
        const saved: StoredRevision = {
          id: ACTIVE_REVISION_ID,
          setup,
          projectDueDate,
          completed: existing && sameSetup(existing.setup, setup) ? existing.completed : {},
          topicProgress: existing?.topicProgress ?? {},
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
        }
        await database.revisionPlans.put(saved)
        return saved
      })
    },

    // Marks a block done. When it has a topic, the outcome also schedules that topic's next review.
    completeBlock(
      date: string,
      blockIndex: number,
      review?: { topicId: string; outcome: ReviewOutcome },
    ): Promise<StoredRevision> {
      return database.transaction('rw', database.revisionPlans, async () => {
        const stored = await getRequired()
        const done = new Set(stored.completed[date] ?? [])
        done.add(blockIndex)
        const updated: StoredRevision = {
          ...stored,
          completed: { ...stored.completed, [date]: [...done].sort((a, b) => a - b) },
          topicProgress: review
            ? {
                ...stored.topicProgress,
                [review.topicId]: reviewTopic(stored.topicProgress[review.topicId], review.outcome, date),
              }
            : stored.topicProgress,
          updatedAt: now(),
        }
        await database.revisionPlans.put(updated)
        return updated
      })
    },

    // Only clears the done mark; any review already recorded stays.
    reopenBlock(date: string, blockIndex: number): Promise<StoredRevision> {
      return database.transaction('rw', database.revisionPlans, async () => {
        const stored = await getRequired()
        const remaining = (stored.completed[date] ?? []).filter((index) => index !== blockIndex)
        const completed = { ...stored.completed }
        if (remaining.length > 0) completed[date] = remaining
        else delete completed[date]
        const updated: StoredRevision = { ...stored, completed, updatedAt: now() }
        await database.revisionPlans.put(updated)
        return updated
      })
    },

    // A review outside the plan, such as a topic that is due for recall.
    recordReview(topicId: string, outcome: ReviewOutcome, today: string): Promise<StoredRevision> {
      return database.transaction('rw', database.revisionPlans, async () => {
        const stored = await getRequired()
        const updated: StoredRevision = {
          ...stored,
          topicProgress: {
            ...stored.topicProgress,
            [topicId]: reviewTopic(stored.topicProgress[topicId], outcome, today),
          },
          updatedAt: now(),
        }
        await database.revisionPlans.put(updated)
        return updated
      })
    },
  }
}

export type RevisionRepository = ReturnType<typeof createRevisionRepository>

export const revisionRepository = createRevisionRepository(db)
