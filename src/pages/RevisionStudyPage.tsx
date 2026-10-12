import { useParams } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useRevision } from '../features/revision/RevisionContext'
import StudyView from '../features/revision/StudyView'
import { revisionSubjects } from '../features/revision/subjects/appliedMaths'

function RevisionStudyPage() {
  useDocumentTitle('Revision: today')
  const { stored, plan, today, actions } = useRevision()
  const { date } = useParams()

  if (!plan) {
    return <p role="alert">This plan could not be built. Open the Calendar and use Change setup to check the dates and study days.</p>
  }
  return <StudyView stored={stored} plan={plan} catalog={revisionSubjects} today={today} actions={actions} date={date} />
}

export default RevisionStudyPage
