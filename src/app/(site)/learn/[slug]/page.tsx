import Link from 'next/link'
import { notFound } from 'next/navigation'
import { lessonBySlug, lessons } from '@/lib/content'
import { Playground } from '@/components/Playground'
import { LessonVideo } from '@/components/LessonVideo'
import { Quiz } from '@/components/Quiz'
import { CompleteLesson } from '@/components/CompleteLesson'
export const dynamic = 'force-dynamic'
export default async function LessonPage({params}: {params:Promise<{slug:string}>}) {
  const {slug}=await params
  const lesson=await lessonBySlug(slug)
  if(!lesson)notFound()
  const all=await lessons()
  const idx=all.findIndex(x=>x.slug===slug)
  const next=all[idx+1]
  return <div className="lesson-page"><div className="lesson-back"><Link href="/learn">← All lessons</Link><span>{lesson.difficulty} · {lesson.durationMinutes} min</span></div>
  <header className="lesson-heading"><span className="eyebrow">LEARN KASA · LESSON {idx+1}</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></header>
  <div className="lesson-layout"><article className="lesson-main"><div className="lesson-prose"><h2>What you'll learn</h2><p>{lesson.overview}</p>{lesson.learningPoints?.map((point,i)=><div className="learning-point" key={i}><h3>{point.heading}</h3><p>{point.detail}</p></div>)}</div><LessonVideo videoUrl={lesson.videoUrl} videoTitle={lesson.videoTitle} videoLanguage={lesson.videoLanguage} transcriptTwi={lesson.transcriptTwi} transcriptEnglish={lesson.transcriptEnglish}/><Playground sourceCode={lesson.sourceCode} starterInput={lesson.starterInput} expectedOutput={lesson.expectedOutput}/>{lesson.challenge&&<div className="lesson-challenge"><span className="eyebrow">YOUR TURN</span><h3>Try this challenge</h3><p>{lesson.challenge}</p></div>}{lesson.quizQuestion&&<Quiz question={lesson.quizQuestion} choices={(lesson.quizChoices||[]).map(c=>c.answerText)} correctChoice={lesson.correctChoice} explanation={lesson.quizExplanation}/>}<div className="lesson-footer"><CompleteLesson slug={slug}/>{next&&<Link className="button button-primary" href={'/learn/'+next.slug}>Next lesson →</Link>}</div></article><aside className="lesson-side"><h3>Practice makes progress.</h3><p>Try editing the code before checking the output. Every program runs privately in your browser.</p><Link href="/practice">Explore challenges →</Link></aside></div></div>
}
