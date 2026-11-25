import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('rate limit storage is atomic and contains no raw identifiers', async () => {
  const migration = await read('src/migrations/20261125_000001.ts')
  const limiter = await read('src/lib/auth-rate-limit.ts')
  assert.match(migration, /PRIMARY KEY \(bucket_key, window_start\)/)
  assert.match(limiter, /ON CONFLICT \(bucket_key, window_start\)/)
  assert.match(limiter, /DO UPDATE SET attempts = kasa_auth_rate_limits\.attempts \+ 1/)
  assert.match(limiter, /createHmac\('sha256'/)
  assert.match(limiter, /return deny/)
  assert.doesNotMatch(migration, /raw_email|email_address|password|reset_token/)
})

test('limiter remains local-only and explicitly gated', async () => {
  const limiter = await read('src/lib/auth-rate-limit.ts')
  assert.match(limiter, /NODE_ENV !== 'production'/)
  assert.match(limiter, /G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes'/)
  assert.match(limiter, /G24_RATE_LIMIT_SECRET/)
  assert.match(limiter, /kasa_academy_dev/)
  assert.match(limiter, /'signup' \| 'login' \| 'forgot-password'/)
})
