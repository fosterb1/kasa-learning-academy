import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = () => readFile(new URL('../scripts/test-g247-expired-reset.ts', import.meta.url), 'utf8')

test('expired-token probe is confined to dedicated local database with explicit consent', async () => {
  const s = await source()
  assert.match(s, /G24_ALLOW_LOCAL_EXPIRY_TEST === 'yes'/)
  assert.match(s, /NODE_ENV !== 'production'/)
  assert.match(s, /kasa_academy_dev/)
  assert.match(s, /url\.username === 'kasa_dev'/)
  assert.match(s, /G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes'/)
  assert.match(s, /@example\.invalid/)
})
test('expiry probe suppresses mail and modifies only a disposable token expiry', async () => {
  const s = await source()
  assert.match(s, /disableVerificationEmail: true/)
  assert.match(s, /disableEmail: true/)
  assert.match(s, /SET reset_password_expiration =/)
  assert.match(s, /WHERE id = \$\{id\} AND reset_password_token IS NOT NULL/)
  assert.match(s, /rows\.length, 1/)
  assert.doesNotMatch(s, /sendEmail\(|RESEND_API_KEY|console\.log\((email|token|originalPassword|replacementPassword)/)
})
test('expiry must be verified in database and rejected before confirming password unchanged', async () => {
  const s = await source()
  assert.match(s, /Date\.parse\(String\(issued\.resetPasswordExpiration\)\) > Date\.now\(\)/)
  assert.match(s, /Date\.parse\(String\(expired\.resetPasswordExpiration\)\) < Date\.now\(\)/)
  assert.match(s, /SECURITY FAILURE: expired reset token was accepted/)
  assert.match(s, /Original password stopped working after rejected reset/)
  assert.match(s, /finally \{/)
  assert.match(s, /await payload\.delete\(\{ collection: 'learners', id, overrideAccess: true \}\)/)
})
