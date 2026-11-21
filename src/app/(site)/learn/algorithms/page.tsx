import Link from 'next/link'
import course from '@/lib/algorithms-course.json'

export const metadata = {title: 'Problem Solving and Algorithms — Kasa Academy'}

export default function AlgorithmsCoursePage() {
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back"><Link href="/learning-path/problem-solving">← Stage 3: Problem Solving</Link><span>5 GUIDED LESSONS</span></nav>
  <header className="page-heading"><span className="eyebrow">STAGE 03 · ALGORITHMS</span><h1>{course.title}</h1><p>{course.description}</p></header>
  <section className="syntax-route-info"><h2>What you will learn</h2><p>Trace an algorithm, search a list, find a maximum, sort values and compare linear versus quadratic work. Every lesson uses the existing core Kasa editor, expected-output feedback and an independent exercise.</p><p>Recommended preparation: <Link href="/learn/syntax">variables, lists, conditions and loops</Link>. These lessons are available without a login.</p></section>
  <div className="academy-algorithms-list" aria-label="Algorithms lessons">
   {course.units.map((unit,i)=><Link className="academy-algorithms-card" key={unit.slug} href={'/learn/algorithms/'+unit.slug}>
    <span className="eyebrow">LESSON {String(i+1).padStart(2,'0')} · {unit.minutes} MINUTES</span>
    <h2>{unit.title}</h2><p>{unit.goal}</p>
    <span>Start lesson →</span>
   </Link>)}
  </div>
  <section className="syntax-route-info"><h2>How progress works</h2><p>Follow the lessons in order and complete each acceptance checklist. The editor compares the shown example output; it is not a hidden-test grader, automatic certificate or account-backed mastery record. For a broader project, continue to <Link href="/learn/applied">Applied Kasa Programming</Link>.</p></section>
 </main>
}
