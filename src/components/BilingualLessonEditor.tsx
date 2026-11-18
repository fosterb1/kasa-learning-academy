'use client'
import {useState} from 'react'
import Link from 'next/link'
import {Playground} from '@/components/Playground'
import {bilingualLessonCode} from '@/lib/kasa-identifiers'

type Props={slug:string;sourceCode:string;starterInput?:string;expectedOutput?:string}
export function BilingualLessonEditor({slug,sourceCode,starterInput='',expectedOutput=''}:Props){
  const {blended,hasVariant}=bilingualLessonCode(slug,sourceCode)
  const [style,setStyle]=useState<'blended'|'original'>('blended')
  const current=style==='blended'?blended:sourceCode
  return <section className="bilingual-lesson-editor" aria-label="Learn to choose Kasa variable names">
    <div className="bilingual-intro">
      <span className="eyebrow">KASA IS YOUR LANGUAGE · CHOOSE YOUR OWN NAMES</span>
      <h2>Twi-inspired names, same programming rules</h2>
      <p><code>ma</code>, <code>ka</code>, and <code>sɛ</code> are Kasa keywords that keep their fixed meanings. Names like <code>sika</code> (money) and <code>din</code> (name) are choices made by the programmer. You can use English or other valid names too, as long as you spell each one consistently.</p>
      <div className="bilingual-name-compare" aria-label="Equivalent code in Twi and English naming styles">
        <div><strong>Twi-style name</strong><pre><code>{'ma sika = 4\nka sika'}</code></pre></div>
        <div><strong>English name</strong><pre><code>{'ma money = 4\nka money'}</code></pre></div>
      </div>
      {hasVariant&&<div className="bilingual-switch" role="group" aria-label="Select identifier naming style">
        <button type="button" aria-pressed={style==='blended'} className={style==='blended'?'selected':''} onClick={()=>setStyle('blended')}>Twi + English names</button>
        <button type="button" aria-pressed={style==='original'} className={style==='original'?'selected':''} onClick={()=>setStyle('original')}>Original lesson names</button>
      </div>}
      <p className="bilingual-caution">{hasVariant?'Switching changes the learner-chosen names in the example, not the Kasa keywords or expected result. It resets the editor to that example.':'This lesson does not require custom variable names. Try your own valid names in the next lesson.'} Akan vocabulary examples are illustrative and need continuing fluent-speaker review.</p>
    </div>
    <Playground sourceCode={current} starterInput={starterInput} expectedOutput={expectedOutput}/>
    <p className="academy-full-playground-link"><Link href="/learn/syntax/variables">Study the difference between keywords and variable names →</Link></p>
  </section>
}
