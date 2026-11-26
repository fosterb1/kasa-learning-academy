import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('learner password recovery uses collection-scoped reset operations', async () => {
  const collection = await read('src/collections/Learners.ts')
  assert.match(collection, /forgotPassword:\s*\{/)
  assert.match(collection, /expiration:\s*30 \* 60 \* 1000/)
  assert.match(collection, /minRequestInterval:\s*60 \* 1000/)
  assert.match(collection, /reset-password#token=/)
  assert.doesNotMatch(collection, /reset-password\?token=/)
  assert.match(collection, /create:\s*\(\) => false/)
  assert.match(collection, /admin:\s*\(\) => false/)
})

test('recovery pages are learners-only and do not store credentials in local storage', async () => {
  const component = await read('src/components/LearnerRecovery.tsx')
  const forgot = await read('src/app/(site)/forgot-password/page.tsx')
  const reset = await read('src/app/(site)/reset-password/page.tsx')
  const login = await read('src/components/LearnerAccount.tsx')
  assert.match(component, /\/api\/learners\/forgot-password/)
  assert.match(component, /\/api\/learners\/reset-password/)
  assert.match(component, /password\.length < 16/)
  assert.match(component, /password !== confirm/)
  assert.match(component, /If an account exists/)
  assert.match(component, /router\.replace\('\/reset-password'\)/)
  assert.doesNotMatch(component, /localStorage|sessionStorage|console\.log|document\.cookie/)
  assert.match(forgot, /LearnerForgotPassword/)
  assert.match(reset, /LearnerResetPassword/)
  assert.match(login, /href="\/forgot-password"/)
})

test('registration remains closed; recovery is not production-ready without global throttling and mail adapter', async () => {
  const learners = await read('src/collections/Learners.ts')
  const config = await read('src/payload.config.ts')
  assert.match(learners, /create:\s*\(\) => false/)
  assert.match(config, /admin:\s*\{ user: Users.slug/)
  assert.doesNotMatch(config, /email:\s*.*resendAdapter|email:\s*.*nodemailerAdapter/)
})
