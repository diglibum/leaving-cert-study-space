import type { Checklist } from '../feedback/checklist'
import type { ParagraphTags } from '../feedback/paragraphs'

export const essaySteps = [
  'material',
  'direction',
  'plan',
  'draft',
  'self-check',
] as const

export type EssayStep = (typeof essaySteps)[number]

export const hintLevels = ['full', 'some', 'light', 'none'] as const

export type HintLevel = (typeof hintLevels)[number]

export interface EssayContent {
  material: string
  direction: string
  plan: string
  draft: string
  selfCheck: string
  checklist: Checklist
  paragraphTags: ParagraphTags
}

// The app supports a single active essay for now.
export const ACTIVE_ESSAY_ID = 'active'

export interface Essay extends EssayContent {
  id: typeof ACTIVE_ESSAY_ID
  questionId: string | null
  step: EssayStep
  hintLevel: HintLevel
  createdAt: number
  updatedAt: number
}

export type EssayVersionReason =
  | 'autosave'
  | 'step-change'
  | 'manual'
  | 'restore-point'

export interface EssayVersion extends EssayContent {
  id: number
  essayId: typeof ACTIVE_ESSAY_ID
  step: EssayStep
  reason: EssayVersionReason
  createdAt: number
}

// A finished or replaced essay kept together with its version history.
export interface ArchivedEssay {
  id: number
  archivedAt: number
  essay: Essay
  versions: EssayVersion[]
}
