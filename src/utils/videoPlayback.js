// A single visibility observer arbitrates playback across project videos and showreels.
const videos = new Map()
let observer
let owner = null
let playbackScope = null
let fullscreenExitedAt = 0
const metadataVideos = new Map()
let metadataObserver

// Prepare nearby media without changing real-viewport playback arbitration.
export function prepareVideoSource(video, source) {
  if (video.getAttribute('src') === source) return
  video.preload = 'metadata'
  video.setAttribute('src', source)
  video.load()
}

export function observeVideoMetadata(video, source) {
  const prepare = () => prepareVideoSource(video, source)
  if (!('IntersectionObserver' in window)) { prepare(); return () => {} }
  if (!metadataObserver) metadataObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const prepare = metadataVideos.get(entry.target)
      if (!prepare) continue
      prepare()
      metadataObserver.unobserve(entry.target)
      metadataVideos.delete(entry.target)
    }
  }, { rootMargin: '1000px 0px', threshold: 0 })
  metadataVideos.set(video, prepare)
  metadataObserver.observe(video)
  return () => {
    metadataObserver?.unobserve(video)
    metadataVideos.delete(video)
    if (!metadataVideos.size) { metadataObserver?.disconnect(); metadataObserver = null }
  }
}
const onFullscreenChange = () => { if (!document.fullscreenElement) fullscreenExitedAt = Date.now() }
export const fullscreenJustExited = () => Boolean(document.fullscreenElement) || Date.now() - fullscreenExitedAt < 350

export function scopePlayback(container) {
  const previous = playbackScope
  playbackScope = container
  for (const video of videos.keys()) if (!container.contains(video)) video.pause()
  owner = null
  return () => { playbackScope = previous; chooseVideo() }
}

function chooseVideo() {
  if (document.hidden) {
    for (const video of videos.keys()) video.pause()
    owner = null
    return
  }
  const manual = owner && videos.get(owner)
  if (manual && (manual.manual || !manual.autoPlay) && manual.ratio >= .25) return
  const candidates = [...videos.entries()].filter(([video, item]) => (!playbackScope || playbackScope.contains(video)) && item.autoPlay && item.ratio >= .55)
    .sort(([, a], [, b]) => b.priority - a.priority || b.ratio - a.ratio)
  const next = candidates[0]?.[0] || null
  if (next === owner) return
  owner?.pause()
  owner = next
  if (next) videos.get(next).activate()
}

export function claimPlayback(video, manual = false) {
  for (const other of videos.keys()) if (other !== video) other.pause()
  owner = video
  if (manual && videos.has(video)) videos.get(video).manual = true
}

export function observeVideo(video, { autoPlay = true, priority = 0, activate }) {
  if (!observer && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const item = videos.get(entry.target)
        if (!item) continue
        item.ratio = entry.isIntersecting ? entry.intersectionRatio : 0
        if (!item.ratio) entry.target.pause()
      }
      chooseVideo()
    }, { threshold: [0, .25, .55, .8, 1] })
    document.addEventListener('visibilitychange', chooseVideo)
    document.addEventListener('fullscreenchange', onFullscreenChange)
  }
  videos.set(video, { autoPlay, priority, activate, ratio: 0 })
  const onPlay = () => claimPlayback(video)
  video.addEventListener('play', onPlay)
  observer?.observe(video)
  return () => {
    video.pause()
    video.removeEventListener('play', onPlay)
    observer?.unobserve(video)
    videos.delete(video)
    if (owner === video) owner = null
    if (!videos.size) {
      observer?.disconnect()
      observer = null
      document.removeEventListener('visibilitychange', chooseVideo)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    } else chooseVideo()
  }
}
