import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('recorded lesson displays full-width before practice sidebar', async () => {
  const page = await readFile(new URL('../src/app/(site)/learn/[slug]/page.tsx', import.meta.url), 'utf8')
  const video = page.indexOf('<LessonVideo ')
  const layout = page.indexOf('<div className="lesson-layout">')
  assert.ok(video > 0 && video < layout, 'lesson video must precede sidebar grid')
  assert.equal(page.match(/<LessonVideo /g)?.length, 1)
})

test('students can enlarge video or transcript without a player reload', async () => {
  const player = await readFile(new URL('../src/components/LessonVideo.tsx', import.meta.url), 'utf8')
  assert.match(player, /setViewMode\('cinema'\)/)
  assert.match(player, /setViewMode\('reading'\)/)
  assert.match(player, /setViewMode\('split'\)/)
  assert.match(player, /aria-pressed=\{viewMode === 'cinema'\}/)
  assert.match(player, /aria-pressed=\{viewMode === 'reading'\}/)
})

test('theater remains full-width on narrower desktop screens', async () => {
  const stylesheet = await readFile(new URL('../src/app/(site)/site.css', import.meta.url), 'utf8')
  const media = stylesheet.slice(stylesheet.lastIndexOf('@media(max-width:1090px)'))
  assert.match(media, /\.kasa-video-view-cinema \.kasa-video-grid\{grid-template-columns:minmax\(0,1fr\)\}/)
})

test('admin transcript editor is tall and adjustable', async () => {
  const editor = await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx', import.meta.url), 'utf8')
  assert.match(editor, /min-height:340px!important/)
  assert.match(editor, /resize:vertical!important/)
})
