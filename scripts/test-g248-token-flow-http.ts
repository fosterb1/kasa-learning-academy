/**
 * G2.4.8 local-only HTTP token-flow integration.
 * One disposable learner; no external email, no actual secret URLs printed.
 * Requires a local Next.js server running with G24_ENABLE_LOCAL_RATE_LIMIT=yes.
 * This is an HTTP integration test, NOT a simulated browser/hydration test.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const db = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const origin = new URL(process.env.G248_TEST_ORIGIN || 'http://localhost:3000')
assert(process.env.NODE_ENV !== 'production', 'Production mode prohibited')
assert(process.env.G248_ALLOW_LOCAL_HTTP_TEST === 'yes', 'Explicit local HTTP test approval required')
assert(hosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
  db.username === 'kasa_dev', 'Only dedicated local database allowed')
assert(origin.protocol === 'http:' && hosts.has(origin.hostname) &&
  ['3000', '3001'].includes(origin.port) && origin.pathname === '/' &&
  !origin.search && !origin.hash && !origin.username && !origin.password,
  'Only local Next.js at 3000/3001 is permitted')
assert(process.env.PAYLOAD_SECRET && process.env.PAYLOAD_SECRET.length >= 32,
  'Dedicated local PAYLOAD_SECRET required')
assert(process.env.G24_ENABLE_LOCAL_RATE_LIMIT === 'yes',
  'Enable G24_ENABLE_LOCAL_RATE_LIMIT=yes in this process AND your local Next.js server')
assert(process.env.G24_RATE_LIMIT_SECRET && process.env.G24_RATE_LIMIT_SECRET.length >= 32,
  'Dedicated local G24_RATE_LIMIT_SECRET required')

const payload = await getPayload({ config })
const email = `g248-http-${randomBytes(12).toString('hex')}@example.invalid`
const initialPassword = randomBytes(32).toString('hex')
const changedPassword = randomBytes(32).toString('hex')
let id: string | number | undefined

async function call(path: string, method: 'GET' | 'POST', body?: Record<string,string>) {
  const url = new URL(path, origin)
  assert(url.origin === origin.origin && !url.search && !url.hash,
    'Test refuses query strings or fragments in HTTP request targets')
  const response = await fetch(url, {
    method,
    headers: {
      origin: origin.origin,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  })
  // Keep response bodies and token values out of test output.
  return {
    status: response.status,
    ok: response.ok,
    referrerPolicy: response.headers.get('referrer-policy'),
    cacheControl: response.headers.get('cache-control'),
  }
}

try {
  const created = await payload.create({
    collection: 'learners', overrideAccess: true,
    disableVerificationEmail: true,
    data: { email, password: initialPassword, displayName: 'Fragment Flow Fixture' },
  })
  id = created.id
  const hidden = await payload.findByID({
    collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
  })
  assert(typeof hidden._verificationToken === 'string' && hidden._verificationToken,
    'Verification token was not created for disposable learner')

  for (const path of ['/verify-email', '/reset-password']) {
    const page = await call(path, 'GET')
    assert(page.ok, `Token landing page not accessible: ${path} (HTTP ${page.status})`)
    assert(page.referrerPolicy === 'no-referrer',
      `Missing no-referrer header on ${path}`)
    assert(page.cacheControl?.toLowerCase().includes('no-store'),
      `Missing no-store header on ${path}`)
  }
  console.log('PASS: both token landing pages respond without token in GET URL')
  console.log('PASS: both landing pages set no-referrer and no-store headers')

  const verified = await call('/api/learner-verify-token', 'POST', {
    token: hidden._verificationToken,
  })
  assert(verified.status === 200, `Token-in-body verification failed (HTTP ${verified.status})`)
  console.log('PASS: verification token accepted in POST body without URL exposure')

  const before = await payload.login({
    collection: 'learners', data: { email, password: initialPassword },
  })
  assert(before.token, 'Verified learner cannot log in')
  console.log('PASS: verified learner can authenticate')

  const resetToken = await payload.forgotPassword({
    collection: 'learners', data: { email }, disableEmail: true,
  })
  assert(typeof resetToken === 'string' && resetToken,
    'Disposable learner recovery token unavailable')
  const reset = await call('/api/learners/reset-password', 'POST', {
    token: resetToken, password: changedPassword,
  })
  assert(reset.ok, `Password reset via token-in-body POST failed (HTTP ${reset.status})`)
  console.log('PASS: password reset accepted in POST body without URL exposure')

  let oldRejected = false
  try {
    await payload.login({ collection: 'learners', data: { email, password: initialPassword } })
  } catch { oldRejected = true }
  assert(oldRejected, 'SECURITY FAILURE: original password still accepted')
  const after = await payload.login({
    collection: 'learners', data: { email, password: changedPassword },
  })
  assert(after.token, 'Changed password login unsuccessful')
  console.log('PASS: original password rejected and new password works')
  console.log('G2.4.8 LOCAL HTTP TOKEN FLOW: PASS (browser URL clearing still unverified)')
} finally {
  if (id !== undefined) {
    await payload.delete({ collection: 'learners', id, overrideAccess: true })
    console.log('PASS: disposable learner deleted')
  }
}
