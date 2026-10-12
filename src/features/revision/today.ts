import { blockTitle } from './labels'
import { dueTopicIds } from './progress'
import type { StoredRevision } from './stored'
import type { RevisionPlan, RevisionSubject } from './types'

export interface TodayBlock {
  index: number
  title: string
  subjectName: string
  minutes: number
  done: boolean
}

export interface TodaySummary {
  /** Date of the shown study day: today, or the next study day when today has no blocks. */
  date: string | null
  isToday: boolean
  blocks: TodayBlock[]
  doneCount: number
  totalMinutes: number
  dueCount: number
  finished: boolean
}

/** What the home page shows: today's blocks, or the next study day on a rest day. */
export function summariseToday(
  stored: StoredRevision,
  plan: RevisionPlan,
  catalog: readonly RevisionSubject[],
  today: string,
): TodaySummary {
  const last = plan.days[plan.days.length - 1]?.date
  const todayPlan = plan.days.find((day) => day.date === today)
  const day =
    todayPlan && todayPlan.blocks.length > 0 ? todayPlan : plan.days.find((entry) => entry.date > today && entry.blocks.length > 0)
  const doneIndexes = day ? (stored.completed[day.date] ?? []) : []
  const blocks = (day?.blocks ?? []).map((block, index) => {
    const subject = catalog.find((entry) => entry.id === block.subjectId)
    return {
      index,
      title: blockTitle(block, subject),
      subjectName: subject?.name ?? block.subjectId,
      minutes: block.minutes,
      done: doneIndexes.includes(index),
    }
  })
  return {
    date: day?.date ?? null,
    isToday: day?.date === today,
    blocks,
    doneCount: blocks.filter((block) => block.done).length,
    totalMinutes: blocks.reduce((sum, block) => sum + block.minutes, 0),
    dueCount: dueTopicIds(stored.topicProgress, today).length,
    finished: last !== undefined && today > last,
  }
}
