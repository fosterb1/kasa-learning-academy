import Link from 'next/link'
import {notFound} from 'next/navigation'
import course from '@/lib/syntax-course.json'
import workbook from '@/lib/syntax-workbook.json'
import {SyntaxDeepPractice} from '@/components/SyntaxDeepPractice'
import {Playground} from '@/components/Playground'
export const dynamicParams=false
export function generateStaticParams(){return course.units.map(unit=>({slug:unit.slug}))}
export default async function SyntaxChapter({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const index=course.units.findIndex(unit=>unit.slug===slug)
 if(index<0)notFound()
 const unit=course.units[index]
 const workbookUnit=workbook.units.find(item=>item.slug===slug)
 if (!workbookUnit) notFound()
 const next=course.units[index+1]
 const prev=course.units[index-1]
 return <main className="content-width syntax-detail">
 <div className="lesson-back"><Link href="/learn/syntax">← Kasa syntax course</Link><span>RULE {index+1} OF {course.units.length} · about {unit.minutes} min</span></div>
 <header className="page-heading"><span className="eyebrow">SYNTAX SCHOOL · KASA 0.4</span><h1>{unit.title}</h1><p>{unit.why}</p></header>
 <article className="syntax-lesson-body">
 <section className="syntax-route-info"><h2>Keywords are fixed; your variable names are flexible</h2><p>{unit.namingNote}</p><pre><code>{'ma sika = 4\nka sika\n\nma score = 4\nka score'}</code></pre><p>Both programs print 4. Only the chosen name changes. Use clear names and keep them consistent.</p></section>
 <section className="syntax-rule"><span className="eyebrow">THE LANGUAGE RULE</span><h2>Exact syntax</h2><pre><code>{unit.syntax}</code></pre><p>{unit.rule}</p></section>
 <section className="syntax-read"><h2>Understand each symbol</h2><table className="syntax-token-table"><thead><tr><th scope="col">Syntax</th><th scope="col">What it means</th></tr></thead><tbody>{unit.tokens.map(([token,meaning])=><tr key={token}><th scope="row"><code>{token}</code></th><td>{meaning}</td></tr>)}</tbody></table></section>
 <section className="syntax-read"><h2>Read the worked example</h2><p>Read every statement and predict the output before pressing Run. The explanation below tells you what the interpreter actually does.</p><pre><code>{unit.example}</code></pre><h3>Line-by-line reasoning</h3><ol className="syntax-trace">{unit.trace.map((step,i)=><li key={i}>{step}</li>)}</ol><p>{unit.walkthrough}</p><h3>Expected output</h3><pre><code>{unit.output}</code></pre></section>
 </article>
 <div className="syntax-code-exercise"><h2>Now run it yourself</h2><p>Change one symbol or value at a time. The example-output comparison only checks the shown case, not every possible input.</p><Playground sourceCode={unit.example} expectedOutput={unit.output}/><p>Need a bigger coding area? <Link href="/playground">Open full Kasa Studio</Link> and paste your code. The full Studio uses a separately versioned first-party browser runtime.</p></div>
 <section className="syntax-read"><h2>Another example: same rule, different program</h2><p>Predict how this example differs. Use Reset example in the editor only when you want to discard its current changes.</p><pre><code>{unit.secondExample}</code></pre><h3>Expected output</h3><pre><code>{unit.secondOutput}</code></pre><details><summary>Why study two examples?</summary><p>To learn the general rule rather than memorize the exact text of one solution. Type this second example into the editor and run it.</p></details></section>
 <SyntaxDeepPractice key={slug} unit={workbookUnit}/>
 <section className="syntax-practice"><h2>Learn from an incorrect example</h2><p>A strong programmer recognizes invalid or misleading instructions. Study this example, try to predict the problem, and read the correction.</p><pre><code>{unit.invalid}</code></pre><p><strong>Why it is incorrect:</strong> {unit.fix}</p></section>
 <section className="syntax-practice"><h2>Your turn: build something</h2><p>{unit.practice}</p><h3>Investigation: try, break, fix</h3><p>{unit.experiment}</p><h3>Think deeper</h3><p>{unit.challenge}</p><h3>Remember this syntax rule</h3><p>{unit.caution}</p><h3>How this helps with other languages</h3><p>{unit.bridge}</p></section>
 <div className="beginner-end"><div><strong>Before moving on</strong><p>Can you read the syntax pattern, write a valid example without copying, predict its output and explain an error? If not, practice the rule again.</p></div><div className="beginner-nav">{prev&&<Link href={'/learn/syntax/'+prev.slug}>← Previous rule</Link>}{next?<Link href={'/learn/syntax/'+next.slug}>Next syntax rule →</Link>:<Link href="/learn">Return to learning path →</Link>}</div></div>
 </main>
}
