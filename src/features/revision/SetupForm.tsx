import { useEffect, useRef, useState, type FormEvent } from 'react'
import { defaultExamDate, parseIsoDate } from './dates'
import { MAX_DAY_MINUTES, validateRevisionSetup } from './planner'
import { revisionSubjects } from './subjects/appliedMaths'
import type { Confidence, CourseLevel, RevisionSetup, Weekday } from './types'

const weekdays: { day: Weekday; label: string }[] = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
]

const defaultMinutes: Record<Weekday, string> = { 0: '0', 1: '45', 2: '45', 3: '45', 4: '45', 5: '45', 6: '90' }

interface SubjectState {
  selected: boolean
  level: CourseLevel
  confidence: Confidence
}

export interface SetupInitial {
  setup: RevisionSetup
  projectDueDate: string | null
}

interface Props {
  initial: SetupInitial | null
  today: string
  onSubmit: (setup: RevisionSetup, projectDueDate: string | null) => Promise<void>
  onCancel?: () => void
}

function SetupForm({ initial, today, onSubmit, onCancel }: Props) {
  const [subjects, setSubjects] = useState<Record<string, SubjectState>>(() =>
    Object.fromEntries(
      revisionSubjects.map((subject, position) => {
        const saved = initial?.setup.subjects.find((entry) => entry.subjectId === subject.id)
        const state: SubjectState = saved
          ? { selected: true, level: saved.level, confidence: saved.confidence }
          : { selected: !initial && position === 0, level: 'higher', confidence: 'okay' }
        return [subject.id, state]
      }),
    ),
  )
  const [startDate, setStartDate] = useState(initial?.setup.startDate ?? today)
  const [examDate, setExamDate] = useState(initial?.setup.examDate ?? defaultExamDate(today))
  const [minutes, setMinutes] = useState<Record<Weekday, string>>(() =>
    Object.fromEntries(
      weekdays.map(({ day }) => [
        day,
        initial ? String(initial.setup.minutesByWeekday[day] ?? 0) : defaultMinutes[day],
      ]),
    ) as Record<Weekday, string>,
  )
  const [projectDate, setProjectDate] = useState(initial?.projectDueDate ?? '')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errors.length > 0) errorRef.current?.focus()
  }, [errors])

  const hasProject = subjects['applied-maths']?.selected === true
  const hasRussian = subjects['russian']?.selected === true

  function updateSubject(id: string, changes: Partial<SubjectState>) {
    setSubjects((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const problems: string[] = []
    const minutesByWeekday: RevisionSetup['minutesByWeekday'] = {}
    for (const { day, label } of weekdays) {
      const text = minutes[day].trim()
      const value = text === '' ? 0 : Number(text)
      if (!Number.isFinite(value) || value < 0 || value > MAX_DAY_MINUTES) {
        problems.push(`${label}: enter minutes between 0 and ${MAX_DAY_MINUTES}.`)
      } else {
        minutesByWeekday[day] = Math.round(value)
      }
    }
    const setup: RevisionSetup = {
      startDate,
      examDate,
      subjects: revisionSubjects.flatMap((subject) =>
        subjects[subject.id].selected
          ? [{ subjectId: subject.id, level: subjects[subject.id].level, confidence: subjects[subject.id].confidence }]
          : [],
      ),
      minutesByWeekday,
    }
    problems.push(...validateRevisionSetup(setup, revisionSubjects).filter((message) => !problems.includes(message)))
    if (hasProject && projectDate !== '' && parseIsoDate(projectDate) === null) problems.push('Choose a valid project date, or leave it empty.')
    if (problems.length > 0) {
      setErrors(problems)
      return
    }
    setErrors([])
    setSaving(true)
    try {
      await onSubmit(setup, !hasProject || projectDate === '' ? null : projectDate)
    } catch {
      setErrors(['Your plan could not be saved. Please try again.'])
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="revision-form" onSubmit={(event) => void submit(event)} noValidate>
      <h2 id="setup-heading">{initial ? 'Change your setup' : 'Set up your revision'}</h2>
      <p>
        Tell the planner what you study and how much time you have. It builds a plan with
        more time for the subjects you feel weaker in. You can change this at any time and
        your progress on topics is kept.
      </p>

      {errors.length > 0 && (
        <div ref={errorRef} role="alert" tabIndex={-1} className="form-errors">
          <p>Please fix the following:</p>
          <ul>
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset>
        <legend>Subjects</legend>
        {revisionSubjects.map((subject) => {
          const state = subjects[subject.id]
          return (
            <div key={subject.id} className="subject-row">
              <label>
                <input
                  type="checkbox"
                  checked={state.selected}
                  onChange={(event) => updateSubject(subject.id, { selected: event.target.checked })}
                />{' '}
                {subject.name}
              </label>
              {state.selected && (
                <>
                  <label>
                    Level{' '}
                    <select
                      value={state.level}
                      onChange={(event) => updateSubject(subject.id, { level: event.target.value as CourseLevel })}
                    >
                      <option value="higher">Higher</option>
                      <option value="ordinary">Ordinary</option>
                    </select>
                  </label>
                  <label>
                    How confident do you feel?{' '}
                    <select
                      value={state.confidence}
                      onChange={(event) => updateSubject(subject.id, { confidence: event.target.value as Confidence })}
                    >
                      <option value="weak">Weak: I need a lot of practice</option>
                      <option value="okay">Okay: some topics need work</option>
                      <option value="strong">Strong: I mostly just need to keep it fresh</option>
                    </select>
                  </label>
                </>
              )}
            </div>
          )
        })}
      </fieldset>

      <fieldset>
        <legend>Dates</legend>
        <p className="field-hint">The plan ends the day before your first exam. The default is 1 June.</p>
        {hasRussian && (
          <p className="field-hint">
            The Russian oral exam is held before the written papers, so its topics come early in the plan. Check
            the oral date with your school.
          </p>
        )}
        <label className="field-label" htmlFor="revision-start">
          Start date
        </label>
        <input id="revision-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <label className="field-label" htmlFor="revision-exam">
          First exam date
        </label>
        <input id="revision-exam" type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
      </fieldset>

      <fieldset>
        <legend>Study time on each day</legend>
        <p className="field-hint">Minutes you can really study. Use 0 for a rest day.</p>
        {weekdays.map(({ day, label }) => (
          <div key={day} className="minutes-row">
            <label htmlFor={`minutes-${day}`}>{label}</label>
            <input
              id={`minutes-${day}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_DAY_MINUTES}
              step={5}
              value={minutes[day]}
              onChange={(event) => setMinutes((current) => ({ ...current, [day]: event.target.value }))}
            />
          </div>
        ))}
      </fieldset>

      {hasProject && (
        <fieldset>
          <legend>Modelling project (optional)</legend>
          <p className="field-hint">
            Applied Mathematics has a project worth 20%. The brief is issued in November 2026. Add
            the due date your school gives you.
          </p>
          <label className="field-label" htmlFor="revision-project">
            Project due date
          </label>
          <input
            id="revision-project"
            type="date"
            value={projectDate}
            onChange={(event) => setProjectDate(event.target.value)}
          />
        </fieldset>
      )}

      <p className="step-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create my plan'}
        </button>
        {onCancel && (
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </p>
    </form>
  )
}

export default SetupForm
