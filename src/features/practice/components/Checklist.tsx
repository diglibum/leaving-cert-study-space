import {
  checklistItems,
  countAnswered,
  criteria,
  criterionLabels,
  ratingLabels,
  ratings,
  type Checklist as ChecklistValue,
  type ChecklistAnswer,
} from '../../feedback/checklist'

interface ChecklistProps {
  checklist: ChecklistValue
  onChange: (checklist: ChecklistValue) => void
  onBlur: () => void
}

function Checklist({ checklist, onChange, onBlur }: ChecklistProps) {
  function setAnswer(id: string, change: Partial<ChecklistAnswer>) {
    onChange({ ...checklist, [id]: { ...checklist[id], ...change } })
  }

  return (
    <section className="self-check-section" aria-labelledby="checklist-heading">
      <h3 id="checklist-heading">2. Checklist</h3>
      <p>
        Answer honestly. For each answer, copy a sentence from your essay or
        write a short note as evidence.
      </p>
      <p role="status">
        {countAnswered(checklist)} of {checklistItems.length} answered.
      </p>

      {criteria.map((criterion) => (
        <div key={criterion} className="criterion">
          <h4>{criterionLabels[criterion].name}</h4>
          <p className="criterion-help">{criterionLabels[criterion].help}</p>
          {checklistItems
            .filter((item) => item.criterion === criterion)
            .map((item) => (
              <fieldset key={item.id} className="checklist-item">
                <legend>{item.prompt}</legend>
                <div className="rating-options">
                  {ratings.map((rating) => (
                    <label key={rating}>
                      <input
                        type="radio"
                        name={item.id}
                        value={rating}
                        checked={checklist[item.id]?.rating === rating}
                        onChange={() => {
                          setAnswer(item.id, { rating })
                          onBlur()
                        }}
                      />
                      {ratingLabels[rating]}
                    </label>
                  ))}
                </div>
                <label className="evidence-label" htmlFor={`${item.id}-note`}>
                  Evidence or note
                </label>
                <input
                  id={`${item.id}-note`}
                  type="text"
                  className="evidence-input"
                  value={checklist[item.id]?.note ?? ''}
                  onChange={(event) => setAnswer(item.id, { note: event.target.value })}
                  onBlur={onBlur}
                />
              </fieldset>
            ))}
        </div>
      ))}
    </section>
  )
}

export default Checklist
