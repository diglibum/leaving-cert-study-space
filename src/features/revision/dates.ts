const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

/** Dates are plain `YYYY-MM-DD` strings handled in UTC so daylight saving never shifts a day. */
export function parseIsoDate(value: string): number | null {
  if (!ISO_DATE.test(value)) return null
  const time = Date.parse(`${value}T00:00:00Z`)
  if (Number.isNaN(time) || formatIsoDate(time) !== value) return null
  return time
}

export function formatIsoDate(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

export function addDays(time: number, days: number): number {
  return time + days * DAY_MS
}

export function weekdayOf(time: number): number {
  return new Date(time).getUTCDay()
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: number, to: number): number {
  return Math.round((to - from) / DAY_MS)
}

/** The Monday on or before the given day. */
export function startOfWeek(time: number): number {
  return addDays(time, -((weekdayOf(time) + 6) % 7))
}

/** Today's date in the learner's own time zone, as `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** The next 1 June on or after the given day (the default exam start). */
export function defaultExamDate(today: string): string {
  const year = Number(today.slice(0, 4))
  return today < `${year}-06-01` ? `${year}-06-01` : `${year + 1}-06-01`
}

export function formatPlanDate(value: string, withYear = false): string {
  const time = parseIsoDate(value)
  if (time === null) return value
  return new Date(time).toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  })
}
