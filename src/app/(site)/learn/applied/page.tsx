import Link from 'next/link'
import course from '@/lib/applied-course.json'

export const metadata = {
  title: 'Applied Programming in Kasa — Ghana-first data projects',
  description: 'Five guided Kasa labs for market receipts, marks, inventory, tables and records, with runnable examples and responsible experimental feature boundaries.',
}

export default function AppliedCourseIndex() {
  return <main className="content-width academy-applied-course">
    <header className="page-heading">
      <span className="eyebrow">APPLIED KASA · FREE GUIDED COURSE</span>
      <h1>Build programs that solve familiar problems.</h1>
      <p>{course.description}</p>
      <p>This is an additional guided practice course, not a replacement for published CMS lessons. Each lab has one dedicated editor, worked example, independent assignment and self-check.</p>
      <p><Link href="/learn/syntax">Review core syntax →</Link> · <Link href="/language-status">Check feature support →</Link></p>
    </header>
    <section className="academy-course-pathway">
      <span className="eyebrow">COURSE ROADMAP</span>
      <h2>Learn by practising, then explain your results.</h2>
      <p>Start with calculations, add decision-making, and finish by reasoning about experimental data concepts. Core examples work in the lesson editor; table and record helper APIs are not enabled as imports.</p>
      <div className="academy-pathway-grid">
        {course.units.map((unit,index) => <Link key={unit.slug} href={'/learn/applied/'+unit.slug}>
          <strong>{String(index+1).padStart(2,'0')} · {unit.title}</strong>
          <span>{unit.stage} · {unit.minutes} minutes</span>
          <span>{unit.goal}</span>
        </Link>)}
      </div>
    </section>
    <section className="syntax-route-info">
      <h2>Study method</h2>
      <ol><li>Predict what the program prints.</li><li>Run the example and compare output.</li><li>Trace the calculation or decision step by step.</li><li>Complete the independent task.</li><li>Use the review question to explain the result without copying.</li></ol>
      <p>Sample-output checks are teaching feedback, not certificates, hidden-test grading or proof of production-ready code.</p>
    </section>
    <p className="academy-full-playground-link"><Link href="/projects">Already comfortable? Try an independent Kasa project →</Link></p>
  </main>
}
