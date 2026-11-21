'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {COURSE_PROGRESS_KEY,COURSE_PROGRESS_EVENT} from '@/components/CourseProgressToggle'

export type CourseLesson={id:string;href:string;title:string;minutes:number;course:string}
export type CourseGroup={id:string;title:string;href:string;lessons:CourseLesson[]}

function readKnown(known:Set<string>):string[]{
 try{
  const raw:unknown=JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY)||'[]')
  if(!Array.isArray(raw))return []
  return [...new Set(raw.filter((id):id is string=>typeof id==='string'&&known.has(id)))]
 }catch{return []}
}
export function CourseProgress({courses}:{courses:CourseGroup[]}){
 const [completed,setCompleted]=useState<string[]>([])
 const [ready,setReady]=useState(false)
 const all=useMemo(()=>courses.flatMap(c=>c.lessons),[courses])
 const known=useMemo(()=>new Set(all.map(l=>l.id)),[all])
 useEffect(()=>{
  const refresh=()=>setCompleted(readKnown(known))
  refresh();setReady(true)
  window.addEventListener('storage',refresh)
  window.addEventListener(COURSE_PROGRESS_EVENT,refresh)
  return()=>{window.removeEventListener('storage',refresh);window.removeEventListener(COURSE_PROGRESS_EVENT,refresh)}
 },[known])
 const done=useMemo(()=>new Set(completed),[completed])
 const next=all.find(l=>!done.has(l.id))
 const total=all.length
 const pct=total?Math.round(100*completed.length/total):0
 const minutes=all.filter(l=>done.has(l.id)).reduce((a,l)=>a+l.minutes,0)
 return <section className="learning-progress-panel" aria-labelledby="course-progress-heading">
  <div className="learning-progress-heading"><div>
   <span className="eyebrow">EIGHT-STAGE ACADEMY · EDITORIAL COURSES</span>
   <h2 id="course-progress-heading">Course study progress</h2>
   <p>Keep track of the chapters and labs you choose to mark studied.</p></div>
   {next&&<Link className="button button-primary" href={next.href}>Continue: {next.title} →</Link>}
  </div>
  <div className="learning-progress-summary">
   <p><strong>{ready?completed.length:'—'}</strong> of {total} chapters/labs studied</p>
   <p><strong>{ready?pct+'%':'—'}</strong> self-reported progress</p>
   <p><strong>{ready?minutes:'—'}</strong> nominal minutes studied</p>
  </div>
  <div className="learning-progress-track" role="progressbar" aria-label="Editorial chapters studied" aria-valuemin={0} aria-valuemax={total||1} aria-valuenow={ready?completed.length:0}>
   <span style={{width:ready?pct+'%':'0%'}}/>
  </div>
  <div className="learning-progress-courses">
   {courses.map(course=>{
    const complete=course.lessons.filter(l=>done.has(l.id)).length
    const percentage=course.lessons.length?Math.round(100*complete/course.lessons.length):0
    return <details key={course.id} className="learning-progress-course"><summary><strong>{course.title}</strong><span>{ready?complete:'—'} / {course.lessons.length} studied · {ready?percentage+'%':'—'}</span></summary>
     <ol>{course.lessons.map(lesson=><li key={lesson.id}><Link href={lesson.href}>{lesson.title}</Link><small>{ready&&done.has(lesson.id)?' ✓ Studied':'Not marked yet'}</small></li>)}</ol>
     <p><Link href={course.href}>Open course overview →</Link></p>
    </details>
   })}
  </div>
  <p className="learning-progress-note">This progress is saved only in this browser. Completion is self-reported; running an example or viewing a quiz does not automatically earn credit. Clearing site data removes progress, and other devices will not share it.</p>
 </section>
}
