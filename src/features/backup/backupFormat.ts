import { normalizeContent } from '../essays/content'
import { toPlainText } from '../essays/richText'
import {
  ACTIVE_ESSAY_ID,
  essaySteps,
  hintLevels,
  type ArchivedEssay,
  type Essay,
  type EssayStep,
  type EssayVersion,
  type EssayVersionReason,
  type HintLevel,
} from '../essays/types'
import { parseIsoDate } from '../revision/dates'
import { validateRevisionSetup } from '../revision/planner'
import { REVIEW_INTERVAL_DAYS, type ReviewOutcome, type TopicProgress } from '../revision/progress'
import { ACTIVE_REVISION_ID, type StoredRevision } from '../revision/stored'
import { revisionSubjects } from '../revision/subjects/appliedMaths'
import type { Confidence, CourseLevel, RevisionSetup, Weekday } from '../revision/types'
import type { StoredData } from '../../storage/essayRepository'

export const BACKUP_APP = 'personal-essay-trainer'
// Version 2 added the revision plan. Version 1 files are read as having no revision data.
export const BACKUP_FORMAT_VERSION = 2
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024

export interface BackupFile {
  app: typeof BACKUP_APP
  formatVersion: typeof BACKUP_FORMAT_VERSION
  exportedAt: string
  data: StoredData
}

export function createBackup(data: StoredData, exportedAt: Date = new Date()): BackupFile {
  return {
    app: BACKUP_APP,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: exportedAt.toISOString(),
    data,
  }
}

export function backupFileName(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `essay-trainer-backup-${stamp}.json`
}

export interface BackupSummary {
  exportedAt: string
  hasEssay: boolean
  questionId: string | null
  draftWords: number
  versionCount: number
  archivedCount: number
  hasRevision: boolean
  revisionTopicsReviewed: number
}

export type ParseResult =
  | { ok: true; data: StoredData; summary: BackupSummary }
  | { ok: false; error: string }

class InvalidBackup extends Error {}

