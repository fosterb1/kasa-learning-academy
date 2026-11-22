import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademyNavigation } from '@/components/AcademyNavigation'
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
      <AcademyNavigation />
      <main id="main" className="main-content">{children}</main>
      <footer className="site-footer"><span>© {new Date().getUTCFullYear()} Kasa Learning Academy · Free to learn, built for curious minds.</span><span><Link href="https://github.com/fosterb1/kasa_programming_language" target="_blank">Kasa language ↗</Link><Link href="/learn/syntax">Syntax</Link><Link href="/learn/applied">Applied labs</Link><Link href="/guides">Guides</Link><Link href="/announcements">Updates</Link><Link href="/my-learning">My learning</Link><Link href="/admin">Admin</Link></span></footer>
    </div>
  </body></html>
}
