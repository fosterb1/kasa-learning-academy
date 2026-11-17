import { vttTimestamp, type TranscriptGeneration } from './transcription'

/** Provider-specific response decoding. Supadata time offsets/durations are in ms. */
type SupadataCue = { text?: unknown; offset?: unknown; duration?: unknown }
type SupadataResult = { content?: unknown; lang?: unknown; result?: unknown; status?: unknown }

const MAX_CUES = 5000
const MAX_CHARACTERS = 250_000
export const JOB_ID_PATTERN = /^[a-zA-Z0-9_-]{10,128}$/

export function normalizeSupadataJobId(input: unknown): string | null {
  return typeof input === 'string' && JOB_ID_PATTERN.test(input) ? input : null
}

export function fromSupadata(payload: unknown): TranscriptGeneration & { detectedLanguage?: string } {
  if (!payload || typeof payload !== 'object') throw new Error('Transcript service did not return usable content')
  const outer = payload as SupadataResult
  const result = outer.result && typeof outer.result === 'object' ? outer.result as SupadataResult : outer
  const lang = typeof result.lang === 'string' ? result.lang : undefined

  if (typeof result.content === 'string') {
    const text = result.content.trim()
    if (!text) throw new Error('No speech detected in this video.')
    if (text.length > MAX_CHARACTERS) throw new Error('Transcript exceeds the maximum field length; split the video.')
    return { transcript: text, timed: false, segments: 0, detectedLanguage: lang }
  }

  if (!Array.isArray(result.content)) throw new Error('Transcript service returned an unsupported response.')
  const cues: string[] = []
  for (const item of result.content.slice(0, MAX_CUES)) {
    if (!item || typeof item !== 'object') continue
    const cue = item as SupadataCue
    if (typeof cue.text !== 'string' || !Number.isFinite(cue.offset) || !Number.isFinite(cue.duration)) continue
    const offset = cue.offset as number, duration = cue.duration as number
    const clean = cue.text.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim()
    if (!clean || offset < 0 || duration <= 0 || (offset + duration) > 86_400_000) continue
    cues.push(vttTimestamp(offset / 1000) + ' --> ' + vttTimestamp((offset + duration) / 1000) + '\n' + clean)
  }
  if (!cues.length) throw new Error('No speech was detected or the transcript contains no valid timestamps.')
  const transcript = 'WEBVTT\n\n' + cues.join('\n\n') + '\n'
  if (transcript.length > MAX_CHARACTERS) throw new Error('Transcript exceeds the maximum field length; split the video.')
  return { transcript, timed: true, segments: cues.length, detectedLanguage: lang }
}
