import Link from 'next/link'
import roadmap from '@/lib/learning-path.json'

export const metadata = {
 title: 'Kasa Academy learning pathway — from your first program to projects',
 description: 'Follow a Ghana-first eight-stage Kasa programming roadmap with clear prerequisites and honest availability.',
}

const labels: Record<string, string> = {
 available: 'Available now', review: 'In review — draft course', experimental: 'Experimental', planned: 'Planned — not yet available',
}

export default function LearningPathPage() {
 const stages = roadmap.stages
 return <main className="content-width academy-roadmap">
  <header className="page-heading">
   <span className="eyebrow">KASA ACADEMY · LEARNING ROADMAP</span>
   <h1>From your first instruction to your own project.</h1>
   <p>{roadmap.description}</p>
   <p>Pick a stage you feel ready for. Prerequisites are recommendations, not locked lessons. You can always revisit an earlier topic.</p>
  </header>
  <nav className="academy-roadmap-quicklinks" aria-label="Learning roadmap stages">
   {stages.map(stage=><a key={stage.id} href={'#stage-'+stage.id}>{String(stage.number).padStart(2,'0')} · {stage.title}</a>)}
  </nav>
  <div className="academy-roadmap-list">
   {stages.map(stage=><section className="academy-roadmap-stage" key={stage.id} id={'stage-'+stage.id}>
    <div className="academy-roadmap-index" aria-hidden="true">{String(stage.number).padStart(2,'0')}</div>
    <div className="academy-roadmap-content">
     <div className="academy-roadmap-heading"><div><span className="eyebrow">{stage.level} · {stage.duration}</span><h2>{stage.title}</h2></div><span className={'academy-roadmap-status academy-roadmap-status-'+stage.status}>{labels[stage.status]}</span></div>
     <p><strong>Prerequisites:</strong> {stage.prerequisites.length ? stage.prerequisites.map(id=>stages.find(s=>s.id===id)?.title || id).join(' · ') : 'None — start here'}</p>
     <h3>What you will learn</h3>
     <ul>{stage.outcomes.map(outcome=><li key={outcome}>{outcome}</li>)}</ul>
     <p><strong>Practice milestone:</strong> {stage.assessment}</p>
     <p className="academy-roadmap-video-note"><strong>Media:</strong> {stage.videoPolicy}</p>
     {stage.route ? <Link className="button button-primary" href={stage.route}>{stage.status==='experimental'?'Explore experimental lesson':stage.status==='review'?'Preview draft course':'Explore this stage'} →</Link> : <p className="academy-roadmap-planned">This course is not yet published. Continue with the available stages while we prepare its lessons and assessments.</p>}
    </div>
   </section>)}
  </div>
  <section className="syntax-route-info"><h2>How progression works today</h2><p>Learning stages guide study order. There are no automatic prerequisites, course certifications or assessed mastery gates yet. Completing a lesson in the existing catalog stores an optional progress mark in this browser only. We are designing future CMS-managed course/module/lesson relationships without overwriting published videos or transcripts.</p><p><Link href="/learn">See published CMS lessons →</Link> · <Link href="/language-status">Language feature compatibility →</Link></p></section>
 </main>
}
