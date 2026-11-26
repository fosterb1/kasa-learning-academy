import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const script = () => readFile(new URL('../scripts/test-g246-logout-http.ts', import.meta.url), 'utf8')

test('logout HTTP probe is explicitly authorized and confined to dedicated localhost DB', async () => {
  const s = await script()
  assert.match(s, /G24_ALLOW_LOCAL_LOGOUT_TEST === 'yes'/)
  assert.match(s, /kasa_academy_dev/)
  assert.match(s, /db\.username === 'kasa_dev'/)
  assert.match(s, /localHosts\.has\(origin\.hostname\)/)
  assert.match(s, /@example\.invalid/)
  assert.match(s, /disableVerificationEmail: true/)
  assert.doesNotMatch(s, /sendEmail|forgotPassword\(|resetPassword\(/)
})
test('probe tests login cookie, authenticated me, logout, signed-out me and old-cookie replay', async () => {
  const s = await script()
  assert.match(s, /\/api\/learners\/login/)
  assert.match(s, /\/api\/learners\/me/)
  assert.match(s, /\/api\/learners\/logout/)
  assert.match(s, /const replay = await call/)
  assert.match(s, /SECURITY OBSERVATION: pre-logout cookie is STILL accepted/)
  assert.match(s, /finally \{/)
  assert.match(s, /await payload\.delete\(/)
  assert.doesNotMatch(s, /console\.log\((email|password|cookie|record\._verificationToken)/)
})
