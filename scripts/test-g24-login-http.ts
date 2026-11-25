/**
 * G2.4.3 controlled local HTTP test for Payload learner login throttling.
 * Uses one unique nonexistent learner; never attempts a real account or emails.
 * Requires a separate already-running next dev server with G24 limiter enabled.
 */
import { randomUUID } from 'node:crypto'

function requireSafe(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const base = new URL(process.env.G24_TEST_ORIGIN || 'http://localhost:3000')
const db = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const validHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
requireSafe(process.env.NODE_ENV !== 'production', 'Refusing to test in production.')
requireSafe(process.env.G24_ALLOW_LOCAL_HTTP_TEST === 'yes',
  'Set G24_ALLOW_LOCAL_HTTP_TEST=yes to authorize this bounded localhost test.')
requireSafe(base.protocol === 'http:' && validHosts.has(base.hostname) &&
  (base.port === '3000' || base.port === '3001') &&
  !base.username && !base.password && !base.search && base.pathname === '/',
  'Target must be a local HTTP development server on port 3000/3001.')
requireSafe(validHosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
  db.username === 'kasa_dev', 'Dedicated local development PostgreSQL DB required.')

const email = `g24-http-${randomUUID()}@example.invalid`
const url = new URL('/api/learners/login', base)
const statuses: number[] = []
for (let attempt = 1; attempt <= 21; attempt++) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base.origin },
    body: JSON.stringify({ email, password: 'intentionally-wrong-no-account' }),
    signal: AbortSignal.timeout(12000),
    redirect: 'manual',
  })
  statuses.push(response.status)
  await response.arrayBuffer() // Close response before next request.
  if (attempt <= 20 && (response.ok || response.status === 429 ||
    response.status >= 500 || (response.status >= 300 && response.status < 400))) {
    throw new Error(`Unexpected response at attempt ${attempt}: HTTP ${response.status}. Status history: ${statuses.join(', ')}`)
  }
  if (attempt === 21 && response.status !== 429) {
    throw new Error(`Limiter not verified: attempt 21 returned HTTP ${response.status}, expected 429. Status history: ${statuses.join(', ')}`)
  }
}
console.log('G2.4.3 LOCAL LOGIN HTTP THROTTLING: PASS (20 rejected credentials, 21st HTTP 429)')
