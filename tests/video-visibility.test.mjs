import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { youtubeVideoId } from '../src/lib/video.ts'

test('published lesson URL produces valid YouTube ID', () => {
  assert.equal(youtubeVideoId('https://youtu.be/j9WZyLZCBzs?si=example'), 'j9WZyLZCBzs')
})

test('course catalog explicitly marks lessons containing a playable video', async () => {
  const source = await readFile(new URL('../src/app/(site)/learn/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /youtubeVideoId\(lesson\.videoUrl\)/)
  assert.match(source, /Watch video/)
})

test('lesson video is rendered before long written lesson content', async () => {
  const source = await readFile(new URL('../src/app/(site)/learn/[slug]/page.tsx', import.meta.url), 'utf8')
  assert.ok(source.indexOf('<LessonVideo ') < source.indexOf('<div className="lesson-prose">'))
  assert.equal(source.match(/<LessonVideo /g)?.length, 1)
})
