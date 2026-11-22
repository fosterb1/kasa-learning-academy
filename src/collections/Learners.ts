import type { CollectionConfig } from 'payload'

/**
 * Student identities are intentionally distinct from CMS administrators.
 * The public self-registration endpoint stays CLOSED until a shared
 * rate-limiter, production mail adapter and abuse review are deployed.
 */
export const Learners: CollectionConfig = {
  slug: 'learners',
  auth: {
    verify: {
      generateEmailSubject: () => 'Verify your Kasa Academy learner account',
      generateEmailHTML: ({ token }) => {
        const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
        const url = base + '/verify-email?token=' + encodeURIComponent(token)
        return '<p>Akwaaba! Verify your Kasa Academy email to activate your learner account.</p><p><a href="' + url + '">Verify email</a></p>'
      },
    },
    // Per-account limit; infrastructure-wide throttling is still required before launch.
    forgotPassword: {
      expiration: 30 * 60 * 1000,
      minRequestInterval: 60 * 1000,
      generateEmailSubject: () => 'Reset your Kasa Academy learner password',
      generateEmailHTML: ({ token }) => {
        const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
        const url = base + '/reset-password?token=' + encodeURIComponent(token)
        return '<p>Someone requested a Kasa Academy learner password reset.</p>' +
          '<p>If this was you, use this link within 30 minutes: <a href="' + url + '">Reset password</a></p>' +
          '<p>If you did not request this, you may ignore the message.</p>'
      },
    },
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  admin: { useAsTitle: 'email', group: 'Learner Accounts', hidden: true },
  access: {
    admin: () => false,
    create: () => false,
    read: ({ req }) =>
      req.user?.collection === 'learners'
        ? { id: { equals: req.user.id } }
        : false,
    update: ({ req, id, data }) => {
      if (req.user?.collection !== 'learners' || String(req.user.id) !== String(id)) return false
      // User-facing profile updates must not mutate auth or verification metadata.
      const allowed = new Set(['displayName', 'bio', 'preferredLanguage'])
      return Boolean(data && Object.keys(data).every(key => allowed.has(key)))
    },
    delete: () => false,
  },
  fields: [
    { name: 'displayName', type: 'text', required: true, minLength: 2, maxLength: 100 },
    { name: 'bio', type: 'textarea', maxLength: 600 },
    { name: 'preferredLanguage', type: 'select',
      options: [
        { label: 'Twi / Akan', value: 'twi' },
        { label: 'English', value: 'english' },
        { label: 'Twi and English', value: 'bilingual' },
      ],
      defaultValue: 'bilingual',
    },
  ],
}
