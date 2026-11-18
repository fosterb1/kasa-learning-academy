import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Playground } from '@/components/Playground'
import course from '@/lib/beginner-course.json'

export const dynamicParams = false
export function generateStaticParams() { return course.units.map(u => ({slug: u.id})) }
export default async function BeginnerLesson({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params
  const index = course.units.findIndex(u => u.id === slug)
  if (index < 0) notFound()
  const unit = course.units[index]
  const next = course.units[index+1]
  const previous = course.units[index-1]
  return <main className="content-width beginner-chapter">
    <div className="lesson-back"><Link href="/start">← Start from zero</Link><span>CHAPTER {index+1} / {course.units.length} · about {unit.minutes} min</span></div>
    <header className="page-heading"><span className="eyebrow">{unit.age.toUpperCase()} · KASA FOUNDATION</span><h1>{unit.title}</h1><p>{unit.story}</p></header>
    <article className="beginner-reading">
      <section className="beginner-goals"><h2>What you will learn</h2><ul>{unit.goals.map(goal=><li key={goal}>{goal}</li>)}</ul></section>
      {unit.explain.map(([heading,text],i)=><section className="beginner-topic" key={heading}><span className="eyebrow">IDEA {i+1}</span><h2>{heading}</h2><p>{text}</p></section>)}
      <section className="beginner-activity"><span className="eyebrow">NO COMPUTER NEEDED</span><h2>Try it with paper and pencil</h2><p>{unit.unplugged}</p></section>
      <section className="beginner-activity"><span className="eyebrow">PREDICT BEFORE YOU RUN</span><h2>Read and reason</h2><p>{unit.trace}</p></section>
      <section className="beginner-activity"><span className="eyebrow">WATCH YOUR OWN THINKING</span><h2>Common misconception</h2><p>{unit.mistake}</p></section>
    </article>
    <section className="beginner-coding" aria-label="Try this chapter in Kasa"><h2>Try the Kasa example</h2><p>Explain each line in your own words. Predict the exact output. Only then press Run code. A correct sample output is a useful check, but the program may need additional testing in real projects.</p>
      <Playground sourceCode={unit.code} expectedOutput={unit.expected} starterInput={"input" in unit ? unit.input : ""}/>
      <div className="beginner-activity"><h3>Modify the example</h3><p>{unit.modify}</p></div>
      <div className="beginner-activity"><h3>Make your own solution</h3><p>{unit.make}</p></div>
    </section>
    <section className="beginner-review"><h2>Check your understanding</h2><p>Try answering without looking at the notes. Discuss with a friend, parent or teacher. Then reveal the explanations.</p>
      {unit.questions.map(([question,answer],i)=><details key={question}><summary>{i+1}. {question}</summary><p>{answer}</p></details>)}
    </section>
    <div className="beginner-end"><div><strong>Learning tip</strong><p>Do not race through the chapters. If an answer surprises you, repeat the paper activity, read the example and ask what changed.</p></div><div className="beginner-nav">{previous&&<Link href={'/start/'+previous.id}>← Previous chapter</Link>}{next?<Link href={'/start/'+next.id}>Next chapter →</Link>:<Link href="/learn">Continue to Kasa lessons →</Link>}</div></div>
  </main>
}
