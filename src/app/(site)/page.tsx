import Link from 'next/link'
import { lessons, modules, challenges, announcements } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [allLessons, allModules, allChallenges, updates] = await Promise.all([lessons(), modules(), challenges(), announcements()])
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">AKWAABA · WELCOME TO KASA</span>
        <h1>Programming starts with <em>your own words.</em></h1>
        <p>Learn to build real programs using Twi-first syntax. Start with a single line, practice in your browser, and work toward real projects. No fee, no account, no barriers.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/learn">Explore free lessons <span aria-hidden="true">→</span></Link><Link className="button button-outline" href="/guides">How to install Kasa</Link></div>
        <div className="mini-stat"><span><b>{allModules.length}</b> learning modules</span><span><b>{allLessons.length}</b> lessons</span><span><b>{allChallenges.length}</b> challenges</span></div>
      </div>
      <div className="hero-terminal" aria-label="Example Kasa program and its output">
        <div className="terminal-head"><span className="terminal-dots">● ● ●</span><span>maakye.kasa</span><span>● Kasa</span></div>
        <div className="terminal-lines"><div><span>01</span><code><i># Your first Kasa program</i></code></div><div><span>02</span><code><b>ma</b> edin = <em>"Akosua"</em></code></div><div><span>03</span><code><b>ka</b> <em>"Maakye, "</em> + edin</code></div><div><span>04</span><code><b>mpɛn</b> 2</code></div><div><span>05</span><code>    <b>ka</b> <em>"Meda wo ase!"</em></code></div><div><span>06</span><code><b>awiei</b></code></div></div>
        <div className="terminal-output"><small>OUTPUT</small><pre>Maakye, Akosua{'\n'}Meda wo ase!{'\n'}Meda wo ase!</pre></div>
      </div>
    </section>
    <section className="section-intro"><div><span className="eyebrow">A CLEAR PATH TO CONFIDENCE</span><h2>From your first <code>ka</code> to building useful programs.</h2></div><p>Short lessons, runnable examples, and hands-on challenges. Learn at your own pace.</p></section>
    <div className="feature-grid"><div className="feature-card"><span className="feature-icon">⌨</span><h3>Learn by writing code</h3><p>Run Twi-first programs inside every lesson—directly in your browser.</p></div><div className="feature-card"><span className="feature-icon">◎</span><h3>Understand every step</h3><p>Simple explanations, practical examples and short quizzes that reinforce ideas.</p></div><div className="feature-card"><span className="feature-icon">↗</span><h3>Build real projects</h3><p>Work with savings calculations, grades, inventory and much more.</p></div></div>
    <section className="section-block"><div className="section-header"><div><span className="eyebrow">YOUR LEARNING JOURNEY</span><h2>Explore learning modules</h2></div><Link className="text-link" href="/learn">All lessons →</Link></div><div className="module-grid">{allModules.map((m,i)=><Link href="/learn" key={m.id} className="module-card"><span className="module-number">0{i+1}</span><h3>{m.title}</h3><p>{m.description || m.subtitle}</p><span className="text-link">Explore module →</span></Link>)}{allModules.length===0&&<div className="empty-state">The first lessons are being prepared. Check back soon.</div>}</div></section>
    {updates.length>0&&<section className="announcement-strip"><div><span className="eyebrow">LATEST NEWS</span><h3>{updates[0].title}</h3><p>{updates[0].summary}</p></div><Link href="/announcements" className="button button-outline">View updates →</Link></section>}
    <section className="cta-section"><span className="eyebrow">LEARNING BELONGS TO EVERYONE</span><h2>Your first program is one click away.</h2><p>All lessons are free. Progress is saved only in your browser.</p><Link className="button button-primary" href="/learn">Start learning Kasa →</Link></section>
  </>
}
