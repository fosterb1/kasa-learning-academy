import Link from 'next/link'
import {notFound} from 'next/navigation'
import {lessons,modules} from '@/lib/content'
import {youtubeVideoId} from '@/lib/video'
import roadmap from '@/lib/learning-path.json'
import catalog from '@/lib/stage-course-map.json'

export const dynamic = 'force-dynamic'
export function generateStaticParams(){return roadmap.stages.map(stage=>({slug:stage.id}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const stage=roadmap.stages.find(item=>item.id===slug)
 return {title:stage?stage.title+' — Kasa Learning Path':'Learning Path'}
}

export default async function StagePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const stage=roadmap.stages.find(item=>item.id===slug)
 const mapped=catalog.stages.find(item=>item.id===slug)
 if(!stage||!mapped)notFound()
 const moduleSlugs=new Set(mapped.courses.flatMap(course=>course.moduleSlugs))
 // Only load published CMS records on stages that actually reference them.
 const [topics,items]=moduleSlugs.size>0
   ?await Promise.all([modules(),lessons()])
   :[[],[]] as [Awaited<ReturnType<typeof modules>>,Awaited<ReturnType<typeof lessons>>]
 const prereqs=stage.prerequisites.map(id=>roadmap.stages.find(item=>item.id===id)).filter((v):v is (typeof roadmap.stages)[number]=>Boolean(v))
 const next=roadmap.stages.find(item=>item.number===stage.number+1)
 return <main className="content-width academy-stage-detail">
  <nav className="lesson-back" aria-label="Learning path navigation"><Link href="/learning-path">← Eight-stage learning path</Link><span>STAGE {String(stage.number).padStart(2,'0')} OF 08 · {stage.level}</span></nav>
  <header className="page-heading"><span className="eyebrow">{stage.status==='available'?'STUDY NOW':stage.status==='planned'?'COURSE IN PREPARATION':'EXPERIMENTAL LEARNING'} · {stage.duration}</span><h1>{stage.title}</h1><p>{stage.outcomes.join(' ')}</p></header>
  <section className="syntax-route-info" aria-label="Learning requirements"><h2>Before you begin</h2><p>{prereqs.length>0?<>Recommended preparation: {prereqs.map((item,i)=><span key={item.id}>{i>0?' · ':''}<Link href={'/learning-path/'+item.id}>{item.title}</Link></span>)}</>:'No previous programming experience is required.'}</p><p><strong>Practice milestone:</strong> {stage.assessment}</p><p>Prerequisites are recommendations, not locked requirements. No automatic certification is claimed.</p></section>
  <section className="academy-stage-courses"><h2>Courses and lessons in this stage</h2>
  {mapped.courses.map(course=><article className="academy-stage-course" key={course.id}>
   <div className="academy-stage-course-head"><div><h3>{course.title}</h3><p>{course.description}</p></div>{course.href?<Link className="button button-primary" href={course.href}>Open course →</Link>:course.moduleSlugs.length===0?<span className="academy-roadmap-status academy-roadmap-status-planned">In development</span>:null}</div>
   {course.moduleSlugs.map(moduleSlug=>{
    const module=topics.find(topic=>topic.slug===moduleSlug)
    if(!module)return <p key={moduleSlug} className="academy-stage-unassigned">The topic "{moduleSlug.replaceAll('-',' ')}" is not published in this environment. <Link href="/learn#lesson-library">Browse the lesson library</Link>.</p>
    const published=items.filter(lesson=>typeof lesson.module==='object'&&lesson.module!==null&&lesson.module.id===module.id)
    return <section key={module.slug} className="academy-stage-module"><h4>{module.title}</h4><p>{module.description||module.subtitle}</p>
      {published.length>0?<ol className="academy-stage-lesson-list">{published.map(lesson=><li key={lesson.slug}><Link href={'/learn/'+lesson.slug}>{lesson.title}</Link> <span>{youtubeVideoId(lesson.videoUrl)?'Video + interactive code':'Text + interactive code'}</span></li>)}</ol>:<p>No published lessons in this topic yet.</p>}
     </section>
   })}
  </article>)}
  </section>
  <section className="syntax-route-info"><h2>Want to browse other lessons?</h2><p>The <Link href="/learn#lesson-library">Lesson Library</Link> lists all published CMS modules, including anything not mapped to this stage. Existing YouTube recordings and transcripts remain attached to their original lesson records.</p>{next&&<p><Link href={'/learning-path/'+next.id}>Explore next stage: {next.title} →</Link></p>}</section>
 </main>
}
