/**
 * G2.4.7: prove expired reset token refusal in dedicated local PostgreSQL.
 * One disposable account. No email, no production database, no token logging.
 * Makes a scoped expiry-only UPDATE on the disposable learner row.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const url = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
assert(process.env.NODE_ENV !== 'production', 'Production test prohibited')
assert(process.env.G24_ALLOW_LOCAL_EXPIRY_TEST === 'yes', 'Explicit local expiry test approval required')
assert(hosts.has(url.hostname) && url.pathname === '/kasa_academy_dev' &&
  url.username === 'kasa_dev', 'Only dedicated local kasa_academy_dev allowed')
assert(process.env.PAYLOAD_SECRET && process.env.PAYLOAD_SECRET.length >= 32,
  'Local PAYLOAD_SECRET missing')
assert(process.env.G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes',
  'Disable the G24 limiter in this test process only; it is tested separately')

const payload = await getPayload({ config })
const drizzle = (payload.db as unknown as {
  drizzle?: { execute: (query: ReturnType<typeof sql>) => Promise<unknown> }
}).drizzle
assert(drizzle, 'PostgreSQL Drizzle driver unavailable')
const email = `g247-expiry-${randomBytes(12).toString('hex')}@example.invalid`
const originalPassword = randomBytes(32).toString('hex')
const replacementPassword = randomBytes(32).toString('hex')
let id: string | number | undefined

try {
  const created = await payload.create({
    collection: 'learners',
    overrideAccess: true,
    disableVerificationEmail: true,
    data: { email, password: originalPassword, displayName: 'Expiry Test Fixture' },
  })
  id = created.id
  const hidden = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(typeof hidden._verificationToken === 'string' && hidden._verificationToken,
    'Disposable learner verification token missing')
  await payload.verifyEmail({ collection: 'learners', token: hidden._verificationToken })
  console.log('PASS: temporary learner created and verified without mail')

  const token = await payload.forgotPassword({
    collection: 'learners',
    data: { email },
    disableEmail: true,
  })
  assert(typeof token === 'string' && token, 'Reset token was not issued')
  const issued = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(issued.resetPasswordExpiration && Date.parse(String(issued.resetPasswordExpiration)) > Date.now(),
    'A future reset expiration was not recorded')
  console.log('PASS: fresh token has a future expiration')

  // Modify only the disposable row's expiration, not the token or other fields.
  // The id was returned by Payload.create; the token remains exclusively in memory.
  const updated = await drizzle.execute(sql`
    UPDATE learners
    SET reset_password_expiration = clock_timestamp() - interval '60 seconds'
    WHERE id = ${id} AND reset_password_token IS NOT NULL
    RETURNING id
  `) as { rows?: Array<{ id: number | string }> } | Array<{ id: number | string }>
  const rows = Array.isArray(updated) ? updated : updated.rows || []
  assert.equal(rows.length, 1, 'Expected exactly one disposable learner expiration update')

  const expired = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(expired.resetPasswordExpiration &&
    Date.parse(String(expired.resetPasswordExpiration)) < Date.now(),
    'Stored expiry was not moved into the past')
  console.log('PASS: disposable token expiration moved into the past')

  let rejected = false
  try {
    await payload.resetPassword({
      collection: 'learners',
      overrideAccess: false,
      data: { token, password: replacementPassword },
    })
  } catch {
    rejected = true
  }
  assert(rejected, 'SECURITY FAILURE: expired reset token was accepted')
  console.log('PASS: expired reset token rejected')

  const login = await payload.login({
    collection: 'learners',
    data: { email, password: originalPassword },
  })
  assert(login.token, 'Original password stopped working after rejected reset')
  console.log('PASS: password unchanged after expired-token rejection')
  console.log('G2.4.7 LOCAL EXPIRED RESET TOKEN: PASS')
} finally {
  if (id !== undefined) {
    await payload.delete({ collection: 'learners', id, overrideAccess: true })
    console.log('PASS: disposable learner deleted')
  }
}
