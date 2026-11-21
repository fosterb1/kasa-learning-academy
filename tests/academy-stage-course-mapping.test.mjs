import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')
const roadmap=JSON.parse(await read('src/lib/learning-path.json'))
const crosswalk=JSON.parse(await read('src/lib/stage-course-map.json'))
const curriculum=JSON.parse(await read('scripts/content/curriculum.json'))

test('all eight stage pages have explicit courses and honest links',()=>{
 assert.equal(crosswalk.version,1)
 assert.equal(crosswalk.kind,'editorial-stage-course-module-crosswalk')
 assert.deepEqual(crosswalk.stages.map(s=>s.id),roadmap.stages.map(s=>s.id))
 const seen=new Set()
 for(const stage of crosswalk.stages){
  assert.ok(stage.courses.length>=1)
  for(const course of stage.courses){
   assert.ok(course.title.length>5)
   assert.ok(course.description.length>15)
   assert.ok(!seen.has(course.id),'duplicate course id '+course.id)
   seen.add(course.id)
   if(course.href!==null)assert.ok(course.href.startsWith('/'),'external path not expected')
  }
 }
})

test('existing five CMS module IDs map to courses without being copied or overwritten',()=>{
 const known=new Set(curriculum.modules.map(m=>m.id.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')))
 assert.equal(known.size,5)
 const assignments=crosswalk.stages.flatMap(s=>s.courses.flatMap(c=>c.moduleSlugs))
 assert.equal(new Set(assignments).size,assignments.length,'do not duplicate a CMS module across stages')
 for(const slug of assignments)assert.ok(known.has(slug),'unknown original CMS module '+slug)
 assert.equal(assignments.length,5,'the five original CMS modules should all be represented')
})

test('primary course landing leads into eight stage detail pages; library remains secondary',async()=>{
 const catalog=await read('src/app/(site)/learn/page.tsx')
 const detail=await read('src/app/(site)/learning-path/[slug]/page.tsx')
 const overview=await read('src/app/(site)/learning-path/page.tsx')
 assert.match(catalog,/roadmap.stages.map/)
 assert.match(catalog,/href=\{"\/learning-path\/"\+stage.id\}/)
 assert.match(catalog,/<details id="lesson-library"/)
 assert.match(catalog,/<summary>/)
 assert.match(catalog,/groups.map\(g=>/)
 assert.match(catalog,/youtubeVideoId\(lesson.videoUrl\)/)
 assert.match(detail,/generateStaticParams/)
 assert.match(detail,/course.moduleSlugs.map/)
 assert.match(detail,/href=\{'\/learn\/'\+lesson.slug\}/)
 assert.match(overview,/href=\{'\/learning-path\/'\+stage.id\}/)
})

test('stage pages query only published CMS content and do not alter media fields',async()=>{
 const page=await read('src/app/(site)/learning-path/[slug]/page.tsx')
 const source=await read('src/lib/content.ts')
 const lesson=await read('src/collections/Lessons.ts')
 assert.match(page,/Promise.all\(\[modules\(\),lessons\(\)\]\)/)
 assert.match(page,/lesson.videoUrl/)
 assert.match(page,/lesson.slug/)
 assert.match(source,/where: published/)
 for(const field of ['videoUrl','transcriptTwi','transcriptEnglish'])
  assert.ok(lesson.includes("name: '"+field+"'"))
 assert.doesNotMatch(page,/(?:db|payload)\.(?:create|update|delete)\(/)
 assert.doesNotMatch(page,/getPayload|seed\(/)
})
