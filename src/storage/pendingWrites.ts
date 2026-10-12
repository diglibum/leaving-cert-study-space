const inFlight = new Set<Promise<unknown>>()

// Lets other pages wait for an autosave that started as the learner navigated
// away, so they never read data that is about to change.
export function trackWrite<T>(write: Promise<T>): Promise<T> {
  inFlight.add(write)
  const done = () => inFlight.delete(write)
  write.then(done, done)
  return write
}

export async function waitForWrites(): Promise<void> {
  await Promise.allSettled([...inFlight])
}
