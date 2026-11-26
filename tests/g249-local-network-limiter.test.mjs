import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const read = p => readFile(new URL('../' + p, import.meta.url), 'utf8')

test('network counters have separate per-purpose limits and validate IPs', async () => {
  const s = await read('src/lib/auth-rate-limit.ts')
  assert.match(s, /import \{ isIP \} from 'node:net'/)
  assert.match(s, /const networkSettings: Record<AuthLimitPurpose, number>/)
  assert.match(s, /login: 40/)
  assert.match(s, /'forgot-password': 20/)
  assert.match(s, /isIP\(ip\)/)
  assert.match(s, /max: networkSettings\[identity\.purpose\]/)
  assert.match(s, /for \(const \{ key, max: bucketMax \} of keys\)/)
  assert.match(s, /Number\(record\.attempts\) > bucketMax/)
  assert.match(s, /createHmac\('sha256'/)
})

test('local network test is finite, explicit, and never manufactures user accounts', async () => {
  const s = await read('scripts/test-g249-network-limiter.ts')
  assert.match(s, /G249_ALLOW_LOCAL_NETWORK_TEST === 'yes'/)
  assert.match(s, /NODE_ENV !== 'production'/)
  assert.match(s, /kasa_academy_dev/)
  assert.match(s, /db\.username === 'kasa_dev'/)
  assert.match(s, /attempt <= 41/)
  assert.match(s, /trustedClientIp = '127\.0\.0\.1'/)
  assert.match(s, /example\.invalid/)
  assert.match(s, /attempt 41 rejected/)
  assert.doesNotMatch(s, /fetch\(|payload\.create\(|sendEmail\(|X-Forwarded-For/)
})

test('network enforcement is not enabled by spoofable request headers', async () => {
  const collection = await read('src/collections/Learners.ts')
  const signup = await read('src/app/api/learner-registration/route.ts')
  const verify = await read('src/app/api/learner-verify-token/route.ts')
  for (const s of [collection,signup,verify]) {
    assert.doesNotMatch(s, /headers\.get\(['"](?:x-forwarded-for|x-real-ip|cf-connecting-ip)['"]\)/i)
  }
  assert.doesNotMatch(collection, /trustedClientIp:/)
  assert.doesNotMatch(signup, /trustedClientIp:/)
  assert.doesNotMatch(verify, /trustedClientIp:/)
})
