import { addDays, daysBetween, formatIsoDate, parseIsoDate, startOfWeek, weekdayOf } from './dates'
import type {
  BlockKind,
  Confidence,
  PlanBlock,
  PlanDay,
  RevisionPhase,
  RevisionPlan,
  RevisionSetup,
  RevisionSubject,
  RevisionTopic,
  Weekday,
} from './types'

/** Length of the final exam-mode phase, in days. */
export const EXAM_PHASE_DAYS = 42
/** Longest practise phase, in days. Shorter plans give it half of the time before exam mode. */
export const PRACTISE_PHASE_DAYS = 70
/** Days before the exam that are light revision only. */
export const LIGHT_DAYS = 2
export const MIN_STUDY_MINUTES = 15
export const MAX_DAY_MINUTES = 480

const MIN_BLOCK_MINUTES = 25
const MAX_BLOCKS_PER_DAY = 4

export const confidenceWeights: Record<Confidence, number> = {
  weak: 1.5,
  okay: 1,
  strong: 0.7,
}

const examBlockCycle: readonly BlockKind[] = ['choose-questions', 'timed-questions', 'review-mistakes']

export function validateRevisionSetup(setup: RevisionSetup, catalog: readonly RevisionSubject[]): string[] {
  const errors: string[] = []
  const start = parseIsoDate(setup.startDate)
  const exam = parseIsoDate(setup.examDate)
  if (start === null) errors.push('Choose a valid start date.')
  if (exam === null) errors.push('Choose a valid exam date.')
  if (start !== null && exam !== null && start >= exam) errors.push('The start date must be before the exam date.')

  if (setup.subjects.length === 0) errors.push('Choose at least one subject.')
  const seen = new Set<string>()
  for (const subject of setup.subjects) {
    if (!catalog.some((entry) => entry.id === subject.subjectId)) errors.push(`Unknown subject: ${subject.subjectId}.`)
    if (seen.has(subject.subjectId)) errors.push(`Subject chosen twice: ${subject.subjectId}.`)
    seen.add(subject.subjectId)
  }

  const minutes = Object.values(setup.minutesByWeekday)
  if (minutes.some((value) => !Number.isFinite(value) || value < 0 || value > MAX_DAY_MINUTES)) {
    errors.push(`Minutes per day must be between 0 and ${MAX_DAY_MINUTES}.`)
  } else if (!minutes.some((value) => value >= MIN_STUDY_MINUTES)) {
    errors.push(`Choose at least one study day with ${MIN_STUDY_MINUTES} minutes or more.`)
  }
  return errors
}

/**
 * Splits `total` into whole numbers proportional to `weights` (largest
 * remainder method). Each item gets at least `minEach` when the total allows it.
 */
export function apportion(total: number, weights: readonly number[], minEach = 0): number[] {
  const counts = weights.map(() => 0)
  if (weights.length === 0 || total <= 0) return counts
  const floor = minEach * weights.length <= total ? minEach : 0
  counts.fill(floor)
  const rest = total - floor * weights.length
  const sum = weights.reduce((acc, weight) => acc + weight, 0)
  const exact = weights.map((weight) => (rest * weight) / sum)
  let left = rest
  exact.forEach((value, index) => {
    counts[index] += Math.floor(value)
    left -= Math.floor(value)
  })
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
  for (let i = 0; i < left; i += 1) counts[byRemainder[i].index] += 1
  return counts
}

function splitDay(minutes: number): number[] {
  if (minutes < MIN_STUDY_MINUTES) return []
  const count = Math.min(MAX_BLOCKS_PER_DAY, Math.max(1, Math.floor(minutes / MIN_BLOCK_MINUTES)))
  return Array<number>(count).fill(Math.round(minutes / count / 5) * 5)
}

/** Picks a subject for every slot of one week, keeping each subject's share and avoiding back-to-back repeats. */
function chooseSubjects(slotCount: number, weights: readonly number[], previous: number | null): number[] {
  const subjectCount = weights.length
  const minEach = slotCount >= subjectCount * 2 ? 2 : 1
  const remaining = apportion(slotCount, weights, minEach)
  const chosen: number[] = []
  let last = previous
  for (let slot = 0; slot < slotCount; slot += 1) {
    const open = remaining.flatMap((count, i) => (count > 0 ? [i] : []))
    const candidates = open.filter((i) => i !== last)
    const pool = candidates.length > 0 ? candidates : open
    const best = pool.reduce((top, i) => (remaining[i] > remaining[top] ? i : top))
    remaining[best] -= 1
    chosen.push(best)
    last = best
  }
  return chosen
}

