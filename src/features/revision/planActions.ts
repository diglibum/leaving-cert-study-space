import type { ReviewOutcome } from './progress'

export interface PlanActions {
  complete: (date: string, index: number, review?: { topicId: string; outcome: ReviewOutcome }) => void
  reopen: (date: string, index: number) => void
  review: (topicId: string, outcome: ReviewOutcome) => void
}
