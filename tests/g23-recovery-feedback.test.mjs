import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const component = await readFile(new URL('../src/components/LearnerRecovery.tsx', import.meta.url), 'utf8')

test('forgot-password UI requires successful HTTP response before displaying confirmation', () => {
  assert.match(component, /response\.status === 429/)
  assert.match(component, /else if \(!response\.ok\)/)
  assert.match(component, /setMessage\('We could not process your request/)
  assert.match(component, /else \{\s*\/\/ Do not reveal whether the email address exists\.\s*setSubmitted\(true\)/)
})
test('recovery UI avoids claiming configured email delivery before successful request', () => {
  assert.doesNotMatch(component, /will be sent when email delivery is configured/)
  assert.match(component, /If an account exists for that email/)
  assert.match(component, /check your inbox/)
})
