import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8')

const catalogs=[
 ['beginner-course.json','start','id',18],
 ['syntax-course.json','syntax','slug',16],
 ['algorithms-course.json','algorithms','slug',5],
 ['data-course.json','data','slug',5],
 ['applied-course.json','applied','slug',5],
 ['development-course.json','development','slug',5],
]

test('six file-based courses have 54 stable, unique study identifiers',async()=>{
 const all=[]
 for(const [file,prefix,key,count] of catalogs){
  const data=JSON.parse(await read('src/lib/'+file))
  assert.equal(data.units.length,count,prefix+' course count changed')
  for(const unit of data.units){
   const id=prefix+'/'+unit[key]
   assert.ok(unit[key]&&unit.title&&unit.minutes>0,id+' malformed')
   all.push(id)
  }
 }
 assert.equal(all.length,54)
 assert.equal(new Set(all).size,all.length,'course study IDs must be unique')
})

test('existing CMS completion storage and in-tab update event are preserved',async()=>{
 const existing=await read('src/components/CompleteLesson.tsx')
 const progress=await read('src/components/LearningProgress.tsx')
 assert.match(existing,/kasa-academy-completed-v1/)
 assert.match(progress,/kasa-academy-completed-v1/)
 assert.match(existing,/dispatchEvent\(new Event\('kasa-academy-progress-changed'\)\)/)
 assert.match(progress,/window.addEventListener\(EVENT, refresh\)/)
 assert.match(progress,/window.addEventListener\('storage', refresh\)/)
 assert.match(progress,/known.has\(slug\)/)
})

test('file-based course markers and dashboard share a separate local-only storage key',async()=>{
 const marker=await read('src/components/CourseProgressToggle.tsx')
 const dashboard=await read('src/components/CourseProgress.tsx')
 assert.match(marker,/kasa-academy-course-completed-v1/)
 assert.match(dashboard,/COURSE_PROGRESS_KEY/)
 assert.match(marker,/COURSE_PROGRESS_EVENT/)
 assert.match(dashboard,/window.addEventListener\(COURSE_PROGRESS_EVENT,refresh\)/)
 assert.match(dashboard,/window.addEventListener\('storage',refresh\)/)
 assert.match(dashboard,/known.has\(id\)/)
 assert.match(marker,/aria-pressed=\{complete\}/)
 assert.match(dashboard,/aria-valuenow/)
 for(const contents of [marker,dashboard])
  assert.doesNotMatch(contents,/fetch\(|sendBeacon|db\.create|db\.update|navigator\.credentials/)
})

test('all six file-based lesson routes have an optional study marker',async()=>{
 const cases=[
  ['src/app/(site)/start/[slug]/page.tsx','start'],
  ['src/app/(site)/learn/syntax/[slug]/page.tsx','syntax'],
  ['src/app/(site)/learn/algorithms/[slug]/page.tsx','algorithms'],
  ['src/app/(site)/learn/data/[slug]/page.tsx','data'],
  ['src/app/(site)/learn/applied/[slug]/page.tsx','applied'],
  ['src/app/(site)/learn/development/[slug]/page.tsx','development'],
 ]
 for(const [path,prefix] of cases){
  const page=await read(path)
  assert.match(page,/CourseProgressToggle/)
  assert.ok(page.includes("id={'"+prefix+"/'+slug}"),prefix+' missing stable completion ID')
 }
})

test('progress page includes all editorial catalogs and published CMS lessons',async()=>{
 const page=await read('src/app/(site)/my-learning/page.tsx')
 for(const [file] of catalogs)assert.ok(page.includes(file),'not included: '+file)
 assert.match(page,/Promise.all\(\[lessons\(\),modules\(\)\]\)/)
 assert.match(page,/<CourseProgress courses=\{catalog\}/)
 assert.match(page,/<LearningProgress lessons=\{cms\}/)
 assert.doesNotMatch(page,/overrideAccess:\s*true|getPayload|db\.create|db\.update/)
})

test('five-link navigation stays uncluttered; progress appears in footer and courses',async()=>{
 const layout=await read('src/app/(site)/layout.tsx')
 const nav=layout.match(/<nav className="primary-nav"[\s\S]*?<\/nav>/)?.[0]
 assert.ok(nav)
 assert.equal((nav.match(/<Link /g)||[]).length,5)
 assert.match(layout,/href="\/my-learning"/)
 const learn=await read('src/app/(site)/learn/page.tsx')
 assert.match(learn,/href="\/my-learning"/)
 assert.match(learn,/roadmap.stages.map/)
 assert.match(learn,/<details id="lesson-library"/)
})

test('no automatic grading or accounts are claimed for course completion',async()=>{
 const dashboard=await read('src/components/CourseProgress.tsx')
 const marker=await read('src/components/CourseProgressToggle.tsx')
 assert.match(dashboard,/self-reported/)
 assert.match(dashboard,/does not automatically earn credit/)
 assert.match(marker,/not a graded assessment or certificate/)
})
