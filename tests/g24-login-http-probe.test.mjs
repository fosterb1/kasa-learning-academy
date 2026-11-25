import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('HTTP throttle probe is explicitly local, bounded, and never creates learner accounts', async () => {
  const source = await readFile(new URL('../scripts/test-g24-login-http.ts', import.meta.url), 'utf8')
  assert.match(source, /G24_ALLOW_LOCAL_HTTP_TEST === 'yes'/)
  assert.match(source, /kasa_academy_dev/)
  assert.match(source, /randomUUID\(\)/)
  assert.match(source, /for \(let attempt = 1; attempt <= 21; attempt\+\+\)/)
  assert.match(source, /response\.status !== 429/)
  assert.match(source, /\/api\/learners\/login/)
  assert.doesNotMatch(source, /\/api\/learners\/forgot-password|\/api\/learner-registration/)
  assert.doesNotMatch(source, /payload\.create|sendEmail|console\.log\(email/)
})
