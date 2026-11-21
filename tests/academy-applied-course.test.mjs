import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8')
const course = JSON.parse(await read('src/lib/applied-course.json'))

test('applied course has five structured, unique lessons with honest experimental boundaries', () => {
 assert.equal(course.version, 1)
 assert.equal(course.status, 'editorial_course_not_cms_seed')
 assert.equal(course.units.length, 5)
 assert.equal(new Set(course.units.map(unit => unit.slug)).size, 5)
 for (const unit of course.units) {
  for (const key of ['title','goal','concept','source','output','task','check','answer','mode'])
   assert.ok(unit[key]?.trim().length >= 12, unit.slug + ': missing ' + key)
  assert.ok(unit.trace.length >= 3, unit.slug + ': missing trace')
  assert.ok(unit.acceptance.length >= 3, unit.slug + ': missing acceptance criteria')
  assert.ok(unit.minutes >= 15 && unit.minutes <= 90)
 }
 assert.match(course.units.find(unit => unit.slug === 'tables-roadmap').mode,/not importable/)
 assert.match(course.units.find(unit => unit.slug === 'records-validation').concept,/not as a Kasa builtin/)
})

for (const unit of course.units) {
 test('applied lesson runs with the existing embedded Kasa runtime: '+unit.slug, () => {
   const result = globalThis.KasaRuntime.executeKasa(unit.source, '', 'run')
   assert.equal(result.ok, true, unit.slug + ': ' + result.error)
   assert.equal(result.output, unit.output, unit.slug + ': expected output changed')
 })
}

test('applied course page links working embedded editor and clear learning stages', async () => {
 const page = await read('src/app/(site)/learn/applied/page.tsx')
 const index = await read('src/app/(site)/learn/page.tsx')
 const layout = await read('src/app/(site)/layout.tsx')
 assert.match(page,/Playground sourceCode=\{unit.source\} expectedOutput=\{unit.output\}/)
 assert.match(page,/Independent assignment/)
 assert.match(page,/Review question and model explanation/)
 assert.match(index,/href="\/learn\/applied"/)
 assert.match(index,/href="\/start"/)
 assert.match(index,/href="\/projects"/)
 assert.match(layout,/href="\/learn\/applied"/)
})

test('existing CMS lessons, video transcripts and Studio remain outside this editorial content', async () => {
 const page = await read('src/app/(site)/learn/applied/page.tsx')
 assert.doesNotMatch(page,/getPayload|db\.update|db\.create|youtubeVideoId|transcriptTwi|transcriptEnglish/)
 const manifest = JSON.parse(await read('src/lib/applied-course.json'))
 assert.ok(manifest.units.every(unit => !unit.source.includes('fa tables firi')))
 assert.ok(manifest.units.every(unit => !unit.source.includes('fa records firi')))
})
