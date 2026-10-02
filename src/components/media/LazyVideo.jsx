import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../utils/assetPath'
import MediaPlaceholder from './MediaPlaceholder'
import { webVideoSource } from '../../data/webMedia'
import { observeVideo } from '../../utils/videoPlayback'

export default function LazyVideo({ video, title, detail = false, muted = !detail, placeholder = false, onAspectRatio }) {
  const ref = useRef(null)
  const sampleCanvas = useRef(null)
  const lastSampledAt = useRef(0)
  const visualFrameFound = useRef(false)
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState(false)
  const [hasVisualFrame, setHasVisualFrame] = useState(false)

  useEffect(() => {
    visualFrameFound.current = false
    lastSampledAt.current = 0
    setHasVisualFrame(false)
    setBlocked(false)
    setFailed(false)
  }, [video?.src])

  useEffect(() => {
    const element = ref.current
    if (!element || !video?.src) return undefined
    let disposed = false
    const activate = () => {
      if (!element.getAttribute('src')) element.src = assetPath(webVideoSource(video.src))
      element.play().then(() => { if (!disposed) setBlocked(false) }).catch(error => {
        if (!disposed && error.name !== 'AbortError') setBlocked(true)
      })
    }
    const unregister = observeVideo(element, { activate, priority: detail ? 2 : 0 })
    return () => { disposed = true; unregister() }
  }, [video?.src, detail, failed])

  if ((!video?.src || failed) && placeholder) {
    return <MediaPlaceholder label="VIDEO ASSET" path={video?.src || 'Add a video source in projects.js'} variant="media-placeholder--motion" />
  }
  if (!video?.src || failed) {
    if (video?.poster) return <img className="video-poster-fallback" src={assetPath(video.poster)} alt={`${title} poster`} />
    return <MediaPlaceholder label="VIDEO ASSET" path="Add a video source in projects.js" variant="media-placeholder--motion" />
  }

  const playVideo = () => {
    if (ref.current && !ref.current.getAttribute('src')) ref.current.src = assetPath(webVideoSource(video.src))
    ref.current?.play().then(() => setBlocked(false)).catch(() => setBlocked(true))
  }

  const checkForVisibleFrame = event => {
    const element = event.currentTarget
    if (visualFrameFound.current || element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
    if (element.currentTime - lastSampledAt.current < .45) return
    lastSampledAt.current = element.currentTime

    try {
      const canvas = sampleCanvas.current || document.createElement('canvas')
      sampleCanvas.current = canvas
      canvas.width = 16
      canvas.height = 9
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(element, 0, 0, canvas.width, canvas.height)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      let luminance = 0
      for (let index = 0; index < pixels.length; index += 4) {
        luminance += pixels[index] * .2126 + pixels[index + 1] * .7152 + pixels[index + 2] * .0722
      }
      if (luminance / (pixels.length / 4) >= 42) {
        visualFrameFound.current = true
        setHasVisualFrame(true)
      }
    } catch {
      visualFrameFound.current = true
      setHasVisualFrame(true)
    }
  }

  return <div className={`lazy-video${hasVisualFrame ? ' lazy-video--visual-ready' : ''}`}>
    {video.poster && <img className="lazy-video__poster" src={assetPath(video.poster)} alt="" aria-hidden="true" decoding="async" onLoad={event => onAspectRatio?.(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />}
    <video ref={ref} poster={assetPath(video.poster)} muted={muted} playsInline loop preload="none" controls={detail} aria-label={title} onLoadedMetadata={event => onAspectRatio?.(event.currentTarget.videoWidth / event.currentTarget.videoHeight)} onTimeUpdate={checkForVisibleFrame} onError={() => setFailed(true)} />
    {blocked && <button className="video-play-button" type="button" onClick={playVideo}>PLAY VIDEO</button>}
  </div>
}
