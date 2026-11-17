/** One-time, explicit administrative bootstrap. No public account signup route. */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!email || !email.includes('@') || !password || password.length < 16) {
  console.error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters in .env.local')
  process.exit(1)
}
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
  console.error('PAYLOAD_SECRET must be a unique random secret with at least 32 characters')
  process.exit(1)
}
const payload = await getPayload({ config })
const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
if (totalDocs > 0) {
  console.log('Users already exist. No account was created or modified.')
  process.exit(0)
}
await payload.create({ collection: 'users', overrideAccess: true, data: { email, password, displayName: 'Kasa Administrator' } })
console.log(`Created first Kasa Academy administrator: ${email}`)
process.exit(0)
