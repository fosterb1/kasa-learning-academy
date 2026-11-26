import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('new learner email links use fragments, not server logged query strings', async () => {
  const source = await read('src/collections/Learners.ts')
  assert.match(source, /\/reset-password#token=/)
  assert.match(source, /\/verify-email#token=/)
  assert.doesNotMatch(source, /\/reset-password\?token=|\/verify-email\?token=/)
})

test('pages do not read sensitive searchParams on server', async () => {
  for (const path of ['src/app/(site)/reset-password/page.tsx',
    'src/app/(site)/verify-email/page.tsx']) {
    const source = await read(path)
    assert.doesNotMatch(source, /searchParams|\btoken=\{/)
  }
  const hook = await read('src/lib/use-fragment-auth-token.ts')
  assert.match(hook, /window\.location\.hash/)
  assert.match(hook, /history\.replaceState/)
  assert.doesNotMatch(hook, /localStorage|sessionStorage|console\.log/)
})

test('verification is submitted with POST body rather than token-bearing URL', async () => {
  const account = await read('src/components/LearnerAccount.tsx')
  const route = await read('src/app/api/learner-verify-token/route.ts')
  assert.match(account, /\/api\/learner-verify-token/)
  assert.match(account, /JSON\.stringify\(\{ token \}\)/)
  assert.doesNotMatch(account, /\/api\/learners\/verify\/.*encodeURIComponent\(token\)/)
  assert.match(route, /checkLocalAuthRateLimit\(\{ purpose: 'verify-email', account: token \}\)/)
  assert.match(route, /G24_ENABLE_LOCAL_RATE_LIMIT/)
  assert.match(route, /process\.env\.NODE_ENV === 'production'/)
  assert.match(route, /payload\.verifyEmail\(\{ collection: 'learners', token \}\)/)
})

test('token landing pages disable Referrer and caching', async () => {
  const config = await read('next.config.mjs')
  assert.match(config, /'Referrer-Policy', value: 'no-referrer'/)
  assert.match(config, /'Cache-Control', value: 'no-store'/)
})
