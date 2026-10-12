import { useId, useState } from 'react'
import { buildCheckPrompt, buildWritingCheckPrompt, wordCount, type CheckProfile } from './problems/aiCheck'
import { CopyPrompt } from './CopyPrompt'

interface Props {
  /** `writing` is for language subjects: a text to be checked for language, not working to be checked line by line. */
  kind?: 'working' | 'writing'
  subjectName?: string
  profiles?: readonly CheckProfile[]
}

/** For any work, such as a past paper part or a piece of writing: type the question and your answer, then copy a ready prompt. */
export function AiCheckBox({ kind = 'working', subjectName = 'language', profiles = [] }: Props) {
  const [question, setQuestion] = useState('')
  const [working, setWorking] = useState('')
  const questionId = useId()
  const workingId = useId()
  const profileId = useId()
  const [profileKey, setProfileKey] = useState('')
  const profile = profiles.find((entry) => entry.id === profileKey)
  const writing = kind === 'writing'

  return (
    <details className="ai-check">
      <summary>{writing ? 'Check my own writing with an AI' : 'Check my own working with an AI'}</summary>
      <p className="field-hint">
        {writing
          ? 'Paste the task and your text, or a transcript of what you said aloud. '
          : 'Paste the question and type or paste your working. '}
        The app builds a prompt that asks for feedback without a full solution or a mark. You copy it by hand; the
        app never contacts an AI.
      </p>
      {writing && profiles.length > 0 && (
        <>
          <label htmlFor={profileId}>Kind of task</label>
          <select id={profileId} value={profileKey} onChange={(event) => setProfileKey(event.target.value)}>
            <option value="">Any writing</option>
            {profiles.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </>
      )}
      <label htmlFor={questionId}>{writing ? 'Task' : 'Question'}</label>
      <textarea id={questionId} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
      <label htmlFor={workingId}>{writing ? 'My text' : 'My working and answer'}</label>
      <textarea id={workingId} rows={6} value={working} onChange={(event) => setWorking(event.target.value)} />
      {writing && (
        <p className="field-hint" role="status">
          {wordCount(working)} {wordCount(working) === 1 ? 'word' : 'words'}
          {profile?.words ? `, target about ${profile.words}` : ''}
        </p>
      )}
      <CopyPrompt
        text={
          writing
            ? buildWritingCheckPrompt({ task: question, text: working, profile }, subjectName)
            : buildCheckPrompt({ question, working })
        }
      />
    </details>
  )
}
