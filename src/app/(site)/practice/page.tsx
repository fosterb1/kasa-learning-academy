import Link from 'next/link'
import { challenges } from '@/lib/content'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Coding challenges' }
export default async function Practice() {const items=await challenges();return <div className="content-width"><div className="page-heading"><span className="eyebrow">PUT IT INTO PRACTICE</span><h1>Build confidence with challenges.</h1><p>Turn the concepts you learn into working programs. Each challenge gives you a starting point and a goal.</p></div><div className="practice-grid">{items.map((x,i)=><Link href={'/practice/'+x.slug} key={x.slug} className="practice-card"><span className="eyebrow">CHALLENGE {String(i+1).padStart(2,'0')} · {x.difficulty}</span><h2>{x.title}</h2><p>{x.task}</p><span className="text-link">Start coding →</span></Link>)}{items.length===0&&<div className="empty-state">Coding challenges will appear here once published.</div>}</div></div>}
