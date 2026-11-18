import Link from 'next/link'
import { studyGuides } from '@/lib/study-guides'
import { lessonChapters } from '@/lib/lesson-chapters'

/** Additional public, offline-readable teaching material; no CMS writes. */
export function StudyCompanion({ slug, title }: { slug: string; title: string }) {
  const guide = studyGuides[slug]
  const chapter = lessonChapters[slug]
  if (!guide) return null
  return <section className="study-companion" aria-label={title + ' study companion'}>
    <div className="study-companion-heading">
      <span className="eyebrow">KASA STUDY BOOK · SUA W'ANKASA</span>
      <h2>Study deeply, then build something</h2>
      <p>Work through these steps before marking the lesson complete. Every activity can be done using the free browser editor or with a notebook and pencil.</p>
    </div>
    {chapter && <div className="study-chapter" aria-label="Detailed study notes">
      <h3>Study notes · Understand the idea</h3>
      <p className="study-context"><strong>In Ghanaian life:</strong> {chapter.context}</p>
      {chapter.concepts.map(([heading, explanation]) => <section key={heading} className="study-chapter-section">
        <h4>{heading}</h4><p>{explanation}</p>
      </section>)}
      <h4>Language and computing vocabulary</h4>
      <dl className="study-glossary">{chapter.terms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      <h4>Explain it back</h4>
      <ol>{chapter.checks.map(question => <li key={question}>{question}</li>)}</ol>
      <p className="study-language-note">Twi programming keywords are Kasa language syntax. Their everyday-language meanings and preferred spellings require review with fluent Akan educators; English technical definitions above explain how the code behaves.</p>
    </div>}
    <div className="study-companion-grid">
      <section className="study-block">
        <h3>1. Learning objectives</h3>
        <p>By the end of this lesson, you should be able to:</p>
        <ul>{guide.objectives.map(objective => <li key={objective}>{objective}.</li>)}</ul>
      </section>
      <section className="study-block">
        <h3>2. Follow the worked code</h3>
        <ol>
          <li>Read the example without pressing Run.</li>
          <li>Write down the output you expect.</li>
          <li>Run it, compare your prediction, and explain any difference.</li>
          <li>Change one value at a time and run it again.</li>
        </ol>
      </section>
      <section className="study-block">
        <h3>3. Common mistake</h3>
        <p>{guide.misconception}.</p>
        <p>When the result surprises you, compare the actual output with each instruction and read the error message rather than guessing.</p>
      </section>
      <section className="study-block">
        <h3>4. Guided practice</h3>
        <p>{guide.guidedPractice}</p>
        <p><strong>Show your working:</strong> record your prediction and the program's actual result.</p>
      </section>
      <section className="study-block study-block-wide">
        <h3>5. Independent assignment</h3>
        <p>{guide.extension}</p>
        <p>Start with your own solution. If you get stuck, return to the code example, change one feature at a time, and explain the final program to another learner.</p>
      </section>
    </div>
    <div className="study-companion-check">
      <h3>Before you continue</h3>
      <ul>
        <li>Can I explain the new concept without reading the example?</li>
        <li>Can I predict and verify the output?</li>
        <li>Can I fix an error and finish the independent assignment?</li>
      </ul>
      <p>Need more practice? <Link href="/practice">Open coding challenges</Link> or <Link href="/playground">try the full playground</Link>.</p>
    </div>
  </section>
}
