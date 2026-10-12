import { useEffect, useId, useRef, useState } from 'react'

interface Props {
  text: string
  label?: string
}

/** Copies a prepared prompt by hand-off only; nothing is sent anywhere. */
export function CopyPrompt({ text, label = 'Copy prompt for an AI check' }: Props) {
  const [message, setMessage] = useState('')
  const [blocked, setBlocked] = useState(false)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const areaId = useId()

  useEffect(() => {
    if (blocked) areaRef.current?.select()
  }, [blocked])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setBlocked(false)
      setMessage('Copied. Paste it into the AI tool you use, then read its feedback and fix your working.')
    } catch {
      setBlocked(true)
      setMessage('Copying was blocked. The text is selected: press Ctrl+C (or Cmd+C) to copy it.')
    }
  }

  return (
    <div className="copy-prompt">
      <button type="button" className="button button-secondary" onClick={copy}>
        {label}
      </button>
      {message && (
        <p role="status" className="field-hint">
          {message}
        </p>
      )}
      {blocked && (
        <>
          <label htmlFor={areaId} className="visually-hidden">
            Prompt text
          </label>
          <textarea id={areaId} ref={areaRef} readOnly rows={8} value={text} />
        </>
      )}
    </div>
  )
}
