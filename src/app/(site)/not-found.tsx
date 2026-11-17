import Link from 'next/link'
export default function NotFound(){return <div className="reading-width not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>We couldn't find that lesson.</h1><p>The page may have moved or hasn't been published yet.</p><Link className="button button-primary" href="/learn">Back to lessons →</Link></div>}
