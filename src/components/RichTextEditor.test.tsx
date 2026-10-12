import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RichTextEditor from './RichTextEditor'

const execCommand = vi.fn()

beforeEach(() => {
  execCommand.mockReset()
  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })
})

afterEach(() => {
  Reflect.deleteProperty(document, 'execCommand')
})

function Harness({ initial = '', onValue }: { initial?: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <p id="label">Notes</p>
      <RichTextEditor
        value={value}
        labelledBy="label"
        placeholder="Write here"
        onChange={(next) => {
          setValue(next)
          onValue?.(next)
        }}
      />
    </>
  )
}

describe('RichTextEditor', () => {
  it('is an accessible multi-line textbox with a formatting toolbar', () => {
    render(<Harness />)

    const box = screen.getByRole('textbox', { name: 'Notes' })
    expect(box).toHaveAttribute('aria-multiline', 'true')
    expect(box).toHaveAttribute('data-placeholder', 'Write here')
    const toolbar = screen.getByRole('toolbar', { name: 'Text formatting' })
    expect(toolbar.querySelectorAll('button')).toHaveLength(4)
  })

  it('shows legacy plain text as paragraphs', () => {
    render(<Harness initial={'First paragraph\n\nSecond paragraph'} />)

    const paragraphs = screen.getByRole('textbox').querySelectorAll('p')
    expect(Array.from(paragraphs).map((p) => p.textContent)).toEqual([
      'First paragraph',
      'Second paragraph',
    ])
  })

  it('saves typed text as a paragraph and reports an empty editor as an empty string', async () => {
    const user = userEvent.setup()
    const values: string[] = []
    render(<Harness onValue={(v) => values.push(v)} />)
    const box = screen.getByRole('textbox')

    await user.type(box, 'Hello')
    expect(values.at(-1)).toBe('<p>Hello</p>')

    await user.clear(box)
    expect(values.at(-1)).toBe('')
    expect(box).toHaveAttribute('data-empty', 'true')
  })

  it('strips unsupported markup that appears in the editor', () => {
    const values: string[] = []
    render(<Harness onValue={(v) => values.push(v)} />)
    const box = screen.getByRole('textbox')

    box.innerHTML = '<div style="color:red"><b>Bold</b> <u>text</u></div><p><br></p><p>Two</p>'
    fireEvent.input(box)

    expect(values.at(-1)).toBe('<p><strong>Bold</strong> text</p><p><br></p><p>Two</p>')
  })

  it('applies formatting commands from the toolbar', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Bold' }))
    await user.click(screen.getByRole('button', { name: 'Numbered list' }))

    expect(execCommand).toHaveBeenCalledWith('bold')
    expect(execCommand).toHaveBeenCalledWith('insertOrderedList')
  })

  it('pastes as plain text, splitting lines into paragraphs', () => {
    render(<Harness />)
    const box = screen.getByRole('textbox')

    act(() => {
      fireEvent.paste(box, {
        clipboardData: { getData: () => '<b>One</b>\nTwo' },
      })
    })

    expect(execCommand).toHaveBeenCalledWith('insertText', false, '<b>One</b>')
    expect(execCommand).toHaveBeenCalledWith('insertParagraph')
    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'Two')
  })
})
