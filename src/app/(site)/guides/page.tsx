import Link from 'next/link'
import { guides } from '@/lib/content'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Install and set up Kasa' }
export default async function GuideIndex(){const items=await guides();return <div className="content-width"><div className="page-heading"><span className="eyebrow">GET STARTED</span><h1>Set up Kasa on your computer.</h1><p>Browse the setup guides, or learn directly in the browser without installing anything.</p></div><div className="practice-grid">{items.map(g=><Link key={g.slug} className="practice-card" href={'/guides/'+g.slug}><span className="eyebrow">SETUP GUIDE</span><h2>{g.title}</h2><p>{g.summary}</p><span className="text-link">Read guide →</span></Link>)}{items.length===0&&<div className="empty-state">Setup guides will be published here soon.</div>}</div></div>}
