import Markdown from 'react-markdown'
import { announcements } from '@/lib/content'
export const dynamic='force-dynamic'
export const metadata={title:'Kasa announcements'}
export default async function Updates(){const items=await announcements();return <div className="reading-width"><div className="page-heading"><span className="eyebrow">KASA NEWSROOM</span><h1>What's happening with Kasa?</h1><p>Language releases, learning materials, and community announcements.</p></div>{items.map(x=><article className="update-entry" key={x.id}><span className="eyebrow">{new Date(x.createdAt).toLocaleDateString('en-GB',{dateStyle:'medium'})}</span><h2>{x.title}</h2><p>{x.summary}</p><div className="markdown-body"><Markdown>{x.bodyMarkdown}</Markdown></div></article>)}{items.length===0&&<div className="empty-state">No announcements have been published yet.</div>}</div>}
