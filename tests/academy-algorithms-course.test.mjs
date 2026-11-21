import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const course=JSON.parse(await read('src/lib/algorithms-course.json'))
const roadmap=JSON.parse(await read('src/lib/learning-path.json'))
const mapping=JSON.parse(await read('src/lib/stage-course-map.json'))

test('algorithm curriculum has five structured, unique lessons and clear learning boundaries',()=>{
 assert.equal(course.version,1)
 assert.equal(course.status,'editorial_course_not_cms_seed')
 assert.equal(course.units.length,5)
 assert.equal(new Set(course.units.map(unit=>unit.slug)).size,5)
 for(const unit of course.units){
  for(const key of ['title','goal','concept','source','task','question','answer','complexity','mode'])
   assert.ok(unit[key]?.trim().length>=8,unit.slug+': missing '+key)
  // Algorithm outputs may legitimately be short (e.g. '25\\n'). Runtime tests below verify exact output.
  assert.equal(typeof unit.output,'string',unit.slug+': expected output must be text')
  assert.ok(unit.output.trim().length>0,unit.slug+': missing output')
  assert.ok(unit.trace.length>=3,unit.slug+': needs worked trace')
  assert.ok(unit.acceptance.length>=3,unit.slug+': needs acceptance checklist')
  assert.ok(unit.minutes>=20&&unit.minutes<=90)
  assert.match(unit.mode,/Core Kasa/)
 }
})

for(const unit of course.units){
 test('algorithm example executes in the actual Academy Kasa runtime: '+unit.slug,()=>{
  const result=globalThis.KasaRuntime.executeKasa(unit.source,'','run')
  assert.equal(result.ok,true,unit.slug+': '+result.error)
  assert.equal(result.output,unit.output,unit.slug+': output mismatch')
 })
}

test('algorithm edge cases show the limits of search, signed maximum, sorting and growth',()=>{
 const variants=[
  {slug:'linear-search',find:'ma wanted = 9',replace:'ma wanted = 7',expected:'atoro\n'},
  {slug:'maximum-value',find:'[-8, -2, -15, -4]',replace:'[4, 16, 7, 12]',expected:'16\n'},
  {slug:'bubble-sort',find:'[8, 3, 6, 1]',replace:'[5, 2, 5, 1]',expected:'1\n2\n5\n5\n'},
  {slug:'count-operations',find:'ma n = 4',replace:'ma n = 8',expected:'8\n64\n'},
  {slug:'trace-steps',find:'[12, 8, 5]',replace:'[12, 8, 5, 10]',expected:'35\n'},
 ]
 for(const v of variants){
  const unit=course.units.find(item=>item.slug===v.slug)
  assert.ok(unit,'unknown lesson '+v.slug)
  assert.ok(unit.source.includes(v.find),'source changed '+v.slug)
  const result=globalThis.KasaRuntime.executeKasa(unit.source.replace(v.find,v.replace),'','run')
  assert.equal(result.ok,true,v.slug+': '+result.error)
  assert.equal(result.output,v.expected,v.slug+': variant output mismatch')
 }
})

test('algorithms pages expose five lessons with one editor each and navigation',async()=>{
 const coursePage=await read('src/app/(site)/learn/algorithms/page.tsx')
 const lessonPage=await read('src/app/(site)/learn/algorithms/[slug]/page.tsx')
 assert.match(coursePage,/course.units.map/)
 assert.match(coursePage,/href=\{'\/learn\/algorithms\/'\+unit.slug\}/)
 assert.match(lessonPage,/generateStaticParams/)
 assert.match(lessonPage,/<Playground sourceCode=\{unit.source\} expectedOutput=\{unit.output\}/)
 assert.equal((lessonPage.match(/<Playground /g)||[]).length,1)
 assert.match(lessonPage,/Self-review checklist/)
 assert.match(lessonPage,/unit.complexity/)
 assert.match(lessonPage,/Previous lesson/)
 assert.match(lessonPage,/Next lesson/)
})

test('Stage 3 is linked in both roadmap and course crosswalk after source is published',()=>{
 const stage=roadmap.stages.find(stage=>stage.id==='problem-solving')
 const crosswalk=mapping.stages.find(stage=>stage.id==='problem-solving')
 assert.equal(stage.status,'available')
 assert.equal(stage.route,'/learn/algorithms')
 assert.equal(crosswalk.courses[0].href,'/learn/algorithms')
 assert.ok(crosswalk.courses[0].moduleSlugs.length===0)
 assert.equal(roadmap.stages.length,8)
})

test('course remains editorial: no CMS writes, migrations or claims of secret grading',async()=>{
 const lesson=await read('src/app/(site)/learn/algorithms/[slug]/page.tsx')
 const overview=await read('src/app/(site)/learn/algorithms/page.tsx')
 assert.doesNotMatch(lesson,/getPayload|db\.update|db\.create|transcriptTwi|transcriptEnglish/)
 assert.match(lesson,/not a complete assessment/)
 assert.match(overview,/not a hidden-test grader/)
})
