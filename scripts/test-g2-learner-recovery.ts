/**
 * G2.2 development-only recovery integration test.
 *
 * GUARDED: works exclusively with a local kasa_academy_dev Postgres database.
 * Never point at Neon, Vercel Preview or Production. Temporary accounts are
 * deleted even if an assertion fails. Tokens/passwords are never logged.
 *
 * G2_ALLOW_DEV_AUTH_TEST=yes npm run test:g2-recovery
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const url = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname) ||
    url.pathname !== '/kasa_academy_dev' ||
    url.username !== 'kasa_dev' ||
    process.env.G2_ALLOW_DEV_AUTH_TEST !== 'yes' ||
    process.env.NODE_ENV === 'production') {
  throw new Error('Refusing G2.2 recovery test: ONLY explicitly authorized local kasa_academy_dev is supported.')
}
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
  throw new Error('Refusing G2.2 recovery test: local PAYLOAD_SECRET missing or too short.')
}

const payload = await getPayload({ config })
const suffix = randomBytes(12).toString('hex')
const email = `g2-recovery-${suffix}@example.invalid`
const originalPassword = randomBytes(32).toString('hex')
const replacementPassword = randomBytes(32).toString('hex')
let id: string | number | undefined
let failed = false

async function mustReject(label: string, action: () => Promise<unknown>) {
  let rejected = false
  try { await action() } catch { rejected = true }
  assert.ok(rejected, `${label} unexpectedly succeeded`)
  console.log(`PASS: ${label}`)
}

try {
  const learner = await payload.create({
    collection: 'learners',
    overrideAccess: true,
    disableVerificationEmail: true,
    data: { email, password: originalPassword, displayName: 'Recovery Fixture' },
  })
  id = learner.id

  await mustReject('unverified login refused', () => payload.login({
    collection: 'learners', data: { email, password: originalPassword },
  }))

  const hidden = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  const verificationToken = hidden._verificationToken
  assert.ok(verificationToken, 'verification token missing')
  await payload.verifyEmail({ collection: 'learners', token: verificationToken })
  console.log('PASS: verification accepted')

  const originalLogin = await payload.login({
    collection: 'learners', data: { email, password: originalPassword },
  })
  assert.ok(originalLogin.token, 'verified login token missing')
  console.log('PASS: verified login')

  // The Payload Local API returns the reset token to this trusted, local test.
  // Do not use this technique to expose a token through a public route.
  const resetToken = await payload.forgotPassword({
    collection: 'learners', data: { email },
  })
  assert.equal(typeof resetToken, 'string', 'reset token missing')
  assert.ok(resetToken, 'reset token empty')
  console.log('PASS: recovery token issued without logging it')

  await mustReject('invalid recovery token rejected', () => payload.resetPassword({
    collection: 'learners',
    data: { token: randomBytes(24).toString('hex'), password: replacementPassword },
  }))

  const result = await payload.resetPassword({
    collection: 'learners',
    data: { token: resetToken, password: replacementPassword },
  })
  assert.ok(result.user, 'reset did not return a user')
  console.log('PASS: password reset completed')

  await mustReject('reset token cannot be reused', () => payload.resetPassword({
    collection: 'learners',
    data: { token: resetToken, password: replacementPassword },
  }))
  await mustReject('old password rejected after reset', () => payload.login({
    collection: 'learners', data: { email, password: originalPassword },
  }))
  const newLogin = await payload.login({
    collection: 'learners', data: { email, password: replacementPassword },
  })
  assert.ok(newLogin.token, 'new password did not authenticate')
  console.log('PASS: new password authenticates')

  // This local test does not claim to prove email delivery, browser cookie
  // invalidation, concurrent recovery, or 30-minute token expiry.
} catch (error) {
  failed = true
  console.error('G2.2 recovery integration FAILED:', error instanceof Error ? error.message : error)
} finally {
  if (id !== undefined) {
    try {
      await payload.delete({ collection: 'learners', id, overrideAccess: true })
      console.log('PASS: temporary learner deleted')
    } catch (error) {
      failed = true
      console.error('G2.2 recovery cleanup FAILED:', error instanceof Error ? error.message : error)
    }
  }
}
process.exit(failed ? 1 : 0)
