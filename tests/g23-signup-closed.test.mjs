import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8')

test('G2.3 signup requires local-only explicit activation and never opens production', async () => {
  const route = await read('src/app/api/learner-registration/route.ts')
  assert.match(route, /NODE_ENV === 'production'/)
  assert.match(route, /G2_ENABLE_LOCAL_SIGNUP !== 'yes'/)
  assert.match(route, /kasa_academy_dev/)
  assert.match(route, /database\.username === 'kasa_dev'/)
  assert.match(route, /status: 503/)
  assert.match(route, /origin !== target\.origin/)
  assert.match(route, /overrideAccess: true/)
  assert.match(route, /Object\.keys\(body\)\.some/)
  assert.doesNotMatch(route, /console\.log/)
})

test('public Payload learner creation remains closed and administrator identities separate', async () => {
  const learners = await read('src/collections/Learners.ts')
  assert.match(learners, /create: \(\) => false/)
  assert.match(learners, /admin: \(\) => false/)
})

test('signup page preserves guest access and makes preview status visible', async () => {
  const page = await read('src/app/(site)/signup/page.tsx')
  const form = await read('src/components/LearnerSignup.tsx')
  assert.match(page, /LearnerSignup/)
  assert.match(form, /closed development preview/)
  assert.match(form, /href="\/learn"/)
  assert.match(form, /password !== confirm/)
  assert.match(form, /\/api\/learner-registration/)
})
