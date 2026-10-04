import { useEffect, useState } from 'react'
import { ambientEdges, ambientEdgeCrop, ambientFeather, renderAmbientStrip } from '../utils/ambientColors'
import { createAmbientZoneMap, sampleAmbientZones, smoothAmbientZones, interpolateAmbientZones } from '../utils/ambientZones'
import { createAmbientScheduler } from '../utils/ambientScheduler'
import { createNativeAmbientSampler } from '../utils/ambientNativeFrame'

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
    layer.dataset.averageSampleMs = '0'; layer.dataset.maxSampleMs = '0'; layer.dataset.frameLagMs = '0'
    layer.dataset.captureMs = '0'; layer.dataset.renderMs = '0'
    delete layer.dataset.pixelTransport
    if (!enabled) return
    const mobile = window.matchMedia('(pointer: coarse), (max-width: 900px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scheduler = createAmbientScheduler({ mobile, reduced })
    let canvas = document.createElement('canvas')
    canvas.width = mobile ? 48 : 64; canvas.height = mobile ? 27 : 36
    canvas.className = 'player-ambient__visual'
    let context
    try { context = canvas.getContext('2d', { willReadFrequently: true }) } catch { /* Use a visual fallback. */ }
    if (context) context.imageSmoothingEnabled = false
    let visible = false, disposed = false, mode = context ? 'pixel' : 'fallback'
    let frame = null, raf = null, lastPaint = null, samples = 0, lastMetrics = 0
    let colors = null, refresh = true, logged = false
    let captureMs = 0, renderMs = 0
    const strips = [], bases = [], feather = ambientFeather(16)
    const mapping = createAmbientZoneMap(canvas.width, canvas.height)
    let pending = false, generation = 0
    let native = createNativeAmbientSampler(canvas.width, canvas.height)
    const crops = new Map()
    for (const edge of ambientEdges) crops.set(edge, ambientEdgeCrop(edge, canvas.width, canvas.height))
    layer.dataset.zones = '16/10/16/10'
    layer.dataset.scheduler = video.requestVideoFrameCallback ? 'video-frame' : 'raf-presented-frame'
    layer.dataset.frameLagMs = '0'

    layer.dataset.resolution = `${canvas.width}x${canvas.height}`
    layer.dataset.hz = String(scheduler.rate)
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
      for (const strip of strips) {
        strip.node.style.setProperty('--strip-scale-x', String(strip.node.parentElement.clientWidth / strip.node.width))
        strip.node.style.setProperty('--strip-scale-y', String(strip.node.parentElement.clientHeight / strip.node.height))
      }
    }
    const createSurfaces = () => {
      if (strips.length) return true
      for (const edge of ambientEdges) {
        const horizontal = edge === 'top' || edge === 'bottom'
        const base = document.createElement('canvas')
        base.width = horizontal ? canvas.width : 16; base.height = horizontal ? 16 : canvas.height
        const baseContext = base.getContext('2d')
        if (!baseContext) return false
        bases.push({ edge, node: base, ctx: baseContext, image: baseContext.createImageData(base.width, base.height), horizontal, line: new Uint8ClampedArray((horizontal ? canvas.width : canvas.height) * 4) })
        for (const level of ['core', 'mid', 'outer']) {
          const node = document.createElement('canvas')
          node.width = horizontal ? canvas.width : 16
          node.height = horizontal ? 16 : canvas.height
          node.className = 'player-ambient__visual'
          node.style.width = `${node.width}px`; node.style.height = `${node.height}px`
          const ctx = node.getContext('2d')
          if (!ctx) return false
          // Constant filters, on tiny surfaces before scaling. Longitudinal
          // blur stays local; twelve surfaces serve all 52 LED zones.
          const blur = level === 'core' ? .6 : level === 'mid' ? 1.2 : 2
          const filter = `blur(${blur}px) saturate(1.15) brightness(1.65)`
          if ('filter' in ctx) ctx.filter = filter
          if (!ctx.filter?.includes('blur(')) node.style.filter = filter
          layer.querySelector(`[data-edge="${edge}"] [data-level="${level}"]`).append(node)
          strips.push({ node, ctx, edge, base })
        }
      }
      geometry()
      return true
    }
    const fallback = (error, cannotDraw = false) => {
      mode = 'fallback'; layer.dataset.mode = mode; layer.dataset.pixelTransport = 'visual'
      if (error?.name === 'SecurityError' && !cannotDraw) {
        // CORS strips never read pixels. Do not retain the CPU/readback canvas
        // chosen for readable media: capture this protected texture on GPU.
        const visual = document.createElement('canvas')
        visual.width = canvas.width; visual.height = canvas.height
        const visualContext = visual.getContext('2d', { willReadFrequently: false })
        if (visualContext) { canvas = visual; context = visualContext; context.imageSmoothingEnabled = false }
      }
      report(`canvas unavailable: ${error?.name === 'SecurityError' ? 'CORS' : error?.message || '2D context unavailable'}; visual video fallback active`, error)
      if (cannotDraw || !context || !createSurfaces()) {
        context = null
        strips.forEach(strip => strip.node.remove()); strips.length = 0; bases.length = 0
        // An unavailable drawing capability must not open a second decoder.
        layer.dataset.pixelTransport = 'unavailable'
      }
    }
    const stop = () => {
      generation++ // Ignore an in-flight worker result after pause/hide/stop.
      if (frame !== null) video.cancelVideoFrameCallback?.(frame)
      if (raf !== null) cancelAnimationFrame(raf)
      frame = null; raf = null
      layer.dataset.sampling = 'idle'
    }
    const active = () => Boolean(context) && !disposed && visible && !document.hidden && !video.paused && !video.ended
    const drawStrips = () => {
      if (mode === 'fallback') {
        // One protected thumbnail capture. All edge views share it, and no
        // readback is attempted. Avoid converting the full video four times.
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        for (const {edge, node, ctx} of bases) ctx.drawImage(canvas, ...crops.get(edge), 0, 0, node.width, node.height)
      }
      for (const { node, ctx, base } of strips) {
        ctx.globalAlpha = mode === 'pixel' || refresh ? 1 : .65
        if (refresh || mode === 'pixel') ctx.clearRect(0, 0, node.width, node.height)
        ctx.drawImage(base, 0, 0, node.width, node.height)
      }
    }
    const paint = async (now = performance.now(), metadata) => {
      if (pending || disposed || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return
      pending = true
      const token = generation, started = performance.now()
      try {
        if (context) {
          try {
            if (mode === 'fallback') drawStrips()
            // Downsample before readback: never copy a full HD YUV frame to CPU
            // just to inspect the 64x36 analysis buffer.
            else if (!native) context.drawImage(video, 0, 0, canvas.width, canvas.height)
          }
          catch (error) { fallback(error, true); return }
          if (mode === 'pixel') {
            try {
              let pixels
              if (native) {
                try { pixels = await native.sample(video) }
                catch (error) {
                  if (disposed) return
                  native?.dispose(); native = null
                  if (error.name === 'SecurityError') { fallback(error); drawStrips(); return }
                  context.drawImage(video, 0, 0, canvas.width, canvas.height)
                }
                if (disposed || token !== generation || !visible || document.hidden || video.paused) return
              }
              layer.dataset.pixelTransport = native ? 'worker-downsampled' : 'canvas-downsampled'
              pixels ||= context.getImageData(0, 0, canvas.width, canvas.height).data
              captureMs = performance.now() - started
              const renderStarted = performance.now()
              const sampled = sampleAmbientZones(pixels, mapping)
              colors = !colors || refresh ? sampled : smoothAmbientZones(colors, sampled, lastPaint === null ? 1000 / 24 : now - lastPaint)
              if (!createSurfaces()) { fallback(new Error('Edge canvas unavailable'), true); return }
              bases.forEach(({ ctx, image, horizontal, line, node }, index) => {
                interpolateAmbientZones(colors[index], line)
                renderAmbientStrip(line, image.data, node.width, node.height, horizontal, feather)
                ctx.putImageData(image, 0, 0)
              })
              drawStrips()
              renderMs = performance.now() - renderStarted
              if (!logged) { report('pixel sampling active'); logged = true }
              layer.dataset.mode = 'pixel'
            } catch (error) { fallback(error); if (context) drawStrips() }
          }
        }
      } finally {
        if (!disposed && token === generation && active()) {
          lastPaint = now; refresh = false; layer.dataset.samples = String(++samples)
          // Visual capture has no pixel analysis. Software rasterization gets
          // a bounded 4 ms budget; pixel sampling retains its 2 ms budget.
          scheduler.record(performance.now() - started, now, mode === 'fallback' ? 4 : 2)
          if (metadata) {
            layer.dataset.mediaTime = String(metadata.mediaTime)
            layer.dataset.presentedFrames = String(metadata.presentedFrames)
            layer.dataset.frameLagMs = String(Math.max(0, performance.now() - (metadata.expectedDisplayTime ?? now)))
          }
          if (now - lastMetrics > 250) {
            const stats = scheduler.stats
            layer.dataset.hz = String(scheduler.rate)
            layer.dataset.averageSampleMs = stats.averageMs.toFixed(3)
            layer.dataset.maxSampleMs = stats.maxMs.toFixed(3)
            layer.dataset.captureMs = captureMs.toFixed(3)
            layer.dataset.renderMs = renderMs.toFixed(3)
            lastMetrics = now
          }
        }
        pending = false
      }
    }
    const schedule = () => {
      if (!active() || frame !== null || raf !== null) return
      if (video.requestVideoFrameCallback) frame = video.requestVideoFrameCallback(tick)
      else raf = requestAnimationFrame(tick)
      layer.dataset.sampling = 'active'
    }
    const tick = (timestamp, metadata) => {
      frame = null; raf = null
      if (!active()) { stop(); return }
      if (!metadata) {
        const quality = video.getVideoPlaybackQuality?.()
        metadata = { mediaTime: video.currentTime, presentedFrames: quality ? quality.totalVideoFrames - quality.droppedVideoFrames : undefined }
      }
      if (scheduler.shouldSample(timestamp, metadata)) paint(timestamp, metadata)
      schedule()
    }
    const sync = () => {
      stop()
      if (!visible || document.hidden || video.paused || video.ended) return
      geometry()
      // A single paused/seeked refresh. Playing updates come only from newly
      // presented frames, never from repeated play/playing/ratechange events.
      if (refresh) paint()
      scheduler.reset(); schedule()
    }
    const seeked = () => { generation++; refresh = true; sync() }
    const reset = () => {
      generation++; stop(); colors = null; refresh = true; lastPaint = null; scheduler.reset()
      ambientEdges.forEach(edge => layer.style.removeProperty(`--ambient-${edge}`))
      strips.forEach(({ node, ctx }) => ctx.clearRect(0, 0, node.width, node.height))
    }
    if (context && !createSurfaces()) fallback(new Error('Edge canvas unavailable'), true)
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
      disposed = true; generation++; native?.dispose(); stop(); observer.disconnect(); resize.disconnect()
      ;['play', 'playing', 'pause', 'ended', 'loadeddata', 'loadedmetadata', 'ratechange'].forEach(name => video.removeEventListener(name, sync))
      video.removeEventListener('seeked', seeked); video.removeEventListener('emptied', reset)
      document.removeEventListener('visibilitychange', sync)
      document.removeEventListener('fullscreenchange', geometry)
      canvas.remove()
      strips.forEach(strip => strip.node.remove()); strips.length = 0; bases.length = 0
      delete layer.dataset.mode
    }
  }, [enabled, videoRef, layerRef, source])
  return { enabled, toggle }
}
