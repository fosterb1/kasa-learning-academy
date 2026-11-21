import Link from 'next/link'
import { CourseProgressToggle } from '@/components/CourseProgressToggle'
import { notFound } from 'next/navigation'
import course from '@/lib/applied-course.json'
import { Playground } from '@/components/Playground'

export const dynamicParams = false
export function generateStaticParams() {
  return course.units.map(unit => ({slug: unit.slug}))
}
export async function generateMetadata({params}: {params: Promise<{slug:string}>}) {
  const {slug} = await params
  const unit = course.units.find(item => item.slug === slug)
  return { title: unit ? unit.title + ' — Applied Kasa' : 'Applied Kasa' }
}

export default async function AppliedLabPage({params}: {params: Promise<{slug:string}>}) {
  const {slug} = await params
  const index = course.units.findIndex(unit => unit.slug === slug)
  if(index < 0) notFound()
  const unit = course.units[index]
  return <main className="content-width academy-applied-course">
    <nav className="lesson-back" aria-label="Lab navigation">
      <Link href="/learn/applied">← Applied course overview</Link>
      <span>LAB {index+1} / {course.units.length}</span>
    </nav>
    <article className="academy-applied-unit">
      <header>
        <span className="eyebrow">{unit.stage} · LAB {index+1} · ABOUT {unit.minutes} MINUTES</span>
        <h1>{unit.title}</h1>
        <p><strong>Learning outcome:</strong> {unit.goal}</p>
        <p>{unit.concept}</p>
        <p className="academy-applied-mode">{unit.mode}</p>
      </header>
      <section aria-label={unit.title+' worked example'}>
        <h2>1. Predict, then run</h2>
        <p>Read the code and write down your expected output. Run it, then compare with the result shown in the editor.</p>
        <Playground sourceCode={unit.source} expectedOutput={unit.output} />
      </section>
      <section>
        <h2>2. Trace the program</h2>
        <ol>{unit.trace.map((line,i)=><li key={i}>{line}</li>)}</ol>
      </section>
      <section>
        <h2>3. Independent assignment</h2>
        <p>{unit.task}</p>
        <h3>Before moving on, check your work</h3>
        <ul>{unit.acceptance.map((point,i)=><li key={i}>{point}</li>)}</ul>
        <details>
          <summary>Review question and model explanation</summary>
          <p><strong>Question:</strong> {unit.check}</p>
          <p><strong>Explanation:</strong> {unit.answer}</p>
        </details>
      </section>
      <CourseProgressToggle id={'applied/'+slug}/>
   <nav className="academy-applied-next" aria-label="Previous and next lab">
        {index>0&&<Link href={'/learn/applied/'+course.units[index-1].slug}>← Previous lab</Link>}
        {index<course.units.length-1
          ?<Link href={'/learn/applied/'+course.units[index+1].slug}>Next lab →</Link>
          :<Link href="/projects">Continue with independent projects →</Link>}
      </nav>
    </article>
    <section className="syntax-route-info">
      <h2>Learning and implementation boundaries</h2>
      <p>These examples use core Kasa. Experimental table/record helper libraries and host-side validators are not currently importable from ordinary lesson code. Results are teaching examples, not secure auto-grading or production accounting tools.</p>
      <p><Link href="/language-status">Read the feature compatibility guide →</Link></p>
    </section>
  </main>
}
