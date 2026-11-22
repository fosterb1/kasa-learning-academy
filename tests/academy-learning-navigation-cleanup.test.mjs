import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8')

test('mega navigation keeps primary routes and secondary resources discoverable',async()=>{
 const layout=await read('src/app/(site)/layout.tsx')
 const nav=await read('src/components/AcademyNavigation.tsx')
 assert.match(layout,/<AcademyNavigation \/>/,'shared navigation is mounted')
 assert.match(nav,/className="academy-primary-nav"/,'primary navigation missing')
 assert.match(nav,/className="academy-mega-grid"/,'mega-menu groups missing')
 assert.match(nav,/aria-expanded=\{open\}/,'menu must expose expanded state')
 for(const href of ['/start','/learn','/learning-path','/practice','/playground','/my-learning'])
  assert.ok(nav.includes("href: '"+href+"'")||nav.includes('href="'+href+'"'),'primary route missing: '+href)
 for(const href of ['/learn/syntax','/learn/applied','/guides','/announcements','/admin'])
  assert.ok(nav.includes("href: '"+href+"'")||layout.includes('href="'+href+'"'),'secondary route missing: '+href)
 for(const title of ['Learning paths','Practice & build','Resources','Your journey'])
  assert.ok(nav.includes("title: '"+title+"'"),'navigation group missing: '+title)
})

test('eight stages lead the learning page and existing CMS lessons remain browsable',async()=>{
 const page=await read('src/app/(site)/learn/page.tsx')
 assert.equal((page.match(/<h1>/g)||[]).length,1)
 assert.match(page,/Learn Kasa, stage by stage/)
 assert.match(page,/roadmap.stages.map/)
 assert.match(page,/href=\{"\/learning-path\/"\+stage.id\}/)
 assert.match(page,/<details id="lesson-library"/)
 assert.match(page,/<summary><strong>Lesson Library<\/strong>/)
 assert.match(page,/groups.map\(g=>/)
 assert.match(page,/youtubeVideoId\(lesson.videoUrl\)/)
 assert.match(page,/href="\/learn\/syntax"/)
 assert.match(page,/href="\/learn\/applied"/)
 assert.match(page,/href="\/projects"/)
 assert.doesNotMatch(page,/className="beginner-route-promo"/)
 assert.doesNotMatch(page,/className="syntax-course-promo"/)
})

test('navigation reconciliation leaves video and transcript fields unchanged',async()=>{
 const lessons=await read('src/collections/Lessons.ts')
 const lessonPage=await read('src/app/(site)/learn/[slug]/page.tsx')
 const stage=await read('src/app/(site)/learning-path/[slug]/page.tsx')
 for(const field of ['videoUrl','transcriptTwi','transcriptEnglish'])
  assert.ok(lessons.includes("name: '"+field+"'"),field+' missing')
 assert.match(lessonPage,/<LessonVideo/)
 assert.match(stage,/lesson.videoUrl/)
 assert.doesNotMatch(stage,/(?:db|payload)\.(?:create|update|delete)\(/)
})
