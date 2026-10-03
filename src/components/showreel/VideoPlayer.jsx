import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { assetPath } from '../../utils/assetPath'
import { webVideoSource } from '../../data/webMedia'
import { claimPlayback, observeVideo } from '../../utils/videoPlayback'
import { clamp } from '../../utils/playerMath'
import useAmbientLight from '../../hooks/useAmbientLight'
import PlayerControls, { PlayerIcon } from '../media/PlayerControls'

let sessionVolume = .8
export default function VideoPlayer({ src, poster, label, durationHint = 0, autoPlay = false, videoRef: externalVideoRef, onEnded, initialMuted = false, loop = false, lazy = false, onAspectRatio, className = '' }) {
  const { t } = useLanguage()
  const localVideoRef = useRef(null), shell = useRef(null), layer = useRef(null), hideTimer = useRef(null), fullscreenExit = useRef(0), disposed = useRef(false)
  const videoRef = externalVideoRef || localVideoRef
  const [playing, setPlaying] = useState(false), [ended, setEnded] = useState(false), [failed, setFailed] = useState(false), [loading, setLoading] = useState(false)
  const [visibleControls, setVisibleControls] = useState(true), [muted, setMuted] = useState(initialMuted), [volume, updateVolume] = useState(sessionVolume), [speed, updateSpeed] = useState(1), [fullscreen, setFullscreen] = useState(false)
  const [duration, setDuration] = useState(durationHint), [time, setTime] = useState(0), [buffered, setBuffered] = useState(0)
  const ambient = useAmbientLight(videoRef, layer, src)
  const reveal = () => {
    if (disposed.current) return
    setVisibleControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (!videoRef.current?.paused && !shell.current?.querySelector('.player-speed__menu') && !shell.current?.querySelector('.showreel-player__controls:focus-within')) setVisibleControls(false)
    }, 2400)
  }
  useEffect(() => {
    const video = videoRef.current
    disposed.current = false
    setTime(0); setBuffered(0); setDuration(durationHint); setFailed(false); setEnded(false); updateSpeed(1)
    video.volume = sessionVolume
    video.playbackRate = 1
    if (lazy) { video.removeAttribute('src'); video.load() }
    const activate = () => {
      if (!video.getAttribute('src')) video.src = assetPath(webVideoSource(src))
      video.play()?.catch(() => { if (!disposed.current) { setPlaying(false); setLoading(false) } })
    }
    const unregister = observeVideo(video, { autoPlay, priority: lazy ? 0 : 2, activate })
    return () => { disposed.current = true; unregister(); clearTimeout(hideTimer.current) }
  }, [src, autoPlay, lazy, durationHint, videoRef])
  useEffect(() => {
    const change = () => {
      const active = document.fullscreenElement === shell.current
      if (!active) fullscreenExit.current = Date.now()
      setFullscreen(active); reveal()
    }
    document.addEventListener('fullscreenchange', change)
    return () => document.removeEventListener('fullscreenchange', change)
  }, [])
  const togglePlay = async () => {
    const video = videoRef.current
    if (video.paused) {
      if (!video.getAttribute('src')) video.src = assetPath(webVideoSource(src))
      claimPlayback(video, true); setLoading(true)
      try { await video.play() } catch { if (!disposed.current) setLoading(false) }
    } else video.pause()
    reveal()
  }
  const setVolume = value => {
    sessionVolume = clamp(value, 0, 1)
    videoRef.current.volume = sessionVolume; videoRef.current.muted = sessionVolume === 0
    updateVolume(sessionVolume); setMuted(sessionVolume === 0)
  }
  const toggleMute = () => {
    if (!videoRef.current.volume) setVolume(.8)
    else { videoRef.current.muted = !videoRef.current.muted; setMuted(videoRef.current.muted) }
    reveal()
  }
  const setSpeed = value => { videoRef.current.playbackRate = value; updateSpeed(value); reveal() }
  const seek = value => {
    if (!duration) return
    const next = clamp(value, 0, duration)
    videoRef.current.currentTime = next
    // Range value must update synchronously while scrubbing, not at timeupdate's cadence.
    setTime(next)
  }
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (shell.current.requestFullscreen) await shell.current.requestFullscreen()
      else videoRef.current.webkitEnterFullscreen?.()
    } catch { /* Embedded browser / OS policy may deny fullscreen. */ }
    reveal()
  }
  const keyboard = event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'Escape') {
      if (document.fullscreenElement || Date.now() - fullscreenExit.current < 350) { event.preventDefault(); event.stopPropagation(); if (document.fullscreenElement) void toggleFullscreen() }
      return
    }
    if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return
    if ((event.key === ' ' || event.key === 'Enter') && event.target.closest('button')) return
    const actions = { ' ': togglePlay, m: toggleMute, f: toggleFullscreen, ArrowLeft: () => { videoRef.current.currentTime = clamp(videoRef.current.currentTime - 5, 0, duration || 0) }, ArrowRight: () => { videoRef.current.currentTime = clamp(videoRef.current.currentTime + 5, 0, duration || 0) }, ArrowUp: () => setVolume(volume + .05), ArrowDown: () => setVolume(volume - .05) }
    const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key]
    if (action) { event.preventDefault(); event.stopPropagation(); action(); reveal() }
  }
  return <div ref={shell} className={`showreel-player premium-player ${className}${visibleControls || !playing ? ' player-controls-visible' : ''}`} role="group" tabIndex="0" aria-label={t(label)} onKeyDown={keyboard} onPointerMove={reveal} onPointerEnter={reveal} onFocus={reveal}>
    <div ref={layer} className={`player-ambient${ambient.enabled ? ' player-ambient--enabled' : ''}`} aria-hidden="true">
      {['top', 'right', 'bottom', 'left'].map(edge => <span key={edge} className="player-ambient__edge" data-edge={edge}>
        {['core', 'mid', 'outer'].map(level => <i key={level} data-level={level} />)}
      </span>)}
    </div>
    <div className="player-viewport">
      <video ref={videoRef} className="showreel-player__video" src={lazy ? undefined : assetPath(webVideoSource(src))} poster={assetPath(poster)} preload="none" playsInline loop={loop} muted={muted} aria-label={t(label)}
        onClick={() => { shell.current?.focus({ preventScroll: true }); togglePlay() }}
        onLoadedMetadata={event => { const video = event.currentTarget; setDuration(Number.isFinite(video.duration) ? video.duration : durationHint); if (video.videoHeight) onAspectRatio?.(video.videoWidth / video.videoHeight) }}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        onProgress={event => { const ranges = event.currentTarget.buffered; setBuffered(ranges.length ? ranges.end(ranges.length - 1) : 0) }}
        onPlay={() => { setPlaying(true); setEnded(false); reveal() }} onPlaying={() => setLoading(false)} onWaiting={() => setLoading(true)} onSeeking={() => setLoading(true)} onSeeked={() => setLoading(false)}
        onVolumeChange={event => { setMuted(event.currentTarget.muted); updateVolume(event.currentTarget.volume) }}
        onError={() => { setPlaying(false); setFailed(true); setLoading(false) }} onPause={() => { setPlaying(false); setLoading(false); reveal() }} onEnded={() => { setPlaying(false); setEnded(true); setLoading(false); onEnded?.() }} />
      {poster && lazy && <img className="player-ratio-probe" src={assetPath(poster)} alt="" aria-hidden="true" onLoad={event => onAspectRatio?.(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />}
      {failed && <p className="player-error" role="alert">{t('VIDEO UNAVAILABLE')} — {t(label)}</p>}
      {!playing && !failed && !loading && <button className="showreel-player__play-overlay" type="button" onClick={() => { shell.current?.focus({ preventScroll: true }); togglePlay() }} aria-label={t(ended ? 'Replay video' : `Play ${t(label)}`)}><PlayerIcon name={ended ? 'replay' : 'play'} /></button>}
      {loading && !failed && <span className="player-loading" role="status" aria-label={t('Loading video')} />}
    </div>
    <PlayerControls {...{ playing, ended, time, duration, buffered, volume, muted, speed, fullscreen, ambient, togglePlay, toggleMute, setVolume, setSpeed, seek, toggleFullscreen }} onInteraction={reveal} />
  </div>
}
