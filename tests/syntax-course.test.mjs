import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const course=JSON.parse(await readFile(new URL('../src/lib/syntax-course.json',import.meta.url),'utf8'))
test('syntax course covers Kasa 0.4 with 16 independent lessons',()=>{
 assert.equal(course.units.length,16)
 assert.equal(new Set(course.units.map(x=>x.slug)).size,16)
 for(const unit of course.units){
  for(const k of ['syntax','rule','walkthrough','practice','experiment','caution','example','secondExample'])
   assert.ok(unit[k]?.length>=10,unit.slug+' lacks '+k)
 }
})
for(const unit of course.units){
 for(const [id,source,expected] of [['worked',unit.example,unit.output],['variation',unit.secondExample,unit.secondOutput]]){
  test('syntax '+unit.slug+': '+id+' runnable output',()=>{
   const result=globalThis.KasaRuntime.executeKasa(source,'','run')
   assert.equal(result.ok,true,unit.slug+': '+result.error)
   assert.equal(result.output,expected,unit.slug+': '+id)
  })
 }
}
test('syntax course is discoverable from main learning path',async()=>{
 const path=await readFile(new URL('../src/app/(site)/learn/page.tsx',import.meta.url),'utf8')
 const page=await readFile(new URL('../src/app/(site)/learn/syntax/[slug]/page.tsx',import.meta.url),'utf8')
 assert.ok(path.includes('href="/learn/syntax"'))
 assert.ok(page.includes('Playground'))
 assert.ok(page.includes('generateStaticParams'))
})
