'use client'
import { useEffect, useState } from 'react'
const STORAGE_KEY = 'kasa-academy-completed-v1'
export function CompleteLesson({slug}:{slug:string}){
  const [complete,setComplete]=useState(false)
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');setComplete(Array.isArray(saved)&&saved.includes(slug))}catch{setComplete(false)}},[slug])
  function toggle(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');const entries=Array.isArray(saved)?saved:[];const next=complete?entries.filter((x:unknown)=>x!==slug):[...new Set([...entries,slug])];localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setComplete(!complete)}catch{setComplete(!complete)}}
  return <button type="button" className={'button '+(complete?'button-done':'button-outline')} onClick={toggle} aria-pressed={complete}>{complete?'✓ Lesson completed':'Mark as complete'}</button>
}
