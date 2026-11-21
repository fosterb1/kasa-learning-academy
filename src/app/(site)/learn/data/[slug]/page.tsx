import Link from 'next/link'
import { CourseProgressToggle } from '@/components/CourseProgressToggle'
import {notFound} from 'next/navigation'
import course from '@/lib/data-course.json'
import {Playground} from '@/components/Playground'

export const dynamicParams=false
export function generateStaticParams(){return course.units.map(unit=>({slug:unit.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const unit=course.units.find(item=>item.slug===slug)
 return {title:unit?unit.title+' — Kasa Data Processing':'Kasa Data Processing'}
}
export default async function DataLessonPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const index=course.units.findIndex(unit=>unit.slug===slug)
 if(index<0)notFound()
 const unit=course.units[index]
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back" aria-label="Data lesson navigation"><Link href="/learn/data">← All data processing lessons</Link><span>LESSON {index+1} OF {course.units.length} · {unit.minutes} MINUTES</span></nav>
  <article className="academy-applied-unit">
   <header><span className="eyebrow">STAGE 04 · {unit.level}</span><h1>{unit.title}</h1><p><strong>Learning outcome:</strong> {unit.goal}</p><p>{unit.concept}</p><p className="academy-applied-mode">{unit.mode}</p></header>
   <section><h2>1. Predict, then run</h2><p>Read and predict the exact output first. Then execute the program in core Kasa.</p><Playground sourceCode={unit.source} expectedOutput={unit.output}/></section>
   <section><h2>2. Explain the data flow</h2><ol>{unit.trace.map((step,i)=><li key={i}>{step}</li>)}</ol><h3>Cost of this approach</h3><p>{unit.complexity}</p></section>
   <section><h2>3. Independent exercise</h2><p>{unit.task}</p><h3>Self-review checklist</h3><ul>{unit.acceptance.map((point,i)=><li key={i}>{point}</li>)}</ul><details><summary>Review question and answer</summary><p><strong>Question:</strong> {unit.question}</p><p><strong>Explanation:</strong> {unit.answer}</p></details></section>
   <CourseProgressToggle id={'data/'+slug}/>
   <nav className="academy-applied-next" aria-label="Previous and next data lesson">
    {index>0&&<Link href={'/learn/data/'+course.units[index-1].slug}>← Previous lesson</Link>}
    {index<course.units.length-1?<Link href={'/learn/data/'+course.units[index+1].slug}>Next lesson →</Link>:<Link href="/learning-path/applied">Explore Stage 5 →</Link>}
   </nav>
  </article>
  <section className="syntax-route-info"><h2>Supported Kasa versus experiments</h2><p>The lesson editor runs core Kasa list, loop, condition and arithmetic code. General native tables, typed records, JSON and CSV support are not promised. Example output matching is not a complete assessment of your program. No existing CMS lesson, published video or transcript was changed.</p><p>For broader experiments, open <Link href="/playground">Kasa Studio</Link>.</p></section>
 </main>
}
