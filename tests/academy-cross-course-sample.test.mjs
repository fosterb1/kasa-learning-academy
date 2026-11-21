import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const courseSpecs=[
 {name:'Computing Foundations',file:'beginner-course.json',route:'/start',page:'src/app/(site)/start/[slug]/page.tsx',sourceKey:'code',outputKey:'expected',slugKey:'id',editor:'BilingualLessonEditor'},
 {name:'Kasa Syntax',file:'syntax-course.json',route:'/learn/syntax',page:'src/app/(site)/learn/syntax/[slug]/page.tsx',sourceKey:'example',outputKey:'output',slugKey:'slug',editor:'Playground'},
 {name:'Algorithms',file:'algorithms-course.json',route:'/learn/algorithms',page:'src/app/(site)/learn/algorithms/[slug]/page.tsx',sourceKey:'source',outputKey:'output',slugKey:'slug',editor:'Playground'},
 {name:'Data Processing',file:'data-course.json',route:'/learn/data',page:'src/app/(site)/learn/data/[slug]/page.tsx',sourceKey:'source',outputKey:'output',slugKey:'slug',editor:'Playground'},
 {name:'Applied Kasa',file:'applied-course.json',route:'/learn/applied',page:'src/app/(site)/learn/applied/[slug]/page.tsx',sourceKey:'source',outputKey:'output',slugKey:'slug',editor:'Playground'},
 {name:'Software Development',file:'development-course.json',route:'/learn/development',page:'src/app/(site)/learn/development/[slug]/page.tsx',sourceKey:'source',outputKey:'output',slugKey:'slug',editor:'Playground'},
]

const courses=await Promise.all(courseSpecs.map(async spec=>({...spec,data:JSON.parse(await read('src/lib/'+spec.file))})))

for(const course of courses){
 const units=course.data.units
 assert.ok(units.length>=3,course.name+' needs at least 3 sample lessons')
 for(const index of [0,Math.floor(units.length/2),units.length-1]){
  const unit=units[index]
  const slug=unit[course.slugKey]
  test(course.name+' · runnable lesson '+slug,()=>{
   assert.equal(typeof slug,'string')
   const source=unit[course.sourceKey]
   const expected=unit[course.outputKey]
   assert.equal(typeof source,'string')
   assert.equal(typeof expected,'string')
   const result=globalThis.KasaRuntime.executeKasa(source,'','run')
   assert.equal(result.ok,true,course.name+'/'+slug+': '+result.error)
   assert.equal(result.output,expected,course.name+'/'+slug+' sample output mismatch')
  })
 }
 test(course.name+' · lesson route is wired to the course data and a real editor',async()=>{
  const page=await read(course.page)
  assert.match(page,/generateStaticParams/)
  assert.ok(page.includes(course.file),course.name+' route does not load its course data')
  assert.ok(page.includes(course.editor),course.name+' route does not show editor')
  // The dynamic route must enumerate all editorial lessons, not a hard-coded sample.
  assert.match(page,/course\.units\.map/)
  for(const index of [0,Math.floor(units.length/2),units.length-1]){
   assert.ok(units[index][course.slugKey]?.length>0,course.name+' missing lesson slug')
  }
 })
}

test('all six course routes are linked to the eight-stage roadmap',async()=>{
 const roadmap=JSON.parse(await read('src/lib/learning-path.json'))
 const map=JSON.parse(await read('src/lib/stage-course-map.json'))
 assert.equal(roadmap.stages.length,8)
 for(const course of courses){
  assert.ok(roadmap.stages.some(stage=>stage.route===course.route),course.name+' missing roadmap route')
  assert.ok(map.stages.some(stage=>stage.courses.some(item=>item.href===course.route)),course.name+' missing course crosswalk route')
 }
})

test('sample tests use existing Academy runtime without altering CMS video/transcript fields',async()=>{
 const lesson=await read('src/collections/Lessons.ts')
 const sample=await read('src/components/Playground.tsx')
 assert.match(lesson,/name: 'videoUrl'/)
 assert.match(lesson,/name: 'transcriptTwi'/)
 assert.match(lesson,/name: 'transcriptEnglish'/)
 assert.match(sample,/new Worker\('\/kasa-worker.js'\)/)
 assert.match(sample,/explainSampleOutput/)
})
