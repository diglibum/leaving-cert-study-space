// Essay text is stored either as legacy plain text or as a small, sanitised
// HTML subset: paragraphs (<p>), <br>, <strong>, <em>, <ul>, <ol>, and <li>.
// Everything that reads essay text for counting, paragraph review, or export should go
// through toPlainText() so both forms work.

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'SECTION',
  'ARTICLE', 'HEADER', 'FOOTER', 'FIGURE', 'TABLE', 'LI', 'UL', 'OL',
])
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'])
const ELEMENT = 1
const TEXT = 3

export function isRichText(value: string): boolean {
  return /^\s*<(p|ul|ol)(\s|>)/i.test(value)
}

function parse(html: string): HTMLElement {
  return new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Turns legacy plain text into paragraphs, so old essays open in the editor.
export function plainTextToHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim() !== '')
  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function appendInlineNode(child: Node, target: Node, doc: Document): void {
  if (child.nodeType === TEXT) {
    target.appendChild(doc.createTextNode(child.textContent ?? ''))
  } else if (child.nodeType === ELEMENT) {
    const element = child as HTMLElement
    const tag = element.tagName
    if (SKIPPED_TAGS.has(tag)) return
    if (tag === 'BR') target.appendChild(doc.createElement('br'))
    else if (tag === 'B' || tag === 'STRONG') {
      appendInline(element, target.appendChild(doc.createElement('strong')), doc)
    } else if (tag === 'I' || tag === 'EM') {
      appendInline(element, target.appendChild(doc.createElement('em')), doc)
    } else appendInline(element, target, doc)
  }
}

function appendInline(source: Node, target: Node, doc: Document): void {
  for (const child of Array.from(source.childNodes)) appendInlineNode(child, target, doc)
}

function hasBlockDescendant(element: Element): boolean {
  return Array.from(element.querySelectorAll('*')).some((node) => BLOCK_TAGS.has(node.tagName))
}

function appendBlocks(source: Node, target: Node, doc: Document): void {
  let run: HTMLElement | null = null
  const flush = () => {
    run = null
  }
  const paragraph = () => {
    run ??= target.appendChild(doc.createElement('p'))
    return run
  }

  for (const child of Array.from(source.childNodes)) {
    if (child.nodeType === TEXT) {
      if ((child.textContent ?? '').trim() === '' && run === null) continue
      paragraph().appendChild(doc.createTextNode(child.textContent ?? ''))
      continue
    }
    if (child.nodeType !== ELEMENT) continue
    const element = child as HTMLElement
    const tag = element.tagName
    if (SKIPPED_TAGS.has(tag)) continue

    if (tag === 'UL' || tag === 'OL') {
      flush()
      const list = target.appendChild(doc.createElement(tag.toLowerCase()))
      for (const item of Array.from(element.querySelectorAll('li'))) {
        appendInline(item, list.appendChild(doc.createElement('li')), doc)
      }
    } else if (BLOCK_TAGS.has(tag)) {
      flush()
      if (hasBlockDescendant(element)) appendBlocks(element, target, doc)
      else appendInline(element, target.appendChild(doc.createElement('p')), doc)
    } else if (tag === 'BR') {
      paragraph().appendChild(doc.createElement('br'))
    } else {
      appendInlineNode(element, paragraph(), doc)
    }
  }
}

function isBlank(element: Element): boolean {
  return (element.textContent ?? '').trim() === '' && !element.querySelector('li')
}

// Returns clean HTML limited to the allowed tags, or '' when there is no text.
export function sanitizeHtml(html: string): string {
  const doc = document.implementation.createHTMLDocument('')
  const output = doc.createElement('div')
  appendBlocks(parse(html), output, doc)

  const blocks = Array.from(output.children)
  while (blocks.length > 0 && isBlank(blocks[0])) blocks.shift()
  while (blocks.length > 0 && isBlank(blocks[blocks.length - 1])) blocks.pop()
  if (blocks.length === 0) return ''

  return blocks
    .map((block) => {
      if (block.tagName === 'P' && isBlank(block)) return '<p><br></p>'
      return block.outerHTML
    })
    .join('')
}

// Value for the editor: legacy plain text becomes paragraphs.
export function toEditorHtml(value: string): string {
  return isRichText(value) ? sanitizeHtml(value) : plainTextToHtml(value)
}

export function toPlainText(value: string, options: { listMarkers?: boolean } = {}): string {
  if (!isRichText(value)) return value

  const root = parse(sanitizeHtml(value))
  const blocks = Array.from(root.children).map((block) => {
    if (block.tagName === 'UL' || block.tagName === 'OL') {
      return Array.from(block.children)
        .map((item, index) => {
          const marker = options.listMarkers
            ? block.tagName === 'UL'
              ? '- '
              : `${index + 1}. `
            : ''
          return marker + inlineText(item)
        })
        .join('\n')
    }
    return inlineText(block)
  })
  return blocks.join('\n\n')
}

function inlineText(node: Node): string {
  return Array.from(node.childNodes)
    .map((child) => {
      if (child.nodeType === TEXT) return child.textContent ?? ''
      return (child as HTMLElement).tagName === 'BR' ? '\n' : inlineText(child)
    })
    .join('')
}
