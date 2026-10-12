const KEY = 'personal-essay-trainer:last-backup-at'

export const BACKUP_REMINDER_DAYS = 7

export function getLastBackupAt(): number | null {
  try {
    const value = Number(window.localStorage.getItem(KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

export function setLastBackupAt(time: number): void {
  try {
    window.localStorage.setItem(KEY, String(time))
  } catch {
    // The reminder is optional, so a blocked localStorage is not an error.
  }
}

export function isBackupDue(lastBackupAt: number | null, now: number): boolean {
  if (lastBackupAt === null) return true
  return now - lastBackupAt > BACKUP_REMINDER_DAYS * 24 * 60 * 60 * 1000
}
