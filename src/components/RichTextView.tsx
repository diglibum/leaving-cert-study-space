import type { ReactNode } from 'react'
import { toEditorHtml } from '../features/essays/richText'

function convert(node: Node, key: number): ReactNode {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return null
  const element = node as HTMLElement
  const children = Array.from(element.childNodes).map(convert)
  switch (element.tagName) {
    case 'P':
      return <p key={key}>{children}</p>
    case 'BR':
      return <br key={key} />
    case 'STRONG':
      return <strong key={key}>{children}</strong>
    case 'EM':
      return <em key={key}>{children}</em>
    case 'UL':
      return <ul key={key}>{children}</ul>
    case 'OL':
      return <ol key={key}>{children}</ol>
    case 'LI':
      return <li key={key}>{children}</li>
    default:
      return null
  }
}

// Read-only view of essay text. It builds React elements from the sanitised
// subset instead of inserting HTML.
function RichTextView({ value }: { value: string }) {
  const html = toEditorHtml(value)
  if (html === '') return <p>(empty)</p>
  const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
  return <div className="rich-view">{Array.from(root.childNodes).map(convert)}</div>
}

export default RichTextView
