'use client'
import {useEffect,useState} from 'react'

export const COURSE_PROGRESS_KEY='kasa-academy-course-completed-v1'
export const COURSE_PROGRESS_EVENT='kasa-academy-course-progress-changed'

function completedIds():string[]{
 try{
  const raw=JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY)||'[]')
  return Array.isArray(raw)?raw.filter((value):value is string=>typeof value==='string'&&value.length<180):[]
 }catch{return []}
}

/** Optional self-reported completion, never automatic grading. */
export function CourseProgressToggle({id}:{id:string}){
 const [complete,setComplete]=useState(false)
 const [ready,setReady]=useState(false)
 useEffect(()=>{
  const sync=()=>setComplete(completedIds().includes(id))
  sync();setReady(true)
  window.addEventListener('storage',sync)
  window.addEventListener(COURSE_PROGRESS_EVENT,sync)
  return ()=>{window.removeEventListener('storage',sync);window.removeEventListener(COURSE_PROGRESS_EVENT,sync)}
 },[id])
 const toggle=()=>{
  try{
   const old=completedIds()
   const next=complete?old.filter(item=>item!==id):[...new Set([...old,id])]
   localStorage.setItem(COURSE_PROGRESS_KEY,JSON.stringify(next))
   setComplete(!complete)
   window.dispatchEvent(new Event(COURSE_PROGRESS_EVENT))
  }catch{/* Browser storage may be disabled; do not claim persistence. */}
 }
 return <div className="academy-course-completion">
  <p>This is a self-reported study marker, not a graded assessment or certificate.</p>
  <button type="button" className={'button '+(complete?'button-done':'button-outline')} disabled={!ready}
   onClick={toggle} aria-pressed={complete}>{complete?'✓ Studied — mark incomplete':'Mark this lesson studied'}</button>
 </div>
}
