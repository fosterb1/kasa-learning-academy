import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('Resend adapter is pinned to the existing Payload version', async () => {
  const pkg = JSON.parse(await read('package.json'))
  assert.equal(pkg.dependencies['@payloadcms/email-resend'], pkg.dependencies.payload)
})

test('email adapter is opt-in, server-only, and is not configured with example credentials', async () => {
  const config = await read('src/payload.config.ts')
  assert.match(config, /import \{ resendAdapter \} from '@payloadcms\/email-resend'/)
  assert.match(config, /process\.env\.RESEND_API_KEY/)
  assert.match(config, /process\.env\.RESEND_FROM_ADDRESS/)
  assert.match(config, /resendApiKey && resendFromAddress/)
  assert.match(config, /email,/)
  assert.doesNotMatch(config, /NEXT_PUBLIC_RESEND|onboarding@resend\.dev|re_[a-zA-Z0-9]{12,}/)
})

test('registration fails closed without real delivery configuration', async () => {
  const route = await read('src/app/api/learner-registration/route.ts')
  const check = route.indexOf('RESEND_API_KEY')
  const create = route.indexOf('await payload.create')
  assert.ok(check !== -1 && check < create)
  assert.match(route, /RESEND_FROM_ADDRESS/)
  assert.match(route, /status: 503/)
  assert.match(route, /NODE_ENV === 'production'/)
  assert.match(route, /G2_ENABLE_LOCAL_SIGNUP !== 'yes'/)
})
