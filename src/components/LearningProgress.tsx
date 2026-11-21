'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const KEY = 'kasa-academy-completed-v1'
const EVENT = 'kasa-academy-progress-changed'

export type ProgressLesson = { slug: string; title: string; module: string; duration: number }

function readCompleted(known: Set<string>): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = JSON.parse(raw || '[]')
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((slug): slug is string =>
      typeof slug === 'string' && known.has(slug)))]
  } catch {
    return []
  }
}

/** Local-only learning path; does not require an account or write to the CMS. */
export function LearningProgress({ lessons }: { lessons: ProgressLesson[] }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [query, setQuery] = useState('')
  const known = useMemo(() => new Set(lessons.map(lesson => lesson.slug)), [lessons])

  useEffect(() => {
    const refresh = () => setCompleted(readCompleted(known))
    refresh()
    setReady(true)
    window.addEventListener('storage', refresh)
    window.addEventListener(EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(EVENT, refresh)
    }
  }, [known])

  const completedSet = useMemo(() => new Set(completed), [completed])
  const remaining = lessons.filter(lesson => !completedSet.has(lesson.slug))
  const next = remaining[0]
  const minutes = lessons.filter(lesson => completedSet.has(lesson.slug))
    .reduce((sum, lesson) => sum + lesson.duration, 0)
  const percentage = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0
  const visible = lessons.filter(lesson =>
    [lesson.title, lesson.module].some(value =>
      value.toLocaleLowerCase().includes(query.toLocaleLowerCase())))

  return <section className="learning-progress-panel" aria-labelledby="academy-progress-heading">
    <div className="learning-progress-heading">
      <div><span className="eyebrow">YOUR LEARNING JOURNEY</span>
        <h2 id="academy-progress-heading">Pick up where you left off</h2>
        <p>Your completed lessons are remembered on this device only. No login required.</p>
      </div>
      {next && <Link href={'/learn/' + encodeURIComponent(next.slug)} className="button button-primary">
        {completed.length ? 'Continue learning →' : 'Begin your first lesson →'}
      </Link>}
    </div>
    <div className="learning-progress-summary">
      <p><strong>{ready ? completed.length : '—'}</strong> of {lessons.length} lessons completed</p>
      <p><strong>{ready ? percentage + '%' : '—'}</strong> complete</p>
      <p><strong>{ready ? minutes : '—'}</strong> estimated learning minutes completed</p>
    </div>
    <div className="learning-progress-track" role="progressbar" aria-label="Lessons completed"
      aria-valuemin={0} aria-valuemax={lessons.length || 1} aria-valuenow={ready ? completed.length : 0}>
      <span style={{ width: ready ? percentage + '%' : '0%' }} />
    </div>
    {lessons.length > 0 && <>
      <label className="learning-progress-search-label" htmlFor="learning-progress-search">Find a lesson by title or module</label>
      <input id="learning-progress-search" className="learning-progress-search" type="search"
        value={query} onChange={event => setQuery(event.target.value)}
        placeholder="Search the learning path…" autoComplete="off" />
      <div className="learning-progress-list" aria-live="polite">
        {visible.map(lesson => <Link key={lesson.slug} href={'/learn/' + encodeURIComponent(lesson.slug)}
          className="learning-progress-item">
          <span aria-hidden="true">{ready && completedSet.has(lesson.slug) ? '✓' : '○'}</span>
          <span><strong>{lesson.title}</strong><small>{lesson.module} · {lesson.duration} min</small></span>
          <span>{ready && completedSet.has(lesson.slug) ? 'Completed' : 'Study lesson →'}</span>
        </Link>)}
        {visible.length === 0 && <p>No matching lessons. Try another search term.</p>}
      </div>
    </>}
    <p className="learning-progress-note">Progress lives in this browser, not in your Academy account. Clearing browser data or using another device will not transfer it.</p>
  </section>
}
