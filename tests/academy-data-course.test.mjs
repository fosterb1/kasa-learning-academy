import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const course=JSON.parse(await read('src/lib/data-course.json'))
const roadmap=JSON.parse(await read('src/lib/learning-path.json'))
const mapping=JSON.parse(await read('src/lib/stage-course-map.json'))

test('data curriculum has five unique lessons and explicit supported-feature limits',()=>{
 assert.equal(course.version,1)
 assert.equal(course.status,'editorial_course_not_cms_seed')
 assert.equal(course.units.length,5)
 assert.equal(new Set(course.units.map(unit=>unit.slug)).size,5)
 assert.match(course.description,/not native Kasa builtins/)
 for(const unit of course.units){
  for(const key of ['title','goal','concept','source','task','question','answer','complexity','mode']){
   assert.ok(unit[key]?.trim().length>=8,unit.slug+' missing '+key)
  }
  assert.equal(typeof unit.output,'string')
  assert.ok(unit.output.trim().length>0,unit.slug+' missing sample output')
  assert.ok(unit.trace.length>=3,unit.slug+' missing guided trace')
  assert.ok(unit.acceptance.length>=3,unit.slug+' missing review checklist')
  assert.ok(unit.minutes>=20&&unit.minutes<=90)
  assert.match(unit.mode,/Core Kasa/)
 }
})

for(const unit of course.units){
 test('data lesson runs in Academy Kasa runtime: '+unit.slug,()=>{
  const result=globalThis.KasaRuntime.executeKasa(unit.source,'','run')
  assert.equal(result.ok,true,unit.slug+': '+result.error)
  assert.equal(result.output,unit.output,unit.slug+': sample output mismatch')
 })
}

test('five changed datasets produce expected outputs',()=>{
 const variants=[
  {slug:'nested-lists',from:'[[12, 8], [10, 6], [7, 5]]',to:'[[12, 8], [10, 6], [7, 5], [6, 4]]',expected:'20\n16\n12\n10\n'},
  {slug:'positional-records',from:'["Akua", 12, 8]',to:'["Kojo", 5, 9]',expected:'Kojo\n45\n'},
  {slug:'validate-values',from:'[10, -3, 20, 0, 15]',to:'[10, -1, 20, -2, 15]',expected:'3\n2\n'},
  {slug:'aggregate-summary',from:'[12, 18, 10, 20]',to:'[2, 5, 8]',expected:'15\n5.0\n'},
  {slug:'filtered-summary',from:'[0, 4, 2, 0, 7]',to:'[0, 4, 2, 0, 0]',expected:'2\n6\n'},
 ]
 for(const variant of variants){
  const unit=course.units.find(u=>u.slug===variant.slug)
  assert.ok(unit,'unknown lesson '+variant.slug)
  assert.ok(unit.source.includes(variant.from),'source not found for '+variant.slug)
  const result=globalThis.KasaRuntime.executeKasa(unit.source.replace(variant.from,variant.to),'','run')
  assert.equal(result.ok,true,variant.slug+': '+result.error)
  assert.equal(result.output,variant.expected,variant.slug+': changed input mismatch')
 }
})

test('empty-list mean is guarded as an independent exercise, not a working sample claim',()=>{
 const unit=course.units.find(u=>u.slug==='aggregate-summary')
 assert.match(unit.concept,/nonempty list/)
 assert.match(unit.concept,/guard against an empty list/)
 assert.match(unit.task,/empty list/)
})

test('five data lesson routes show runnable code and pedagogical sequence',async()=>{
 const overview=await read('src/app/(site)/learn/data/page.tsx')
 const lesson=await read('src/app/(site)/learn/data/[slug]/page.tsx')
 assert.match(overview,/course.units.map/)
 assert.match(overview,/href=\{'\/learn\/data\/'\+unit.slug\}/)
 assert.match(lesson,/generateStaticParams/)
 assert.match(lesson,/<Playground sourceCode=\{unit.source\} expectedOutput=\{unit.output\}/)
 assert.equal((lesson.match(/<Playground /g)||[]).length,1)
 assert.match(lesson,/Self-review checklist/)
 assert.match(lesson,/Previous lesson/)
 assert.match(lesson,/Next lesson/)
 assert.match(lesson,/unit.complexity/)
})

test('Stage 4 maps to an available course while experimental tables remain unclaimed',()=>{
 const stage=roadmap.stages.find(s=>s.id==='data')
 const mapped=mapping.stages.find(s=>s.id==='data')
 assert.equal(stage.status,'available')
 assert.equal(stage.route,'/learn/data')
 assert.deepEqual(stage.prerequisites,['syntax','problem-solving'])
 assert.equal(mapped.courses[0].href,'/learn/data')
 assert.deepEqual(mapped.courses[0].moduleSlugs,[])
 assert.match(stage.videoPolicy,/experimental or unsupported/)
 assert.equal(roadmap.stages.length,8)
})

test('editorial data lessons do not write CMS, modify Studio or claim certifications',async()=>{
 const lesson=await read('src/app/(site)/learn/data/[slug]/page.tsx')
 const overview=await read('src/app/(site)/learn/data/page.tsx')
 assert.doesNotMatch(lesson,/getPayload|db\.update|db\.create|transcriptTwi|transcriptEnglish/)
 assert.match(lesson,/not a complete assessment/)
 assert.match(overview,/no account-backed completion/)
 assert.match(overview,/not native table/)
})
