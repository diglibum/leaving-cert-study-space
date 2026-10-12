import EssayWorkspace from '../features/practice/components/EssayWorkspace'
import QuestionPicker from '../features/practice/components/QuestionPicker'
import { useActiveEssay } from '../features/practice/useActiveEssay'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function PracticePage() {
  useDocumentTitle('Essay practice')
  const {
    loadState,
    essay,
    saveStatus,
    startFailed,
    start,
    change,
    changeStep,
    saveNow,
  } = useActiveEssay()

  return (
    <div className="practice">
      <h1 id="page-title">Essay practice</h1>

      {loadState === 'loading' && <p role="status">Loading your essay…</p>}

      {loadState === 'error' && (
        <p role="alert">
          Your essay could not be loaded from this browser. Local storage may be
          blocked, for example in private browsing. Reload the page to try again.
        </p>
      )}

      {loadState === 'ready' && !essay && (
        <section aria-labelledby="choose-heading">
          <h2 id="choose-heading">Choose a question</h2>
          <p>
            These are real personal essay questions from past Leaving
            Certificate Higher Level exams. Pick one to start. You can change
            it later without losing your work.
          </p>
          {startFailed && (
            <p role="alert">
              Could not start your essay. Local storage may be blocked in this
              browser.
            </p>
          )}
          <QuestionPicker onSelect={(question) => void start(question.id)} />
        </section>
      )}

      {loadState === 'ready' && essay && (
        <EssayWorkspace
          essay={essay}
          saveStatus={saveStatus}
          onChange={change}
          onChangeStep={changeStep}
          onSaveNow={saveNow}
        />
      )}
    </div>
  )
}

export default PracticePage
