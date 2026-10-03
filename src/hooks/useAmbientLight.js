import { useEffect, useState } from 'react'
import { ambientEdges, sampleAmbientEdges, smoothAmbientEdges } from '../utils/ambientColors'

const preferenceKey = 'portfolio-video-ambient'
function initialPreference() {
  try {
    const saved = localStorage.getItem(preferenceKey)
    if (saved !== null) return saved === 'on'
  } catch { /* Storage is optional. */ }
  return window.matchMedia('(min-width: 901px) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
export default function useAmbientLight(videoRef, layerRef, source) {
  const [enabled, setEnabled] = useState(initialPreference)
  useEffect(() => {
    const sync = event => setEnabled(event.detail)
    window.addEventListener('portfolio-ambient', sync)
    return () => window.removeEventListener('portfolio-ambient', sync)
  }, [])
  const toggle = () => {
    const next = !enabled
    try { localStorage.setItem(preferenceKey, next ? 'on' : 'off') } catch { /* Optional preference. */ }
    window.dispatchEvent(new CustomEvent('portfolio-ambient', { detail: next }))
  }
  useEffect(() => {
    const video = videoRef.current, layer = layerRef.current
    if (!video || !layer) return
    ambientEdges.forEach(edge => layer.style.removeProperty(`--ambient-${edge}`))
    layer.dataset.mode = 'pending'; layer.dataset.sampling = 'idle'; layer.dataset.samples = '0'
    if (!enabled) return
    const mobile = window.matchMedia('(pointer: coarse), (max-width: 900px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const interval = reduced ? 200 : mobile ? 125 : 1000 / 12
    const canvas = document.createElement('canvas')
    canvas.width = mobile ? 48 : 64; canvas.height = mobile ? 27 : 36
    canvas.className = 'player-ambient__visual'
    let context
    try { context = canvas.getContext('2d', { willReadFrequently: true }) } catch { /* Use a visual fallback. */ }
    let visible = false, disposed = false, mode = context ? 'pixel' : 'fallback'
    let frame = null, raf = null, lastSample = -Infinity, samples = 0
    let colors = null, refresh = true, logged = false, duplicate = null
    layer.dataset.resolution = `${canvas.width}x${canvas.height}`
    layer.dataset.hz = String(1000 / interval)
    const report = (message, error) => {
      if (import.meta.env.DEV) console[error ? 'warn' : 'debug'](`[AmbientLight] ${message}`, {
        source: video.currentSrc, readyState: video.readyState,
        width: video.videoWidth, height: video.videoHeight,
        ...(error ? { reason: error.name, message: error.message } : {}),
      })
    }
    // Follow the contained picture rather than the player's letterbox bars.
    const geometry = () => {
      const shell = layer.parentElement
      const box = video.getBoundingClientRect(), parent = shell.getBoundingClientRect()
      if (!box.width || !box.height || !video.videoWidth || !video.videoHeight) return
      const scale = Math.min(video.clientWidth / video.videoWidth, video.clientHeight / video.videoHeight)
      const width = video.videoWidth * scale, height = video.videoHeight * scale
      const scaleX = parent.width / shell.offsetWidth || 1, scaleY = parent.height / shell.offsetHeight || 1
      Object.assign(layer.style, {
        left: `${(box.left - parent.left) / scaleX + (video.clientWidth - width) / 2}px`,
        top: `${(box.top - parent.top) / scaleY + (video.clientHeight - height) / 2}px`,
        width: `${width}px`, height: `${height}px`,
      })
      layer.style.setProperty('--ambient-visual-scale-x', String(width / canvas.width * 1.14))
      layer.style.setProperty('--ambient-visual-scale-y', String(height / canvas.height * 1.14))
    }
    const fallback = (error, cannotDraw = false) => {
      mode = 'fallback'; layer.dataset.mode = mode
      report(`canvas unavailable: ${error?.name === 'SecurityError' ? 'CORS' : error?.message || '2D context unavailable'}; visual video fallback active`, error)
      if (cannotDraw) { context = null; canvas.remove() }
      if (context) {
        // A tainted canvas can still display video: no pixel reads, extra media
        // requests or second decoder, even for cross-origin GitHub releases.
        // Blur this tiny surface BEFORE scaling it, rather than rasterizing a
        // player-sized filtered video on every update. Preserve portrait ratio.
        canvas.height = Math.max(1, Math.round(canvas.width * video.videoHeight / video.videoWidth))
        canvas.style.width = `${canvas.width}px`; canvas.style.height = `${canvas.height}px`
        if ('filter' in context) {
          context.filter = `blur(${mobile ? 3 : 4.5}px) saturate(1.35) brightness(.85)`
          if (context.filter.includes('blur(')) canvas.dataset.filtered = 'true'
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        geometry()
        layer.append(canvas)
      } else {
        // Only browsers unable to draw video at all need a second element.
        duplicate = document.createElement('video')
        duplicate.className = 'player-ambient__visual'; duplicate.muted = true
        duplicate.playsInline = true; duplicate.preload = 'none'
        duplicate.tabIndex = -1; duplicate.setAttribute('aria-hidden', 'true')
        layer.append(duplicate)
      }
    }
    const stop = () => {
      if (frame !== null) video.cancelVideoFrameCallback?.(frame)
      if (raf !== null) cancelAnimationFrame(raf)
      frame = null; raf = null; duplicate?.pause()
      layer.dataset.sampling = 'idle'
    }
    const active = () => !disposed && visible && !document.hidden && !video.paused && !video.ended
    const paint = () => {
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return
      if (context) {
        if (mode === 'fallback') {
          context.globalAlpha = refresh ? 1 : .25
          if (refresh) context.clearRect(0, 0, canvas.width, canvas.height)
        }
        try { context.drawImage(video, 0, 0, canvas.width, canvas.height) }
        catch (error) { fallback(error, true); paint(); return }
        if (mode === 'pixel') {
          try {
            const sampled = sampleAmbientEdges(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
            colors = !colors || refresh ? sampled : smoothAmbientEdges(colors, sampled)
            colors.forEach((rgb, index) => layer.style.setProperty(`--ambient-${ambientEdges[index]}`, rgb.map(Math.round).join(' ')))
            if (!logged) { report('pixel sampling active'); logged = true }
            layer.dataset.mode = 'pixel'
          } catch (error) { fallback(error) }
        }
      } else if (duplicate) {
        if (duplicate.getAttribute('src') !== video.currentSrc) duplicate.src = video.currentSrc
        duplicate.playbackRate = video.playbackRate; duplicate.loop = video.loop
        if (Math.abs(duplicate.currentTime - video.currentTime) > .15 || refresh) duplicate.currentTime = video.currentTime
        if (active() && duplicate.paused) duplicate.play()?.catch(error => { if (!logged) { report('visual fallback playback unavailable', error); logged = true } })
      }
      refresh = false; layer.dataset.samples = String(++samples)
    }
    const schedule = () => {
      if (!active() || frame !== null || raf !== null) return
      if (video.requestVideoFrameCallback) frame = video.requestVideoFrameCallback(tick)
      else raf = requestAnimationFrame(tick)
      layer.dataset.sampling = 'active'
    }
    const tick = timestamp => {
      frame = null; raf = null
      if (!active()) { stop(); return }
      if (timestamp - lastSample >= interval) { paint(); lastSample = timestamp }
      schedule()
    }
    const sync = () => {
      stop()
      if (!visible || document.hidden) return
      geometry()
      // One refresh for paused/loaded/seeked frames, never a paused loop.
      paint(); lastSample = performance.now(); schedule()
    }
    const seeked = () => { refresh = true; sync() }
    const reset = () => {
      stop(); colors = null; refresh = true
      ambientEdges.forEach(edge => layer.style.removeProperty(`--ambient-${edge}`))
    }
    if (!context) fallback()
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() }, { threshold: .1 })
    observer.observe(video)
    const resize = new ResizeObserver(geometry)
    resize.observe(video)
    ;['play', 'playing', 'pause', 'ended', 'loadeddata', 'loadedmetadata', 'ratechange'].forEach(name => video.addEventListener(name, sync))
    video.addEventListener('seeked', seeked); video.addEventListener('emptied', reset)
    document.addEventListener('visibilitychange', sync)
    document.addEventListener('fullscreenchange', geometry)
    return () => {
      disposed = true; stop(); observer.disconnect(); resize.disconnect()
      ;['play', 'playing', 'pause', 'ended', 'loadeddata', 'loadedmetadata', 'ratechange'].forEach(name => video.removeEventListener(name, sync))
      video.removeEventListener('seeked', seeked); video.removeEventListener('emptied', reset)
      document.removeEventListener('visibilitychange', sync)
      document.removeEventListener('fullscreenchange', geometry)
      canvas.remove()
      if (duplicate) { duplicate.removeAttribute('src'); duplicate.load(); duplicate.remove() }
      delete layer.dataset.mode
    }
  }, [enabled, videoRef, layerRef, source])
  return { enabled, toggle }
}
