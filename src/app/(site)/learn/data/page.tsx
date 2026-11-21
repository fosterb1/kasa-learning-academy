import Link from 'next/link'
import course from '@/lib/data-course.json'
export const metadata={title:'Data Structures and Data Processing — Kasa Academy'}
export default function DataCoursePage(){
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back"><Link href="/learning-path/data">← Stage 4: Data Processing</Link><span>5 GUIDED LESSONS</span></nav>
  <header className="page-heading"><span className="eyebrow">STAGE 04 · DATA PROCESSING</span><h1>{course.title}</h1><p>{course.description}</p></header>
  <section className="syntax-route-info"><h2>From data to useful answers</h2><p>Learn to model rows with lists, document positional record conventions, check numeric inputs, compute a mean and filter stock figures. All examples execute in the existing core Kasa interpreter; they are not native table, dictionary, CSV, JSON or typed-record features.</p><p>Recommended preparation: <Link href="/learn/algorithms">Stage 3 Algorithms</Link> and <Link href="/learn/syntax">Kasa syntax</Link>.</p></section>
  <div className="academy-algorithms-list" aria-label="Data processing lessons">
   {course.units.map((unit,i)=><Link className="academy-algorithms-card" key={unit.slug} href={'/learn/data/'+unit.slug}>
    <span className="eyebrow">LESSON {String(i+1).padStart(2,'0')} · {unit.minutes} MINUTES</span><h2>{unit.title}</h2><p>{unit.goal}</p><span>Start lesson →</span>
   </Link>)}
  </div>
  <section className="syntax-route-info"><h2>Learning and assessment</h2><p>Each lesson includes an executable example, guided trace and independent activity. Output comparison checks the displayed sample, not arbitrary changes or mastery. There is no account-backed completion, automatic certification or hidden-test grader.</p></section>
 </main>
}
