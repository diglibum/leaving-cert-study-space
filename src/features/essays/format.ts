const dateTime = new Intl.DateTimeFormat('en-IE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(time: number | string): string {
  const date = new Date(time)
  return Number.isNaN(date.getTime()) ? 'unknown time' : dateTime.format(date)
}
