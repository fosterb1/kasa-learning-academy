import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('recovery HTTP probe is bounded and uses no real learner or email operation', async () => {
  const s = await readFile(new URL('../scripts/test-g24-recovery-http.ts', import.meta.url), 'utf8')
  assert.match(s, /G24_ALLOW_LOCAL_HTTP_TEST === 'yes'/)
  assert.match(s, /kasa_academy_dev/)
  assert.match(s, /randomUUID\(\)/)
  assert.match(s, /@example\.invalid/)
  assert.match(s, /for \(let i = 1; i <= 6; i\+\+\)/)
  assert.match(s, /i === 6 && result\.status !== 429/)
  assert.match(s, /\/api\/learners\/forgot-password/)
  assert.doesNotMatch(s, /\/api\/learner-registration|sendEmail|payload\.create/)
})

test('Payload hook covers recovery before authentication actions', async () => {
  const s = await readFile(new URL('../src/collections/Learners.ts', import.meta.url), 'utf8')
  assert.match(s, /beforeOperation/)
  assert.match(s, /forgotPassword: 'forgot-password'/)
  assert.match(s, /checkLocalAuthRateLimit/)
})
