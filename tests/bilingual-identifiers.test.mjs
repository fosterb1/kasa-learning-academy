import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {identifierExamples,renameKasaIdentifiers,bilingualLessonCode} from '../src/lib/kasa-identifiers.ts'
import '../public/kasa-runtime.js'

const curriculum=JSON.parse(await readFile(new URL('../scripts/content/curriculum.json',import.meta.url),'utf8'))
const beginners=JSON.parse(await readFile(new URL('../src/lib/beginner-course.json',import.meta.url),'utf8'))

test('renaming respects strings, comments and nonmatching substrings',()=>{
 const source='# score should remain unchanged\nma score = 4\nka "score is text"\nka score\nma score2 = 9\nka score2\n'
 const result=renameKasaIdentifiers(source,{score:'sɔhwɛ_score'})
 assert.equal(result,'# score should remain unchanged\nma sɔhwɛ_score = 4\nka "score is text"\nka sɔhwɛ_score\nma score2 = 9\nka score2\n')
})
test('Unicode source identifiers are renamed without breaking similar longer names',()=>{
 const source='ma ɛdin = "Akosua"\nma ɛdin2 = "Kofi"\nka ɛdin\nka ɛdin2'
 const got=renameKasaIdentifiers(source,{'ɛdin':'din'})
 assert.equal(got,'ma din = "Akosua"\nma ɛdin2 = "Kofi"\nka din\nka ɛdin2')
})
test('all 24 bundled lessons retain identical output under Twi-name blending',()=>{
 for (const lesson of curriculum.lessons){
  const {blended}=bilingualLessonCode(lesson.id,lesson.code)
  const expected=globalThis.KasaRuntime.executeKasa(lesson.code,lesson.input||'','run')
  const actual=globalThis.KasaRuntime.executeKasa(blended,lesson.input||'','run')
  assert.equal(actual.ok,expected.ok,lesson.id+': '+actual.error)
  assert.equal(actual.output,expected.output,lesson.id+': output changed')
  assert.equal(actual.error,expected.error,lesson.id+': error changed')
  if(expected.ok)assert.equal(actual.output,lesson.expected,lesson.id+': published expected mismatch')
 }
})
test('beginner and project naming variants keep their Kasa outputs',()=>{
 for(const u of beginners.units){
  const code=renameKasaIdentifiers(u.code,identifierExamples['start/'+u.id]||{})
  const result=globalThis.KasaRuntime.executeKasa(code,u.input||'','run')
  assert.equal(result.ok,true,u.id+': '+result.error)
  assert.equal(result.output,u.expected,u.id)
 }
})
test('all student-facing editor pages use the bilingual source view',async()=>{
 for(const relative of [
  '../src/app/(site)/learn/[slug]/page.tsx',
  '../src/app/(site)/start/[slug]/page.tsx',
  '../src/app/(site)/projects/[id]/page.tsx'
 ]){
  const page=await readFile(new URL(relative,import.meta.url),'utf8')
  assert.ok(page.includes('BilingualLessonEditor'),relative)
 }
})
