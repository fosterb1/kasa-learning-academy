'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import './academy-navigation.css'

const groups = [
  {
    title: 'Learning paths',
    caption: 'Structured lessons from zero to useful programs',
    links: [
      { label: 'Start from zero', href: '/start' },
      { label: 'Programming foundations', href: '/start/meet-the-computer' },
      { label: 'Kasa syntax', href: '/learn/syntax' },
      { label: 'Algorithms', href: '/learn/algorithms' },
      { label: 'Data processing', href: '/learn/data' },
      { label: 'Applied programming', href: '/learn/applied' },
      { label: 'Software development', href: '/learn/development' },
    ],
  },
  {
    title: 'Practice & build',
    caption: 'Turn lessons into programs you can run',
    links: [
      { label: 'All challenges', href: '/practice' },
      { label: 'Ghana-inspired projects', href: '/projects' },
      { label: 'Full Kasa Studio', href: '/playground' },
      { label: 'Explore all lessons', href: '/learn' },
    ],
  },
  {
    title: 'Resources',
    caption: 'Everything you need while learning',
    links: [
      { label: 'Installation guide', href: '/learn/install' },
      { label: 'Kasa glossary', href: '/glossary' },
      { label: 'Guides', href: '/guides' },
      { label: 'Academy updates', href: '/announcements' },
    ],
  },
  {
    title: 'Your journey',
    caption: 'Find your next lesson and see your progress',
    links: [
      { label: 'Learning roadmap', href: '/learning-path' },
      { label: 'My learning', href: '/my-learning' },
    ],
  },
]

export function AcademyNavigation() {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        const trigger = navRef.current?.querySelector<HTMLButtonElement>('.academy-nav-trigger')
        trigger?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <header className="academy-header" ref={navRef} onMouseLeave={() => { if (window.matchMedia("(hover: hover) and (min-width: 851px)").matches) setOpen(false) }}>
      <div className="academy-header-inner">
        <Link href="/" className="logo-link" aria-label="Kasa Academy home" onClick={() => setOpen(false)}>
          <span className="logo-mark">K</span>
          <span><strong>Kasa</strong><small>Learning Academy</small></span>
        </Link>
        <nav className="academy-primary-nav" aria-label="Main navigation">
          <button
            className="academy-nav-trigger"
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls="academy-mega-menu"
            onMouseEnter={() => { if (window.matchMedia("(hover: hover) and (min-width: 851px)").matches) setOpen(true) }}
            onClick={() => setOpen(value => !value)}
          >
            Explore <span className="academy-chevron" aria-hidden="true">⌄</span>
          </button>
          <Link href="/learning-path" onClick={() => setOpen(false)}>Learning path</Link>
          <Link href="/practice" onClick={() => setOpen(false)}>Practice</Link>
          <Link href="/playground" onClick={() => setOpen(false)}>Studio</Link>
          <Link href="/my-learning" onClick={() => setOpen(false)}>My learning</Link>
        </nav>
        <Link href="/start" className="header-cta" onClick={() => setOpen(false)}>Start learning <span aria-hidden="true">↗</span></Link>
        <button
          className="academy-mobile-nav-toggle"
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-controls="academy-mega-menu"
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>
      </div>
      {open && (
        <div className="academy-mega-menu" id="academy-mega-menu">
          <div className="academy-mega-intro">
            <div>
              <span className="academy-mega-eyebrow">AKWAABA · EXPLORE KASA</span>
              <p>Choose what you want to learn, build, or review.</p>
            </div>
            <Link href="/learn" className="academy-mega-all" onClick={() => setOpen(false)}>Browse the course catalog →</Link>
          </div>
          <div className="academy-mega-grid">
            {groups.map(group => (
              <section className="academy-mega-group" key={group.title} aria-label={group.title}>
                <h2>{group.title}</h2>
                <p>{group.caption}</p>
                <ul>
                  {group.links.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
