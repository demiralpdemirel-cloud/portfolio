import { useEffect, useState } from 'react'
import { edgeColors } from '../utils/playerMath'

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
  const [available, setAvailable] = useState(true)
  useEffect(() => setAvailable(true), [source])
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
    if (!video || !layer || !enabled) return
    const canvas = document.createElement('canvas')
    canvas.width = 32; canvas.height = 18
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) { setAvailable(false); return }
    let visible = false, timer = null, blocked = false, samples = 0
    const interval = window.matchMedia('(pointer: coarse)').matches ? 250 : 100
    const stop = () => { clearTimeout(timer); timer = null; layer.dataset.sampling = 'idle' }
    const sample = () => {
      timer = null
      if (blocked || !visible || document.hidden || video.paused || video.ended) { stop(); return }
      if (video.readyState >= 2 && context) {
        try {
          context.drawImage(video, 0, 0, 32, 18)
          edgeColors(context.getImageData(0, 0, 32, 18).data, 32, 18).forEach((color, i) => layer.style.setProperty(`--ambient-${['top', 'right', 'bottom', 'left'][i]}`, color))
          layer.dataset.samples = String(++samples); layer.dataset.sampling = 'active'
        } catch {
          // A tainted cross-origin frame must never break playback or be retried.
          blocked = true; layer.dataset.sampling = 'unavailable'; layer.style.opacity = '0'; setAvailable(false); return
        }
      }
      timer = window.setTimeout(sample, interval)
    }
    const sync = () => { stop(); if (visible && !document.hidden && !video.paused && !blocked) sample() }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() }, { threshold: .1 })
    observer.observe(video)
    ;['play', 'pause', 'ended', 'loadeddata'].forEach(name => video.addEventListener(name, sync))
    document.addEventListener('visibilitychange', sync)
    layer.style.opacity = ''
    return () => {
      stop(); observer.disconnect()
      ;['play', 'pause', 'ended', 'loadeddata'].forEach(name => video.removeEventListener(name, sync))
      document.removeEventListener('visibilitychange', sync)
    }
  }, [enabled, videoRef, layerRef, source])
  return { enabled, available, toggle }
}
