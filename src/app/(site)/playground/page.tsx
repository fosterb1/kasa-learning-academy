import Link from 'next/link'
import { Playground } from '@/components/Playground'

export const metadata = {
  title: 'Kasa online playground',
  description: 'Write, run and check Twi-first Kasa programs inside the Kasa Learning Academy.',
}

const DEFAULT_SOURCE = 'ma edin = "Ghana"\nka "Akwaaba, " + edin\n'

/** Only embed HTTPS origins; never render an arbitrary iframe scheme. */
function configuredPlaygroundUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_KASA_PLAYGROUND_URL?.trim()
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

export default function PlaygroundPage() {
  const remote = configuredPlaygroundUrl()
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
