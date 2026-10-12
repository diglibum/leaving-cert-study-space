import { useCallback, useEffect, useRef, useState } from 'react'
import {
  essayRepository,
  type EssayRepository,
  type EssayUpdate,
} from '../../storage/essayRepository'
import { trackWrite } from '../../storage/pendingWrites'
import { requestPersistentStorage } from '../../storage/persistence'
import type { Essay, EssayStep, EssayVersionReason } from '../essays/types'

export const AUTOSAVE_DELAY_MS = 600

export type LoadState = 'loading' | 'ready' | 'error'
export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error'

// Keeps the active essay in React state for instant typing and writes changes
// to IndexedDB in order: after a short pause, when the field loses focus, when
// the step changes, and when the page is hidden or closed.
export function useActiveEssay(repository: EssayRepository = essayRepository) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [essay, setEssay] = useState<Essay | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [startFailed, setStartFailed] = useState(false)
  const pending = useRef<EssayUpdate>({})
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    repository.getActive().then(
      (found) => {
        if (cancelled) return
        setEssay(found ?? null)
        setLoadState('ready')
      },
      () => {
        if (!cancelled) setLoadState('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository])

  const flush = useCallback(
    (versionReason?: EssayVersionReason): Promise<void> => {
      clearTimeout(timer.current)
      const patch = pending.current
      const hasChanges = Object.keys(patch).length > 0
      if (!hasChanges && !versionReason) return queue.current

      pending.current = {}
      setSaveStatus('saving')
      queue.current = queue.current
        .then(async () => {
          if (hasChanges) await repository.update(patch)
          if (versionReason) await repository.recordVersion(versionReason)
          if (Object.keys(pending.current).length === 0) setSaveStatus('saved')
        })
        .catch(() => {
          pending.current = { ...patch, ...pending.current }
          setSaveStatus('error')
        })
      return trackWrite(queue.current)
    },
    [repository],
  )

  const change = useCallback(
    (patch: EssayUpdate) => {
      setEssay((current) => (current ? { ...current, ...patch } : current))
      pending.current = { ...pending.current, ...patch }
      setSaveStatus('unsaved')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS)
    },
    [flush],
  )

  const changeStep = useCallback(
    (step: EssayStep) => {
      change({ step })
      void flush('step-change')
    },
    [change, flush],
  )

  const start = useCallback(
    async (questionId: string) => {
      setStartFailed(false)
      void requestPersistentStorage()
      try {
        setEssay(await repository.start(questionId))
        setSaveStatus('saved')
      } catch {
        setStartFailed(true)
      }
    },
    [repository],
  )

  const saveNow = useCallback(() => void flush(), [flush])

  useEffect(() => {
    const save = () => void flush()
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [flush])

  return {
    loadState,
    essay,
    saveStatus,
    startFailed,
    start,
    change,
    changeStep,
    saveNow,
  }
}
