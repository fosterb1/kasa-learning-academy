import type { GlobalConfig } from 'payload'
import { adminsOnly } from '@/lib/access'

/** One editable CMS setting; administrators can update the Netlify URL without redeploying. */
export const PlaygroundSettings: GlobalConfig = {
  slug: 'playground-settings',
  label: 'Playground Settings',
  admin: { group: 'Website Settings', description: 'Connect the full Netlify playground to the Learning Academy.' },
  access: {
    read: adminsOnly,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'playgroundUrl',
      label: 'Netlify Playground URL',
      type: 'text',
      admin: {
        description: 'Paste the full HTTPS address, for example https://your-kasa-playground.netlify.app/. Save to update /playground immediately; leave blank for the local built-in editor.',
        placeholder: 'https://your-kasa-playground.netlify.app/',
      },
      validate: (value: unknown) => {
        if (!value || (typeof value === 'string' && !value.trim())) return true
        if (typeof value !== 'string') return 'Enter a valid HTTPS URL.'
        try {
          const url = new URL(value.trim())
          if (url.protocol !== 'https:' || url.username || url.password ||
              url.search || url.hash || url.pathname !== '/' ||
              !url.hostname.includes('.')) {
            return 'Use a full HTTPS site-root URL with no username, password, query or fragment.'
          }
          return true
        } catch {
          return 'Enter a valid HTTPS URL, for example https://your-site.netlify.app/.'
        }
      },
    },
  ],
}
