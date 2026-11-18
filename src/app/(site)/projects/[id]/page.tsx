import Link from 'next/link'
import { notFound } from 'next/navigation'
import { capstones } from '@/lib/capstones'
import { Playground } from '@/components/Playground'
export const dynamicParams = false
export function generateStaticParams() { return capstones.map(project => ({id: project.id})) }
export default async function Project({params}:{params:Promise<{id:string}>}) {
  const {id} = await params
  const project = capstones.find(p => p.id === id)
  if (!project) notFound()
  return <main className="content-width">
    <div className="lesson-back"><Link href="/projects">← All practical projects</Link><span>{project.difficulty}</span></div>
    <div className="page-heading"><span className="eyebrow">REAL-WORLD KASA PROJECT</span><h1>{project.title}</h1><p>{project.task}</p></div>
    <div className="project-rubric"><h2>How to approach the project</h2>
      <ol><li>Describe the input values and the expected output.</li><li>Write a short plan in plain language before modifying the code.</li><li>Implement the solution and run it; compare the sample output.</li><li>Change a number or input, predict the result and retest.</li><li>Explain your solution to someone learning Kasa.</li></ol>
      <p><strong>Assessment:</strong> matching the sample output is only a first check, not proof that a program handles every input. This is a learning project, not a production accounting or school records system.</p>
    </div>
    <Playground sourceCode={project.starterCode} starterInput={project.starterInput} expectedOutput={project.expectedOutput}/>
    <details className="hint-box"><summary>Show a hint if you get stuck</summary><p>{project.hint}</p></details>
    <p className="academy-full-playground-link"><Link href="/projects">Explore another project →</Link></p>
  </main>
}
