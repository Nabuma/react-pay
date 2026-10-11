import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.css'

type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-screen" role="alert">
        <h1>Something went wrong</h1>
        <p className="muted">An unexpected error occurred. Your data is safe.</p>
        <button className="button button-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    )
  }
}
