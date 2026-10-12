import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackup } from '../features/backup/backupFormat'
import { downloadFile } from '../features/backup/download'
import { db } from '../storage/database'
import { essayRepository } from '../storage/essayRepository'
import { revisionRepository } from '../storage/revisionRepository'
import BackupPage from './BackupPage'
import ExportPage from './ExportPage'
import HistoryPage from './HistoryPage'
import PracticePage from './PracticePage'

vi.mock('../features/backup/download', () => ({ downloadFile: vi.fn() }))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/practice" element={<PracticePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function seedEssay(draft = 'I walked home. I felt proud.') {
  await essayRepository.start('2026-q7')
  await essayRepository.update({ draft, step: 'draft' })
}

beforeEach(async () => {
  await db.essays.clear()
  await db.essayVersions.clear()
  await db.archivedEssays.clear()
  await db.revisionPlans.clear()
  localStorage.clear()
  vi.mocked(downloadFile).mockClear()
})

describe('History page', () => {
  it('points to Practice when there is no essay', async () => {
    renderAt('/history')
    expect(await screen.findByText(/You have no active essay/)).toBeInTheDocument()
    expect(screen.getByText('No archived essays yet.')).toBeInTheDocument()
  })

  it('saves a version and restores an older one after confirmation', async () => {
    const user = userEvent.setup()
    await seedEssay('Old text.')
    await essayRepository.recordVersion('manual')
    await essayRepository.update({ draft: 'New text.' })
    renderAt('/history')

    await user.click(await screen.findByRole('button', { name: 'Restore this version' }))
    expect(await essayRepository.getActive()).toMatchObject({ draft: 'New text.' })
    await user.click(screen.getByRole('button', { name: 'Yes, restore this version' }))

    expect(await screen.findByText(/Version restored/)).toBeInTheDocument()
    expect(await essayRepository.getActive()).toMatchObject({ draft: 'Old text.' })
    expect(await essayRepository.listVersions()).toHaveLength(2)
  })

  it('records a manual version', async () => {
    const user = userEvent.setup()
    await seedEssay()
    renderAt('/history')

    await user.click(await screen.findByRole('button', { name: 'Save a version now' }))

    expect(await screen.findByText('Version saved.')).toBeInTheDocument()
    expect(await essayRepository.listVersions()).toHaveLength(1)
  })

  it('archives the essay only after confirmation and shows it in the archive', async () => {
    const user = userEvent.setup()
    await seedEssay()
    renderAt('/history')

    await user.click(await screen.findByRole('button', { name: 'Start a new essay' }))
    expect(await essayRepository.getActive()).toBeDefined()
    await user.click(screen.getByRole('button', { name: /Yes, archive it/ }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Choose a question' })).toBeInTheDocument()
    expect(await essayRepository.getActive()).toBeUndefined()
    expect(await essayRepository.listArchived()).toHaveLength(1)
  })
})

describe('Backup page', () => {
  it('downloads a backup file and remembers the time', async () => {
    const user = userEvent.setup()
    await seedEssay()
    renderAt('/backup')

    await user.click(screen.getByRole('button', { name: 'Download backup' }))

    await waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1))
    const [name, content] = vi.mocked(downloadFile).mock.calls[0]
    expect(name).toMatch(/^essay-trainer-backup-\d{4}-\d{2}-\d{2}\.json$/)
    expect(JSON.parse(content).data.essay.draft).toBe('I walked home. I felt proud.')
    expect(await screen.findByText(/Last backup downloaded/)).toBeInTheDocument()
  })

  it('previews a backup and only changes data after confirmation', async () => {
    const user = userEvent.setup()
    await seedEssay('Newer work.')
    const other = await essayRepository.exportAll()
    const backup = createBackup({
      ...other,
      essay: other.essay && { ...other.essay, draft: 'Backed up work.' },
    })
    renderAt('/backup')

    await user.upload(
      screen.getByLabelText('Backup file (.json)'),
      new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' }),
    )

    const preview = await screen.findByRole('group', { name: 'Backup preview' })
    expect(within(preview).getByText(/2026, question 7/)).toBeInTheDocument()
    expect(await essayRepository.getActive()).toMatchObject({ draft: 'Newer work.' })

    await user.click(within(preview).getByRole('button', { name: 'Restore this backup' }))

    expect(await screen.findByText(/Backup restored/)).toBeInTheDocument()
    expect(await essayRepository.getActive()).toMatchObject({ draft: 'Backed up work.' })
    expect((await essayRepository.listArchived())[0].essay.draft).toBe('Newer work.')
  })

  it('includes the revision plan in the backup and merges it on restore', async () => {
    const user = userEvent.setup()
    await revisionRepository.saveSetup(
      {
        startDate: '2026-10-12',
        examDate: '2027-06-01',
        subjects: [{ subjectId: 'applied-maths', level: 'higher', confidence: 'okay' }],
        minutesByWeekday: { 1: 45 },
      },
      null,
    )
    await revisionRepository.recordReview('am-dijkstra', 'got-it', '2026-10-20')
    renderAt('/backup')

    await user.click(screen.getByRole('button', { name: 'Download backup' }))
    expect(await screen.findByText(/Last backup downloaded/)).toBeInTheDocument()
    const [, content] = vi.mocked(downloadFile).mock.calls[0]
    expect(JSON.parse(content).data.revision.topicProgress['am-dijkstra']).toBeDefined()

    await revisionRepository.recordReview('am-circular', 'shaky', '2026-10-25')
    await user.upload(
      screen.getByLabelText('Backup file (.json)'),
      new File([content], 'backup.json', { type: 'application/json' }),
    )
    const preview = await screen.findByRole('group', { name: 'Backup preview' })
    expect(within(preview).getByText('A revision plan with 1 topics reviewed')).toBeInTheDocument()
    await user.click(within(preview).getByRole('button', { name: 'Restore this backup' }))

    expect(await screen.findByText(/Backup restored/)).toBeInTheDocument()
    const topics = Object.keys((await revisionRepository.get())?.topicProgress ?? {}).sort()
    expect(topics).toEqual(['am-circular', 'am-dijkstra'])
  })

  it('rejects an invalid file without touching data', async () => {
    const user = userEvent.setup()
    await seedEssay()
    renderAt('/backup')

    await user.upload(
      screen.getByLabelText('Backup file (.json)'),
      new File(['{"hello":1}'], 'bad.json', { type: 'application/json' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a Study Space backup/)
    expect(screen.queryByRole('button', { name: 'Restore this backup' })).not.toBeInTheDocument()
    expect(await essayRepository.getActive()).toMatchObject({ draft: 'I walked home. I felt proud.' })
  })
})

describe('AI export page', () => {
  it('shows ready-to-copy text built from the essay', async () => {
    await seedEssay()
    renderAt('/export')

    const field = await screen.findByLabelText('Text to copy')
    expect(field).toHaveAttribute('readonly')
    expect((field as HTMLTextAreaElement).value).toContain('I walked home. I felt proud.')
    expect(screen.getByText(/never sends anything/)).toBeInTheDocument()
  })

  it('asks the learner to start an essay first', async () => {
    renderAt('/export')
    expect(await screen.findByText(/You have no essay yet/)).toBeInTheDocument()
  })
})

describe('Self-check on the Practice page', () => {
  it('lets the learner mark paragraphs and answer the checklist, saving both', async () => {
    const user = userEvent.setup()
    await seedEssay('I walked home.\n\nI felt proud.')
    await essayRepository.update({ step: 'self-check' })
    renderAt('/practice')

    await screen.findByRole('heading', { level: 2, name: 'Check your essay' })
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Type of paragraph 2/ }),
      'Mostly what I thought or felt',
    )
    expect(screen.getByText(/Marked 1 of 2 paragraphs/)).toBeInTheDocument()
    await user.click(
      within(
        screen.getByRole('group', { name: /Every paragraph connects back/ }),
      ).getByRole('radio', { name: 'Partly' }),
    )

    await waitFor(async () => {
      const essay = await essayRepository.getActive()
      expect(essay?.paragraphTags).toEqual({ 'I felt proud.': 'felt' })
      expect(essay?.checklist['purpose-question'].rating).toBe('partly')
    })
    expect(screen.getByText(/1 of 10 answered/)).toBeInTheDocument()
  })
})
