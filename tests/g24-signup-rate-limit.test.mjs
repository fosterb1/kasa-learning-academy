import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('registration checks shared PostgreSQL counter before creating any account', async () => {
  const source = await read('src/app/api/learner-registration/route.ts')
  const limit = source.indexOf("await checkLocalAuthRateLimit({ purpose: 'signup', account: email })")
  const create = source.indexOf('await payload.create(')
  assert.ok(limit > 0 && create > limit, 'rate check must precede all account writes')
  assert.match(source, /G24_ENABLE_LOCAL_RATE_LIMIT !== 'yes'/)
  assert.match(source, /!decision\.allowed/)
  assert.match(source, /status: 429/)
  assert.match(source, /'Retry-After': String\(decision\.retryAfterSeconds\)/)
  assert.doesNotMatch(source, /x-forwarded-for|x-real-ip/i)
})

test('registration remains local-only and public collection creation is forbidden', async () => {
  const route = await read('src/app/api/learner-registration/route.ts')
  const learners = await read('src/collections/Learners.ts')
  assert.match(route, /NODE_ENV === 'production'/)
  assert.match(route, /G2_ENABLE_LOCAL_SIGNUP !== 'yes'/)
  assert.match(route, /database\.pathname === '\/kasa_academy_dev'/)
  assert.match(learners, /create: \(\) => false/)
})

test('signup UI does not present a rate-limit rejection as success', async () => {
  const ui = await read('src/components/LearnerSignup.tsx')
  const throttle = ui.indexOf('response.status === 429')
  const success = ui.indexOf('setSuccess(true)')
  assert.ok(throttle > 0 && success > throttle)
  assert.match(ui, /Too many registration attempts/)
})
