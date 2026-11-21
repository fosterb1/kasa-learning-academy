import Link from 'next/link'
import course from '@/lib/development-course.json'
export const metadata={title:'Software Development Practices — Kasa Academy'}
export default function DevelopmentCoursePage(){
 return <main className="content-width academy-applied-course">
  <nav className="lesson-back"><Link href="/learning-path/development">← Stage 7: Software Development</Link><span>5 GUIDED LESSONS</span></nav>
  <header className="page-heading"><span className="eyebrow">STAGE 07 · SOFTWARE DEVELOPMENT</span><h1>{course.title}</h1><p>{course.description}</p></header>
  <section className="syntax-route-info"><h2>Build software you can explain and maintain</h2><p>Practise debugging, test design, refactoring, version control planning and reproducible project documentation. Kasa programs in these lessons use the core editor. Git commands and README files are activities performed outside the Kasa runtime.</p><p>Recommended preparation: <Link href="/learn/algorithms">Algorithms</Link>, <Link href="/learn/data">Data Processing</Link> and <Link href="/learn/applied">Applied Labs</Link>.</p></section>
  <div className="academy-algorithms-list" aria-label="Software development lessons">
   {course.units.map((unit,i)=><Link className="academy-algorithms-card" key={unit.slug} href={'/learn/development/'+unit.slug}>
    <span className="eyebrow">LESSON {String(i+1).padStart(2,'0')} · {unit.minutes} MINUTES</span><h2>{unit.title}</h2><p>{unit.goal}</p><span>Start lesson →</span>
   </Link>)}
  </div>
  <section className="syntax-route-info"><h2>Learning boundaries</h2><p>Each lesson contains a runnable example and a manual review exercise. There is no account-backed assessment, automatic Git integration, repository write access, hidden-test grading or certificate issued by these pages.</p></section>
 </main>
}
