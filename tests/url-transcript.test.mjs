import test from 'node:test'
import assert from 'node:assert/strict'
import { fromSupadata, normalizeSupadataJobId } from '../src/lib/supadata-transcript.ts'
import { parseTranscript } from '../src/lib/video.ts'

test('creates timestamped VTT from Supadata YouTube offsets in milliseconds', () => {
  const result = fromSupadata({ lang: 'en', content: [
    { text: 'Akwaaba', offset: 0, duration: 1500 },
    { text: 'Kasa sɛ!', offset: 1500, duration: 2200 }
  ] })
  assert.equal(result.timed, true)
  assert.equal(result.segments, 2)
  assert.equal(result.detectedLanguage, 'en')
  assert.deepEqual(parseTranscript(result.transcript).map(x => [x.start, x.end, x.text]),
    [[0, 1.5, 'Akwaaba'], [1.5, 3.7, 'Kasa sɛ!']])
})
test('supports async job result wrapper', () => {
  const result = fromSupadata({ status: 'completed', result: { lang: 'tw', content: [
    { text: 'Sɛ yɛbɛka', offset: 50, duration: 500 }
  ] } })
  assert.equal(result.detectedLanguage, 'tw')
  assert.equal(result.segments, 1)
})
test('does not invent caption times for plain text responses', () => {
  assert.deepEqual(fromSupadata({ content: 'Twi transcript', lang: 'en' }),
    { transcript: 'Twi transcript', timed: false, segments: 0, detectedLanguage: 'en' })
})
test('discards invalid offsets and refuses empty content', () => {
  const v = fromSupadata({ content: [
    { text: 'bad', offset: -5, duration: 80 },
    { text: '<b>valid</b>', offset: 100, duration: 900 }
  ] })
  assert.equal(parseTranscript(v.transcript)[0].text, 'valid')
  assert.throws(() => fromSupadata({ content: [] }), /speech|timestamps/)
})
test('only accepts plausible job IDs', () => {
  assert.equal(normalizeSupadataJobId('123e4567-e89b-12d3-a456-426614174000'), '123e4567-e89b-12d3-a456-426614174000')
  assert.equal(normalizeSupadataJobId('../admin/users'), null)
  assert.equal(normalizeSupadataJobId('too-short'), null)
  assert.equal(normalizeSupadataJobId('a'.repeat(256)), null)
})
