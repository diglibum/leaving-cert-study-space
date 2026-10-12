import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatDateTime } from '../features/essays/format'
import type { EssayVersion, EssayVersionReason } from '../features/essays/types'
import EssayContentView from '../features/history/EssayContentView'
import { getStep } from '../features/practice/steps'
import { toPlainText } from '../features/essays/richText'
import { countWords } from '../features/practice/text'
import { findQuestion, questionLabel } from '../features/questions/questions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStoredData } from '../hooks/useStoredData'
import { essayRepository } from '../storage/essayRepository'

const PAGE_SIZE = 20

const reasonLabels: Record<EssayVersionReason, string> = {
  autosave: 'Automatic save',
  'step-change': 'Changed step',
  manual: 'Saved by you',
  'restore-point': 'Before a restore',
}

function questionText(questionId: string | null): string {
  const question = findQuestion(questionId)
  return question
    ? `${question.year}, question ${question.questionNumber}: ${question.task}`
    : 'No question selected'
}

function VersionItem({
  version,
  onRestore,
}: {
  version: EssayVersion
  onRestore: (id: number) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="history-item">
      <details>
        <summary>
          {formatDateTime(version.createdAt)} · {reasonLabels[version.reason]} ·{' '}
          {getStep(version.step).title} · {countWords(toPlainText(version.draft))} words in essay
        </summary>
        <EssayContentView content={version} />
        {confirming ? (
          <div className="confirm-box" role="group" aria-label="Confirm restore">
            <p>
              Your current text is saved as a new version first, so you can undo
              this restore.
            </p>
            <button
              type="button"
              className="button"
              onClick={() => void onRestore(version.id)}
            >
              Yes, restore this version
            </button>{' '}
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setConfirming(true)}
          >
            Restore this version
          </button>
        )}
      </details>
    </li>
  )
}

function HistoryPage() {
  useDocumentTitle('Essay history')
  const navigate = useNavigate()
  const load = useCallback(async () => {
    const [essay, versions, archived] = await Promise.all([
      essayRepository.getActive(),
      essayRepository.listVersions(),
      essayRepository.listArchived(),
    ])
    return { essay, versions, archived }
  }, [])
  const { state, reload } = useStoredData(load)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmingNew, setConfirmingNew] = useState(false)

  async function run(action: () => Promise<void>, success: string) {
    setError('')
    try {
      await action()
      setMessage(success)
      reload()
    } catch {
      setMessage('')
      setError('That did not work. Your essay was not changed. Please try again.')
    }
  }

  return (
    <section className="page-panel history" aria-labelledby="page-title">
      <h1 id="page-title">Essay history</h1>

      {state.status === 'loading' && <p role="status">Loading your history…</p>}
      {state.status === 'error' && (
        <p role="alert">
          Your history could not be loaded from this browser. Reload the page to
          try again.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {state.status === 'ready' && (
        <>
          {!state.data.essay ? (
            <p>
              You have no active essay.{' '}
              <Link to="/practice">Choose a question on the Essay practice page</Link>{' '}
              to start one.
            </p>
          ) : (
            <>
              <section aria-labelledby="current-heading">
                <h2 id="current-heading">Current essay</h2>
                <p>{questionText(state.data.essay.questionId)}</p>
                <p>
                  Last saved {formatDateTime(state.data.essay.updatedAt)} ·{' '}
                  {countWords(toPlainText(state.data.essay.draft))} words in the essay ·{' '}
                  <Link to="/practice">continue writing</Link>
                </p>
                <p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() =>
                      void run(async () => {
                        await essayRepository.recordVersion('manual')
                      }, 'Version saved.')
                    }
                  >
                    Save a version now
                  </button>
                </p>
              </section>

              <section aria-labelledby="versions-heading">
                <h2 id="versions-heading">Saved versions</h2>
                <p>
                  A version is recorded each time you change step, when you
                  restore an older version, and when you save one yourself.
                </p>
                {state.data.versions.length === 0 ? (
                  <p>No versions yet.</p>
                ) : (
                  <>
                    <ul className="history-list">
                      {state.data.versions.slice(0, visible).map((version) => (
                        <VersionItem
                          key={version.id}
                          version={version}
                          onRestore={(id) =>
                            run(async () => {
                              await essayRepository.restoreVersion(id)
                            }, 'Version restored. Your earlier text was kept as a version.')
                          }
                        />
                      ))}
                    </ul>
                    {visible < state.data.versions.length && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => setVisible((count) => count + PAGE_SIZE)}
                      >
                        Show more ({state.data.versions.length - visible} older)
                      </button>
                    )}
                  </>
                )}
              </section>

              <section aria-labelledby="new-heading">
                <h2 id="new-heading">Start a new essay</h2>
                <p>
                  Your current essay is moved to the archive below. Nothing is
                  deleted. Download a backup first if you want an extra copy.
                </p>
                {confirmingNew ? (
                  <div className="confirm-box" role="group" aria-label="Confirm new essay">
                    <p>Archive the current essay and choose a new question?</p>
                    <button
                      type="button"
                      className="button"
                      onClick={() =>
                        void run(async () => {
                          await essayRepository.startNew()
                          void navigate('/practice')
                        }, '')
                      }
                    >
                      Yes, archive it and start a new essay
                    </button>{' '}
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setConfirmingNew(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setConfirmingNew(true)}
                  >
                    Start a new essay
                  </button>
                )}
              </section>
            </>
          )}

          <section aria-labelledby="archive-heading">
            <h2 id="archive-heading">Archived essays</h2>
            {state.data.archived.length === 0 ? (
              <p>No archived essays yet.</p>
            ) : (
              <ul className="history-list">
                {state.data.archived.map((entry) => (
                  <li key={entry.id} className="history-item">
                    <details>
                      <summary>
                        Archived {formatDateTime(entry.archivedAt)} ·{' '}
                        {questionLabel(entry.essay.questionId)} ·{' '}
                        {countWords(toPlainText(entry.essay.draft))} words
                      </summary>
                      <p>{questionText(entry.essay.questionId)}</p>
                      <EssayContentView content={entry.essay} />
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default HistoryPage