function phaseFor(time: number, bounds: { exam: number; examStart: number; practiseStart: number }): RevisionPhase {
  if (time >= addDays(bounds.exam, -LIGHT_DAYS)) return 'light'
  if (time >= bounds.examStart) return 'exam'
  if (time >= bounds.practiseStart) return 'practise'
  return 'build'
}

function topicsFor(subject: RevisionSubject, level: 'higher' | 'ordinary'): RevisionTopic[] {
  return subject.topics.filter((topic) => level === 'higher' || !topic.higherOnly)
}

export function buildRevisionPlan(setup: RevisionSetup, catalog: readonly RevisionSubject[]): RevisionPlan {
  const errors = validateRevisionSetup(setup, catalog)
  if (errors.length > 0) throw new RangeError(errors.join(' '))

  const start = parseIsoDate(setup.startDate) as number
  const exam = parseIsoDate(setup.examDate) as number
  const examStart = Math.max(start, addDays(exam, -EXAM_PHASE_DAYS))
  const practiseLength = Math.min(PRACTISE_PHASE_DAYS, Math.floor(daysBetween(start, examStart) / 2))
  const bounds = { exam, examStart, practiseStart: addDays(examStart, -practiseLength) }

  const subjects = setup.subjects.map((entry) => ({
    setup: entry,
    subject: catalog.find((candidate) => candidate.id === entry.subjectId) as RevisionSubject,
  }))
  const weights = subjects.map((entry) => confidenceWeights[entry.setup.confidence])

  const days: PlanDay[] = []
  for (let time = start; time < exam; time = addDays(time, 1)) {
    days.push({ date: formatIsoDate(time), phase: phaseFor(time, bounds), blocks: [] })
  }

  // Slots are the study blocks of each day; subjects are assigned week by week (Monday to Sunday).
  const slotsByDay = days.map((day, index) => {
    const time = addDays(start, index)
    return { day, minutes: splitDay(setup.minutesByWeekday[weekdayOf(time) as Weekday] ?? 0), week: startOfWeek(time) }
  })
  const weeks = new Map<number, typeof slotsByDay>()
  for (const entry of slotsByDay) weeks.set(entry.week, [...(weeks.get(entry.week) ?? []), entry])

  let previous: number | null = null
  const subjectBlocks: PlanBlock[][] = subjects.map(() => [])
  for (const week of weeks.values()) {
    const slotCount = week.reduce((total, entry) => total + entry.minutes.length, 0)
    const chosen = chooseSubjects(slotCount, weights, previous)
    let cursor = 0
    for (const entry of week) {
      for (const minutes of entry.minutes) {
        const index = chosen[cursor]
        cursor += 1
        const block: PlanBlock = { subjectId: subjects[index].subject.id, minutes, kind: 'light-review' }
        entry.day.blocks.push(block)
        subjectBlocks[index].push(block)
      }
    }
    previous = chosen.length > 0 ? chosen[chosen.length - 1] : previous
  }

  // Second pass: give every block a kind (and topic) in the order the learner will meet them.
  const dayOf = new Map<PlanBlock, PlanDay>()
  for (const day of days) for (const block of day.blocks) dayOf.set(block, day)

  subjects.forEach((entry, index) => {
    const topics = topicsFor(entry.subject, entry.setup.level)
    const blocks = subjectBlocks[index]
    const buildBlocks = blocks.filter((block) => dayOf.get(block)?.phase === 'build')
    const buildTopicIds = apportion(buildBlocks.length, topics.map((topic) => topic.size), 1).flatMap((count, topicIndex) =>
      Array<string>(count).fill(topics[topicIndex].id),
    )
    let build = 0
    let practise = 0
    let exams = 0
    for (const block of blocks) {
      const phase = dayOf.get(block)?.phase
      if (phase === 'build') {
        block.kind = 'learn-topic'
        block.topicId = buildTopicIds[build]
        build += 1
      } else if (phase === 'practise') {
        block.kind = 'practise-topic'
        if (topics.length > 0) block.topicId = topics[practise % topics.length].id
        practise += 1
      } else if (phase === 'exam') {
        block.kind = examBlockCycle[exams % examBlockCycle.length]
        exams += 1
      }
    }
  })

  const phaseStarts: RevisionPlan['phaseStarts'] = {}
  for (const day of days) phaseStarts[day.phase] ??= day.date
  const levels = Object.fromEntries(setup.subjects.map((entry) => [entry.subjectId, entry.level]))
  return { days, phaseStarts, levels }
}
