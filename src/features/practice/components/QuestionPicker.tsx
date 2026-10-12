import { questions } from '../../questions/questions'
import type { EssayQuestion } from '../../questions/types'

interface QuestionPickerProps {
  currentId?: string | null
  onSelect: (question: EssayQuestion) => void
}

const years = [...new Set(questions.map((question) => question.year))].sort(
  (a, b) => b - a,
)

function QuestionPicker({ currentId = null, onSelect }: QuestionPickerProps) {
  return (
    <div className="question-picker">
      {years.map((year) => {
        const group = questions
          .filter((question) => question.year === year)
          .sort((a, b) => a.questionNumber - b.questionNumber)
        const additional = group.every((question) => question.tier === 'additional')

        return (
          <section key={year} aria-labelledby={`questions-${year}`}>
            <h3 id={`questions-${year}`}>
              {year}
              {additional ? ' · additional practice' : ''}
            </h3>
            <ul className="question-list">
              {group.map((question) => (
                <li key={question.id} className="question-card">
                  <p className="question-task">{question.task}</p>
                  <p className="question-meta">
                    Paper 1, question {question.questionNumber} · theme:{' '}
                    {question.theme}
                  </p>
                  {question.id === currentId ? (
                    <p className="question-current">Current question</p>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      aria-label={`Choose this question: ${year}, question ${question.questionNumber}`}
                      onClick={() => onSelect(question)}
                    >
                      Choose this question
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default QuestionPicker
