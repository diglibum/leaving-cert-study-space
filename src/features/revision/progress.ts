import { addDays, formatIsoDate, parseIsoDate } from './dates'

/** Days to wait after a review, by how many times in a row the topic was recalled. */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 21, 45] as const

export type ReviewOutcome = 'got-it' | 'shaky'

export interface TopicProgress {
  outcome: ReviewOutcome
  /** Index into `REVIEW_INTERVAL_DAYS`; "shaky" always goes back to 0. */
  box: number
  lastReviewed: string
  due: string
}

export function reviewTopic(
  previous: TopicProgress | undefined,
  outcome: ReviewOutcome,
  today: string,
): TopicProgress {
  const todayTime = parseIsoDate(today)
  if (todayTime === null) throw new RangeError('Today must be a valid date.')
  const box =
    outcome === 'shaky' || !previous ? 0 : Math.min(previous.box + 1, REVIEW_INTERVAL_DAYS.length - 1)
  return {
    outcome,
    box,
    lastReviewed: today,
    due: formatIsoDate(addDays(todayTime, REVIEW_INTERVAL_DAYS[box])),
  }
}

/** Topic ids due on or before `today`: most overdue first, then shaky before steady. */
export function dueTopicIds(progress: Readonly<Record<string, TopicProgress>>, today: string): string[] {
  return Object.entries(progress)
    .filter(([, entry]) => entry.due <= today)
    .sort(
      ([idA, a], [idB, b]) =>
        a.due.localeCompare(b.due) || a.box - b.box || idA.localeCompare(idB),
    )
    .map(([id]) => id)
}

export interface ProgressSummary {
  total: number
  reviewed: number
  shaky: number
  due: number
}

export function summariseProgress(
  topicIds: readonly string[],
  progress: Readonly<Record<string, TopicProgress>>,
  today: string,
): ProgressSummary {
  const entries = topicIds.flatMap((id) => (progress[id] ? [progress[id]] : []))
  return {
    total: topicIds.length,
    reviewed: entries.length,
    shaky: entries.filter((entry) => entry.outcome === 'shaky').length,
    due: entries.filter((entry) => entry.due <= today).length,
  }
}
