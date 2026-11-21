import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')

test('Academy header has five clear destinations, without losing footer resources',async()=>{
 const layout=await read('src/app/(site)/layout.tsx')
 const nav=layout.match(/<nav className="primary-nav"[\s\S]*?<\/nav>/)?.[0]
 assert.ok(nav,'main navigation missing')
 assert.equal((nav.match(/<Link /g)||[]).length,5,'primary navigation must stay concise')
 for(const href of ['/start','/learn','/learning-path','/practice','/playground'])
  assert.ok(nav.includes('href="'+href+'"'),href+' missing')
 for(const href of ['/learn/syntax','/learn/applied','/guides','/announcements','/admin'])
  assert.ok(layout.includes('href="'+href+'"'),href+' resource link lost')
})

test('learning page shows one introduction, eight stages, then published CMS lesson library',async()=>{
 const page=await read('src/app/(site)/learn/page.tsx')
 assert.equal((page.match(/<h1>/g)||[]).length,1)
 assert.match(page,/roadmap.stages.map/)
 assert.match(page,/Your eight-stage learning path/)
 assert.match(page,/Lesson library/)
 assert.match(page,/groups.map\(g=>/)
 assert.match(page,/youtubeVideoId\(lesson.videoUrl\)/)
 assert.match(page,/href="\/learn\/applied"/)
 assert.match(page,/href="\/projects"/)
 assert.doesNotMatch(page,/className="beginner-route-promo"/)
 assert.doesNotMatch(page,/className="syntax-course-promo"/)
 assert.doesNotMatch(page,/Published CMS lesson modules/)
})

test('visual-only cleanup preserves CMS lesson and media collections',async()=>{
 const lessons=await read('src/collections/Lessons.ts')
 const video=await read('src/app/(site)/learn/[slug]/page.tsx')
 assert.match(lessons,/name: 'videoUrl'/)
 assert.match(lessons,/name: 'transcriptTwi'/)
 assert.match(lessons,/name: 'transcriptEnglish'/)
 assert.match(video,/<LessonVideo/)
})
