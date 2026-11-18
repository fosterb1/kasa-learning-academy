import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import '../public/kasa-runtime.js'

const course = JSON.parse(await readFile(new URL('../src/lib/beginner-course.json', import.meta.url), 'utf8'))
test('Foundations include eighteen ordered and unique chapters', () => {
  assert.equal(course.units.length, 18)
  assert.equal(new Set(course.units.map(c => c.id)).size, 18)
  for(const c of course.units) {
    assert.ok(c.story.length >= 90, c.id + ': missing relatable context')
    assert.ok(c.goals.length >= 2)
    assert.ok(c.explain.length >= 4)
    assert.ok(c.unplugged.length >= 60)
    assert.ok(c.trace.length >= 60)
    assert.ok(c.questions.length >= 3)
    assert.ok(c.mistake.length >= 60)
    assert.ok(c.make.length >= 60)
  }
})
for(const chapter of course.units) {
  test('Kasa worked example matches published output: '+chapter.id, () => {
    const result = globalThis.KasaRuntime.executeKasa(chapter.code, chapter.input || '', 'run')
    assert.equal(result.ok, true, String(result.error))
    assert.equal(result.output, chapter.expected)
  })
}
test('Foundations route is linked from the learner catalog', async () => {
  const catalog = await readFile(new URL('../src/app/(site)/learn/page.tsx', import.meta.url), 'utf8')
  const route = await readFile(new URL('../src/app/(site)/start/[slug]/page.tsx', import.meta.url), 'utf8')
  assert.match(catalog, /href="\/start"/)
  assert.match(route, /generateStaticParams/)
  assert.match(route, /unit\.unplugged/)
  assert.match(route, /unit\.questions/)
  assert.match(route, /unit\.mistake/)
})
