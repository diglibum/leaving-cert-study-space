import { useCallback, useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { sanitizeHtml, toEditorHtml } from '../features/essays/richText'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  labelledBy: string
  describedBy?: string
  placeholder?: string
}

type Format = 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList'

const tools: { command: Format; label: string; symbol: string }[] = [
  { command: 'bold', label: 'Bold', symbol: 'B' },
  { command: 'italic', label: 'Italic', symbol: 'I' },
  { command: 'insertUnorderedList', label: 'Bulleted list', symbol: '•' },
  { command: 'insertOrderedList', label: 'Numbered list', symbol: '1.' },
]

function commandState(command: Format): boolean {
  try {
    return typeof document.queryCommandState === 'function' && document.queryCommandState(command)
  } catch {
    return false
  }
}

// A small rich-text editor built on the browser's own `contenteditable`: paragraphs,
// bold, italic, and two list types. The saved value is sanitised HTML, or ''
// when there is no text. Pasted text is always inserted as plain text.
function RichTextEditor({
  value,
  onChange,
  onBlur,
  labelledBy,
  describedBy,
  placeholder,
}: RichTextEditorProps) {
  const editor = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef<string | null>(null)
  const [active, setActive] = useState<Partial<Record<Format, boolean>>>({})

  const refreshActive = useCallback(() => {
    const element = editor.current
    const selection = window.getSelection()
    if (!element || !selection?.anchorNode || !element.contains(selection.anchorNode)) return
    setActive(Object.fromEntries(tools.map(({ command }) => [command, commandState(command)])))
  }, [])

  const emit = useCallback(() => {
    const element = editor.current
    if (!element) return
    const html = sanitizeHtml(element.innerHTML)
    element.dataset.empty = String(html === '')
    if (html === lastEmitted.current) return
    lastEmitted.current = html
    onChange(html)
  }, [onChange])

  // Show the initial value, and any later value that did not come from typing
  // (for example after restoring a version).
  useEffect(() => {
    const element = editor.current
    if (!element || value === lastEmitted.current) return
    element.innerHTML = toEditorHtml(value)
    element.dataset.empty = String(sanitizeHtml(element.innerHTML) === '')
    lastEmitted.current = sanitizeHtml(element.innerHTML)
  }, [value])

  useEffect(() => {
    document.addEventListener('selectionchange', refreshActive)
    return () => document.removeEventListener('selectionchange', refreshActive)
  }, [refreshActive])

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p')
    } catch {
      // Unsupported browsers fall back to divs, which are cleaned when saving.
    }
  }, [])

  function format(command: Format) {
    editor.current?.focus()
    document.execCommand(command)
    emit()
    refreshActive()
  }

  function paste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n')
    text.split('\n').forEach((line, index) => {
      if (index > 0) document.execCommand('insertParagraph')
      if (line) document.execCommand('insertText', false, line)
    })
    emit()
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar" role="toolbar" aria-label="Text formatting">
        {tools.map(({ command, label, symbol }) => (
          <button
            key={command}
            type="button"
            className="rich-tool"
            aria-label={label}
            aria-pressed={active[command] ?? false}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => format(command)}
          >
            <span aria-hidden="true" className={`rich-tool-${command}`}>
              {symbol}
            </span>
          </button>
        ))}
      </div>
      <div
        ref={editor}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        data-placeholder={placeholder}
        data-empty="true"
        spellCheck
        onInput={emit}
        onPaste={paste}
        onBlur={() => {
          // Replace anything the browser added with the cleaned version.
          const element = editor.current
          if (element) {
            const clean = sanitizeHtml(element.innerHTML)
            element.innerHTML = clean
            element.dataset.empty = String(clean === '')
          }
          onBlur?.()
        }}
      />
    </div>
  )
}

export default RichTextEditor
