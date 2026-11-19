import {getPayload} from 'payload'
import config from '@/payload.config'
import {normalizePlaygroundUrl} from '@/lib/playground-url'

/**
 * Optional CMS-managed external Netlify playground. Never replaces the
 * bundled own-origin Kasa Studio or executes administrator-supplied HTML.
 * Publicly expose only the already-validated URL; CMS edits remain admin-only.
 */
export async function ExternalPlaygroundLink() {
 if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) return null
 try {
  const payload = await getPayload({config})
  const settings = await payload.findGlobal({slug:'playground-settings', overrideAccess:true})
  const href = normalizePlaygroundUrl(settings.playgroundUrl)
  if (!href) return null
  return <p className="academy-external-playground-link">
   Prefer the standalone Netlify edition? <a href={href} target="_blank" rel="noopener noreferrer">Open the separately hosted Kasa playground</a>.
   The Academy&apos;s embedded Studio above remains the recommended first-party version.
  </p>
 } catch {
  // The bundled first-party Studio works even when optional CMS is unavailable.
  return null
 }
}
