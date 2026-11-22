/**
 * G2.1 development-only security integration check.
 * Creates two random, temporary learner identities, verifies login/access,
 * then deletes the fixtures with explicit Local API privileged cleanup.
 *
 * Run ONLY against an isolated disposable development database, NEVER prod.
 * All auth tokens and generated passwords stay in memory, never printed.
 */
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const url = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(url.hostname)
if (!isLocal || url.pathname !== '/kasa_academy_dev' || url.username !== 'kasa_dev' ||
    process.env.G2_ALLOW_DEV_AUTH_TEST !== 'yes' || process.env.NODE_ENV === 'production') {
  throw new Error('Refusing G2 auth test: only explicitly authorized local kasa_academy_dev is supported.')
}
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
  throw new Error('Refusing G2 auth test: PAYLOAD_SECRET is missing or too short.')
}

const db = await getPayload({ config })
const suffix = randomBytes(9).toString('hex')
const password = randomBytes(32).toString('hex')
const emails = [`g2-integration-a-${suffix}@example.invalid`, `g2-integration-b-${suffix}@example.invalid`]
const ids: Array<string | number> = []
let failed = false

async function mustReject(label: string, action: () => Promise<unknown>) {
  let rejected = false
  try { await action() } catch { rejected = true }
  assert.ok(rejected, label + ' unexpectedly succeeded')
  console.log('PASS: ' + label)
}

try {
  for (const [index, email] of emails.entries()) {
    const created = await db.create({
      collection: 'learners',
      overrideAccess: true,
      disableVerificationEmail: true,
      data: {
        email,
        password,
        displayName: index === 0 ? 'G2 Alice' : 'G2 Bob',
      },
    })
    ids.push(created.id)
  }
  console.log('PASS: two temporary development learners created')

  await mustReject('public learner registration blocked', () => db.create({
    collection: 'learners', overrideAccess: false, data: {
      email: `g2-denied-${suffix}@example.invalid`, password, displayName: 'Denied',
    },
  }))

  // Verification is required. Obtain the LOCAL, hidden token and redeem it
  // through the maintained Payload operation (never print or expose the token).
  await mustReject('unverified learner cannot log in', () => db.login({
    collection: 'learners', data: { email: emails[0], password },
  }))
  for (const id of ids) {
    const record = await db.findByID({
      collection: 'learners', id, overrideAccess: true, showHiddenFields: true,
    })
    const token = record._verificationToken
    assert.equal(typeof token, 'string', 'verification token must exist')
    assert.ok(token, 'empty verification token')
    const verified = await db.verifyEmail({ collection: 'learners', token })
    assert.ok(verified, 'verification operation must succeed')
  }
  console.log('PASS: email ownership verification through Payload')

  const logins = await Promise.all(emails.map(email =>
    db.login({ collection: 'learners', data: { email, password } }),
  ))
  assert.ok(logins.every(x => x.token && x.user), 'both logins must produce auth result')
  console.log('PASS: verified learners can log in')

  const [alice, bob] = logins.map(x => x.user)
  if (!alice || !bob) throw new Error('Both learners must authenticate')
  assert.equal(alice.collection, 'learners')
  assert.equal(bob.collection, 'learners')
  assert.notEqual(alice.id, bob.id)

  const own = await db.find({
    collection: 'learners', user: alice, overrideAccess: false, limit: 20,
  })
  assert.equal(own.totalDocs, 1, 'learner should see only own record')
  assert.equal(own.docs[0]?.id, alice.id)
  console.log('PASS: learner can read only their own profile')

  await mustReject('learner cannot change another learner profile', () => db.update({
    collection: 'learners', id: bob.id, user: alice, overrideAccess: false,
    data: { displayName: 'Compromised' },
  }))
  await mustReject('learner cannot change verification flags', () => db.update({
    collection: 'learners', id: alice.id, user: alice, overrideAccess: false,
    data: { _verified: false },
  }))
  await mustReject('learner cannot modify CMS administrator records', () => db.find({
    collection: 'users', user: alice, overrideAccess: false,
  }))
  await mustReject('learner cannot create CMS lessons', () => db.create({
    collection: 'modules', user: alice, overrideAccess: false,
    data: { title: 'Forbidden', slug: 'g2-forbidden-' + suffix, order: 1 },
  }))

  const updated = await db.update({
    collection: 'learners', id: alice.id, user: alice, overrideAccess: false,
    data: { displayName: 'Updated G2 Alice', bio: 'Testing Twi', preferredLanguage: 'twi' },
  })
  assert.equal(updated.displayName, 'Updated G2 Alice')
  assert.equal(updated.preferredLanguage, 'twi')
  console.log('PASS: own allowlisted profile update succeeds')

  const after = await db.findByID({
    collection: 'learners', id: bob.id, overrideAccess: true,
  })
  assert.equal(after.displayName, 'G2 Bob', 'other learner must remain unchanged')
  console.log('PASS: second learner remains unchanged')
} catch (error) {
  failed = true
  console.error('G2 auth integration FAILED:', error instanceof Error ? error.message : error)
} finally {
  for (const id of ids) {
    try {
      await db.delete({ collection: 'learners', id, overrideAccess: true })
    } catch (error) {
      failed = true
      console.error('G2 cleanup FAILED for temporary id ' + id + ':', error instanceof Error ? error.message : error)
    }
  }
  console.log('G2 temporary learner cleanup complete')
}
process.exit(failed ? 1 : 0)
