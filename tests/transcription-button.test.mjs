import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Generate transcript button is never inert because recording is absent', async () => {
  const src = await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx', import.meta.url), 'utf8')
  assert.match(src, /disabled=\{working\} onClick=\{generate\}/)
  assert.doesNotMatch(src, /disabled=\{!recording \|\| working\}/)
})

test('Clicking generate without a file opens upload picker and explains why', async () => {
  const src = await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx', import.meta.url), 'utf8')
  assert.match(src, /recordingInputRef\.current\?\.click\(\)/)
  assert.match(src, /ref=\{recordingInputRef\}/)
  assert.match(src, /YouTube URL cannot be transcribed directly/)
})

test('Invalid files still blocked, selection is acknowledged and request needs consent to overwrite', async () => {
  const src = await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx', import.meta.url), 'utf8')
  assert.match(src, /file\.size > MAX_AUDIO_BYTES/)
  assert.match(src, /!confirmReplacement\(\)/)
  assert.match(src, /Ready to transcribe:/)
  assert.match(src, /setRecording\(null\)/)
})
