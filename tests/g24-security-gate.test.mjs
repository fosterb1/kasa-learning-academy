import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('public learner collection creation remains closed', async () => {
  const learners = await read('src/collections/Learners.ts')
  assert.match(learners, /create: \(\) => false/)
  assert.match(learners, /admin: \(\) => false/)
})

test('signup route requires localhost, dedicated DB and explicit dev flag', async () => {
  const route = await read('src/app/api/learner-registration/route.ts')
  assert.match(route, /NODE_ENV === 'production'/)
  assert.match(route, /G2_ENABLE_LOCAL_SIGNUP !== 'yes'/)
  assert.match(route, /database\.pathname === '\/kasa_academy_dev'/)
  assert.match(route, /database\.username === 'kasa_dev'/)
  assert.match(route, /origin !== target\.origin/)
})

test('existing recovery UI avoids false success on HTTP failures', async () => {
  const component = await read('src/components/LearnerRecovery.tsx')
  assert.match(component, /else if \(!response\.ok\)/)
  assert.match(component, /response\.status === 429/)
})

test('release gate explicitly records open security blockers', async () => {
  const gate = await read('docs/G24_AUTH_SECURITY_GATE.md')
  for (const term of ['distributed rate limits','session','enumeration','redaction','public signup CLOSED']) {
    assert.ok(gate.toLowerCase().includes(term.toLowerCase()), 'missing gate ' + term)
  }
})
