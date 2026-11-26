/**
 * G2.4.6 bounded local HTTP logout test using ONE disposable learner.
 * Run with local Next.js server already running against kasa_academy_dev.
 * No real email, no changes to real accounts, no outbound mail.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const db = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const origin = new URL(process.env.G24_TEST_ORIGIN || 'http://localhost:3000')
assert(process.env.NODE_ENV !== 'production', 'Production mode denied')
assert(process.env.G24_ALLOW_LOCAL_LOGOUT_TEST === 'yes', 'Explicit local test approval required')
assert(localHosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
  db.username === 'kasa_dev', 'Dedicated local database required')
assert(origin.protocol === 'http:' && localHosts.has(origin.hostname) &&
  ['3000', '3001'].includes(origin.port) && origin.pathname === '/' &&
  !origin.search && !origin.hash && !origin.username && !origin.password,
  'Only local Next.js port 3000/3001 is permitted')
assert(process.env.PAYLOAD_SECRET && process.env.PAYLOAD_SECRET.length >= 32, 'Local secret missing')

// No cookie, token, reset token or full response body is printed.
const payload = await getPayload({ config })
const email = `g24-logout-${randomBytes(12).toString('hex')}@example.invalid`
const password = randomBytes(32).toString('hex')
let id: string | number | undefined
const endpoint = (path: string) => new URL(path, origin)

async function call(path: string, method: 'GET' | 'POST', cookie?: string, body?: object) {
  const response = await fetch(endpoint(path), {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      origin: origin.origin,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
    redirect: 'manual',
  })
  const setCookie = response.headers.get('set-cookie') || ''
  const status = response.status
  const json: unknown = await response.json().catch(() => null)
  return { status, ok: response.ok, setCookie, json }
}
function userMatches(json: unknown) {
  if (!json || typeof json !== 'object' || !('user' in json)) return false
  const user = json.user
  return Boolean(user && typeof user === 'object' && 'collection' in user &&
    'id' in user && user.collection === 'learners' && String(user.id) === String(id))
}
try {
  const created = await payload.create({
    collection: 'learners', overrideAccess: true, disableVerificationEmail: true,
    data: { email, password, displayName: 'Logout Test Fixture' },
  })
  id = created.id
  const record = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(record._verificationToken, 'No disposable verification token')
  await payload.verifyEmail({ collection: 'learners', token: record._verificationToken })

  const login = await call('/api/learners/login', 'POST', undefined, { email, password })
  assert(login.ok, `Disposable HTTP login failed: ${login.status}`)
  const cookieMatch = login.setCookie.match(/(?:^|,\s*)(payload-token|learners-token)=([^;,]+)/i)
  assert(cookieMatch, 'Learner cookie not found on login response')
  const cookie = `${cookieMatch[1]}=${cookieMatch[2]}`
  const before = await call('/api/learners/me', 'GET', cookie)
  assert(before.ok && userMatches(before.json), 'Authenticated /me failed before logout')
  console.log('PASS: authenticated learner cookie works before logout')

  const logout = await call('/api/learners/logout', 'POST', cookie, {})
  assert(logout.ok, `Logout endpoint rejected request: ${logout.status}`)
  // Observe cookies without printing any cookie values. Valid deletion can use
  // Max-Age=0, a negative Max-Age, or an Expires date in the past.
  const cookieDirectives = logout.setCookie.split(';').map(x => x.trim())
  const age = cookieDirectives.find(x => /^max-age\s*=/i.test(x))
  const expires = cookieDirectives.find(x => /^expires\s*=/i.test(x))
  const maxAgeValue = age ? Number(age.split('=').slice(1).join('=').trim()) : NaN
  const expirationDate = expires ? Date.parse(expires.slice(expires.indexOf('=') + 1).trim()) : NaN
  const cookieExpired = (Number.isFinite(maxAgeValue) && maxAgeValue <= 0) ||
    (Number.isFinite(expirationDate) && expirationDate < Date.now())
  const cookieName = cookie.split('=')[0]
  const clearsSameName = new RegExp('(?:^|,\\s*)' + cookieName.replace(/[.*+?^${}()|[\\]\\]/g, '\\  assert(/max-age=0|expires=thu, 01 jan 1970/i.test(logout.setCookie),
    'Logout did not visibly expire a cookie')
  console.log('PASS: logout endpoint clears a cookie')

  const after = await call('/api/learners/me', 'GET')
  assert(!userMatches(after.json), 'Session was available without cookie after logout')
  console.log('PASS: signed-out request has no learner session')

  const replay = await call('/api/learners/me', 'GET', cookie)
  if (userMatches(replay.json)) {
    console.log('SECURITY OBSERVATION: pre-logout cookie is STILL accepted by server; browser logout alone is not session revocation')
  } else {
    console.log('PASS: pre-logout cookie rejected after logout')
  }
  console.log('G2.4.6 LOCAL HTTP LOGOUT: COMPLETE (review server-side cookie replay observation)')') + '=', 'i').test(logout.setCookie)
  console.log('Logout HTTP status:', logout.status)
  console.log('Logout cookie metadata:', JSON.stringify({
    setCookiePresent: Boolean(logout.setCookie),
    sameCookieName: clearsSameName,
    expirationDirectivePresent: Boolean(age || expires),
    cookieExpired,
  }))

  const after = await call('/api/learners/me', 'GET')
  const afterAuthenticated = userMatches(after.json)
  console.log(afterAuthenticated
    ? 'FAIL: no-cookie request authenticated unexpectedly'
    : 'PASS: request without session cookie is anonymous')

  // Important: Node fetch does not store cookies. Explicitly replay the
  // original cookie to check server-side invalidation independently.
  const replay = await call('/api/learners/me', 'GET', cookie)
  const replayAuthenticated = userMatches(replay.json)
  console.log(replayAuthenticated
    ? 'SECURITY OBSERVATION: pre-logout cookie is STILL accepted by server'
    : 'PASS: pre-logout cookie rejected after logout')

  assert(!afterAuthenticated, 'No-cookie request unexpectedly authenticated')
  assert(clearsSameName && cookieExpired,
    'Logout did not provide an expiring Set-Cookie for the learner cookie')
  assert(!replayAuthenticated,
    'SECURITY GAP: server still accepts old session after logout')
  console.log('G2.4.6 LOCAL HTTP LOGOUT: PASS (cookie cleared and old session invalidated)')
} finally {
  if (id !== undefined) {
    await payload.delete({ collection: 'learners', id, overrideAccess: true })
    console.log('PASS: disposable learner deleted')
  }
}
