import { getPayload } from 'payload'
import config from '@payload-config'
import { formatProviderTranscript } from '@/lib/transcription'

export const runtime = 'nodejs'
export const maxDuration = 60

// Vercel functions accept a maximum 4.5MB request body. Leave room for multipart overhead.
const MAX_FILE_BYTES = 3_500_000
const MAX_REQUEST_BYTES = 4_000_000
const EXTENSIONS = /\.(mp3|m4a|wav|flac|ogg|webm|mp4|mpeg|mpga)$/i

function reply(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Transcribe instructor-owned audio clips only. Never download arbitrary YouTube
 * videos or expose the server-side Groq API key to students/browser JavaScript.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const site = new URL(request.url).origin
  if (!origin || origin !== site) return reply('Cross-site requests are not allowed.', 403)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_REQUEST_BYTES) return reply('File exceeds upload limit. Use a compressed recording under 3.5MB.', 413)

  let payload
  try {
    payload = await getPayload({ config })
    const auth = await payload.auth({ headers: request.headers })
    if (!auth.user || auth.user.collection !== 'users') return reply('Please sign in as an academy administrator.', 401)
  } catch {
    return reply('Could not verify the administrator session.', 503)
  }

  const key = process.env.GROQ_API_KEY
  if (!key) return reply('AI transcription is not yet configured. The site owner must set GROQ_API_KEY in Vercel.', 503)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reply('Upload a valid audio recording using the transcription form.', 400)
  }
  const audio = form.get('audio')
  const language = form.get('language')
  if (!(audio instanceof File)) return reply('Select an audio or small MP4 recording.', 400)
  if (language !== 'english' && language !== 'twi') return reply('Choose English or Twi/Akan.', 400)
  if (audio.size === 0 || audio.size > MAX_FILE_BYTES) return reply('Choose a recording smaller than 3.5MB.', 413)
  if (!EXTENSIONS.test(audio.name)) return reply('Supported audio: MP3, M4A, WAV, FLAC, OGG, WebM, MPEG, MPGA, or small MP4.', 415)

  const providerForm = new FormData()
  providerForm.set('file', audio, audio.name)
  providerForm.set('model', 'whisper-large-v3')
  providerForm.set('response_format', 'verbose_json')
  providerForm.set('temperature', '0')

  // Whisper does not offer verified Twi/Akan language control. Do not send a
  // fake ISO-639-1 language code: let the model detect and mark for review.
  if (language === 'english') {
    providerForm.set('language', 'en')
    providerForm.set('prompt', 'Kasa programming language. Keywords: ka, ma, sɛ, awiei, dwumadie, sanma, nokware, atoro.')
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key },
      body: providerForm,
      cache: 'no-store',
      signal: AbortSignal.timeout(55_000),
    })
    if (!response.ok) {
      if (response.status === 429) return reply('The transcription service rate limit was reached. Try again later.', 429)
      if (response.status === 413) return reply('The speech service rejected the recording size. Use a shorter, compressed clip.', 413)
      if (response.status === 401 || response.status === 403) return reply('The transcription service key is invalid or lacks access.', 503)
      return reply('Speech transcription failed. Please retry with a shorter, clearer recording.', 502)
    }
    const output: unknown = await response.json()
    const result = formatProviderTranscript(output)
    if (result.transcript.length > 250_000) return reply('Transcript too long for this lesson field; split the recording.', 413)
    return Response.json({
      ...result,
      needsReview: true,
      language: language === 'english' ? 'English' : 'Twi/Akan (experimental)',
      notice: language === 'twi'
        ? 'Twi is not a verified language for this Whisper model. Check every line carefully; incorrect or invented words may occur.'
        : 'AI captions are a draft. Verify terminology, timings, and names before publishing.',
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') return reply('The recording took too long to transcribe. Upload a shorter clip.', 504)
    return reply('The speech service was unavailable or returned unusable captions.', 502)
  }
}
