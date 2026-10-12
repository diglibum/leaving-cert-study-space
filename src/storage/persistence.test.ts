import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestPersistentStorage } from './persistence'

function stubStorage(storage: unknown) {
  vi.stubGlobal('navigator', { ...navigator, storage })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('requestPersistentStorage', () => {
  it('returns false when the browser has no persistence API', async () => {
    stubStorage(undefined)

    expect(await requestPersistentStorage()).toBe(false)
  })

  it('does not ask again when storage is already persistent', async () => {
    const persist = vi.fn()
    stubStorage({ persisted: async () => true, persist })

    expect(await requestPersistentStorage()).toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it('returns the browser decision otherwise', async () => {
    stubStorage({ persisted: async () => false, persist: async () => false })

    expect(await requestPersistentStorage()).toBe(false)
  })

  it('returns false instead of throwing when the request fails', async () => {
    stubStorage({
      persisted: async () => false,
      persist: async () => {
        throw new Error('blocked')
      },
    })

    expect(await requestPersistentStorage()).toBe(false)
  })
})
