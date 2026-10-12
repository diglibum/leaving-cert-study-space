// Asks the browser not to evict local data under storage pressure. Call it
// when the learner first saves, not on page load, because some browsers show
// a permission prompt.
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false

  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
