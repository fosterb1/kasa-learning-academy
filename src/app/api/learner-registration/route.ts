import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

// This endpoint is deliberately unavailable on all production and Preview deployments.
// Opening public registration requires a separately reviewed shared rate limiter,
// real email delivery, abuse controls, and a new explicit release decision.
function localRegistrationEnabled(request: Request): boolean {
  if (process.env.NODE_ENV === 'production' || process.env.G2_ENABLE_LOCAL_SIGNUP !== 'yes') return false
  try {
    const database = new URL(process.env.DATABASE_URL || '')
    const target = new URL(request.url)
    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
    return localHosts.has(database.hostname) &&
      database.pathname === '/kasa_academy_dev' &&
      database.username === 'kasa_dev' &&
      localHosts.has(target.hostname)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!localRegistrationEnabled(request)) {
    return Response.json({ message: 'Registration is not open.' }, { status: 503 })
  }
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_ADDRESS?.trim()) {
    return Response.json({ message: 'Registration email is not configured.' }, { status: 503 })
  }
  const target = new URL(request.url)
  const origin = request.headers.get('origin')
  if (!origin || origin !== target.origin) {
    return Response.json({ message: 'Invalid request origin.' }, { status: 403 })
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return Response.json({ message: 'Expected JSON.' }, { status: 415 })
  }
  const length = Number(request.headers.get('content-length') || 0)
  if (!Number.isFinite(length) || length > 4096) {
    return Response.json({ message: 'Request too large.' }, { status: 413 })
  }
  let data: unknown
  try {
    const raw = await request.text()
    if (Buffer.byteLength(raw, 'utf8') > 4096) return Response.json({ message: 'Request too large.' }, { status: 413 })
    data = JSON.parse(raw)
  } catch {
    return Response.json({ message: 'Invalid JSON.' }, { status: 400 })
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return Response.json({ message: 'Invalid registration fields.' }, { status: 400 })
  }
  const body = data as Record<string, unknown>
  const permitted = ['email', 'password', 'displayName', 'preferredLanguage']
  if (Object.keys(body).some(key => !permitted.includes(key))) {
    return Response.json({ message: 'Invalid registration fields.' }, { status: 400 })
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  const password = body.password
  const language = body.preferredLanguage
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      displayName.length < 2 || displayName.length > 100 ||
      typeof password !== 'string' || password.length < 12 || password.length > 128 ||
      !['twi', 'english', 'bilingual'].includes(String(language))) {
    return Response.json({ message: 'Invalid registration fields.' }, { status: 400 })
  }
  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'learners',
      overrideAccess: true,
      data: { email, password, displayName, preferredLanguage: language as 'twi' | 'english' | 'bilingual' },
    })
    return Response.json({ message: 'Check your email for verification.' }, { status: 202 })
  } catch {
    // Do not leak account existence, database details, or verification tokens.
    return Response.json({ message: 'Registration could not be completed.' }, { status: 400 })
  }
}
