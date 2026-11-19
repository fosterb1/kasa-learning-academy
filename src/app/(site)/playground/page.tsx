import type { Metadata } from 'next'
import { ExternalPlaygroundLink } from '@/components/ExternalPlaygroundLink'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kasa Studio — Full Playground',
  description: 'The complete first-party Kasa programming playground with Native WebAssembly and a JavaScript fallback, hosted inside Kasa Learning Academy.',
}

/**
 * Own-origin static studio lives in /public/kasa-studio.
 * The iframe isolates its dark editor styling from the Academy CMS layout.
 * The source, worker, native JS and WASM all resolve to THIS origin:
 * the Netlify deployment and Payload CMS setting are no longer prerequisites.
 */
export default function PlaygroundPage() {
  return <section className="academy-native-playground" aria-label="Kasa full-screen programming playground">
    <iframe
      title="Kasa Studio — full native WebAssembly playground"
      src="/kasa-studio/index.html"
      className="academy-native-playground-frame"
      referrerPolicy="same-origin"
      allow="clipboard-write"
    />
    <ExternalPlaygroundLink />
    <noscript>
      <p>JavaScript is required to run Kasa in your browser. You can still read the <a href="/learn">Kasa learning materials</a>.</p>
    </noscript>
  </section>
}
