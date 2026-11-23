'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import './learner-account.css'

type Language = 'twi' | 'english' | 'bilingual'

export function LearnerSignup() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('bilingual')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setMessage('')
    if (password !== confirm) {
      setMessage('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/learner-registration', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), password, preferredLanguage }),
      })
      if (response.status === 503) {
        setMessage('Account creation is not open yet. You can still use the free Academy lessons without an account.')
      } else if (response.status === 400) {
        setMessage('Check your name, email, and password. Passwords must have at least 12 characters.')
      } else if (!response.ok) {
        setMessage('We could not create this account. Please try again later.')
      } else {
        setSuccess(true)
        setMessage('Registration request accepted. Check your email for the verification link before signing in.')
      }
    } catch {
      setMessage('Unable to reach the Academy. Try again later.')
    } finally {
      setBusy(false)
      setPassword('')
      setConfirm('')
    }
  }

  return <div className="learner-auth-card">
    <span className="eyebrow">KASA ACADEMY · LEARNERS</span>
    <h1>Create your free account</h1>
    <p>Signup is in a closed development preview. Lessons and Studio remain available without an account.</p>
    {!success && <form onSubmit={submit}>
      <label>Full name<input required minLength={2} maxLength={100} autoComplete="name"
        value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
      <label>Email<input required type="email" maxLength={254} autoComplete="email"
        value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password"
        value={password} onChange={e => setPassword(e.target.value)} /></label>
      <label>Confirm password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password"
        value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
      <label>Preferred language
        <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value as Language)}>
          <option value="bilingual">Twi and English</option>
          <option value="twi">Twi / Akan</option>
          <option value="english">English</option>
        </select>
      </label>
      <button type="submit" className="button button-primary" disabled={busy}>
        {busy ? 'Processing…' : 'Create account (development preview)'}
      </button>
    </form>}
    {message && <p role={success ? 'status' : 'alert'} className="learner-auth-message">{message}</p>}
    <p><Link href="/login">Already registered? Sign in →</Link></p>
    <p><Link href="/learn">Browse free lessons without an account →</Link></p>
  </div>
}
