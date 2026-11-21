import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import './site.css'

export const metadata: Metadata = {
  title: { default: 'Kasa Learning Academy — Learn Programming in Twi', template: '%s | Kasa Academy' },
  description: 'Learn the Kasa programming language for free: tutorials, interactive Twi coding, setup guides, quizzes and practical projects.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="logo-link" aria-label="Kasa Academy home"><span className="logo-mark">K</span><span><strong>Kasa</strong><small>Learning Academy</small></span></Link>
        <nav className="primary-nav" aria-label="Main navigation">
          <Link href="/start">Start from zero</Link><Link href="/learn">Learn</Link><Link href="/my-learning">My learning</Link><Link href="/learn/syntax">Syntax</Link><Link href="/practice">Practice</Link><Link href="/playground">Playground</Link><Link href="/guides">Set up Kasa</Link><Link href="/announcements">Updates</Link>
        </nav>
        <Link href="/start" className="header-cta">Start learning <span aria-hidden="true">↗</span></Link>
      </header>
      <main id="main" className="main-content">{children}</main>
      <footer className="site-footer"><span>© {new Date().getUTCFullYear()} Kasa Learning Academy · Free to learn, built for curious minds.</span><span><Link href="https://github.com/fosterb1/kasa_programming_language" target="_blank">Kasa language ↗</Link><Link href="/admin">Admin</Link></span></footer>
    </div>
  </body></html>
}
