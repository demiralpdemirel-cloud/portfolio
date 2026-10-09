import { useLanguage } from '../../i18n/LanguageContext'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { assetPath } from '../../utils/assetPath'
import FullscreenImageViewer from './FullscreenImageViewer'

const EnvironmentGallery = forwardRef(function EnvironmentGallery({ media = [], fullResolutionMedia = media, views, title }, ref) {
  const { t } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const [incomingIndex, setIncomingIndex] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [viewerOrigin, setViewerOrigin] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const heroRef = useRef(null)
  const focusReturnFrame = useRef(null)
  const viewerWasOpen = useRef(false)
  const requestId = useRef(0)
  const transitionTimer = useRef(null)
  const scrollIndex = useRef(-1)
  const desiredIndex = useRef(0)

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      if (!media.length || isViewerOpen) return
      const index = Math.min(media.length - 1, Math.floor(progress * media.length))
      if (index === scrollIndex.current) return
      scrollIndex.current = index
      selectImage(index)
    },
  }))

  useEffect(() => () => {
    requestId.current += 1
    window.clearTimeout(transitionTimer.current)
    window.cancelAnimationFrame(focusReturnFrame.current)
  }, [])

  useEffect(() => {
    if (isViewerOpen) {
      viewerWasOpen.current = true
      return undefined
    }
    if (!viewerWasOpen.current) return undefined
    viewerWasOpen.current = false
    focusReturnFrame.current = requestAnimationFrame(() => heroRef.current?.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(focusReturnFrame.current)
  }, [isViewerOpen])

  const selectImage = index => {
    if (index === desiredIndex.current) return
    desiredIndex.current = index

    const id = ++requestId.current
    let hasStarted = false
    window.clearTimeout(transitionTimer.current)
    setIsTransitioning(false)
    setIncomingIndex(null)
    if (index === visibleIndex) {
      setActiveIndex(index)
      return
    }

    const image = new Image()
    const showImage = () => {
      if (hasStarted || id !== requestId.current) return
      hasStarted = true
      setActiveIndex(index)
      setIncomingIndex(index)
      requestAnimationFrame(() => {
        if (id !== requestId.current) return
        setIsTransitioning(true)
        transitionTimer.current = window.setTimeout(() => {
          if (id !== requestId.current) return
          setVisibleIndex(index)
          setIncomingIndex(null)
          setIsTransitioning(false)
        }, 520)
      })
    }

    image.onload = showImage
    image.onerror = () => {
      if (id === requestId.current) desiredIndex.current = activeIndex
    }
    image.src = assetPath(media[index])
    if (image.complete && image.naturalWidth > 0) showImage()
  }

  const openViewer = () => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    setViewerOrigin({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
  }

  if (!media.length) return null

  const imageLayer = (index, className) => (
    <img
      className={`environment-frame__image ${className}`}
      src={assetPath(media[index])}
      alt={t(views?.[index]?.alt || '')}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  )

  return (
    <div className={`environment-frame${views ? ' environment-frame--editorial' : media.length > 4 ? ' environment-frame--extended' : ''}`} role="group" aria-label={t(`${title} image gallery`)}>
      <button
        ref={heroRef}
        className="environment-frame__hero"
        type="button"
        aria-label={t(`Open ${title} view ${String(activeIndex + 1).padStart(2, '0')} fullscreen`)}
        onClick={openViewer}
      >
        {imageLayer(visibleIndex, `environment-frame__image--current${isTransitioning ? ' is-leaving' : ''}`)}
        {incomingIndex !== null && imageLayer(incomingIndex, `environment-frame__image--incoming${isTransitioning ? ' is-entering' : ''}`)}
      </button>
      <div className="environment-frame__rail" role="group" aria-label={t("Choose a project view")}>
        {media.map((src, index) => (
          <button
            className={`environment-frame__thumb${activeIndex === index ? ' is-active' : ''}`}
            key={src}
            type="button"
            aria-label={views ? `${String(index + 1).padStart(2, '0')} ${views[index].label}` : t(`Show ${title} view ${String(index + 1).padStart(2, '0')}`)}
            aria-pressed={activeIndex === index}
            onClick={() => selectImage(index)}
          >
            {views ? <span>{String(index + 1).padStart(2, '0')} / {views[index].label}</span> : <><img src={assetPath(src)} alt="" loading="lazy" decoding="async" draggable="false" /><span>{t('VIEW')} / {String(index + 1).padStart(2, '0')}</span></>}
          </button>
        ))}
      </div>
      <span className="environment-frame__sr-status" aria-live="polite" aria-atomic="true">
        {t(`${title} — view ${String(activeIndex + 1).padStart(2, '0')}`)}
      </span>
      {isViewerOpen && <FullscreenImageViewer media={fullResolutionMedia} alts={views?.map(view => view.alt)} title={title} index={activeIndex} origin={viewerOrigin} onNavigate={selectImage} onClose={closeViewer} />}
    </div>
  )
})

export default EnvironmentGallery
