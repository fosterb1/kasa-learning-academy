import Link from 'next/link'
import { notFound } from 'next/navigation'
import { challengeBySlug } from '@/lib/content'
import { Playground } from '@/components/Playground'
export const dynamic = 'force-dynamic'
export default async function PracticeOne({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const x=await challengeBySlug(slug);if(!x)notFound();return <div className="content-width"><div className="lesson-back"><Link href="/practice">← All challenges</Link><span>{x.difficulty}</span></div><div className="page-heading"><span className="eyebrow">PRACTICE PROJECT</span><h1>{x.title}</h1><p>{x.task}</p></div><Playground sourceCode={x.starterCode||'# Start coding here\n'} starterInput={x.starterInput} expectedOutput={x.expectedOutput}/><details className="hint-box"><summary>Need a hint?</summary><p>{x.hint||'Try breaking the problem down into smaller steps.'}</p></details></div>}
