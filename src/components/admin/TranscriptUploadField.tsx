'use client'
import { useRef, useState, type ChangeEvent } from 'react'
import type { TextareaFieldClientComponent } from 'payload'
import { TextareaField, useField } from '@payloadcms/ui'
import { parseTranscript, youtubeVideoId } from '@/lib/video'

const MAX_CAPTION_SIZE = 250_000
const MAX_AUDIO_BYTES = 3_500_000
const AUDIO_TYPES = /\.(mp3|m4a|wav|flac|ogg|webm|mp4|mpeg|mpga)$/i

/**
 * Admin-only editor. Upload a transcript OR generate one from a short
 * instructor-owned recording. All AI output is an editable draft until
 * the administrator explicitly saves/publishes the Payload lesson.
 */
export const TranscriptUploadField: TextareaFieldClientComponent = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path })
  const { value: attachedVideoUrl } = useField<string>({ path: 'videoUrl' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [recording, setRecording] = useState<File | null>(null)
  const recordingInputRef = useRef<HTMLInputElement>(null)
  const [working, setWorking] = useState(false)
  const [urlWorking, setUrlWorking] = useState(false)
  const [urlProgress, setUrlProgress] = useState('')

  const language = path.toLowerCase().includes('twi') ? 'twi' : 'english'
  const languageName = language === 'twi' ? 'Twi / Akan' : 'English'
  const linkedVideoId = youtubeVideoId(attachedVideoUrl)
  const busy = working || urlWorking

  const confirmReplacement = () => !value?.trim() || window.confirm('Replace the current ' + languageName + ' transcript? Save a copy first if you want to keep it.')

  /**
   * Use the YouTube URL already attached to the Payload lesson. Caption-first
   * mode may fall back to paid AI transcription when subtitles are absent.
   * Save an unfinished provider job ID in sessionStorage to avoid repeat charges.
   */
  const transcribeLinkedVideo = async () => {
    if (busy) return
    if (!linkedVideoId) {
      setError('Paste a valid YouTube URL into the lesson’s YouTube lesson URL field before generating captions.')
      return
    }
    if (!confirmReplacement()) return
    setError('')
    setMessage('')
    setUrlProgress('')

    const key = 'kasa-transcription-job:' + linkedVideoId + ':' + language
    const existingId = sessionStorage.getItem(key)
    if (!existingId && !window.confirm(
      'Transcribe the video attached to this lesson? Existing captions will be used when available; otherwise Supadata may charge AI transcription credits. Confirm that you are authorized to process this video.'
    )) return

    setUrlWorking(true)
    const endpoint = '/api/academy-transcribe-url'
    try {
      let result: {
        status?: string
        jobId?: string
        transcript?: string
        timed?: boolean
        segments?: number
        detectedLanguage?: string
        notice?: string
        error?: string
      }

      if (existingId) {
        setUrlProgress('Resuming the previous transcription job…')
        result = { status: 'processing', jobId: existingId }
      } else {
        setUrlProgress('Checking the attached YouTube video for captions…')
        const response = await fetch(endpoint, {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: attachedVideoUrl, language }),
        })
        result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not read the YouTube video.')
        if (result.jobId) sessionStorage.setItem(key, result.jobId)
      }

      for (let attempt = 0; result.status === 'processing' && attempt < 100; attempt++) {
        if (!result.jobId) throw new Error('The transcription service did not return a job ID.')
        setUrlProgress('Video transcription is running. Keep this lesson editor open; longer recordings can take several minutes…')
        await new Promise(resolve => setTimeout(resolve, 3000))
        const response = await fetch(endpoint + '?jobId=' + encodeURIComponent(result.jobId), {
          credentials: 'same-origin', cache: 'no-store',
        })
        const next = await response.json()
        if (!response.ok) {
          // An expired job cannot be resumed; allow a new request next time.
          if (response.status === 404) sessionStorage.removeItem(key)
          throw new Error(next.error || 'Could not check transcription progress.')
        }
        result = next
      }

      if (result.status === 'processing') {
        throw new Error('Transcription is still running. Click this button again to resume checking without starting a new job.')
      }
      if (!result.transcript) throw new Error(result.error || 'No transcript was returned.')
      sessionStorage.removeItem(key)
      setValue(result.transcript)
      setUrlProgress('')
      setMessage(
        'YouTube transcript imported (' + (result.timed ? (result.segments || 0) + ' timed captions' : 'plain text') +
        (result.detectedLanguage ? ', source language: ' + result.detectedLanguage : '') +
        '). Review the draft, especially Twi and Kasa keywords, then Save/Publish the lesson.'
      )
    } catch (err) {
      setUrlProgress('')
      setError(err instanceof Error ? err.message : 'Could not transcribe this video.')
    } finally {
      setUrlWorking(false)
    }
  }

  const uploadCaptions = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (!/\.(vtt|srt|txt)$/i.test(file.name)) {
      setError('Choose a .vtt, .srt, or .txt subtitle file.')
      return
    }
    if (file.size > MAX_CAPTION_SIZE) {
      setError('Subtitle file is too large. Maximum: 250 KB.')
      return
    }
    if (!confirmReplacement()) return
    try {
      const text = (await file.text()).replace(/^\uFEFF/, '')
      if (!text.trim()) { setError('The selected subtitle file is empty.'); return }
      const cues = parseTranscript(text)
      if (/\.(vtt|srt)$/i.test(file.name) && cues.length === 0) {
        setError('No valid timed captions found. Check the SRT/VTT timestamps.')
        return
      }
      setValue(text)
      setMessage('Imported ' + file.name + (cues.length ? ' (' + cues.length + ' timed captions)' : ' (reading transcript)') + '. Review and save or publish the lesson.')
    } catch {
      setError('Could not read the subtitle file. Export it as UTF-8 and try again.')
    }
  }

  const pickRecording = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    event.target.value = ''
    setError('')
    if (file && (!AUDIO_TYPES.test(file.name) || file.size > MAX_AUDIO_BYTES || file.size === 0)) {
      setRecording(null)
      setError('Choose a short MP3, M4A, WAV, FLAC, OGG, WebM or MP4 file under 3.5 MB.')
      return
    }
    setRecording(file)
    setMessage(file ? 'Recording selected. Click Generate to turn the audio into editable captions.' : '')
  }

  const generate = async () => {
    if (working) return
    if (!recording) {
      setError('To use this audio-upload option, choose a recording. Alternatively select Option 1 to transcribe the attached YouTube URL.')
      recordingInputRef.current?.click()
      return
    }
    if (!confirmReplacement()) return
    setWorking(true)
    setMessage('')
    setError('')
    const body = new FormData()
    body.set('audio', recording, recording.name)
    body.set('language', language)
    try {
      const response = await fetch('/api/academy-transcribe', {
        method: 'POST',
        body,
        credentials: 'same-origin',
        cache: 'no-store',
      })
      const result = await response.json() as {
        error?: string
        transcript?: string
        segments?: number
        timed?: boolean
        notice?: string
      }
      if (!response.ok || !result.transcript) {
        throw new Error(result.error || 'Speech transcription failed. Try a shorter recording.')
      }
      setValue(result.transcript)
      setMessage('AI draft generated (' + (result.timed ? (result.segments || 0) + ' timed cues' : 'text without timestamps') + '). ' + (result.notice || 'Check carefully before publishing.') + ' Remember to Save/Publish this lesson.')
      setRecording(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate subtitles.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ padding: '16px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-success-500)', borderRadius: 9, marginBottom: 14 }}>
        <strong style={{ display: 'block', fontSize: 16, marginBottom: 8 }}>Option 1 — Transcribe the YouTube video attached to this lesson</strong>
        <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
          No separate audio upload needed. The system first checks the linked video’s captions and uses AI if necessary.
          Generated captions may consume Supadata credits. Twi/Akan accuracy is not guaranteed.
        </p>
        <p style={{ fontSize: 12, marginBottom: 10, overflowWrap: 'anywhere' }}>
          <strong>Attached video: </strong>
          {linkedVideoId ? <a href={'https://www.youtube.com/watch?v=' + linkedVideoId} target="_blank" rel="noreferrer">https://www.youtube.com/watch?v={linkedVideoId}</a>
            : <span>No valid YouTube URL attached yet. Fill in the “YouTube lesson URL” field above.</span>}
        </p>
        <button type="button" onClick={transcribeLinkedVideo} disabled={busy}
          style={{ width: '100%', maxWidth: 420, background: 'var(--theme-success-500)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 800, fontSize: 13, padding: 14, cursor: busy ? 'wait' : 'pointer' }}>
          {urlWorking ? 'Transcribing linked video…' : 'Transcribe linked video — ' + languageName}
        </button>
        {urlProgress && <p role="status" style={{ fontSize: 12, marginTop: 10 }}>{urlProgress}</p>}
      </div>
      <div style={{ padding: '12px 14px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 7, marginBottom: 10 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Option 2 — Upload a short recording for AI transcription</strong>
        <p style={{ fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          <strong>Step 1:</strong> Select a short recording from your computer (under 3.5 MB). <strong>Step 2:</strong> Click Generate. If no recording is selected, clicking Generate will open the file picker.
          The audio is processed by Groq&apos;s speech service; it is not stored in the Kasa database.
          {language === 'twi' ? ' Twi/Akan is not verified for this model: inaccurate or invented words are possible. Correct the draft manually.' : ' Review Kasa keywords and timing before publishing.'}
        </p>
        <label htmlFor={'audio-' + path} style={{ display: 'block', fontWeight: 600, marginBottom: 7 }}>
          Audio or small video clip
        </label>
        <input ref={recordingInputRef} id={'audio-' + path} type="file"
          accept=".mp3,.m4a,.wav,.flac,.ogg,.webm,.mp4,.mpeg,.mpga,audio/*,video/mp4"
          onChange={pickRecording} disabled={busy}
          aria-label={'Choose a ' + languageName + ' recording to transcribe'} />
        <p style={{ fontSize: 12, margin: '8px 0', fontWeight: 600 }} role="status">{recording ? '✓ Ready to transcribe: ' + recording.name + ' (' + (recording.size / 1_000_000).toFixed(2) + ' MB)' : 'No recording selected yet — select a file here or use the button below.'}</p>
        <button type="button" disabled={busy} onClick={generate}
          style={{ display: 'block', marginTop: 10, padding: '10px 15px', borderRadius: 6, cursor: working ? 'wait' : 'pointer', background: 'var(--theme-success-500)', color: '#fff', border: 0, fontWeight: 700 }}>
          {working ? 'Generating captions…' : recording ? 'Generate ' + languageName + ' transcript with AI' : 'Select recording to generate ' + languageName + ' transcript'}
        </button>
        <p style={{ fontSize: 11, marginTop: 8 }}>This is the alternative manual-upload method, for videos that cannot be retrieved from YouTube. If the recording exceeds 3.5 MB, export a compressed clip.</p>
      </div>
      <div style={{ padding: '12px 14px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 7, marginBottom: 10 }}>
        <label htmlFor={'upload-' + path} style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Option 3 — Import a corrected transcript file (VTT, SRT, TXT)
        </label>
        <input id={'upload-' + path} type="file" accept=".vtt,.srt,.txt,text/vtt,text/plain" onChange={uploadCaptions} disabled={busy}
          aria-label={'Upload corrected captions for ' + path} />
      </div>
      {error && <p role="alert" style={{ color: 'var(--theme-error-500)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {message && <p role="status" style={{ color: 'var(--theme-success-500)', fontSize: 13, marginBottom: 12 }}>{message}</p>}
      {/* Give instructors room to proofread long bilingual captions without fighting a tiny text box. */}
      <style>{`.kasa-admin-transcript-editor textarea {min-height:340px!important;resize:vertical!important;line-height:1.7!important;font-family:ui-monospace,SFMono-Regular,Consolas,monospace!important;font-size:14px!important}`}</style>
      <div className="kasa-admin-transcript-editor">
        <TextareaField {...props} />
      </div>
    </div>
  )
}
