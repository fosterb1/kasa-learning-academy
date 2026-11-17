import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { youtubeVideoId, captionSeconds, parseTranscript, formatTimestamp } from '../src/lib/video.ts'

describe('YouTube URL guard', () => {
  const id = 'dQw4w9WgXcQ'
  for (const link of [
    id, 'https://youtu.be/' + id, 'https://www.youtube.com/watch?v=' + id + '&t=60',
    'https://m.youtube.com/watch?v=' + id, 'https://www.youtube.com/embed/' + id,
    'https://www.youtube-nocookie.com/embed/' + id, 'https://www.youtube.com/shorts/' + id,
    'https://www.youtube.com/live/' + id,
  ]) it('accepts official video URLs', () => assert.equal(youtubeVideoId(link), id))
  for (const link of [
    '', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
    'https://evil.test/redirect?url=https://youtube.com/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)', 'http://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/playlist?list=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=not-video',
  ]) it('rejects nonvideo or unsafe URLs', () => assert.equal(youtubeVideoId(link), null))
})

describe('Timed captions', () => {
  it('parses SRT and VTT timestamps', () => {
    assert.equal(captionSeconds('00:01:02,500'), 62.5)
    assert.equal(captionSeconds('01:02.500'), 62.5)
    assert.equal(captionSeconds('02:03:04.250'), 7384.25)
    assert.equal(captionSeconds('00:00:65,000'), null)
  })
  it('parses numbered SRT cues', () => {
    assert.deepEqual(parseTranscript('1\n00:00:01,000 --> 00:00:03,000\nAkwaaba!\n\n2\n00:00:03,000 --> 00:00:07,200\nka means print.'), [
      { start: 1, end: 3, text: 'Akwaaba!' }, { start: 3, end: 7.2, text: 'ka means print.' },
    ])
  })
  it('parses VTT with header, settings, and formatting', () => {
    assert.deepEqual(parseTranscript('WEBVTT\n\nNOTE intro\nSkip this\n\n00:00:00.000 --> 00:00:02.100 align:start\n<c.green>Maakye</c> <b>Ghana</b>!\n\n00:00:02.100 --> 00:00:04.000\nSɛ yɛ bɛka.'), [
      { start: 0, end: 2.1, text: 'Maakye Ghana!' }, { start: 2.1, end: 4, text: 'Sɛ yɛ bɛka.' },
    ])
  })
  it('skips reversed cues and plain text', () => {
    assert.deepEqual(parseTranscript('WEBVTT\n\n00:00:03.000 --> 00:00:01.000\nInvalid'), [])
    assert.deepEqual(parseTranscript('Just a paragraph'), [])
  })
  it('handles BOM and formats time', () => {
    assert.equal(parseTranscript('\uFEFFWEBVTT\n\n00:00:00.000 --> 00:00:01.000\nTwi').length, 1)
    assert.equal(formatTimestamp(62.3), '1:02')
    assert.equal(formatTimestamp(3662), '1:01:02')
    assert.equal(formatTimestamp(-20), '0:00')
  })
})
