import { useState } from 'react'
import { Link } from 'react-router'
import { getLastBackupAt, isBackupDue } from '../../../storage/backupReminder'

function BackupReminder() {
  const [{ lastBackupAt, due }] = useState(() => {
    const last = getLastBackupAt()
    return { lastBackupAt: last, due: isBackupDue(last, Date.now()) }
  })
  if (!due) return null

  return (
    <p className="backup-reminder">
      {lastBackupAt === null
        ? 'You have not downloaded a backup yet. '
        : 'Your last backup is more than a week old. '}
      Your essay lives only in this browser, so keep a copy:{' '}
      <Link to="/backup">go to Backup</Link>.
    </p>
  )
}

export default BackupReminder
