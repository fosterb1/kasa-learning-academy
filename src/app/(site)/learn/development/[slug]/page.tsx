import Link from 'next/link'
import { CourseProgressToggle } from '@/components/CourseProgressToggle'
import {notFound} from 'next/navigation'
import course from '@/lib/development-course.json'
import {Playground} from '@/components/Playground'

export const dynamicParams=false
export function generateStaticParams(){return course.units.map(unit=>({slug:unit.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const unit=course.units.find(item=>item.slug===slug)
 return {title:unit?unit.title+' — Kasa Software Practices':'Kasa Software Practices'}
}
export default async function DevelopmentLessonPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const index=course.units.findIndex(unit=>unit.slug===slug)
 if(index<0)notFound()
 const unit=course.units[index]
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back" aria-label="Software practice navigation"><Link href="/learn/development">← All software practices</Link><span>LESSON {index+1} OF {course.units.length} · {unit.minutes} MINUTES</span></nav>
  <article className="academy-applied-unit">
   <header><span className="eyebrow">STAGE 07 · {unit.level}</span><h1>{unit.title}</h1><p><strong>Learning outcome:</strong> {unit.goal}</p><p>{unit.concept}</p><p className="academy-applied-mode">{unit.mode}</p></header>
   <section><h2>1. Predict, then run</h2><p>Predict the result before running the example. This editor executes Kasa only, not Git or shell commands.</p><Playground sourceCode={unit.source} expectedOutput={unit.output}/></section>
   <section><h2>2. Explain the workflow</h2><ol>{unit.trace.map((step,i)=><li key={i}>{step}</li>)}</ol><h3>Cost and reasoning</h3><p>{unit.complexity}</p></section>
   <section><h2>3. Independent practice</h2><p>{unit.task}</p><h3>Self-review checklist</h3><ul>{unit.acceptance.map((point,i)=><li key={i}>{point}</li>)}</ul><details><summary>Review question and explanation</summary><p><strong>Question:</strong> {unit.question}</p><p><strong>Explanation:</strong> {unit.answer}</p></details></section>
   <CourseProgressToggle id={'development/'+slug}/>
   <nav className="academy-applied-next" aria-label="Previous and next software practice lesson">
    {index>0&&<Link href={'/learn/development/'+course.units[index-1].slug}>← Previous lesson</Link>}
    {index<course.units.length-1?<Link href={'/learn/development/'+course.units[index+1].slug}>Next lesson →</Link>:<Link href="/learning-path/portfolio">Explore Stage 8 →</Link>}
   </nav>
  </article>
  <section className="syntax-route-info"><h2>Supported tools and limitations</h2><p>Only core Kasa code runs in the sample editor. Real Git commands must be run in a terminal and project documentation is written separately. Output comparison is not a complete assessment of arbitrary edited code. No published CMS lesson, video or transcript was changed.</p><p>Continue experimenting in <Link href="/playground">Kasa Studio</Link>.</p></section>
 </main>
}
