import Link from 'next/link'
import { capstones } from '@/lib/capstones'
export const metadata = { title: 'Kasa real-world coding projects' }
export default function Projects() {
  return <main className="content-width">
    <div className="page-heading"><span className="eyebrow">GHANA FIRST · BUILD SOMETHING USEFUL</span>
      <h1>Practical coding projects</h1>
      <p>Apply Kasa to familiar problems in Ghanaian schools, market stalls, transport and community savings. Every project includes a task, starter code, a sample output check and a hint. All run in your browser without an account.</p>
    </div>
    <div className="practice-grid">{capstones.map((project,i) => <Link key={project.slug} className="practice-card" href={'/projects/'+project.slug}>
      <span className="eyebrow">PROJECT {i+1} · {project.difficulty}</span>
      <h2>{project.title}</h2><p>{project.task}</p><span className="text-link">Write the program →</span>
    </Link>)}</div>
    <p className="academy-full-playground-link"><Link href="/learn">Review the full Kasa learning path →</Link></p>
  </main>
}
