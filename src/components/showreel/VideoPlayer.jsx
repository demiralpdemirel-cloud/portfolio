import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../utils/assetPath'
import { webVideoSource } from '../../data/webMedia'
import { observeVideo } from '../../utils/videoPlayback'

function timeLabel(time) {
  if (!Number.isFinite(time)) return '0:00'
  const seconds = Math.floor(time)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function VideoPlayer({ src, poster, label, durationHint = 0, autoPlay = false, videoRef: externalVideoRef, onEnded }) {
  const localVideoRef = useRef(null)
  const videoRef = externalVideoRef || localVideoRef
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const playControl = useRef(null)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(durationHint)
  const [currentTime, setCurrentTime] = useState(0)
  const lastDisplayedTime = useRef(-1)

  useEffect(() => {
    setDuration(durationHint)
    setFailed(false)
    setCurrentTime(0)
    lastDisplayedTime.current = -1
    const video = videoRef.current
    if (!video) return
    return observeVideo(video, { autoPlay: false, priority: 2, activate: () => {} })
  }, [src, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!autoPlay) {
      video.pause()
      setPlaying(false)
      return
    }
    const playPromise = video.play()
    playPromise?.then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [autoPlay, src, videoRef, durationHint])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try { await video.play(); setPlaying(true) } catch { setPlaying(false) }
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const toggleFullscreen = async () => {
    const target = videoRef.current?.parentElement
    if (!target) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await target.requestFullscreen()
    } catch { /* Fullscreen can be unavailable in embedded browsers. */ }
  }

  return <div className="showreel-player" aria-label={label}>
    <video
      ref={videoRef}
      className="showreel-player__video"
      src={assetPath(webVideoSource(src))}
      poster={assetPath(poster)}
      preload="none"
      playsInline
      muted={muted}
      onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      onTimeUpdate={event => {
        const seconds = Math.floor(event.currentTarget.currentTime)
        if (seconds !== lastDisplayedTime.current) { lastDisplayedTime.current = seconds; setCurrentTime(event.currentTarget.currentTime) }
      }}
      onPlay={event => {
        if (document.activeElement === event.currentTarget.parentElement.querySelector('.showreel-player__play-overlay')) playControl.current?.focus({ preventScroll: true })
        setPlaying(true)
      }}
      onError={() => { setPlaying(false); setFailed(true) }}
      onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); onEnded?.() }}
      aria-label={label}
    />
    {failed && <p role="alert">VIDEO UNAVAILABLE — {label}</p>}
    {!playing && !failed && <button className="showreel-player__play-overlay" type="button" onClick={togglePlay} aria-label={`Play ${label}`}>
      <span>PLAY {label.toUpperCase()}</span><span>{timeLabel(duration)}</span>
    </button>}
    <div className="showreel-player__controls">
      <button ref={playControl} type="button" onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>{playing ? 'PAUSE' : 'PLAY'}</button>
      <span className="showreel-player__time" aria-live="off">{timeLabel(currentTime)} / {timeLabel(duration)}</span>
      <input className="showreel-player__seek" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value) }} aria-label="Seek video" />
      <button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? 'Unmute video' : 'Mute video'}>{muted ? 'SOUND ON' : 'MUTE'}</button>
      <button type="button" onClick={toggleFullscreen} aria-label="Open fullscreen">FULLSCREEN</button>
    </div>
  </div>
}
