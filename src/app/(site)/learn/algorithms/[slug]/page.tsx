import Link from 'next/link'
import { CourseProgressToggle } from '@/components/CourseProgressToggle'
import {notFound} from 'next/navigation'
import course from '@/lib/algorithms-course.json'
import {Playground} from '@/components/Playground'

export const dynamicParams=false
export function generateStaticParams(){return course.units.map(unit=>({slug:unit.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const lesson=course.units.find(unit=>unit.slug===slug)
 return {title:lesson?lesson.title+' — Kasa Algorithms':'Kasa Algorithms'}
}
export default async function AlgorithmLessonPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const index=course.units.findIndex(unit=>unit.slug===slug)
 if(index<0)notFound()
 const unit=course.units[index]
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back" aria-label="Algorithm lesson navigation"><Link href="/learn/algorithms">← All algorithms lessons</Link><span>LESSON {index+1} OF {course.units.length} · {unit.minutes} MINUTES</span></nav>
  <article className="academy-applied-unit">
   <header><span className="eyebrow">STAGE 03 · {unit.level}</span><h1>{unit.title}</h1><p><strong>Learning outcome:</strong> {unit.goal}</p><p>{unit.concept}</p><p className="academy-applied-mode">{unit.mode}</p></header>
   <section><h2>1. Predict, then run</h2><p>Read the program before pressing Run. Predict its output and compare what Kasa actually prints.</p><Playground sourceCode={unit.source} expectedOutput={unit.output}/></section>
   <section><h2>2. Trace the algorithm</h2><ol>{unit.trace.map((step,i)=><li key={i}>{step}</li>)}</ol><h3>Algorithm cost</h3><p>{unit.complexity}</p></section>
   <section><h2>3. Independent exercise</h2><p>{unit.task}</p><h3>Self-review checklist</h3><ul>{unit.acceptance.map((point,i)=><li key={i}>{point}</li>)}</ul><details><summary>Review question and explanation</summary><p><strong>Question:</strong> {unit.question}</p><p><strong>Explanation:</strong> {unit.answer}</p></details></section>
   <CourseProgressToggle id={'algorithms/'+slug}/>
   <nav className="academy-applied-next" aria-label="Previous and next algorithm">
    {index>0&&<Link href={'/learn/algorithms/'+course.units[index-1].slug}>← Previous lesson</Link>}
    {index<course.units.length-1?<Link href={'/learn/algorithms/'+course.units[index+1].slug}>Next lesson →</Link>:<Link href="/learning-path/data">Explore Stage 4 →</Link>}
   </nav>
  </article>
  <section className="syntax-route-info"><h2>Learning boundaries</h2><p>This is a worked core-Kasa teaching example. Output comparison is not a complete assessment of correctness for every input. For bigger experiments, open <Link href="/playground">Kasa Studio</Link>. No CMS lesson, published video or transcript is changed by this course.</p></section>
 </main>
}
