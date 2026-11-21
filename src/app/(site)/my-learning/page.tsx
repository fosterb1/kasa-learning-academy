import Link from 'next/link'
import { lessons, modules } from '@/lib/content'
import { LearningProgress, type ProgressLesson } from '@/components/LearningProgress'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'My learning path',
  description: 'Track completed Kasa Academy lessons on this device without creating an account.',
}

export default async function MyLearningPage() {
  const [allLessons, allModules] = await Promise.all([lessons(), modules()])
  const names = new Map(allModules.map(module => [String(module.id), module.title]))
  const items: ProgressLesson[] = allLessons.map(lesson => ({
    slug: lesson.slug,
    title: lesson.title,
    module: typeof lesson.module === 'object' && lesson.module !== null
      ? lesson.module.title
      : names.get(String(lesson.module)) || 'Kasa lessons',
    duration: Math.max(1, Number(lesson.durationMinutes) || 5),
  }))
  return <main className="content-width">
    <header className="page-heading">
      <span className="eyebrow">FREE SELF-PACED LEARNING</span>
      <h1>My learning path</h1>
      <p>Review your progress, discover the next lesson and find topics you want to study again.</p>
      <p><Link href="/start">New to programming? Start from zero →</Link> · <Link href="/learn">Browse the full curriculum →</Link></p>
    </header>
    <LearningProgress lessons={items} />
  </main>
}
