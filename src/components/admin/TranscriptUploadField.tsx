'use client'
import { useRef, useState, type ChangeEvent } from 'react'
import type { TextareaFieldClientComponent } from 'payload'
import { TextareaField, useField } from '@payloadcms/ui'
import { parseTranscript } from '@/lib/video'

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
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [recording, setRecording] = useState<File | null>(null)
  const recordingInputRef = useRef<HTMLInputElement>(null)
  const [working, setWorking] = useState(false)

  const language = path.toLowerCase().includes('twi') ? 'twi' : 'english'
  const languageName = language === 'twi' ? 'Twi / Akan' : 'English'

  const confirmReplacement = () => !value?.trim() || window.confirm('Replace the current ' + languageName + ' transcript? Save a copy first if you want to keep it.')

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
      setError('Select a recording from your computer first. The button will open the file picker for you. A YouTube URL cannot be transcribed directly.')
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
      <div style={{ padding: '12px 14px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 7, marginBottom: 10 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Automatic {languageName} transcription — experimental</strong>
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
          onChange={pickRecording} disabled={working}
          aria-label={'Choose a ' + languageName + ' recording to transcribe'} />
        <p style={{ fontSize: 12, margin: '8px 0', fontWeight: 600 }} role="status">{recording ? '✓ Ready to transcribe: ' + recording.name + ' (' + (recording.size / 1_000_000).toFixed(2) + ' MB)' : 'No recording selected yet — select a file here or use the button below.'}</p>
        <button type="button" disabled={working} onClick={generate}
          style={{ display: 'block', marginTop: 10, padding: '10px 15px', borderRadius: 6, cursor: working ? 'wait' : 'pointer', background: 'var(--theme-success-500)', color: '#fff', border: 0, fontWeight: 700 }}>
          {working ? 'Generating captions…' : recording ? 'Generate ' + languageName + ' transcript with AI' : 'Select recording to generate ' + languageName + ' transcript'}
        </button>
        <p style={{ fontSize: 11, marginTop: 8 }}>A YouTube URL is used for video playback only. AI transcription requires your original audio file. If the recording exceeds 3.5 MB, export a shorter compressed audio clip or split it into parts.</p>
      </div>
      <div style={{ padding: '12px 14px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 7, marginBottom: 10 }}>
        <label htmlFor={'upload-' + path} style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Or import a corrected transcript file (VTT, SRT, TXT)
        </label>
        <input id={'upload-' + path} type="file" accept=".vtt,.srt,.txt,text/vtt,text/plain" onChange={uploadCaptions} disabled={working}
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
