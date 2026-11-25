import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('session reset probe is local-only and explicitly approved', async () => {
  const source = await read('scripts/test-g24-session-reset.ts')
  assert.match(source, /G24_ALLOW_LOCAL_SESSION_TEST === 'yes'/)
  assert.match(source, /NODE_ENV !== 'production'/)
  assert.match(source, /kasa_academy_dev/)
  assert.match(source, /dbUrl\.username === 'kasa_dev'/)
  assert.match(source, /G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes'/)
  assert.match(source, /randomBytes\(12\)/)
  assert.match(source, /@example\.invalid/)
})

test('test cannot send an email and checks real JWT revocation and reset token reuse', async () => {
  const source = await read('scripts/test-g24-session-reset.ts')
  assert.match(source, /disableVerificationEmail: true/)
  assert.match(source, /disableEmail: true/)
  assert.match(source, /payload\.auth\(\{ headers: new Headers/)
  assert.match(source, /pre-reset session still authenticated after reset/)
  assert.match(source, /reset token cannot be reused/)
  assert.match(source, /old password rejected/)
  assert.match(source, /new password and new session work/)
  assert.doesNotMatch(source, /console\.log\((?:email|resetToken|originalToken|originalPassword|newPassword)/)
})

test('fixture cleanup cannot be skipped when an assertion fails', async () => {
  const source = await read('scripts/test-g24-session-reset.ts')
  assert.match(source, /finally \{/)
  assert.match(source, /await payload\.delete\(\{ collection: 'learners', id, overrideAccess: true \}\)/)
  assert.doesNotMatch(source, /fetch\(|\/api\/learner-registration/)
})
