import type { SaveStatus as SaveStatusValue } from '../useActiveEssay'

interface SaveStatusProps {
  status: SaveStatusValue
  onRetry: () => void
}

const messages: Record<Exclude<SaveStatusValue, 'error'>, string> = {
  saved: 'All changes saved on this device.',
  saving: 'Saving…',
  unsaved: 'Unsaved changes…',
}

function SaveStatus({ status, onRetry }: SaveStatusProps) {
  if (status === 'error') {
    return (
      <p className="save-status save-status-error" role="alert">
        Could not save. Your text is still on the screen, so keep this tab open.{' '}
        <button type="button" className="button-link" onClick={onRetry}>
          Try saving again
        </button>
      </p>
    )
  }

  return <p className="save-status">{messages[status]}</p>
}

export default SaveStatus
