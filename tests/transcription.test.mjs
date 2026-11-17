import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatProviderTranscript, vttTimestamp } from '../src/lib/transcription.ts'
import { parseTranscript } from '../src/lib/video.ts'

test('Groq-style segments become valid timed WebVTT', () => {
  const result = formatProviderTranscript({ text: 'Akwaaba Kasa', segments: [
    { start: 0, end: 1.234, text: 'Akwaaba' }, { start: 1.234, end: 2.5, text: ' Kasa.' },
  ] })
  assert.equal(result.timed, true)
  assert.equal(result.segments, 2)
  assert.equal(result.transcript.startsWith('WEBVTT\n\n00:00:00.000 --> 00:00:01.234'), true)
  assert.deepEqual(parseTranscript(result.transcript).map(x => x.text), ['Akwaaba', 'Kasa.'])
})
test('plain provider text is never given imaginary timestamps', () => {
  assert.deepEqual(formatProviderTranscript({ text: 'Maakye Ghana' }), { transcript: 'Maakye Ghana', segments: 0, timed: false })
})
test('invalid audio segments are discarded safely', () => {
  const result = formatProviderTranscript({ text: 'fallback', segments: [
    { start: 9, end: 2, text: 'invalid' }, { start: 0, end: 3, text: '<b>Twi</b> caption' },
  ] })
  assert.equal(result.segments, 1)
  assert.equal(parseTranscript(result.transcript)[0]?.text, 'Twi caption')
})
test('invalid time and empty provider output throw', () => {
  assert.throws(() => vttTimestamp(-1))
  assert.throws(() => formatProviderTranscript({ segments: [] }))
})
test('timestamps support hours and milliseconds', () => {
  assert.equal(vttTimestamp(3662.021), '01:01:02.021')
})
