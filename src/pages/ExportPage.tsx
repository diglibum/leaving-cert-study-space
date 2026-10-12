import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { downloadFile } from '../features/backup/download'
import { buildAiExport } from '../features/export/aiExport'
import { findQuestion } from '../features/questions/questions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStoredData } from '../hooks/useStoredData'
import { essayRepository } from '../storage/essayRepository'

function ExportPage() {
  useDocumentTitle('Essay AI export')
  const load = useCallback(() => essayRepository.getActive(), [])
  const { state } = useStoredData(load)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [copyMessage, setCopyMessage] = useState('')

  const text = useMemo(() => {
    if (state.status !== 'ready' || !state.data) return ''
    return buildAiExport(state.data, findQuestion(state.data.questionId))
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage('Copied. Paste it into the tool you want to use.')
    } catch {
      textRef.current?.select()
      setCopyMessage('Copying was blocked. The text is selected: press Ctrl+C (or Cmd+C) to copy it.')
    }
  }

  return (
    <section className="page-panel export" aria-labelledby="page-title">
      <h1 id="page-title">Essay AI export</h1>
      <p>
        This page prepares your essay as plain text that you can copy into an AI
        tool yourself. The app never sends anything: you decide whether to use
        an AI tool, which one, and what to paste. Your essay may contain
        personal details, so check them before sharing, and follow your
        school&rsquo;s rules on AI use.
      </p>

      {state.status === 'loading' && <p role="status">Loading your essay…</p>}
      {state.status === 'error' && (
        <p role="alert">Your essay could not be loaded. Reload the page to try again.</p>
      )}
      {state.status === 'ready' && !state.data && (
        <p>
          You have no essay yet. <Link to="/practice">Start on the Essay practice page</Link>.
        </p>
      )}

      {state.status === 'ready' && state.data && (
        <>
          <label className="field-label" htmlFor="export-text">
            Text to copy
          </label>
          <textarea
            id="export-text"
            ref={textRef}
            className="step-text"
            rows={16}
            readOnly
            value={text}
          />
          <p className="step-actions">
            <button type="button" className="button" onClick={() => void copy()}>
              Copy text
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => downloadFile('essay-for-feedback.txt', text, 'text/plain')}
            >
              Download as a text file
            </button>
          </p>
          {copyMessage && <p role="status">{copyMessage}</p>}
          <p>
            Treat any feedback as advice to think about, not as an exam mark.
            Your own check on the Essay practice page is still the most useful.
          </p>
        </>
      )}
    </section>
  )
}

export default ExportPage
