'use client'
import {useState} from 'react'
import {Playground} from '@/components/Playground'
import workbook from '@/lib/syntax-workbook.json'

type Unit = (typeof workbook.units)[number]

export function SyntaxDeepPractice({unit}:{unit:Unit}) {
 const [revealed,setRevealed]=useState(false)
 const [completed,setCompleted]=useState<boolean[]>([false,false,false,false])
 const finished=completed.filter(Boolean).length
 const lab=unit.newExample
 return <section className="syntax-deep-practice" aria-label="Guided Kasa syntax workbook">
   <header className="syntax-deep-header">
     <span className="eyebrow">DEEP PRACTICE · PREDICT → TRACE → RUN → CHANGE</span>
     <h2>Make this Kasa rule your own</h2>
     <p>This is an additional, runnable example—not just a repetition of the first program. Study what changes, then make your own version.</p>
   </header>
   <div className="syntax-deep-stage"><span className="syntax-step">01</span><div><h3>Predict before running</h3><p>{unit.preflight}</p><p><strong>Your investigation:</strong> {lab.purpose}</p><pre><code>{lab.code}</code></pre></div></div>
   <div className="syntax-deep-stage"><span className="syntax-step">02</span><div><h3>Trace the program</h3><p>Follow the program statement by statement, including how values change and which lines print.</p><details><summary>Show the instructor's tracing hint</summary><p>{lab.coach}</p></details></div></div>
   <div className="syntax-deep-stage"><span className="syntax-step">03</span><div><h3>Run and compare</h3><p>The editor checks the exact output for this sample. Use the Twi character toolbar if your keyboard does not have ɛ or ɔ.</p><Playground sourceCode={lab.code} expectedOutput={lab.output}/><button type="button" className="button button-outline" aria-expanded={revealed} onClick={()=>setRevealed(v=>!v)}>{revealed?'Hide instructor output':'Reveal instructor output'}</button>{revealed&&<pre className="syntax-workbook-output"><code>{lab.output}</code></pre>}</div></div>
   <div className="syntax-deep-stage"><span className="syntax-step">04</span><div><h3>Modify without copying</h3><p>{lab.transfer}</p><p>Try another name that makes sense in your community. Check that the Kasa keywords remain unchanged.</p></div></div>
   <div className="syntax-deep-stage"><span className="syntax-step">05</span><div><h3>Debug and explain</h3><p><strong>Consider this original chapter mistake:</strong></p><pre><code>{unit.debugging.incorrect}</code></pre><details><summary>Show an explanation after predicting the problem</summary><p>{unit.debugging.explanation}</p></details><h4>Explain it back</h4><ol>{unit.mastery.map((question,i)=><li key={i}>{question}</li>)}</ol></div></div>
   <div className="syntax-deep-checklist"><h3>Self-check before the next chapter</h3><p>Tick these only after doing the activity. This stays on this page; it is not a formal grade or saved certificate.</p>{unit.checklist.map((label,i)=><label key={label}><input type="checkbox" checked={completed[i]} onChange={e=>setCompleted(values=>values.map((value,index)=>index===i?e.target.checked:value))}/>{label}</label>)}<p role="status">{finished} of {unit.checklist.length} independent learning goals practised.</p></div>
 </section>
}
