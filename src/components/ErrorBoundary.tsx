import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

// Last-resort screen so an unexpected error never leaves a blank page. Saved
// essays are stored separately and are not affected.
class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="page-panel" role="alert">
        <h1>Something went wrong</h1>
        <p>
          The page could not be shown. Your saved essay is stored separately
          and should be safe. Reload the page to continue.
        </p>
        <button type="button" className="button" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </main>
    )
  }
}

export default ErrorBoundary
