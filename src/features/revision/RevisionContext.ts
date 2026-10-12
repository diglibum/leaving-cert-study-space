import { useOutletContext } from 'react-router'
import type { PlanActions } from './planActions'
import type { StoredRevision } from './stored'
import type { RevisionPlan, RevisionSetup } from './types'

/** Shared by the revision pages, provided by the layout route in `RevisionPage`. */
export interface RevisionContextValue {
  stored: StoredRevision
  /** Null when the saved setup no longer produces a plan. */
  plan: RevisionPlan | null
  today: string
  actions: PlanActions
  saveSetup: (setup: RevisionSetup, projectDueDate: string | null) => Promise<void>
  runAction: (action: () => Promise<unknown>, success: string) => void
}

export function useRevision(): RevisionContextValue {
  return useOutletContext<RevisionContextValue>()
}
