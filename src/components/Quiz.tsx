'use client'
import { useState } from 'react'
export function Quiz({ question, choices, correctChoice, explanation }: { question: string; choices: string[]; correctChoice: number; explanation?: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  if (!choices.length) return null
  const correct = selected === correctChoice
  return <section className="quiz-card"><span className="eyebrow">CHECK YOUR UNDERSTANDING</span><h2>Quick quiz</h2><p>{question}</p><div role="radiogroup" aria-label="Quiz answers" className="quiz-choices">{choices.map((c,i)=><label key={i} className={'quiz-option '+(selected===i?'selected':'')}><input type="radio" name="quiz" checked={selected===i} onChange={()=>{setSelected(i);setSubmitted(false)}}/><span>{c}</span></label>)}</div><button type="button" className="button button-primary" disabled={selected===null} onClick={()=>setSubmitted(true)}>Check answer</button>{submitted&&<p role="status" className={'quiz-feedback '+(correct?'correct':'incorrect')}><strong>{correct?'Correct!':'Not quite — try again.'}</strong> {explanation}</p>}</section>
}
