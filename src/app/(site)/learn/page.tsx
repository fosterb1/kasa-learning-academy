import Link from 'next/link'
import { lessons, modules } from '@/lib/content'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Free programming lessons' }
export default async function LessonsIndex() {
  const [items, groups] = await Promise.all([lessons(), modules()])
  return <div className="content-width"><div className="page-heading"><span className="eyebrow">THE KASA CURRICULUM</span><h1>Learn Kasa, one step at a time.</h1><p>Choose a lesson, try the code, and mark your progress. Every lesson is free.</p></div>
    <div className="course-layout"><aside className="course-rail"><b>Learning path</b>{groups.map((g,i)=><a key={g.slug} href={'#'+g.slug}><span>{String(i+1).padStart(2,'0')}</span>{g.title}</a>)}</aside>
      <div className="course-body">{groups.map(g=><section id={g.slug} key={g.slug} className="course-module"><div className="section-header"><div><span className="eyebrow">MODULE</span><h2>{g.title}</h2><p>{g.description||g.subtitle}</p></div></div><div className="lesson-stack">{items.filter(l=>typeof l.module==='object'&&l.module!==null&&l.module.id===g.id).map((lesson,i)=><Link key={lesson.slug} href={'/learn/'+lesson.slug} className="lesson-row"><span className="lesson-index">{String(i+1).padStart(2,'0')}</span><span className="lesson-info"><strong>{lesson.title}</strong><small>{lesson.subtitle||lesson.overview.slice(0,90)}</small></span><span className="lesson-meta">{lesson.durationMinutes||5} min <span aria-hidden="true">↗</span></span></Link>)}</div></section>)}{items.length===0&&<div className="empty-state">Lessons will appear after the administrator publishes the curriculum.</div>}</div></div>
  </div>
}
