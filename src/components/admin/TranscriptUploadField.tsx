'use client'
import { useState, type ChangeEvent } from 'react'
import type { TextareaFieldClientComponent } from 'payload'
import { TextareaField, useField } from '@payloadcms/ui'
import { parseTranscript } from '@/lib/video'

const MAX_FILE_SIZE = 250_000

/**
 * Import subtitles in the browser, not as files on Vercel's ephemeral filesystem.
 * Saves text inside the existing protected Payload lesson document.
 */
export const TranscriptUploadField: TextareaFieldClientComponent = (props) => {
  const { path } = props
  const { setValue } = useField<string>({ path })
  const [message, setMessage] = useState('')

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!/\.(vtt|srt|txt)$/i.test(file.name)) {
      setMessage('Choose a .vtt, .srt, or .txt file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage('The transcript is too large. Maximum: 250 KB.')
      return
    }
    try {
      const text = (await file.text()).replace(/^\uFEFF/, '')
      if (!text.trim()) {
        setMessage('The selected file is empty.')
        return
      }
      if (/\.(vtt|srt)$/i.test(file.name) && parseTranscript(text).length === 0) {
        setMessage('No valid timed captions found. Use WebVTT or SRT timestamps.')
        return
      }
      setValue(text)
      const cues = parseTranscript(text)
      setMessage('Imported ' + file.name + (cues.length ? ' (' + cues.length + ' timestamped captions).' : ' as a reading transcript.') + ' Save or Publish the lesson to keep it.')
    } catch {
      setMessage('Could not read this subtitle file. Try exporting it as UTF-8.')
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ padding: '12px 14px', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, marginBottom: 10 }}>
        <label htmlFor={'upload-' + path} style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Import a transcript file (VTT, SRT, or TXT)
        </label>
        <input id={'upload-' + path} type="file" accept=".vtt,.srt,.txt,text/vtt,text/plain" onChange={upload} aria-label={'Upload subtitle file for ' + path} />
        <p role="status" style={{ fontSize: 12, margin: '6px 0 0' }}>{message || 'The file is read locally; it is only saved when you save or publish the lesson.'}</p>
      </div>
      <TextareaField {...props} />
    </div>
  )
}
