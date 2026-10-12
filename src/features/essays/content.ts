import { normalizeChecklist, emptyChecklist } from '../feedback/checklist'
import { normalizeParagraphTags } from '../feedback/paragraphs'
import { toPlainText } from './richText'
import type { EssayContent } from './types'

export const contentFields = ['material', 'direction', 'plan', 'draft', 'selfCheck'] as const

export type TextField = (typeof contentFields)[number]

export function emptyContent(): EssayContent {
  return {
    material: '',
    direction: '',
    plan: '',
    draft: '',
    selfCheck: '',
    checklist: emptyChecklist(),
    paragraphTags: {},
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

// Accepts older or partial records and returns complete content.
export function normalizeContent(value: Partial<Record<keyof EssayContent, unknown>>): EssayContent {
  return {
    material: text(value.material),
    direction: text(value.direction),
    plan: text(value.plan),
    draft: text(value.draft),
    selfCheck: text(value.selfCheck),
    checklist: normalizeChecklist(value.checklist),
    paragraphTags: normalizeParagraphTags(value.paragraphTags),
  }
}

export function pickContent(source: EssayContent): EssayContent {
  return normalizeContent(source)
}

export function hasContent(content: EssayContent): boolean {
  return (
    contentFields.some((field) => toPlainText(content[field]).trim() !== '') ||
    Object.values(content.checklist).some(
      (answer) => answer.rating !== null || answer.note.trim() !== '',
    )
  )
}

function stable(content: EssayContent): string {
  const { paragraphTags, ...rest } = normalizeContent(content)
  return JSON.stringify([rest, Object.entries(paragraphTags).sort()])
}

export function sameContent(a: EssayContent, b: EssayContent): boolean {
  return stable(a) === stable(b)
}
