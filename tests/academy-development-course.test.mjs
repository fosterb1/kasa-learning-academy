import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const course=JSON.parse(await read('src/lib/development-course.json'))
const roadmap=JSON.parse(await read('src/lib/learning-path.json'))
const mapping=JSON.parse(await read('src/lib/stage-course-map.json'))

test('software practices curriculum has five structured lessons with honest boundaries',()=>{
 assert.equal(course.version,1)
 assert.equal(course.status,'editorial_course_not_cms_seed')
 assert.equal(course.units.length,5)
 assert.equal(new Set(course.units.map(u=>u.slug)).size,5)
 assert.match(course.description,/Git and README activities remain external/)
 for(const unit of course.units){
  for(const key of ['title','goal','concept','source','task','question','answer','complexity','mode'])
   assert.ok(unit[key]?.trim().length>=8,unit.slug+': '+key+' missing')
  assert.equal(typeof unit.output,'string')
  assert.ok(unit.output.trim().length>0,unit.slug+': output missing')
  assert.ok(unit.trace.length>=3)
  assert.ok(unit.acceptance.length>=3)
  assert.ok(unit.minutes>=20&&unit.minutes<=90)
  assert.match(unit.mode,/Core Kasa/)
 }
})

for(const unit of course.units){
 test('software practices worked Kasa program: '+unit.slug,()=>{
  const r=globalThis.KasaRuntime.executeKasa(unit.source,'','run')
  assert.equal(r.ok,true,unit.slug+': '+r.error)
  assert.equal(r.output,unit.output)
 })
}

test('changed inputs cover boundary conditions, refactor calls and workflow gates',()=>{
 const variants=[
  {slug:'debug-trace',from:'[4, 6, 3]',to:'[4, 6, 3, 2]',expected:'15\n'},
  {slug:'test-cases',from:'[5, 9, 2]',to:'[5, 5]',expected:'2\n'},
  {slug:'refactor-function',from:'ka second',to:'ka second\nka total_price(0, 8)',expected:'24\n10\n0\n'},
  {slug:'version-control',from:'ma reviewed = nokware',to:'ma reviewed = atoro',expected:'Finish checks first\n'},
  {slug:'document-project',from:'ma available = 4',to:'ma available = 6',expected:'Stock sufficient\n'},
 ]
 for(const v of variants){
  const unit=course.units.find(u=>u.slug===v.slug)
  assert.ok(unit?.source.includes(v.from),v.slug+': sample has changed')
  const r=globalThis.KasaRuntime.executeKasa(unit.source.replace(v.from,v.to),'','run')
  assert.equal(r.ok,true,v.slug+': '+r.error)
  assert.equal(r.output,v.expected,v.slug+': changed output differs')
 }
})

test('Stage 7 course pages expose interactive editor, clear sequence and no Git execution claim',async()=>{
 const overview=await read('src/app/(site)/learn/development/page.tsx')
 const lesson=await read('src/app/(site)/learn/development/[slug]/page.tsx')
 assert.match(overview,/course.units.map/)
 assert.match(overview,/href=\{'\/learn\/development\/'\+unit.slug\}/)
 assert.match(lesson,/generateStaticParams/)
 assert.match(lesson,/<Playground sourceCode=\{unit.source\} expectedOutput=\{unit.output\}/)
 assert.equal((lesson.match(/<Playground /g)||[]).length,1)
 assert.match(lesson,/Previous lesson/)
 assert.match(lesson,/Next lesson/)
 assert.match(lesson,/Self-review checklist/)
 assert.match(lesson,/Git commands must be run in a terminal/)
})

test('Stage 7 is linked to five lessons without touching CMS module relationships',()=>{
 const stage=roadmap.stages.find(s=>s.id==='development')
 const mapped=mapping.stages.find(s=>s.id==='development')
 assert.equal(stage.status,'available')
 assert.equal(stage.route,'/learn/development')
 assert.deepEqual(stage.prerequisites,['problem-solving','data','applied'])
 assert.equal(mapped.courses[0].href,'/learn/development')
 assert.deepEqual(mapped.courses[0].moduleSlugs,[])
 assert.equal(roadmap.stages.length,8)
})

test('course requires no CMS writes and avoids false certification claims',async()=>{
 const lesson=await read('src/app/(site)/learn/development/[slug]/page.tsx')
 const overview=await read('src/app/(site)/learn/development/page.tsx')
 assert.doesNotMatch(lesson,/getPayload|db\.update|db\.create|transcriptTwi|transcriptEnglish/)
 assert.match(lesson,/No published CMS lesson, video or transcript was changed/)
 assert.match(overview,/no account-backed assessment/)
 assert.match(overview,/no.+certificate/)
})
