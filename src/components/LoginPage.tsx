import { useState, type FormEvent } from 'react'
import { ArrowRight, Landmark, ShieldCheck } from 'lucide-react'
import { demoUsers } from '../data'
import type { DemoUser } from '../types'
import './LoginPage.css'

type LoginPageProps = {
  onLogin: (user: DemoUser) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const user = demoUsers.find(candidate =>
      candidate.email === email.trim().toLowerCase() && candidate.password === password
    )

    if (!user) {
      setError('Those details do not match a demo account. Choose a profile below to fill its credentials.')
      return
    }

    setError(null)
    onLogin(user)
  }

  function selectDemoUser(user: DemoUser) {
    setEmail(user.email)
    setPassword(user.password)
    setError(null)
  }

  return (
    <main className="login-page">
      <section aria-label="Toss demo sign in" className="login-shell">
        <div className="login-intro">
          <a aria-label="Toss home" className="login-brand" href="/">
            <Landmark aria-hidden />
            <span>Toss</span>
          </a>
          <div className="login-intro-copy">
            <p className="login-eyebrow">Your money, in view</p>
            <h1>A calmer way to stay on top of your finances.</h1>
            <p className="login-description">
              Sign in to see your accounts, follow your spending, and manage your money in one place.
            </p>
          </div>
          <p className="login-security">
            <ShieldCheck aria-hidden size={17} />
            Demo experience — no real accounts or payments
          </p>
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <p className="login-eyebrow">Welcome back</p>
            <h2>Sign in to Toss</h2>
            <p className="muted">Use one of the demo profiles to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                autoComplete="username"
                id="login-email"
                onChange={event => {
                  setEmail(event.target.value)
                  setError(null)
                }}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                autoComplete="current-password"
                id="login-password"
                onChange={event => {
                  setPassword(event.target.value)
                  setError(null)
                }}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" type="submit">
              Sign in
              <ArrowRight aria-hidden size={17} />
            </button>
          </form>

          <div className="demo-users">
            <div className="demo-users-heading">
              <h3>Try a demo profile</h3>
              <span>Credentials fill automatically</span>
            </div>
            <ul className="demo-user-list">
              {demoUsers.map(user => (
                <li key={user.id}>
                  <button className="demo-user" onClick={() => selectDemoUser(user)} type="button">
                    <span aria-hidden className="profile-avatar">
                      {user.name.split(' ').map(part => part[0]).join('')}
                    </span>
                    <span className="demo-user-details">
                      <span className="demo-user-name">{user.name}</span>
                      <span className="demo-user-email">{user.email}</span>
                    </span>
                    <span aria-hidden className="demo-user-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="demo-password-note">Demo passwords: maya123 · lucas123 · amelia123</p>
          </div>
        </div>
      </section>
    </main>
  )
}
