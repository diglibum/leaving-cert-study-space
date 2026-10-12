import type { TopicProgress } from './progress'
import type { RevisionSetup, Weekday } from './types'

export const ACTIVE_REVISION_ID = 'active'

/** The learner's revision plan settings and progress, stored as one row. */
export interface StoredRevision {
  id: typeof ACTIVE_REVISION_ID
  setup: RevisionSetup
  /** Date the school gave for the modelling project, `YYYY-MM-DD`. */
  projectDueDate: string | null
  /** Plan blocks marked done: date to block indexes. Reset when the setup changes. */
  completed: Record<string, number[]>
  topicProgress: Record<string, TopicProgress>
  createdAt: number
  updatedAt: number
}

export function sameSetup(a: RevisionSetup, b: RevisionSetup): boolean {
  return JSON.stringify(normaliseSetup(a)) === JSON.stringify(normaliseSetup(b))
}

function normaliseSetup(setup: RevisionSetup) {
  return {
    startDate: setup.startDate,
    examDate: setup.examDate,
    subjects: setup.subjects.map(({ subjectId, level, confidence }) => ({ subjectId, level, confidence })),
    minutes: ([0, 1, 2, 3, 4, 5, 6] as const).map((day: Weekday) => setup.minutesByWeekday[day] ?? 0),
  }
}

/**
 * Combines revision data from a backup with what is already on this device
 * without losing any learning progress: the more recently saved plan settings
 * win, and for every topic the most recent review wins.
 */
export function mergeRevision(current: StoredRevision | undefined, incoming: StoredRevision): StoredRevision {
  if (!current) return incoming
  const base = incoming.updatedAt > current.updatedAt ? incoming : current
  const topicProgress: Record<string, TopicProgress> = { ...current.topicProgress }
  for (const [id, entry] of Object.entries(incoming.topicProgress)) {
    const existing = topicProgress[id]
    if (!existing || entry.lastReviewed > existing.lastReviewed) topicProgress[id] = entry
  }
  return {
    ...base,
    topicProgress,
    createdAt: Math.min(current.createdAt, incoming.createdAt),
    updatedAt: Math.max(current.updatedAt, incoming.updatedAt),
  }
}