function fail(message: string): never {
  throw new InvalidBackup(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function timestamp(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    fail(`${label} is not a valid time.`)
  }
  return value
}

function step(value: unknown, label: string): EssayStep {
  if (!essaySteps.includes(value as EssayStep)) fail(`${label} has an unknown step.`)
  return value as EssayStep
}

const versionReasons: readonly EssayVersionReason[] = [
  'autosave',
  'step-change',
  'manual',
  'restore-point',
]

function readEssay(value: unknown, label: string): Essay {
  if (!isRecord(value)) fail(`${label} is not an essay.`)
  const { questionId, hintLevel } = value
  if (questionId !== null && typeof questionId !== 'string') {
    fail(`${label} has an invalid question.`)
  }
  if (!hintLevels.includes(hintLevel as HintLevel)) {
    fail(`${label} has an unknown help level.`)
  }
  return {
    id: ACTIVE_ESSAY_ID,
    questionId,
    step: step(value.step, label),
    hintLevel: hintLevel as HintLevel,
    createdAt: timestamp(value.createdAt, label),
    updatedAt: timestamp(value.updatedAt, label),
    ...normalizeContent(value),
  }
}

function readVersions(value: unknown, label: string): EssayVersion[] {
  if (!Array.isArray(value)) fail(`${label} versions are missing.`)
  return value.map((entry, index) => {
    if (!isRecord(entry)) fail(`${label} version ${index + 1} is invalid.`)
    if (!versionReasons.includes(entry.reason as EssayVersionReason)) {
      fail(`${label} version ${index + 1} has an unknown reason.`)
    }
    return {
      id: 0,
      essayId: ACTIVE_ESSAY_ID,
      step: step(entry.step, `${label} version ${index + 1}`),
      reason: entry.reason as EssayVersionReason,
      createdAt: timestamp(entry.createdAt, `${label} version ${index + 1}`),
      ...normalizeContent(entry),
    }
  })
}

function readArchived(value: unknown): ArchivedEssay[] {
  if (!Array.isArray(value)) fail('Archived essays are missing.')
  return value.map((entry, index) => {
    const label = `Archived essay ${index + 1}`
    if (!isRecord(entry)) fail(`${label} is invalid.`)
    return {
      id: 0,
      archivedAt: timestamp(entry.archivedAt, label),
      essay: readEssay(entry.essay, label),
      versions: readVersions(entry.versions, label),
    }
  })
}

const confidences: readonly Confidence[] = ['weak', 'okay', 'strong']
const levels: readonly CourseLevel[] = ['higher', 'ordinary']
const outcomes: readonly ReviewOutcome[] = ['got-it', 'shaky']

function isoDate(value: unknown, label: string): string {
  if (typeof value !== 'string' || parseIsoDate(value) === null) fail(`${label} is not a valid date.`)
  return value
}

function readRevision(value: unknown): StoredRevision {
  const label = 'The revision plan'
  if (!isRecord(value) || !isRecord(value.setup)) fail(`${label} is invalid.`)
  const { setup: raw } = value
  if (!Array.isArray(raw.subjects) || !isRecord(raw.minutesByWeekday)) fail(`${label} has invalid settings.`)

  const subjects = raw.subjects.map((entry) => {
    if (!isRecord(entry) || typeof entry.subjectId !== 'string') fail(`${label} has an invalid subject.`)
    if (!levels.includes(entry.level as CourseLevel)) fail(`${label} has an unknown level.`)
    if (!confidences.includes(entry.confidence as Confidence)) fail(`${label} has an unknown confidence.`)
    return { subjectId: entry.subjectId, level: entry.level as CourseLevel, confidence: entry.confidence as Confidence }
  })
  const minutesByWeekday: Partial<Record<Weekday, number>> = {}
  for (const day of [0, 1, 2, 3, 4, 5, 6] as const) {
    const minutes = raw.minutesByWeekday[day]
    if (minutes === undefined) continue
    if (typeof minutes !== 'number' || !Number.isFinite(minutes)) fail(`${label} has invalid study minutes.`)
    minutesByWeekday[day] = minutes
  }
  const setup: RevisionSetup = {
    startDate: isoDate(raw.startDate, `${label} start date`),
    examDate: isoDate(raw.examDate, `${label} exam date`),
    subjects,
    minutesByWeekday,
  }
  const problems = validateRevisionSetup(setup, revisionSubjects)
  if (problems.length > 0) fail(`${label} is not valid: ${problems[0]}`)

  const completed: Record<string, number[]> = {}
  if (!isRecord(value.completed)) fail(`${label} has no done marks.`)
  for (const [date, indexes] of Object.entries(value.completed)) {
    isoDate(date, `${label} done mark`)
    if (!Array.isArray(indexes) || !indexes.every((index) => Number.isInteger(index) && index >= 0)) {
      fail(`${label} has an invalid done mark.`)
    }
    completed[date] = indexes as number[]
  }

  const topicProgress: Record<string, TopicProgress> = {}
  if (!isRecord(value.topicProgress)) fail(`${label} has no topic progress.`)
  for (const [topicId, entry] of Object.entries(value.topicProgress)) {
    if (!isRecord(entry) || !outcomes.includes(entry.outcome as ReviewOutcome)) fail(`${label} has invalid topic progress.`)
    const { box } = entry
    if (typeof box !== 'number' || !Number.isInteger(box) || box < 0 || box >= REVIEW_INTERVAL_DAYS.length) {
      fail(`${label} has invalid topic progress.`)
    }
    topicProgress[topicId] = {
      outcome: entry.outcome as ReviewOutcome,
      box,
      lastReviewed: isoDate(entry.lastReviewed, `${label} review date`),
      due: isoDate(entry.due, `${label} review date`),
    }
  }

  return {
    id: ACTIVE_REVISION_ID,
    setup,
    projectDueDate: value.projectDueDate == null ? null : isoDate(value.projectDueDate, `${label} project date`),
    completed,
    topicProgress,
    createdAt: timestamp(value.createdAt, label),
    updatedAt: timestamp(value.updatedAt, label),
  }
}

export function parseBackup(text: string): ParseResult {
  try {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      fail('This file is not valid JSON.')
    }
    if (!isRecord(parsed) || parsed.app !== BACKUP_APP) {
      fail('This is not a Study Space backup file.')
    }
    if (typeof parsed.formatVersion !== 'number' || parsed.formatVersion < 1) {
      fail('This backup has no valid format version.')
    }
    if (parsed.formatVersion > BACKUP_FORMAT_VERSION) {
      fail('This backup was made by a newer version of the app. Update the app first.')
    }
    if (!isRecord(parsed.data)) fail('The backup has no data.')

    const { data } = parsed
    const essay = data.essay === null ? null : readEssay(data.essay, 'The essay')
    const stored: StoredData = {
      essay,
      versions: essay ? readVersions(data.versions, 'The essay') : [],
      archived: readArchived(data.archived),
      revision: data.revision == null ? null : readRevision(data.revision),
    }
    const exportedAt = typeof parsed.exportedAt === 'string' ? parsed.exportedAt : ''

    return {
      ok: true,
      data: stored,
      summary: {
        exportedAt,
        hasEssay: essay !== null,
        questionId: essay?.questionId ?? null,
        draftWords: essay ? (toPlainText(essay.draft).trim().match(/\S+/g) ?? []).length : 0,
        versionCount: stored.versions.length,
        archivedCount: stored.archived.length,
        hasRevision: stored.revision !== null,
        revisionTopicsReviewed: Object.keys(stored.revision?.topicProgress ?? {}).length,
      },
    }
  } catch (error) {
    if (error instanceof InvalidBackup) return { ok: false, error: error.message }
    throw error
  }
}
