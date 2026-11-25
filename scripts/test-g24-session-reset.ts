/**
 * G2.4.5 local-only password-reset and session lifecycle integration test.
 * Creates ONE disposable learner, sends NO email, and deletes it in finally.
 * Never print JWTs, verification tokens or reset tokens.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const dbUrl = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const local = new Set(['127.0.0.1', 'localhost', '[::1]'])
assert(process.env.NODE_ENV !== 'production', 'Refusing to test in production')
assert(process.env.G24_ALLOW_LOCAL_SESSION_TEST === 'yes', 'Set G24_ALLOW_LOCAL_SESSION_TEST=yes')
assert(local.has(dbUrl.hostname) && dbUrl.pathname === '/kasa_academy_dev' &&
  dbUrl.username === 'kasa_dev', 'Dedicated local PostgreSQL DB required')
assert(process.env.PAYLOAD_SECRET && process.env.PAYLOAD_SECRET.length >= 32,
  'Local PAYLOAD_SECRET is required')
assert(process.env.G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes',
  'Stop here: run test in a separate shell with G24_ENABLE_LOCAL_RATE_LIMIT unset to avoid consuming real hook counters')

const payload = await getPayload({ config })
const nonce = randomBytes(12).toString('hex')
const email = `g24-session-${nonce}@example.invalid`
const originalPassword = randomBytes(32).toString('hex')
const newPassword = randomBytes(32).toString('hex')
let id: string | number | undefined

async function mustFail(name: string, operation: () => Promise<unknown>) {
  let failed = false
  try { await operation() } catch { failed = true }
  assert(failed, `${name} unexpectedly succeeded`)
}

async function authenticatedBy(token: string) {
  const result = await payload.auth({ headers: new Headers({ authorization: `JWT ${token}` }) })
  return result.user?.collection === 'learners' && String(result.user.id) === String(id)
}

try {
  const created = await payload.create({
    collection: 'learners',
    overrideAccess: true,
    disableVerificationEmail: true,
    data: { email, password: originalPassword, displayName: 'Session Test Fixture' },
  })
  id = created.id
  const hidden = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(typeof hidden._verificationToken === 'string' && hidden._verificationToken,
    'Fixture verification token unavailable')
  await payload.verifyEmail({ collection: 'learners', token: hidden._verificationToken })

  const login = await payload.login({
    collection: 'learners',
    data: { email, password: originalPassword },
  })
  assert(typeof login.token === 'string' && login.token, 'Login did not issue JWT')
  const originalToken = login.token
  assert(await authenticatedBy(originalToken), 'Original session was not valid before reset')
  console.log('PASS: disposable session authenticated before reset')

  const resetToken = await payload.forgotPassword({
    collection: 'learners',
    data: { email },
    disableEmail: true,
  })
  assert(typeof resetToken === 'string' && resetToken, 'No recovery token issued')
  const reset = await payload.resetPassword({
    collection: 'learners',
    data: { token: resetToken, password: newPassword },
  })
  assert(reset.user, 'Reset operation did not return learner')
  console.log('PASS: password reset without outbound mail')

  await mustFail('reset token reuse', () => payload.resetPassword({
    collection: 'learners',
    data: { token: resetToken, password: newPassword },
  }))
  console.log('PASS: reset token cannot be reused')
  await mustFail('old password', () => payload.login({
    collection: 'learners',
    data: { email, password: originalPassword },
  }))
  console.log('PASS: old password rejected')

  assert(!(await authenticatedBy(originalToken)),
    'SECURITY FAILURE: pre-reset session still authenticated after reset')
  console.log('PASS: pre-reset session revoked')

  const after = await payload.login({
    collection: 'learners',
    data: { email, password: newPassword },
  })
  assert(typeof after.token === 'string' && after.token, 'New password login failed')
  assert(await authenticatedBy(after.token), 'New session failed authentication')
  console.log('PASS: new password and new session work')

  console.log('G2.4.5 LOCAL SESSION RESET: PASS (revocation, single-use token, password replacement)')
} finally {
  if (id !== undefined) {
    await payload.delete({ collection: 'learners', id, overrideAccess: true })
    console.log('PASS: disposable learner deleted')
  }
  await payload.db.destroy?.()
}
