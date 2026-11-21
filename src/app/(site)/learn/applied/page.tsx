import Link from 'next/link'
import course from '@/lib/applied-course.json'
import { Playground } from '@/components/Playground'

export const metadata = {
  title: 'Applied Programming in Kasa — Ghana-first data projects',
  description: 'Five guided Kasa labs for market receipts, marks, inventory, tables and records, with runnable examples and responsible experimental feature boundaries.',
}

export default function AppliedCoursePage() {
  return <main className="content-width academy-applied-course">
    <header className="page-heading">
      <span className="eyebrow">APPLIED KASA · FREE GUIDED COURSE</span>
      <h1>Build programs that solve familiar problems.</h1>
      <p>{course.description}</p>
      <p>This is an extra practice course, not a replacement for any published CMS lesson. Every runnable example below uses core Kasa; experimental ideas are labelled separately.</p>
      <p><Link href="/learn/syntax">Review the Kasa syntax course →</Link> · <Link href="/language-status">Check feature support →</Link></p>
    </header>
    <nav aria-label="Applied course lessons" className="academy-applied-nav">
      {course.units.map((unit,index) => <a href={'#'+unit.slug} key={unit.slug}>
        <span>{String(index+1).padStart(2,'0')}</span>{unit.title}
      </a>)}
    </nav>
    {course.units.map((unit,index) => <article key={unit.slug} id={unit.slug} className="academy-applied-unit">
      <header>
        <span className="eyebrow">{unit.stage} · LAB {index+1} · ABOUT {unit.minutes} MINUTES</span>
        <h2>{unit.title}</h2>
        <p><strong>Learning outcome:</strong> {unit.goal}</p>
        <p>{unit.concept}</p>
        <p className="academy-applied-mode">{unit.mode}</p>
      </header>
      <section aria-label={unit.title+' worked example'}>
        <h3>1. Predict, then run</h3>
        <p>Read the code and write down your expected output. Run it in the editor, then compare with the displayed result.</p>
        <Playground sourceCode={unit.source} expectedOutput={unit.output} />
      </section>
      <section>
        <h3>2. Trace the program</h3>
        <ol>{unit.trace.map((line,i)=><li key={i}>{line}</li>)}</ol>
      </section>
      <section>
        <h3>3. Independent assignment</h3>
        <p>{unit.task}</p>
        <h4>Before moving on, check your work</h4>
        <ul>{unit.acceptance.map((point,i)=><li key={i}>{point}</li>)}</ul>
        <details>
          <summary>Review question and model explanation</summary>
          <p><strong>Question:</strong> {unit.check}</p>
          <p><strong>Explanation:</strong> {unit.answer}</p>
        </details>
      </section>
      <div className="academy-applied-next">
        {index>0&&<a href={'#'+course.units[index-1].slug}>← Previous lab</a>}
        {index<course.units.length-1
          ?<a href={'#'+course.units[index+1].slug}>Next lab →</a>
          :<Link href="/projects">Continue with independent projects →</Link>}
      </div>
    </article>)}
    <section className="syntax-route-info">
      <h2>What you have — and have not — learned</h2>
      <p>The examples exercise core Kasa arithmetic, decisions, loops, lists and functions. The later labs introduce the *ideas* behind source-only tables, positional records and separate host-side validators; they do not claim those experiments are available as standard imports or production tools.</p>
      <p>Sample outputs and self-checks support learning, but are not hidden-test grading, certificates or proof of correctness. For further practice, use <Link href="/projects">the independent project catalog</Link>.</p>
    </section>
  </main>
}
