import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('G2 learner accounts remain distinct from CMS administrators', async () => {
  const config = await read('src/payload.config.ts')
  const admins = await read('src/collections/Users.ts')
  const learners = await read('src/collections/Learners.ts')
  const access = await read('src/lib/access.ts')
  assert.match(config, /admin:\s*\{ user: Users.slug/)
  assert.match(config, /collections:\s*\[Users, Learners,/)
  assert.match(admins, /create: adminsOnly/)
  assert.match(access, /req\.user\.collection === 'users'/)
  assert.match(learners, /slug: 'learners'/)
  assert.match(learners, /admin: \(\) => false/)
  assert.match(learners, /create: \(\) => false/)
  assert.match(learners, /req\.user\?\.collection === 'learners'/)
  assert.match(learners, /String\(req\.user\.id\) !== String\(id\)/)
  assert.match(learners, /delete: \(\) => false/)
  assert.match(learners, /verify: \{/)
})

test('profile update can edit only explicit public fields', async () => {
  const learners = await read('src/collections/Learners.ts')
  assert.match(learners, /new Set\(\['displayName', 'bio', 'preferredLanguage'\]\)/)
  assert.doesNotMatch(learners, /create: \(\) => true/)
  assert.doesNotMatch(learners, /admin: \(\) => true/)
  assert.match(learners, /maxLoginAttempts: 5/)
})

test('learner frontend uses Payload auth and never localStorage for credentials', async () => {
  const app = await read('src/components/LearnerAccount.tsx')
  const login = await read('src/app/(site)/login/page.tsx')
  const profile = await read('src/app/(site)/profile/page.tsx')
  const verify = await read('src/app/(site)/verify-email/page.tsx')
  for (const path of ['/api/learners/login','/api/learners/me','/api/learners/logout','/api/learners/verify/']) {
    assert.ok(app.includes(path), 'missing auth route: ' + path)
  }
  assert.match(app, /method: 'PATCH'/)
  assert.match(app, /credentials: 'same-origin'/)
  assert.doesNotMatch(app, /localStorage|sessionStorage|document\.cookie/)
  assert.match(login, /<LearnerLogin/)
  assert.match(profile, /<LearnerProfile/)
  assert.match(verify, /<LearnerVerify/)
})
