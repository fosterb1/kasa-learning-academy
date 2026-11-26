import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = () => readFile(new URL('../scripts/test-g248-token-flow-http.ts', import.meta.url), 'utf8')

test('G2.4.8 HTTP probe is confined to explicitly approved localhost and dedicated DB', async () => {
  const s = await source()
  assert.match(s, /G248_ALLOW_LOCAL_HTTP_TEST === 'yes'/)
  assert.match(s, /NODE_ENV !== 'production'/)
  assert.match(s, /db\.pathname === '\/kasa_academy_dev'/)
  assert.match(s, /db\.username === 'kasa_dev'/)
  assert.match(s, /hosts\.has\(origin\.hostname\)/)
  assert.match(s, /G24_ENABLE_LOCAL_RATE_LIMIT === 'yes'/)
  assert.match(s, /G24_RATE_LIMIT_SECRET/)
  assert.match(s, /@example\.invalid/)
})

test('probe never puts tokens in HTTP URLs, sends no email, and deletes fixture', async () => {
  const s = await source()
  assert.match(s, /!url\.search && !url\.hash/)
  assert.match(s, /disableVerificationEmail: true/)
  assert.match(s, /disableEmail: true/)
  assert.match(s, /\/api\/learner-verify-token/)
  assert.match(s, /\/api\/learners\/reset-password/)
  assert.match(s, /'no-referrer'/)
  assert.match(s, /'no-store'/)
  assert.match(s, /finally \{/)
  assert.match(s, /await payload\.delete\(\{ collection: 'learners', id, overrideAccess: true \}\)/)
  assert.doesNotMatch(s, /sendEmail\(|console\.log\((email|resetToken|initialPassword|changedPassword)/)
})

test('probe distinguishes HTTP security checks from untested browser fragment clearing', async () => {
  const s = await source()
  assert.match(s, /browser URL clearing still unverified/)
  assert.match(s, /original password still accepted/)
  assert.match(s, /Changed password login unsuccessful/)
})
