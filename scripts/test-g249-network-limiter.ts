/**
 * G2.4.9 local-only, bounded network counter test.
 * No HTTP calls, no users created, no real emails, no forged headers.
 * Uses a fixed loopback test identity, never claims that it is a real client IP.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { checkLocalAuthRateLimit } from '../src/lib/auth-rate-limit.ts'

const db = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
assert(process.env.NODE_ENV !== 'production', 'Production prohibited')
assert(process.env.G249_ALLOW_LOCAL_NETWORK_TEST === 'yes',
  'Set explicit G249_ALLOW_LOCAL_NETWORK_TEST=yes to run this test')
assert(hosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
  db.username === 'kasa_dev', 'Dedicated localhost PostgreSQL only')
assert(process.env.G24_ENABLE_LOCAL_RATE_LIMIT === 'yes', 'Local rate limiter must be enabled')
assert(process.env.G24_RATE_LIMIT_SECRET && process.env.G24_RATE_LIMIT_SECRET.length >= 32 &&
  process.env.G24_RATE_LIMIT_SECRET !== process.env.PAYLOAD_SECRET,
  'Dedicated rate-limit secret required and must differ from Payload secret')

// Test identity is intentionally NOT resolved from an HTTP header.
// Exact 41 calls: at most 40 allowed for one simulated source in the 15-minute window.
const nonce = randomBytes(12).toString('hex')
const trustedClientIp = '127.0.0.1'
for (let attempt = 1; attempt <= 41; attempt++) {
  const account = `g249-${nonce}-${attempt}@example.invalid`
  const decision = await checkLocalAuthRateLimit({
    purpose: 'login',
    account,
    trustedClientIp,
  })
  if (attempt <= 40) {
    assert(decision.allowed, `Expected network test attempt ${attempt} to be permitted; check for prior localhost network-counter usage in this window`)
  } else {
    assert(!decision.allowed && decision.retryAfterSeconds >= 1,
      'SECURITY FAILURE: same simulated source bypassed network threshold by rotating accounts')
  }
}
console.log('PASS: 40 rotated-account attempts allowed under simulated shared network threshold')
console.log('PASS: attempt 41 rejected despite a new account identifier')
console.log('G2.4.9 LOCAL NETWORK COUNTER: PASS (no HTTP client IP trusted or production integration)')
