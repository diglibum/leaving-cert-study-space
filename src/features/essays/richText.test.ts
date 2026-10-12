import { describe, expect, it } from 'vitest'
import {
  isRichText,
  plainTextToHtml,
  sanitizeHtml,
  toEditorHtml,
  toPlainText,
} from './richText'

describe('rich text', () => {
  it('recognises stored HTML and legacy plain text', () => {
    expect(isRichText('<p>Hello</p>')).toBe(true)
    expect(isRichText('Hello <p>')).toBe(false)
    expect(isRichText('')).toBe(false)
  })

  it('turns legacy plain text into escaped paragraphs', () => {
    expect(plainTextToHtml('One\nline break\n\nSecond <b>para</b>')).toBe(
      '<p>One<br>line break</p><p>Second &lt;b&gt;para&lt;/b&gt;</p>',
    )
    expect(toEditorHtml('Old text')).toBe('<p>Old text</p>')
  })

  it('keeps only the allowed tags and strips attributes', () => {
    expect(
      sanitizeHtml(
        '<div style="color:red" onclick="x()"><b>Bold</b> and <i class="a">italic</i> <a href="javascript:x">link</a></div>',
      ),
    ).toBe('<p><strong>Bold</strong> and <em>italic</em> link</p>')
  })

  it('removes scripts and styles with their contents', () => {
    expect(sanitizeHtml('<p>Hi<script>alert(1)</script><style>p{}</style></p>')).toBe('<p>Hi</p>')
  })

  it('wraps loose text and converts divs and headings to paragraphs', () => {
    expect(sanitizeHtml('Loose<div>Block</div><h2>Head</h2>')).toBe(
      '<p>Loose</p><p>Block</p><p>Head</p>',
    )
  })

  it('keeps lists and flattens nested markup inside items', () => {
    expect(sanitizeHtml('<ul><li><b>One</b></li><li>Two</li></ul><ol><li>First</li></ol>')).toBe(
      '<ul><li><strong>One</strong></li><li>Two</li></ul><ol><li>First</li></ol>',
    )
  })

  it('treats an editor with only empty paragraphs as empty', () => {
    expect(sanitizeHtml('<p><br></p><p></p>')).toBe('')
    expect(sanitizeHtml('')).toBe('')
  })

  it('keeps empty paragraphs between text and trims them at the ends', () => {
    expect(sanitizeHtml('<p></p><p>A</p><p><br></p><p>B</p><p></p>')).toBe(
      '<p>A</p><p><br></p><p>B</p>',
    )
  })

  it('converts to plain text with paragraphs, line breaks, and optional list markers', () => {
    const html = '<p>First <strong>para</strong></p><p>Line<br>break</p><ul><li>A</li><li>B</li></ul><ol><li>X</li></ol>'
    expect(toPlainText(html)).toBe('First para\n\nLine\nbreak\n\nA\nB\n\nX')
    expect(toPlainText(html, { listMarkers: true })).toBe(
      'First para\n\nLine\nbreak\n\n- A\n- B\n\n1. X',
    )
  })

  it('returns legacy plain text unchanged', () => {
    expect(toPlainText('Just text\n\nTwo')).toBe('Just text\n\nTwo')
  })
})
