import type { GlobalConfig } from 'payload'
import { adminsOnly } from '@/lib/access'
import { normalizePlaygroundUrl } from '@/lib/playground-url'

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
        if (value === null || value === undefined || value === '') return true
        return normalizePlaygroundUrl(value) !== null
          ? true
          : 'Enter a full HTTPS site-root address without credentials, path, query or fragment.'
      },
    },
  ],
}
