import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkLocalAuthRateLimit } from '@/lib/auth-rate-limit'

export const runtime = 'nodejs'

// This additional token-in-body endpoint is restricted to the dedicated local
// G2.4 preview. Production verification requires separate network abuse review.
function localAllowed(request: Request): boolean {
  if (process.env.NODE_ENV === 'production' ||
      process.env.G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes') return false
  try {
    const db = new URL(process.env.DATABASE_URL || '')
    const url = new URL(request.url)
    const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
    return hosts.has(db.hostname) && db.pathname === '/kasa_academy_dev' &&
      db.username === 'kasa_dev' && hosts.has(url.hostname) &&
      request.headers.get('origin') === url.origin
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!localAllowed(request)) return Response.json({ message: 'Verification unavailable.' }, { status: 503 })
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return Response.json({ message: 'Expected JSON.' }, { status: 415 })
  }
  let body: unknown
  try {
    const raw = await request.text()
    if (Buffer.byteLength(raw, 'utf8') > 2048) {
      return Response.json({ message: 'Request too large.' }, { status: 413 })
    }
    body = JSON.parse(raw)
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 })
  }
  const record = body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown> : {}
  const token = typeof record.token === 'string' ? record.token : ''
  if (Object.keys(record).some(key => key !== 'token') ||
      !token || token.length > 512 || /\s/.test(token)) {
    return Response.json({ message: 'Invalid verification request.' }, { status: 400 })
  }
  const decision = await checkLocalAuthRateLimit({ purpose: 'verify-email', account: token })
  if (!decision.allowed) {
    return Response.json({ message: 'Too many attempts or verification unavailable.' }, { status: 429 })
  }
  try {
    const payload = await getPayload({ config })
    await payload.verifyEmail({ collection: 'learners', token })
    return Response.json({ message: 'Email verification completed.' }, { status: 200,
      headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
  } catch {
    // Do not expose the token or internal authentication error.
    return Response.json({ message: 'Verification invalid or expired.' }, { status: 400 })
  }
}
