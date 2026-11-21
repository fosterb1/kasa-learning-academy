import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')
const roadmap = JSON.parse(await read('src/lib/learning-path.json'))

test('eight-stage roadmap declares ordered unique stages, prerequisites and availability', () => {
 assert.equal(roadmap.version,1)
 assert.equal(roadmap.kind,'editorial-learning-path-readonly')
 assert.equal(roadmap.stages.length,8)
 const ids = new Set()
 for (const [i, stage] of roadmap.stages.entries()) {
  assert.equal(stage.number,i+1)
  assert.ok(!ids.has(stage.id), 'duplicate stage '+stage.id)
  assert.ok(['available','review','experimental','planned'].includes(stage.status))
  for (const prereq of stage.prerequisites) assert.ok(ids.has(prereq),stage.id+' prerequisite out of order: '+prereq)
  if (stage.status === 'planned' || stage.status === 'review') assert.equal(stage.route,null,stage.id+' must not advertise unmerged/unwritten route')
  assert.ok(stage.outcomes.length >= 2)
  assert.ok(stage.assessment.length >= 20)
  assert.ok(stage.videoPolicy.length >= 20)
  ids.add(stage.id)
 }
})

test('student route distinguishes future work and preserves existing CMS catalog', async () => {
 const page=await read('src/app/(site)/learning-path/page.tsx')
 const catalog=await read('src/app/(site)/learn/page.tsx')
 const layout=await read('src/app/(site)/layout.tsx')
 assert.match(page,/roadmap.stages/)
 assert.match(page,/stage.route \?/)
 assert.match(page,/stage.prerequisites/)
 assert.match(page,/This course is not yet published/)
 assert.match(catalog,/href="\/learning-path"/)
 assert.match(layout,/href="\/learning-path"/)
 assert.match(catalog,/youtubeVideoId\(lesson.videoUrl\)/)
})

test('video remains attached to published CMS records and safe fallback', async () => {
 const lesson=await read('src/collections/Lessons.ts')
 const content=await read('src/lib/content.ts')
 const fallback=await read('src/lib/fallback-content.ts')
 const display=await read('src/app/(site)/learn/[slug]/page.tsx')
 assert.match(lesson,/name: 'videoUrl'/)
 assert.match(lesson,/name: 'transcriptTwi'/)
 assert.match(lesson,/name: 'transcriptEnglish'/)
 assert.match(lesson,/versions: \{ drafts: \{ autosave: true \} \}/)
 assert.match(content,/where: \{ and: \[published, \{ slug:/)
 assert.match(content,/if \(!isUninitializedDatabase\(error\)\) throw error/)
 assert.match(fallback,/Public, read-only curriculum/)
 assert.match(display,/youtubeVideoId\(lesson.videoUrl\)/)
 assert.match(display,/<LessonVideo/)
})

test('video audit does not write records or expose video URLs in results', async () => {
 const audit=await read('scripts/audit-lesson-videos.ts')
 assert.match(audit,/VIDEO_AUDIT_READONLY/)
 assert.match(audit,/draft: true/)
 assert.match(audit,/publishedWithPlayableVideo/)
 assert.match(audit,/draftPublishedUrlDifferences/)
 assert.doesNotMatch(audit,/db\.(?:update|create|delete)\s*\(/)
 assert.doesNotMatch(audit,/payload\.(?:update|create|delete)\s*\(/)
 assert.doesNotMatch(audit,/console\.log\(.*Url/)
})

test('no migration, seed or studio asset touched by this read-only roadmap', async () => {
 const page=await read('src/app/(site)/learning-path/page.tsx')
 assert.doesNotMatch(page,/getPayload|db\.create|db\.update|transcriptTwi/)
 const store=await read('src/lib/learning-path.json')
 assert.doesNotMatch(store,/https:\/\/youtu\.be|youtube\.com\/watch/)
})
