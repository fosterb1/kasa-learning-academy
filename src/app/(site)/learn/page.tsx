import Link from 'next/link'
import { lessons, modules } from '@/lib/content'
import { youtubeVideoId } from '@/lib/video'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Free programming lessons' }
export default async function LessonsIndex() {
  const [items, groups] = await Promise.all([lessons(), modules()])
  return <div className="content-width"><div className="page-heading"><span className="eyebrow">THE KASA CURRICULUM</span><h1>Learn Kasa, one step at a time.</h1><p>Choose a lesson, try the code, and mark your progress. Every lesson is free. Each lesson includes structured notes and a working code example.</p><p className="academy-full-playground-link"><Link href="/glossary">Read the Kasa–English programming glossary →</Link> · <Link href="/projects">Explore practical projects →</Link></p></div>
    <section className="beginner-route-promo"><div><span className="eyebrow">FIRST TIME PROGRAMMING?</span><h2>Start before the syntax lessons.</h2><p>Ten free, carefully scaffolded chapters introduce computers, instructions, problem-solving, code-reading and safe mini-projects—designed for Ghanaian first-time learners.</p></div><Link className="button button-primary" href="/start">Start from zero →</Link></section>
    <div className="course-layout"><aside className="course-rail"><b>Learning path</b>{groups.map((g,i)=><a key={g.slug} href={'#'+g.slug}><span>{String(i+1).padStart(2,'0')}</span>{g.title}</a>)}</aside>
      <div className="course-body">{groups.map(g=><section id={g.slug} key={g.slug} className="course-module"><div className="section-header"><div><span className="eyebrow">MODULE</span><h2>{g.title}</h2><p>{g.description||g.subtitle}</p></div></div><div className="lesson-stack">{items.filter(l=>typeof l.module==='object'&&l.module!==null&&l.module.id===g.id).map((lesson,i)=><Link key={lesson.slug} href={'/learn/'+lesson.slug} className="lesson-row"><span className="lesson-index">{String(i+1).padStart(2,'0')}</span><span className="lesson-info"><strong>{lesson.title}</strong><small>{lesson.subtitle||lesson.overview.slice(0,90)}</small>{youtubeVideoId(lesson.videoUrl) ? <span className="lesson-video-badge"><span aria-hidden="true">▶</span> Watch video</span> : <span className="lesson-video-absent">Text + interactive code</span>}</span><span className="lesson-meta">{lesson.durationMinutes||5} min <span aria-hidden="true">↗</span></span></Link>)}</div></section>)}{items.length===0&&<div className="empty-state">Lessons will appear after the administrator publishes the curriculum.</div>}</div></div>
  </div>
}
