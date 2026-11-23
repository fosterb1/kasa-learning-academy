import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const file = await readFile(new URL('../scripts/resend-g23-local-verification.ts', import.meta.url), 'utf8')

test('resend is an operator-only script with local database and explicit approval', () => {
  assert.match(file, /NODE_ENV === 'production'/)
  assert.match(file, /G23_ALLOW_LOCAL_RESEND !== 'yes'/)
  assert.match(file, /kasa_academy_dev/)
  assert.match(file, /database\.username !== 'kasa_dev'/)
  assert.match(file, /RESEND_API_KEY/)
  assert.match(file, /RESEND_FROM_ADDRESS/)
  assert.match(file, /G23_RESEND_TO/)
})
test('existing unverified account only and no verification token logging', () => {
  assert.match(file, /learner\._verified === true/)
  assert.match(file, /learner\._verificationToken/)
  assert.match(file, /lookup\.docs\.length !== 1/)
  assert.match(file, /payload\.sendEmail/)
  assert.doesNotMatch(file, /payload\.(?:create|update|delete)\(/)
  assert.doesNotMatch(file, /console\.log\([^)]*(?:token|verifyUrl)/)
})
