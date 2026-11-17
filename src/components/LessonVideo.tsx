'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatTimestamp, parseTranscript, youtubeVideoId } from '@/lib/video'

type Props = {
  videoUrl?: string | null
  videoTitle?: string | null
  videoLanguage?: 'twi' | 'english' | 'bilingual' | null
  transcriptTwi?: string | null
  transcriptEnglish?: string | null
}
type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
}
type YouTubeAPI = {
  Player: new (element: HTMLElement, options: {
    videoId: string
    width: string
    height: string
    host: string
    playerVars: { playsinline: number; origin: string; cc_load_policy: number; rel: number }
    events: { onReady: () => void; onError: () => void }
  }) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeAPI
    onYouTubeIframeAPIReady?: () => void
  }
}

let iframeAPIReady: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (iframeAPIReady) return iframeAPIReady
  iframeAPIReady = new Promise<void>((resolve, reject) => {
    const oldCallback = window.onYouTubeIframeAPIReady
    const timeout = window.setTimeout(() => {
      iframeAPIReady = null
      reject(new Error('The YouTube player could not load. You can still read the transcript.'))
    }, 18000)
    window.onYouTubeIframeAPIReady = () => {
      oldCallback?.()
      clearTimeout(timeout)
      resolve()
    }

    let script = document.getElementById('kasa-youtube-iframe-api') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'kasa-youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('error', () => {
      clearTimeout(timeout)
      iframeAPIReady = null
      reject(new Error('YouTube is blocked or unavailable. Use the Watch on YouTube link.'))
    }, { once: true })
  })
  return iframeAPIReady
}

