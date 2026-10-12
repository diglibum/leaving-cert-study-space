import { useCallback, useEffect, useState } from 'react'
import { waitForWrites } from '../storage/pendingWrites'

export type StoredDataState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T }

// Loads data from local storage after any in-flight autosave has finished.
export function useStoredData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<StoredDataState<T>>({ status: 'loading' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    waitForWrites()
      .then(load)
      .then(
        (data) => {
          if (!cancelled) setState({ status: 'ready', data })
        },
        () => {
          if (!cancelled) setState({ status: 'error' })
        },
      )
    return () => {
      cancelled = true
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((value) => value + 1), [])
  return { state, reload }
}
