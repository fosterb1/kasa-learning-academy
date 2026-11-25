/**
 * Development-only operator command to resend an existing verification link.
 * This is NOT a public HTTP route and never creates or verifies an account.
 *
 * Example (PowerShell):
 *   $env:G23_RESEND_TO = 'recipient@example.com'
 *   node --env-file=.env.local --import tsx scripts/resend-g23-local-verification.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const fail = (message: string): never => { throw new Error(message) }
const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])
const targetEmail = process.env.G23_RESEND_TO?.trim().toLowerCase() || ''
const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid')
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

if (process.env.NODE_ENV === 'production' ||
    process.env.G23_ALLOW_LOCAL_RESEND !== 'yes' ||
    !localHosts.has(database.hostname) ||
    database.pathname !== '/kasa_academy_dev' ||
    database.username !== 'kasa_dev' ||
    !localHosts.has(site.hostname) ||
    site.protocol !== 'http:' ||
    !process.env.RESEND_API_KEY?.trim() ||
    !process.env.RESEND_FROM_ADDRESS?.trim() ||
    !process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
  fail('Refusing resend: explicit local-only database, site, email adapter and consent gates are required.')
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail) || targetEmail.length > 254) {
  fail('Set G23_RESEND_TO to one existing test learner email.')
}

const payload = await getPayload({ config })
const lookup = await payload.find({
  collection: 'learners',
  where: { email: { equals: targetEmail } },
  limit: 2,
  overrideAccess: true,
  showHiddenFields: true,
})
if (lookup.docs.length !== 1) fail('Expected exactly one local learner record; no email sent.')
const learner = lookup.docs[0]
if (learner._verified === true) fail('Account is already verified; no email sent.')
const token = typeof learner._verificationToken === 'string' ? learner._verificationToken : ''
if (!token) {
  throw new Error('No existing verification token is available. No email sent; token was not regenerated.')
}

const verifyUrl = new URL('/verify-email', site)
verifyUrl.searchParams.set('token', token)
await payload.sendEmail({
  to: targetEmail,
  subject: 'Verify your Kasa Academy learner account',
  html: '<p>Akwaaba! Verify your Kasa Academy learner account:</p>' +
    '<p><a href="' + verifyUrl.toString().replaceAll('&', '&amp;') + '">Verify email</a></p>',
})
console.log('Verification email handed to configured delivery provider for the existing test learner.')