/** A video is only requested from YouTube after the learner presses Play. */
export function LessonVideo({ videoUrl, videoTitle, videoLanguage, transcriptTwi, transcriptEnglish }: Props) {
  const videoId = youtubeVideoId(videoUrl)
  const twi = useMemo(() => parseTranscript(transcriptTwi), [transcriptTwi])
  const english = useMemo(() => parseTranscript(transcriptEnglish), [transcriptEnglish])
  const tracks = useMemo(() => [
    ...(transcriptTwi?.trim() ? [{ id: 'twi' as const, title: 'Twi / Akan', cues: twi, raw: transcriptTwi }] : []),
    ...(transcriptEnglish?.trim() ? [{ id: 'english' as const, title: 'English', cues: english, raw: transcriptEnglish }] : []),
  ], [twi, english, transcriptTwi, transcriptEnglish])

  const defaultLanguage = tracks.find(track => track.id === (videoLanguage === 'english' ? 'english' : 'twi'))?.id || tracks[0]?.id || 'twi'
  const [language, setLanguage] = useState<'twi' | 'english'>(defaultLanguage)
  const [search, setSearch] = useState('')
  const [started, setStarted] = useState(false)
  const [ready, setReady] = useState(false)
  const [playerError, setPlayerError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [autoScroll, setAutoScroll] = useState(true)
  const playerSlot = useRef<HTMLDivElement | null>(null)
  const player = useRef<YouTubePlayer | null>(null)
  const jumpTo = useRef<number | null>(null)
  const captionList = useRef<HTMLDivElement | null>(null)

  const activeTrack = tracks.find(track => track.id === language) || tracks[0]
  const cues = activeTrack?.cues || []
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const matches = cues.map((cue, index) => ({ cue, index })).filter(({ cue }) => cue.text.toLocaleLowerCase().includes(normalizedSearch))
  const activeIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end)
  const watchUrl = videoId ? 'https://www.youtube.com/watch?v=' + videoId : ''

  useEffect(() => {
    if (!started || !videoId) return
    let active = true
    let interval: ReturnType<typeof setInterval> | null = null

    loadYouTubeAPI().then(() => {
      if (!active || !playerSlot.current || !window.YT?.Player) return
      player.current = new window.YT.Player(playerSlot.current, {
        videoId,
        width: '100%',
        height: '100%',
        host: 'https://www.youtube-nocookie.com',
        playerVars: { origin: window.location.origin, playsinline: 1, cc_load_policy: 1, rel: 0 },
        events: {
          onReady: () => {
            if (!active) return
            setReady(true)
            if (jumpTo.current !== null) {
              player.current?.seekTo(jumpTo.current, true)
              player.current?.playVideo()
              jumpTo.current = null
            }
          },
          onError: () => setPlayerError('This video cannot be embedded. Open it on YouTube instead.'),
        },
      })
      interval = setInterval(() => {
        if (!active || !player.current) return
        try {
          const now = player.current.getCurrentTime()
          if (Number.isFinite(now)) setCurrentTime(now)
        } catch {
          // Player might be unloading or blocked by the browser.
        }
      }, 650)
    }).catch((error: unknown) => {
      if (active) setPlayerError(error instanceof Error ? error.message : 'YouTube playback is unavailable.')
    })
    return () => {
      active = false
      if (interval) clearInterval(interval)
      try { player.current?.destroy() } catch { /* player may not have initialized */ }
      player.current = null
      setReady(false)
    }
  }, [started, videoId])

  useEffect(() => {
    if (!autoScroll || normalizedSearch || activeIndex < 0 || !captionList.current) return
    const list = captionList.current
    const current = list.querySelector<HTMLElement>('[data-active="true"]')
    if (!current) return
    list.scrollTo({ top: current.offsetTop - list.offsetTop - list.clientHeight / 3, behavior: 'smooth' })
  }, [activeIndex, autoScroll, language, normalizedSearch])

  function seekTo(second: number) {
    setCurrentTime(second)
    if (!started) {
      jumpTo.current = second
      setStarted(true)
    } else if (ready && player.current) {
      player.current.seekTo(second, true)
      player.current.playVideo()
    } else {
      jumpTo.current = second
    }
  }

  if (!videoId) return null

  return (
    <section id="lesson-video" className="kasa-video-lesson" aria-label="Kasa video lesson">
      <div className="kasa-video-heading">
        <div>
          <span className="eyebrow">TIE · KENKAN · SUA  /  LISTEN · READ · LEARN</span>
          <h2>{videoTitle || 'Watch this Kasa lesson'}</h2>
          <p>Learn in Twi and English. Pause, follow along, or tap a sentence to replay that moment.</p>
        </div>
        <span className="kasa-video-language">{videoLanguage === 'twi' ? 'Twi / Akan' : videoLanguage === 'english' ? 'English' : 'Twi + English'}</span>
      </div>

      <div className="kasa-video-grid">
        <div className="kasa-player-column">
          <div className="kasa-video-frame">
            {!started ? (
              <button className="kasa-video-start" type="button" onClick={() => setStarted(true)} aria-label="Load and play YouTube lesson">
                <span className="kasa-video-play-icon" aria-hidden="true">▶</span>
                <strong>Play lesson video</strong>
                <small>YouTube loads only after you select Play.</small>
              </button>
            ) : (
              <div ref={playerSlot} className="kasa-video-player" aria-label="YouTube lesson player" />
            )}
          </div>
          {playerError && <p className="kasa-video-error" role="alert">{playerError}</p>}
          <div className="kasa-video-player-footer">
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
            <span>Playback by YouTube · Learning materials are free</span>
          </div>
        </div>

        <div className="kasa-transcript-panel">
          <div className="kasa-transcript-toolbar">
            <strong>Lesson transcript</strong>
            {tracks.length > 0 && <span>{tracks.length > 1 ? 'Bilingual' : 'Reading companion'}</span>}
          </div>
          {tracks.length > 1 && (
            <div className="kasa-transcript-tabs" role="group" aria-label="Transcript language">
              {tracks.map(track => <button type="button" key={track.id} aria-pressed={activeTrack?.id === track.id} onClick={() => { setLanguage(track.id); setSearch('') }}>{track.title}</button>)}
            </div>
          )}

          {cues.length > 0 ? (
            <>
              <label htmlFor="kasa-transcript-search" className="sr-only">Search transcript</label>
              <input id="kasa-transcript-search" className="kasa-transcript-search" type="search" placeholder="Find a word or phrase…" value={search} onChange={event => setSearch(event.target.value)} />
              <label className="kasa-transcript-follow"><input type="checkbox" checked={autoScroll} onChange={event => setAutoScroll(event.target.checked)} /> Follow playback <span aria-live="polite">{formatTimestamp(currentTime)}</span></label>
              <div className="kasa-transcript-list" ref={captionList} role="region" aria-label="Timestamped lesson transcript" tabIndex={0}>
                {matches.map(({ cue, index }) => (
                  <button className="kasa-transcript-cue" key={index} data-active={index === activeIndex} type="button" onClick={() => seekTo(cue.start)} title="Jump to this moment">
                    <span className="kasa-transcript-time">{formatTimestamp(cue.start)}</span>
                    <span className="kasa-transcript-text">{cue.text}</span>
                  </button>
                ))}
                {matches.length === 0 && <p className="kasa-transcript-empty">No transcript lines match your search.</p>}
              </div>
            </>
          ) : activeTrack?.raw.trim() ? (
            <div className="kasa-transcript-prose" aria-label="Reading transcript"><p>This transcript has no timestamps, so it is shown as text. Upload an SRT or VTT file to enable synced playback.</p><pre>{activeTrack.raw}</pre></div>
          ) : (
            <div className="kasa-transcript-empty">
              <p>A searchable transcript will appear when the teacher adds Twi or English subtitles.</p>
              <p>You can still use YouTube&apos;s own CC button if captions are available for the video.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
