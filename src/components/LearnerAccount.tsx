'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './learner-account.css'
import { useFragmentAuthToken } from '@/lib/use-fragment-auth-token'

type Learner = {
  id: number | string
  email: string
  displayName: string
  bio?: string | null
  preferredLanguage?: 'twi' | 'english' | 'bilingual' | null
}

async function jsonRequest(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const result: unknown = await response.json().catch(() => null)
  return { ok: response.ok, result }
}

function errorMessage(value: unknown, fallback: string): string {
  if (value && typeof value === 'object' && 'message' in value &&
      typeof value.message === 'string') return value.message
  return fallback
}

export function LearnerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    try {
      const { ok } = await jsonRequest('/api/learners/login', {
        method: 'POST', body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!ok) { setMessage('Email or password was not accepted. Ensure your account is verified.'); return }
      router.push('/profile')
      router.refresh()
    } catch { setMessage('Unable to sign in. Check your connection and retry.') }
    finally { setBusy(false); setPassword('') }
  }
  return <div className="learner-auth-card">
    <span className="eyebrow">YOUR KASA ACCOUNT</span>
    <h1>Welcome back.</h1>
    <p>Sign in using your verified Kasa Academy learner account. Administrator login remains separate.</p>
    <form onSubmit={submit}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <button className="button button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    {message && <p role="alert" className="learner-auth-message">{message}</p>}
    <p><Link href="/forgot-password">Forgot your password?</Link></p>
    <p><Link href="/learn">Continue learning without signing in →</Link></p>
    <small>Public registration is not enabled yet. Only approved development learner accounts can sign in during the G2 preview.</small>
  </div>
}

export function LearnerProfile() {
  const router = useRouter()
  const [learner, setLearner] = useState<Learner | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [language, setLanguage] = useState<'twi'|'english'|'bilingual'>('bilingual')
  const load = useCallback(async () => {
    try {
      const {ok,result} = await jsonRequest('/api/learners/me')
      const record = result && typeof result === 'object' && 'user' in result
        ? result.user : null
      if (ok && record && typeof record === 'object' && 'id' in record) {
        const found = record as Learner
        setLearner(found); setName(found.displayName || ''); setBio(found.bio || '')
        setLanguage(found.preferredLanguage || 'bilingual')
      } else setLearner(null)
    } catch { setMessage('Unable to retrieve your profile.'); setLearner(null) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!learner || busy) return
    setBusy(true); setMessage('')
    try {
      const {ok,result} = await jsonRequest('/api/learners/' + encodeURIComponent(String(learner.id)), {
        method: 'PATCH', body: JSON.stringify({ displayName: name.trim(), bio: bio.trim(), preferredLanguage: language }),
      })
      if (!ok) { setMessage(errorMessage(result,'Profile could not be saved.')); return }
      setMessage('Your profile was saved.')
      await load()
    } catch { setMessage('Unable to save right now. Try again.') }
    finally { setBusy(false) }
  }
  async function logout() {
    if (busy) return
    setBusy(true); setMessage('')
    try {
      const {ok} = await jsonRequest('/api/learners/logout',{method:'POST',body:'{}'})
      if (!ok) { setMessage('Logout failed. Please try again.'); return }
      setLearner(null); router.push('/login'); router.refresh()
    } catch { setMessage('Logout failed. Please check your connection.') }
    finally { setBusy(false) }
  }
  if (loading) return <div className="learner-auth-card"><p role="status">Loading learner profile…</p></div>
  if (!learner) return <div className="learner-auth-card">
    <h1>Sign in to manage your profile</h1><p>{message || 'You are not signed in as a learner.'}</p>
    <Link className="button button-primary" href="/login">Learner login</Link>
  </div>
  return <div className="learner-auth-card">
    <span className="eyebrow">LEARNER PROFILE</span>
    <h1>Your Kasa profile</h1>
    <p className="learner-email">Signed in as {learner.email}</p>
    <form onSubmit={save}>
      <label>Display name<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Short bio<textarea maxLength={600} rows={4} value={bio} onChange={e=>setBio(e.target.value)} /></label>
      <label>Preferred learning language
        <select value={language} onChange={e=>setLanguage(e.target.value as typeof language)}>
          <option value="bilingual">Twi and English</option><option value="twi">Twi / Akan</option><option value="english">English</option>
        </select>
      </label>
      <button className="button button-primary" disabled={busy}>{busy?'Saving…':'Save profile'}</button>
    </form>
    {message && <p role="status" className="learner-auth-message">{message}</p>}
    <button className="learner-logout" type="button" onClick={logout} disabled={busy}>Sign out</button>
    <p><Link href="/my-learning">Go to My learning →</Link></p>
    <small>Course completion is still browser-local during G2. Account-backed progress comes in G2.2.</small>
  </div>
}

export function LearnerVerify() {
  const token = useFragmentAuthToken()
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  async function submit(){
    if (busy || !token) return
    setBusy(true)
    try {
      const {ok} = await jsonRequest('/api/learner-verify-token', { method:'POST',body:JSON.stringify({ token }) })
      setMessage(ok ? 'Email verified. You may now sign in.' : 'This verification link is invalid or expired.')
    } catch {setMessage('Unable to verify. Please retry.')}
    finally {setBusy(false)}
  }
  return <div className="learner-auth-card">
    <h1>Verify your email</h1>
    <p>Confirm that you own the email address associated with your Kasa learner account.</p>
    {token ? <button className="button button-primary" disabled={busy} onClick={submit}>{busy?'Verifying…':'Verify email'}</button> : <p>Missing verification token.</p>}
    {message && <p role="status">{message}</p>}
    <p><Link href="/login">Go to learner login →</Link></p>
  </div>
}
