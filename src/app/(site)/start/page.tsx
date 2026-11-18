import Link from 'next/link'
import course from '@/lib/beginner-course.json'

export const metadata = { title: 'Start from zero — Kasa Computing for beginners' }
export default function FirstSteps() {
  return <main className="content-width kasa-first-steps">
    <div className="page-heading">
      <span className="eyebrow">START FROM ZERO · FREE BEGINNER COURSE</span>
      <h1>Never coded before? Start here.</h1>
      <p>{course.intro}</p>
      <p>Learn what computers are, how instructions work, and how to solve problems. Start with everyday activities and write your first Kasa programs when you feel ready.</p>
    </div>
    <div className="beginner-intro"><div><strong>For learners and coding clubs</strong><p>Read a little, draw or discuss an activity, predict what code will do, run it, then create your own version. No student login, video or payment is required.</p></div><div><strong>For parents and teachers</strong><p>Encourage the child to explain their thinking. Use paper-and-pencil tasks when internet is expensive. Offer help with reading, without typing every answer for them.</p></div></div>
    <p className="academy-full-playground-link"><Link href="/start/teaching-guide">Teachers and parents: read the free classroom facilitator guide →</Link></p>
    <section className="beginner-course-list" aria-label="Foundations course chapters">
      {course.units.map((unit,i)=><Link href={'/start/'+unit.id} className="beginner-unit-card" key={unit.id}>
        <span className="beginner-index">{String(i+1).padStart(2,'0')}</span>
        <span><small>{unit.age} · about {unit.minutes} min</small><strong>{unit.title}</strong><span>{unit.goals[0]}</span></span>
        <span aria-hidden="true">→</span>
      </Link>)}
    </section>
    <div className="beginner-next"><h2>After these foundations</h2><p>Continue to the Academy's broader Kasa lessons for more on data, functions, lists, sorting and practical projects. Those courses assume you already understand basic programming ideas.</p><Link href="/learn" className="button button-primary">Explore Kasa lessons →</Link></div>
  </main>
}
