import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const curriculum = JSON.parse(await readFile(new URL('../scripts/content/curriculum.json', import.meta.url), 'utf8'))
const companion = await readFile(new URL('../src/lib/study-guides.ts', import.meta.url), 'utf8')
const chapters = await readFile(new URL('../src/lib/lesson-chapters.ts', import.meta.url), 'utf8')
const lessonPage = await readFile(new URL('../src/app/(site)/learn/[slug]/page.tsx', import.meta.url), 'utf8')
test('all 24 published starter lessons have structured companions', () => {
  assert.equal(curriculum.lessons.length, 24)
  for (const lesson of curriculum.lessons) {
    assert.ok(companion.includes('"'+lesson.id+'":'), 'Missing study guide: ' + lesson.id)
    assert.ok(chapters.includes('"'+lesson.id+'":'), 'Missing detailed chapter: ' + lesson.id)
  }
})
test('the companion is attached to the learner page', async () => {
  const component = await readFile(new URL('../src/components/StudyCompanion.tsx', import.meta.url), 'utf8')
  for (const heading of ['Learning objectives', 'Follow the worked code', 'Common mistake', 'Guided practice', 'Independent assignment', 'Before you continue']) {
    assert.ok(component.includes(heading), 'Missing heading: ' + heading)
  }
  assert.ok(lessonPage.includes('<StudyCompanion slug={slug} title={lesson.title}/>'))
  assert.ok(component.includes('Language and computing vocabulary'))
})
test('static study guides need no network or login', () => {
  assert.doesNotMatch(companion, /fetch\(|localStorage|process\.env|axios/)
})
