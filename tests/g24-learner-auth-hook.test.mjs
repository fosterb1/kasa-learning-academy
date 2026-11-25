import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('learner login and recovery are guarded at Payload beforeOperation, not after successful login', async () => {
  const learners = await read('src/collections/Learners.ts')
  assert.match(learners, /beforeOperation:\s*\[async/)
  assert.match(learners, /login: 'login'/)
  assert.match(learners, /forgotPassword: 'forgot-password'/)
  assert.match(learners, /resetPassword: 'reset-password'/)
  assert.match(learners, /checkLocalAuthRateLimit\(\{ purpose, account \}\)/)
  assert.doesNotMatch(learners, /beforeLogin:.*checkLocalAuthRateLimit/)
})

test('rate limit hook is local opt-in and preserves other collection operations', async () => {
  const learners = await read('src/collections/Learners.ts')
  assert.match(learners, /G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes'\) return args/)
  assert.match(learners, /if \(!purpose\) return args/)
  assert.match(learners, /throw new APIError\('Too many requests or authentication temporarily unavailable\.', 429\)/)
  assert.doesNotMatch(learners, /console\.(log|error|warn)/)
  assert.match(learners, /create: \(\) => false/)
  assert.match(learners, /admin: \(\) => false/)
})

test('recovery uses HMAC token key without logging or storing the raw reset token', async () => {
  const learners = await read('src/collections/Learners.ts')
  const limiter = await read('src/lib/auth-rate-limit.ts')
  const migration = await read('src/migrations/20261125_000001.ts')
  assert.match(learners, /purpose === 'reset-password' \? fields\.token : fields\.email/)
  assert.match(limiter, /createHmac\('sha256'/)
  assert.match(migration, /bucket_key varchar\(64\)/)
  assert.doesNotMatch(migration, /reset_token|email|password/)
})

test('CMS admin remains a separate collection', async () => {
  const payload = await read('src/payload.config.ts')
  assert.match(payload, /admin: \{ user: Users\.slug/)
  assert.match(payload, /collections: \[Users, Learners,/)
})
