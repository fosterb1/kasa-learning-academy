import { createHmac } from 'node:crypto'
import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import config from '@/payload.config'

/**
 * G2.4 server-only PostgreSQL limiter. Never call from the browser.
 * No untrusted proxy header is accepted as a network identity.
 * Missing configuration/DB errors DENY the request.
 * Authenticated identity and trusted proxy integration remain separate gates.
 */
export type AuthLimitPurpose = 'signup' | 'login' | 'forgot-password' | 'reset-password' | 'verify-email'
export type AuthLimitDecision = { allowed: boolean; retryAfterSeconds: number }
export type AuthLimitIdentity = { purpose: AuthLimitPurpose; account?: string; trustedClientIp?: string }
const settings: Record<AuthLimitPurpose, { windowSeconds: number; max: number }> = {
  signup: { windowSeconds: 3600, max: 5 },
  login: { windowSeconds: 900, max: 20 },
  'forgot-password': { windowSeconds: 3600, max: 5 },
  'reset-password': { windowSeconds: 900, max: 10 },
  'verify-email': { windowSeconds: 900, max: 10 },
}
const deny: AuthLimitDecision = { allowed: false, retryAfterSeconds: 60 }

function digest(purpose: AuthLimitPurpose, kind: 'account' | 'ip', value: string, secret: string) {
  return createHmac('sha256', secret).update('kasa:g24:v1\0').update(purpose).update('\0')
    .update(kind).update('\0').update(value).digest('hex')
}

function localEnvironmentIsSafe(): boolean {
  try {
    const url = new URL(process.env.DATABASE_URL || '')
    return process.env.NODE_ENV !== 'production' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
      url.pathname === '/kasa_academy_dev' && url.username === 'kasa_dev'
  } catch {
    return false
  }
}

export async function checkLocalAuthRateLimit(identity: AuthLimitIdentity): Promise<AuthLimitDecision> {
  // Initial integration is limited to our dedicated local development DB.
  // Production always denies until proxy trust, scope, testing and release review are complete.
  if (!localEnvironmentIsSafe() || process.env.G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes') return deny
  const secret = process.env.G24_RATE_LIMIT_SECRET
  if (!secret || secret.length < 32 || secret === process.env.PAYLOAD_SECRET) return deny
  const canonical = identity.account?.trim().toLowerCase()
  const ip = identity.trustedClientIp?.trim()
  if ((!canonical && !ip) || (canonical && canonical.length > 254) || (ip && ip.length > 64)) return deny
  const { windowSeconds, max } = settings[identity.purpose]
  const keys = [
    canonical ? digest(identity.purpose, 'account', canonical, secret) : null,
    ip ? digest(identity.purpose, 'ip', ip, secret) : null,
  ].filter((key): key is string => Boolean(key)).sort()
  try {
    const payload = await getPayload({ config })
    // Payload Postgres adapter exposes its Drizzle driver; absent driver must deny.
    const db = (payload.db as unknown as { drizzle?: { execute: (query: ReturnType<typeof sql>) => Promise<unknown> } }).drizzle
    if (!db) return deny
    let permitted = true
    let retryAfterSeconds = 0
    // Each counter increment is an atomic PostgreSQL upsert. Multiple independent
    // processes cannot overwrite one another; rejected attempts are still counted.
    for (const key of keys) {
      const rows = await db.execute(sql`
        INSERT INTO kasa_auth_rate_limits (bucket_key, window_start, attempts, expires_at)
        VALUES (
          ${key},
          to_timestamp(floor(extract(epoch from clock_timestamp()) / ${windowSeconds}) * ${windowSeconds}),
          1,
          to_timestamp((floor(extract(epoch from clock_timestamp()) / ${windowSeconds}) + 2) * ${windowSeconds})
        )
        ON CONFLICT (bucket_key, window_start)
        DO UPDATE SET attempts = kasa_auth_rate_limits.attempts + 1
        RETURNING attempts, greatest(1, ceil(extract(epoch from
          (window_start + ${windowSeconds} * interval '1 second') - clock_timestamp())))::integer AS retry_seconds
      `) as { rows?: Array<{ attempts: number; retry_seconds: number }> } | Array<{ attempts: number; retry_seconds: number }>
      const record = Array.isArray(rows) ? rows[0] : rows.rows?.[0]
      if (!record || !Number.isFinite(Number(record.attempts))) return deny
      if (Number(record.attempts) > max) {
        permitted = false
        retryAfterSeconds = Math.max(retryAfterSeconds, Number(record.retry_seconds) || 60)
      }
    }
    return { allowed: permitted, retryAfterSeconds: permitted ? 0 : Math.min(3600, Math.max(1, Math.ceil(retryAfterSeconds))) }
  } catch {
    // Never bypass throttling on database failures.
    return deny
  }
}
