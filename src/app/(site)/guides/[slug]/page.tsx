import { notFound } from 'next/navigation'
import Link from 'next/link'
import Markdown from 'react-markdown'
import { guideBySlug } from '@/lib/content'
export const dynamic='force-dynamic'
export default async function GuideOne({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const g=await guideBySlug(slug);if(!g)notFound();return <div className="reading-width"><div className="lesson-back"><Link href="/guides">← Setup guides</Link></div><div className="page-heading"><span className="eyebrow">INSTALLATION & USAGE</span><h1>{g.title}</h1><p>{g.summary}</p></div><article className="markdown-body"><Markdown>{g.bodyMarkdown}</Markdown></article></div>}
