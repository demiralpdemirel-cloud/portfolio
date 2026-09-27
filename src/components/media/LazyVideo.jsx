import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../utils/assetPath'
import MediaPlaceholder from './MediaPlaceholder'

export default function LazyVideo({ video, title, detail = false, placeholder = false }) {
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.play().then(() => setBlocked(false)).catch(() => setBlocked(true))
      } else {
        element.pause()
      }
    }, { threshold: 0.55 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [video?.src])

  if ((!video?.src || failed) && placeholder) {
    return <MediaPlaceholder label="VIDEO ASSET" path={video?.src || 'Add a video source in projects.js'} variant="media-placeholder--motion" />
  }
  if (!video?.src || failed) {
    if (video?.poster) return <img className="video-poster-fallback" src={assetPath(video.poster)} alt={`${title} poster`} />
    return <MediaPlaceholder label="VIDEO ASSET" path="Add a video source in projects.js" variant="media-placeholder--motion" />
  }

  const playVideo = () => {
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
    {video.poster && <img className="lazy-video__poster" src={assetPath(video.poster)} alt="" aria-hidden="true" />}
    <video ref={ref} src={assetPath(video.src)} poster={assetPath(video.poster)} muted={!detail} playsInline loop preload="metadata" controls={detail} aria-label={title} onTimeUpdate={checkForVisibleFrame} onError={() => setFailed(true)} />
    {blocked && <button className="video-play-button" type="button" onClick={playVideo}>PLAY VIDEO</button>}
  </div>
}
