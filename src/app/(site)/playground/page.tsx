import Link from 'next/link'
import { Playground } from '@/components/Playground'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
  title: 'Kasa online playground',
  description: 'Write, run and check Twi-first Kasa programs inside the Kasa Learning Academy.',
}

const DEFAULT_SOURCE = 'ma edin = "Ghana"\nka "Akwaaba, " + edin\n'

/** Only embed HTTPS origins; never render an arbitrary iframe scheme. */
async function configuredPlaygroundUrl(): Promise<string | null> {
  let configured: string | undefined
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'playground-settings', overrideAccess: true })
    configured = typeof settings.playgroundUrl === 'string' ? settings.playgroundUrl.trim() : undefined
  } catch (error) {
    // Before the additive migration is applied, preserve the existing inline
    // interpreter rather than taking down the public playground route.
    let cause: unknown = error
    let missingTable = false
    for (let i = 0; i < 8 && cause && typeof cause === 'object'; i++) {
      if ((cause as {code?: unknown}).code === '42P01') { missingTable = true; break }
      cause = (cause as {cause?: unknown}).cause
    }
    if (!missingTable) throw error
    return null
  }
  if (!configured) return null
  try {
    const target = new URL(configured)
    if (target.protocol !== 'https:' || target.username || target.password) return null
    // Keep the destination at its root: do not propagate an untrusted query.
    return target.origin + '/'
  } catch {
    return null
  }
}

export const dynamic = 'force-dynamic'

export default async function PlaygroundPage() {
  const remote = await configuredPlaygroundUrl()
  return <div className="content-width academy-full-playground">
    <div className="page-heading">
      <span className="eyebrow">WRITE KASA · RUN IN YOUR BROWSER</span>
      <h1>Your Kasa coding playground.</h1>
      <p>Experiment with Twi-first programs while learning. Lessons and challenges also have their own inline code editors.</p>
    </div>
    {remote ? <>
      <div className="academy-playground-toolbar">
        <span>Full Kasa playground · Native WebAssembly where available, JavaScript fallback</span>
        <a className="button button-outline" href={remote} target="_blank" rel="noopener noreferrer">
          Open full playground in a new tab ↗
        </a>
      </div>
      <iframe
        title="Full Kasa programming playground"
        className="academy-playground-iframe"
        src={remote}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
      <p className="academy-playground-footnote">If the embedded playground is blocked by a browser privacy setting, use the link above. Your work stays in your browser profile unless you download it.</p>
    </> : <>
      <p className="academy-playground-footnote">The full Netlify playground is not connected yet. You can still practice here using Kasa's built-in JavaScript interpreter.</p>
      <Playground sourceCode={DEFAULT_SOURCE} />
    </>}
    <p className="academy-playground-footnote"><Link href="/learn">Explore Kasa lessons →</Link> · <Link href="/practice">Try a coding challenge →</Link></p>
  </div>
}
