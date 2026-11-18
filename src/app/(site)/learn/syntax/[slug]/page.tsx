import Link from 'next/link'
import {notFound} from 'next/navigation'
import course from '@/lib/syntax-course.json'
import {Playground} from '@/components/Playground'
export const dynamicParams=false
export function generateStaticParams(){return course.units.map(unit=>({slug:unit.slug}))}
export default async function SyntaxChapter({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const index=course.units.findIndex(unit=>unit.slug===slug)
 if(index<0)notFound()
 const unit=course.units[index]
 const next=course.units[index+1]
 const prev=course.units[index-1]
 return <main className="content-width syntax-detail">
 <div className="lesson-back"><Link href="/learn/syntax">← Kasa syntax course</Link><span>RULE {index+1} OF {course.units.length} · about {unit.minutes} min</span></div>
 <header className="page-heading"><span className="eyebrow">SYNTAX SCHOOL · KASA 0.4</span><h1>{unit.title}</h1><p>{unit.why}</p></header>
 <article className="syntax-lesson-body">
 <section className="syntax-rule"><span className="eyebrow">THE LANGUAGE RULE</span><h2>Exact syntax</h2><pre><code>{unit.syntax}</code></pre><p>{unit.rule}</p></section>
 <section className="syntax-read"><h2>Read the worked example</h2><p>Read every statement and predict the output before pressing Run. The explanation below tells you what the interpreter actually does.</p><pre><code>{unit.example}</code></pre><h3>Line-by-line reasoning</h3><p>{unit.walkthrough}</p><h3>Expected output</h3><pre><code>{unit.output}</code></pre></section>
 </article>
 <div className="syntax-code-exercise"><h2>Now run it yourself</h2><p>Change one symbol or value at a time. The example-output comparison only checks the shown case, not every possible input.</p><Playground sourceCode={unit.example} expectedOutput={unit.output}/></div>
 <section className="syntax-read"><h2>Another example: same rule, different program</h2><p>Predict how this example differs. Use Reset example in the editor only when you want to discard its current changes.</p><pre><code>{unit.secondExample}</code></pre><h3>Expected output</h3><pre><code>{unit.secondOutput}</code></pre><details><summary>Why study two examples?</summary><p>To learn the general rule rather than memorize the exact text of one solution. Type this second example into the editor and run it.</p></details></section>
 <section className="syntax-practice"><h2>Your turn: build something</h2><p>{unit.practice}</p><h3>Investigation: try, break, fix</h3><p>{unit.experiment}</p><h3>Remember this syntax rule</h3><p>{unit.caution}</p></section>
 <div className="beginner-end"><div><strong>Before moving on</strong><p>Can you read the syntax pattern, write a valid example without copying, predict its output and explain an error? If not, practice the rule again.</p></div><div className="beginner-nav">{prev&&<Link href={'/learn/syntax/'+prev.slug}>← Previous rule</Link>}{next?<Link href={'/learn/syntax/'+next.slug}>Next syntax rule →</Link>:<Link href="/learn">Return to learning path →</Link>}</div></div>
 </main>
}
