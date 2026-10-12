import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <section className="page-panel" aria-labelledby="page-title">
      <h1 id="page-title">Page not found</h1>
      <p>
        This page does not exist. <Link to="/">Go to the home page</Link>.
      </p>
    </section>
  )
}

export default NotFoundPage
