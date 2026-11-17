import { getPayload } from 'payload'
import config from '@payload-config'
import { youtubeVideoId } from '@/lib/video'
import { fromSupadata, normalizeSupadataJobId } from '@/lib/supadata-transcript'

export const runtime = 'nodejs'
export const maxDuration = 60

const API_BASE = 'https://api.supadata.ai/v1/transcript'

function json(data: object, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}
function failure(message: string, status: number): Response {
  return json({ error: message }, status)
}

async function authenticated(request: Request): Promise<boolean> {
  try {
    const payload = await getPayload({ config })
    const user = await payload.auth({ headers: request.headers })
    return !!user.user && user.user.collection === 'users'
  } catch {
    return false
  }
}

function providerFailure(status: number): Response {
  if (status === 206 || status === 404) return failure('No accessible transcript was found for this video. Check its visibility and whether captions are available.', 404)
  if (status === 401 || status === 403) return failure('Supadata API access was denied. Check the server-side SUPADATA_API_KEY and video permissions.', 503)
  if (status === 402) return failure('Supadata credits are exhausted or this account cannot use this transcription mode.', 402)
  if (status === 429) return failure('Supadata rate limit reached. Try again after the limit resets.', 429)
  return failure('Unable to transcribe this video right now. Please try again later.', 502)
}

function decode(data: unknown, status: number): Response {
  if (!data || typeof data !== 'object') return failure('Transcript provider returned an invalid response.', 502)
  const result = data as { error?: unknown; jobId?: unknown; status?: unknown }
  if (result.error) return failure('Video transcript unavailable. Check the URL, privacy settings and your provider quota.', 502)
  const jobId = normalizeSupadataJobId(result.jobId)
  if (status === 202 || jobId) {
    if (!jobId) return failure('Transcript provider returned an invalid job identifier.', 502)
    return json({ status: 'processing', jobId })
  }
  if (result.status === 'queued' || result.status === 'active') return json({ status: 'processing' })
  if (result.status === 'failed') return failure('The video transcription job failed. Please try a shorter video or upload the original recording.', 502)

  try {
    const caption = fromSupadata(data)
    return json({
      ...caption,
      status: 'completed',
      needsReview: true,
      notice: 'Review language, Kasa keywords, speaker names and timestamps carefully before publishing.',
    })
  } catch (e) {
    return failure(e instanceof Error ? e.message : 'Video transcript could not be processed.', 422)
  }
}

/**
 * Only Payload administrators may request third-party transcriptions. All
 * user input is reduced to a strict YouTube ID, never fetched as arbitrary URL.
 *
 * mode=auto uses existing YouTube captions first, then AI fallback, which
 * may consume Supadata credits. Calls are initiated explicitly by an admin.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return failure('Cross-site requests are not allowed.', 403)
  if (!(await authenticated(request))) return failure('Sign in as an Academy administrator.', 401)
  const key = process.env.SUPADATA_API_KEY
  if (!key) return failure('Link transcription is not configured. Add SUPADATA_API_KEY privately in Vercel and redeploy.', 503)

  if (Number(request.headers.get('content-length') || 0) > 5000) return failure('Request is too large.', 413)
  let requestData: { videoUrl?: unknown; language?: unknown } = {}
  try { requestData = await request.json() } catch { return failure('Invalid request body.', 400) }

  const videoId = typeof requestData.videoUrl === 'string' ? youtubeVideoId(requestData.videoUrl) : null
  if (!videoId) return failure('Attach a valid YouTube URL to this lesson before transcribing.', 400)
  if (requestData.language !== 'twi' && requestData.language !== 'english') return failure('Select Twi/Akan or English.', 400)

  const url = new URL(API_BASE)
  url.searchParams.set('url', 'https://www.youtube.com/watch?v=' + videoId)
  url.searchParams.set('mode', 'auto')
  // English-only teachers can prefer English captions. Twi/Akan uses language
  // autodetection because provider support for its code is not guaranteed.
  if (requestData.language === 'english') url.searchParams.set('lang', 'en')

  try {
    const response = await fetch(url, {
      headers: { 'x-api-key': key, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(18_000),
    })
    if (!response.ok && response.status !== 202) return providerFailure(response.status)
    const result: unknown = await response.json()
    return decode(result, response.status)
  } catch {
    return failure('The transcript service did not respond. Try again later.', 504)
  }
}

/** Poll a job returned for a long video. No Supadata keys reach browsers. */
export async function GET(request: Request): Promise<Response> {
  if (!(await authenticated(request))) return failure('Sign in as an Academy administrator.', 401)
  const key = process.env.SUPADATA_API_KEY
  if (!key) return failure('URL transcription is not configured.', 503)
  const id = normalizeSupadataJobId(new URL(request.url).searchParams.get('jobId'))
  if (!id) return failure('Invalid transcription job identifier.', 400)

  try {
    const response = await fetch(API_BASE + '/' + id, {
      headers: { 'x-api-key': key, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(14_000),
    })
    if (!response.ok) return providerFailure(response.status)
    const data: unknown = await response.json()
    if (data && typeof data === 'object') {
      const s = (data as { status?: unknown }).status
      if (s === 'queued' || s === 'active') return json({ status: 'processing', jobId: id })
    }
    return decode(data, response.status)
  } catch {
    return failure('Could not check video transcription progress. Try again.', 504)
  }
}
