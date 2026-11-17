/**
 * Kasa Academy lesson-video helpers.
 * Pure utilities: work on server and in browser; do not contact YouTube.
 */
export type TranscriptCue = { start: number; end: number; text: string }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'])
const NO_COOKIE_HOSTS = new Set(['youtube-nocookie.com', 'www.youtube-nocookie.com'])

export function youtubeVideoId(input: string | null | undefined): string | null {
  const raw = input?.trim() || ''
  if (VIDEO_ID.test(raw)) return raw
  if (!raw || raw.length > 2000) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.toLowerCase()
    let id: string | null = null
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || null
    } else if (YOUTUBE_HOSTS.has(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v')
      else if (/^\/(shorts|embed|live)\//.test(url.pathname)) {
        id = url.pathname.split('/').filter(Boolean)[1] || null
      }
    } else if (NO_COOKIE_HOSTS.has(host) && url.pathname.startsWith('/embed/')) {
      id = url.pathname.split('/').filter(Boolean)[1] || null
    }
    return id && VIDEO_ID.test(id) ? id : null
  } catch {
    return null
  }
}

export function captionSeconds(value: string): number | null {
  const cleaned = value.trim().replace(',', '.')
  const parts = cleaned.split(':')
  if (parts.length !== 2 && parts.length !== 3) return null
  if (!parts.every((part, i) => i === parts.length - 1 ? /^\d{2}(?:\.\d{1,3})?$/.test(part) : /^\d{1,4}$/.test(part))) return null
  const nums = parts.map(Number)
  if (!nums.every(Number.isFinite)) return null
  const seconds = nums[nums.length - 1], minutes = nums[nums.length - 2]
  if (seconds >= 60 || (parts.length === 3 && minutes >= 60)) return null
  const hours = parts.length === 3 ? nums[0] : 0
  const total = hours * 3600 + minutes * 60 + seconds
  return total >= 0 && total <= 24 * 3600 ? total : null
}

export function parseTranscript(input: string | null | undefined): TranscriptCue[] {
  if (typeof input !== 'string' || !input.trim()) return []
  const blocks = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/)
  const result: TranscriptCue[] = []
  for (const block of blocks) {
    if (result.length >= 5000) break
    const lines = block.split('\n').map(x => x.trim()).filter(Boolean)
    if (!lines.length || /^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/i.test(lines[0])) continue
    const stampIndex = lines.findIndex(line => line.includes('-->'))
    if (stampIndex < 0 || stampIndex > 1) continue
    const timings = lines[stampIndex].split(/\s+-->\s+/)
    if (timings.length !== 2) continue
    const start = captionSeconds(timings[0])
    const end = captionSeconds(timings[1].split(/\s+/)[0])
    if (start === null || end === null || end <= start) continue
    const text = lines.slice(stampIndex + 1).join(' ').replace(/<[^>]*>/g, '').replace(/\{\\an\d+\}/g, '').trim()
    if (text) result.push({ start, end, text })
  }
  return result.sort((a, b) => a.start - b.start)
}

export function formatTimestamp(time: number): string {
  if (!Number.isFinite(time) || time < 0) return '0:00'
  const whole = Math.floor(time)
  const seconds = String(whole % 60).padStart(2, '0')
  const minutes = Math.floor(whole / 60) % 60
  const hours = Math.floor(whole / 3600)
  return hours ? hours + ':' + String(minutes).padStart(2, '0') + ':' + seconds : minutes + ':' + seconds
}
