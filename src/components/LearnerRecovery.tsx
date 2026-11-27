'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './learner-account.css'

async function postJSON(path: string, data: Record<string, string>) {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response
}

/**
 * The backend deliberately does not disclose whether a learner email exists.
 * Transactional mail is not configured in this foundation, so this is a
 * development-only workflow until delivery + global throttling are ready.
 */
export function LearnerForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const response = await postJSON('/api/learners/forgot-password', { email: email.trim().toLowerCase() })
      if (response.status === 429) {
        setMessage('Too many requests. Please try again later.')
      } else {
        // Do not reveal whether the email address exists.
        setSubmitted(true)
      }
    } catch {
      setMessage('Unable to reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="learner-auth-card">
    <span className="eyebrow">ACCOUNT RECOVERY</span>
    <h1>Reset your password</h1>
    {submitted
      ? <p role="status">If an account exists for that email, password reset instructions will be sent when email delivery is configured.</p>
      : <>
        <p>Enter your learner email address to request a reset link.</p>
        <form onSubmit={submit}>
          <label>Email
            <input required type="email" autoComplete="email" maxLength={254}
              value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <button className="button button-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Request reset link'}
          </button>
        </form>
      </>}
    {message && <p role="alert" className="learner-auth-message">{message}</p>}
    <p><Link href="/login">Return to learner login →</Link></p>
    <small>Email delivery is currently in development and may not reach your inbox.</small>
  </div>
}

export function LearnerResetPassword({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (password.length < 16) {
      setMessage('Use a password with at least 16 characters.')
      return
    }
    if (password !== confirm) {
      setMessage('The passwords do not match.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const response = await postJSON('/api/learners/reset-password', { token, password })
      if (!response.ok) {
        setMessage('This reset link is invalid or expired. Please request a new one.')
        return
      }
      setDone(true)
      setPassword('')
      setConfirm('')
      router.replace('/reset-password')
    } catch {
      setMessage('Unable to reset the password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="learner-auth-card">
    <span className="eyebrow">ACCOUNT RECOVERY</span>
    <h1>Choose a new password</h1>
    {done
      ? <p role="status">Password updated. You can now sign in with your new password.</p>
      : token
        ? <form onSubmit={submit}>
            <label>New password
              <input required type="password" autoComplete="new-password" minLength={16}
                value={password} onChange={event => setPassword(event.target.value)} />
            </label>
            <label>Confirm new password
              <input required type="password" autoComplete="new-password" minLength={16}
                value={confirm} onChange={event => setConfirm(event.target.value)} />
            </label>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        : <p>No reset token was found. Request a new password reset email.</p>}
    {message && <p role="alert" className="learner-auth-message">{message}</p>}
    <p><Link href={done ? '/login' : '/forgot-password'}>{done ? 'Sign in →' : 'Request a new link →'}</Link></p>
  </div>
}
