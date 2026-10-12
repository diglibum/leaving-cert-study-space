import { describe, expect, it } from 'vitest'
import { emptyContent } from '../essays/content'
import type { Essay } from '../essays/types'
import type { StoredRevision } from '../revision/stored'
import { backupFileName, createBackup, parseBackup } from './backupFormat'

const essay: Essay = {
  id: 'active',
  questionId: '2026-q7',
  step: 'draft',
  hintLevel: 'some',
  ...emptyContent(),
  draft: 'One two three',
  createdAt: 1,
  updatedAt: 2,
}

function backupText(change?: (backup: Record<string, unknown>) => void) {
  const backup = JSON.parse(
    JSON.stringify(createBackup({ essay, versions: [], archived: [], revision: null }, new Date(0))),
  )
  change?.(backup)
  return JSON.stringify(backup)
}

describe('backup format', () => {
  it('names files by local date', () => {
    expect(backupFileName(new Date(2026, 0, 5))).toBe('essay-trainer-backup-2026-01-05.json')
  })

  it('accepts a valid backup and summarises it', () => {
    const result = parseBackup(backupText())

    expect(result).toMatchObject({
      ok: true,
      summary: { hasEssay: true, questionId: '2026-q7', draftWords: 3, versionCount: 0 },
    })
  })

  it('accepts a backup with no active essay', () => {
    const result = parseBackup(
      JSON.stringify(createBackup({ essay: null, versions: [], archived: [], revision: null })),
    )
    expect(result).toMatchObject({ ok: true, summary: { hasEssay: false } })
  })

  it.each([
    ['not JSON', 'nope', /not valid JSON/],
    ['another app', JSON.stringify({ app: 'other' }), /not a Study Space backup/],
    [
      'a newer format',
      backupText((backup) => (backup.formatVersion = 99)),
      /newer version/,
    ],
    [
      'an unknown step',
      backupText((backup) => {
        ;(backup.data as { essay: { step: string } }).essay.step = 'nonsense'
      }),
      /unknown step/,
    ],
    [
      'a bad time',
      backupText((backup) => {
        ;(backup.data as { essay: { createdAt: unknown } }).essay.createdAt = 'yesterday'
      }),
      /not a valid time/,
    ],
    [
      'missing archive',
      backupText((backup) => {
        delete (backup.data as { archived?: unknown }).archived
      }),
      /Archived essays are missing/,
    ],
  ])('rejects %s', (_name, text, message) => {
    const result = parseBackup(text)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(message)
  })

  it('fills in fields missing from older backups', () => {
    const result = parseBackup(
      backupText((backup) => {
        const stored = (backup.data as { essay: Record<string, unknown> }).essay
        delete stored.checklist
        delete stored.paragraphTags
      }),
    )
    expect(result.ok && result.data.essay?.checklist['purpose-question']).toEqual({
      rating: null,
      note: '',
    })
  })
})

describe('backup format: revision data', () => {
  const revision: StoredRevision = {
    id: 'active',
    setup: {
      startDate: '2026-10-12',
      examDate: '2027-06-01',
      subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'weak' }],
      minutesByWeekday: { 1: 45, 6: 90 },
    },
    projectDueDate: '2027-02-01',
    completed: { '2026-10-12': [0, 1] },
    topicProgress: {
      'am-kinematics-1d': { outcome: 'got-it', box: 1, lastReviewed: '2026-10-13', due: '2026-10-16' },
    },
    createdAt: 1,
    updatedAt: 2,
  }

  function withRevision(change?: (revision: Record<string, unknown>) => void) {
    const backup = JSON.parse(JSON.stringify(createBackup({ essay: null, versions: [], archived: [], revision })))
    change?.(backup.data.revision)
    return JSON.stringify(backup)
  }

  it('writes format version 2 and round-trips revision data', () => {
    expect(JSON.parse(withRevision()).formatVersion).toBe(2)
    const result = parseBackup(withRevision())
    expect(result).toMatchObject({ ok: true, summary: { hasRevision: true, revisionTopicsReviewed: 1 } })
    expect(result.ok && result.data.revision).toEqual(revision)
  })

  it('reads a version 1 backup as having no revision data', () => {
    const old = JSON.stringify({
      app: 'personal-essay-trainer',
      formatVersion: 1,
      exportedAt: '2026-10-01T00:00:00.000Z',
      data: { essay: null, versions: [], archived: [] },
    })
    const result = parseBackup(old)
    expect(result).toMatchObject({ ok: true, summary: { hasRevision: false, revisionTopicsReviewed: 0 } })
    expect(result.ok && result.data.revision).toBeNull()
  })

  it.each([
    ['not an object', (r: Record<string, unknown>) => Object.assign(r, { setup: 'x' }), /revision plan is invalid/],
    [
      'an unknown subject',
      (r: Record<string, unknown>) => ((r.setup as { subjects: unknown[] }).subjects = [{ subjectId: 'nope', level: 'higher', confidence: 'okay' }]),
      /Unknown subject/,
    ],
    [
      'an unknown confidence',
      (r: Record<string, unknown>) => ((r.setup as { subjects: { confidence: string }[] }).subjects[0].confidence = 'great'),
      /unknown confidence/,
    ],
    [
      'a bad date',
      (r: Record<string, unknown>) => ((r.setup as { examDate: string }).examDate = '2027-13-45'),
      /not a valid date/,
    ],
    [
      'exam before start',
      (r: Record<string, unknown>) => ((r.setup as { examDate: string }).examDate = '2026-01-01'),
      /before the exam date/,
    ],
    [
      'a bad done mark',
      (r: Record<string, unknown>) => (r.completed = { '2026-10-12': [-1] }),
      /invalid done mark/,
    ],
    [
      'a bad topic box',
      (r: Record<string, unknown>) =>
        (r.topicProgress = { a: { outcome: 'got-it', box: 9, lastReviewed: '2026-10-13', due: '2026-10-16' } }),
      /invalid topic progress/,
    ],
    [
      'a bad review outcome',
      (r: Record<string, unknown>) =>
        (r.topicProgress = { a: { outcome: 'easy', box: 0, lastReviewed: '2026-10-13', due: '2026-10-16' } }),
      /invalid topic progress/,
    ],
  ])('rejects revision data with %s', (_name, change, message) => {
    const result = parseBackup(withRevision(change))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(message)
  })
})
