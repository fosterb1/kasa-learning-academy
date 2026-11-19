import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const workbook=JSON.parse(await readFile(new URL('../src/lib/syntax-workbook.json',import.meta.url),'utf8'))
const course=JSON.parse(await readFile(new URL('../src/lib/syntax-course.json',import.meta.url),'utf8'))
const interpreter=globalThis.KasaRuntime
const output=s=>s.replace(/\r\n/g,'\n').trimEnd()

test('Phase 4B workbook covers every syntax chapter with unique exercises',()=>{
 const chapters=course.units.map(x=>x.slug)
 assert.equal(chapters.length,16)
 assert.deepEqual(workbook.units.map(x=>x.slug),chapters)
 const seen=new Set()
 for (const chapter of workbook.units){
  assert.ok(chapter.preflight.length>40,chapter.slug)
  assert.equal(chapter.checklist.length,4,chapter.slug)
  assert.ok(chapter.mastery.length>=3,chapter.slug)
  assert.ok(chapter.newExample.transfer.length>15,chapter.slug)
  assert.ok(chapter.newExample.coach.length>15,chapter.slug)
  assert.ok(!seen.has(chapter.slug),chapter.slug)
  seen.add(chapter.slug)
 }
})
test('All 16 added Phase 4B examples run and match their expected output',()=>{
 for(const chapter of workbook.units){
  const {code,output:expected}=chapter.newExample
  const result=interpreter.executeKasa(code,'','run')
  assert.equal(result.ok,true,chapter.slug+': '+result.error)
  assert.equal(output(result.output),output(expected),chapter.slug+' output')
 }
})
test('Kasa lessons render deep practice with live editor and instructor hints',async()=>{
 const page=await readFile(new URL('../src/app/(site)/learn/syntax/[slug]/page.tsx',import.meta.url),'utf8')
 const component=await readFile(new URL('../src/components/SyntaxDeepPractice.tsx',import.meta.url),'utf8')
 assert.match(page,/<SyntaxDeepPractice key=\{slug\} unit=\{workbookUnit\}/)
 assert.match(component,/<Playground sourceCode=\{lab.code\} expectedOutput=\{lab.output\}/)
 assert.match(component,/Predict before running/)
 assert.match(component,/Trace the program/)
 assert.match(component,/Debug and explain/)
})
