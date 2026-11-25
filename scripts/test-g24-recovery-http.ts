/**
 * Bounded local-only HTTP probe: password-recovery rate limiting.
 * A fresh random .invalid email is not registered and cannot receive mail.
 * Does not inspect, create or modify any learner account.
 */
import { randomUUID } from 'node:crypto'

function guard(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}
const db = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const base = new URL(process.env.G24_TEST_ORIGIN || 'http://localhost:3000')
const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
guard(process.env.NODE_ENV !== 'production', 'Production test refused')
guard(process.env.G24_ALLOW_LOCAL_HTTP_TEST === 'yes', 'Set G24_ALLOW_LOCAL_HTTP_TEST=yes')
guard(hosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
  db.username === 'kasa_dev', 'Only dedicated local DB is permitted')
guard(base.protocol === 'http:' && hosts.has(base.hostname) &&
  ['3000', '3001'].includes(base.port) &&
  base.pathname === '/' && !base.search && !base.hash &&
  !base.username && !base.password,
  'Only localhost:3000/3001 root URL allowed')

const email = `g24-recovery-${randomUUID()}@example.invalid`
const endpoint = new URL('/api/learners/forgot-password', base)
const statuses: number[] = []
for (let i = 1; i <= 6; i++) {
  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base.origin },
    body: JSON.stringify({ email }),
    signal: AbortSignal.timeout(12000),
    redirect: 'manual',
  })
  statuses.push(result.status)
  await result.arrayBuffer()
  if (i < 6 && (result.status === 429 || result.status >= 500 ||
    (result.status >= 300 && result.status < 400))) {
    throw new Error(`Unexpected response before threshold at attempt ${i}: HTTP ${result.status}; history ${statuses.join(', ')}`)
  }
  if (i === 6 && result.status !== 429) {
    throw new Error(`Recovery limiter not proven; sixth request HTTP ${result.status}; expected 429; history ${statuses.join(', ')}`)
  }
}
console.log('G2.4.4 LOCAL RECOVERY HTTP THROTTLING: PASS (6th attempt HTTP 429; no actual account or email)')
