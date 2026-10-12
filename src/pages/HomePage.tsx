import { Link } from 'react-router'
import TodayCard from '../features/revision/TodayCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle()

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Leaving Certificate · 2027</p>
        <h1 id="page-title">Leaving Cert Study Space</h1>
        <p className="hero-message">Plan it. Practise it. Check it.</p>
        <p className="hero-description">
          A private place to prepare for the Leaving Certificate: a daily
          revision plan for your subjects with practice you can check on the
          spot, and step-by-step practice for the English personal essay.
          Everything stays in this browser.
        </p>
        <p className="practice-note">
          Suggested routine: open Today, do the blocks in order, and mark each
          one as done.
        </p>
      </section>

      <TodayCard />

      <section className="practice-overview" aria-labelledby="areas-title">
        <div className="section-heading">
          <p className="eyebrow">What is here</p>
          <h2 id="areas-title">Two ways to prepare</h2>
        </div>
        <ul className="area-cards">
          <li>
            <h3>Revision planner</h3>
            <p>
              Choose your subjects, exam date and study days. You get a plan
              for every day, with steps for each block, exercises you can check
              in the app, real past paper pointers, and a calendar. Applied
              Mathematics and Russian (Higher) are ready.
            </p>
            <p>
              <Link className="button" to="/revision">
                Open revision
              </Link>
            </p>
          </li>
          <li>
            <h3>English personal essay</h3>
            <p>
              Choose a real past exam question and work through five steps at
              your own pace: collect ideas, choose your focus, plan, write and
              check. Move from "what happened" to "why it matters to me".
            </p>
            <p>
              <Link className="button button-secondary" to="/practice">
                Go to essay practice
              </Link>
            </p>
          </li>
        </ul>
        <p>
          Use Essay history to see earlier versions of your essay and the
          Backup page to download a copy of everything. Essay AI export
          prepares text you can copy yourself; the app never sends anything.
        </p>
      </section>
    </>
  )
}

export default HomePage
