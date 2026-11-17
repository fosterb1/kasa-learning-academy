/**
 * Convert a transcription provider's segment output to a WebVTT transcript.
 * No automatic correction is claimed, especially for Twi/Kasa terminology.
 */
export type TranscriptGeneration = { transcript: string; segments: number; timed: boolean }
type Segment = { start: number; end: number; text: string }

function pad(n: number, size = 2): string {
  return Math.max(0, Math.floor(n)).toString().padStart(size, '0')
}
export function vttTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 24 * 3600) throw new Error('Invalid caption timestamp')
  const ms = Math.round(seconds * 1000)
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const secs = Math.floor((ms % 60_000) / 1000)
  return pad(hours) + ':' + pad(minutes) + ':' + pad(secs) + '.' + pad(ms % 1000, 3)
}
export function formatProviderTranscript(payload: unknown): TranscriptGeneration {
  if (!payload || typeof payload !== 'object') throw new Error('Speech provider returned no transcript')
  const data = payload as { text?: unknown; segments?: unknown }
  const segments: Segment[] = []

  if (Array.isArray(data.segments)) {
    for (const raw of data.segments.slice(0, 5000)) {
      if (!raw || typeof raw !== 'object') continue
      const x = raw as Partial<Segment>
      if (typeof x.start !== 'number' || typeof x.end !== 'number' || typeof x.text !== 'string') continue
      const text = x.text.replace(/[\r\n]+/g, ' ').replace(/<[^>]*>/g, '').trim()
      if (!text || !Number.isFinite(x.start) || !Number.isFinite(x.end)) continue
      if (x.start < 0 || x.end <= x.start || x.end > 24 * 3600) continue
      segments.push({ start: x.start, end: x.end, text })
    }
  }
  segments.sort((a, b) => a.start - b.start)

  if (segments.length) {
    const body = segments.map(s => vttTimestamp(s.start) + ' --> ' + vttTimestamp(s.end) + '\n' + s.text).join('\n\n')
    return { transcript: 'WEBVTT\n\n' + body + '\n', segments: segments.length, timed: true }
  }

  // Never invent timestamps for a plain-text-only provider response.
  if (typeof data.text === 'string' && data.text.trim()) {
    return { transcript: data.text.trim(), segments: 0, timed: false }
  }
  throw new Error('No intelligible transcript was returned. Try a clearer recording.')
}
