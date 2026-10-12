import { useState } from 'react'
import { Link } from 'react-router'
import {
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  type ParseResult,
} from '../features/backup/backupFormat'
import { downloadFile } from '../features/backup/download'
import { formatDateTime } from '../features/essays/format'
import { questionLabel } from '../features/questions/questions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { essayRepository } from '../storage/essayRepository'
import { getLastBackupAt, setLastBackupAt } from '../storage/backupReminder'
import { waitForWrites } from '../storage/pendingWrites'

type Parsed = Extract<ParseResult, { ok: true }>

function BackupPage() {
  useDocumentTitle('Backup')
  const [lastBackupAt, setLastBackup] = useState(getLastBackupAt)
  const [exportError, setExportError] = useState('')
  const [preview, setPreview] = useState<Parsed | null>(null)
  const [importError, setImportError] = useState('')
  const [restored, setRestored] = useState(false)

  async function download() {
    setExportError('')
    try {
      await waitForWrites()
      const data = await essayRepository.exportAll()
      const json = JSON.stringify(createBackup(data), null, 2)
      downloadFile(backupFileName(), json, 'application/json')
      const now = Date.now()
      setLastBackupAt(now)
      setLastBackup(now)
    } catch {
      setExportError('The backup could not be created. Please try again.')
    }
  }

  async function chooseFile(file: File | undefined) {
    setPreview(null)
    setImportError('')
    setRestored(false)
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) {
      setImportError('This file is too large to be a Study Space backup.')
      return
    }
    const result = parseBackup(await file.text())
    if (result.ok) setPreview(result)
    else setImportError(result.error)
  }

  async function restore() {
    if (!preview) return
    try {
      await waitForWrites()
      await essayRepository.importAll(preview.data)
      setPreview(null)
      setRestored(true)
    } catch {
      setImportError('The backup could not be restored. Your current essay was not changed.')
    }
  }

  return (
    <section className="page-panel backup" aria-labelledby="page-title">
      <h1 id="page-title">Backup</h1>
      <p>
        Your revision plan, progress and essay are stored only in this browser.
        Clearing site data or changing computers would lose them, so download a backup regularly. The
        file stays on your device; nothing is uploaded.
      </p>

      <section aria-labelledby="download-heading">
        <h2 id="download-heading">Download a backup</h2>
        <p>
          The backup contains your current essay, its saved versions,
          archived essays, and your revision plan and progress.
        </p>
        <p>
          {lastBackupAt
            ? `Last backup downloaded: ${formatDateTime(lastBackupAt)}.`
            : 'You have not downloaded a backup on this device yet.'}
        </p>
        <button type="button" className="button" onClick={() => void download()}>
          Download backup
        </button>
        {exportError && <p role="alert">{exportError}</p>}
      </section>

      <section aria-labelledby="restore-heading">
        <h2 id="restore-heading">Restore from a backup</h2>
        <p>
          Choose a backup file you downloaded earlier. You will see what it
          contains before anything changes. If your current essay is different,
          it is moved to the archive, never deleted. Revision data is merged
          with what is on this device: the newer plan settings are kept and
          every topic keeps its most recent review.
        </p>
        <label className="field-label" htmlFor="backup-file">
          Backup file (.json)
        </label>
        <input
          id="backup-file"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
        {importError && <p role="alert">{importError}</p>}

        {preview && (
          <div className="confirm-box" role="group" aria-label="Backup preview">
            <h3>This backup contains</h3>
            <ul>
              <li>
                Made{' '}
                {preview.summary.exportedAt
                  ? formatDateTime(preview.summary.exportedAt)
                  : 'at an unknown time'}
              </li>
              <li>
                {preview.summary.hasEssay
                  ? `An essay for ${questionLabel(preview.summary.questionId)} with ${preview.summary.draftWords} words in the essay step`
                  : 'No active essay'}
              </li>
              <li>{preview.summary.versionCount} saved versions</li>
              <li>{preview.summary.archivedCount} archived essays</li>
              <li>
                {preview.summary.hasRevision
                  ? `A revision plan with ${preview.summary.revisionTopicsReviewed} topics reviewed`
                  : 'No revision plan'}
              </li>
            </ul>
            <button type="button" className="button" onClick={() => void restore()}>
              Restore this backup
            </button>{' '}
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setPreview(null)}
            >
              Cancel
            </button>
          </div>
        )}
        {restored && (
          <p role="status">
            Backup restored. <Link to="/practice">Continue on the Essay practice page</Link>.
          </p>
        )}
      </section>
    </section>
  )
}

export default BackupPage
