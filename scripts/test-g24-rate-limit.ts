/**
 * Explicit local-only database test. No signup, email or login traffic.
 * Does not modify production, requires the G2.4 additive migration.
 */
import { randomUUID } from 'node:crypto'
import { checkLocalAuthRateLimit } from '../src/lib/auth-rate-limit.ts'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
assert(process.env.NODE_ENV !== 'production', 'Refusing production')
assert(process.env.G24_ENABLE_LOCAL_RATE_LIMIT === 'yes', 'Set G24_ENABLE_LOCAL_RATE_LIMIT=yes explicitly')
assert(['localhost', '127.0.0.1', '[::1]'].includes(database.hostname), 'Local DB required')
assert(database.pathname === '/kasa_academy_dev' && database.username === 'kasa_dev', 'Dedicated local DB required')
assert(process.env.G24_RATE_LIMIT_SECRET && process.env.G24_RATE_LIMIT_SECRET.length >= 32,
  'Set a random G24_RATE_LIMIT_SECRET (32+ characters); do not paste it into chat')

const suffix = randomUUID()
const account = `g24-${suffix}@example.invalid`
const first = await checkLocalAuthRateLimit({ purpose: 'signup', account })
assert(first.allowed && first.retryAfterSeconds === 0, 'First request should pass; check local DB migration/adapter')
const rest = await Promise.all(Array.from({ length: 8 }, () =>
  checkLocalAuthRateLimit({ purpose: 'signup', account })))
const accepted = rest.filter(result => result.allowed).length
assert(accepted === 4, `Concurrency limit failed: accepted ${accepted} additional requests, expected 4`)
assert(rest.filter(result => !result.allowed).length === 4, 'Rejected attempts count mismatch')
const separatePurpose = await checkLocalAuthRateLimit({ purpose: 'login', account })
assert(separatePurpose.allowed, 'Different purpose must have separate counters')
const separateAccount = await checkLocalAuthRateLimit({ purpose: 'signup', account: `other-${suffix}@example.invalid` })
assert(separateAccount.allowed, 'Different accounts must have separate counters')
const invalidIdentity = await checkLocalAuthRateLimit({ purpose: 'signup' })
assert(!invalidIdentity.allowed, 'Empty identity must be denied')
console.log('G2.4 LOCAL DB RATE LIMIT: PASS (atomic concurrency + separation + fail-closed)')
